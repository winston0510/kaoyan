import { createClient } from '@supabase/supabase-js';
import { db, setDb, questionsCache, setQuestionsCache } from './state';
import { getLocal, setLocal, todayKey } from './storage';
import { toast } from './utils';
import type { Question, QuizRecord, DailyStat, MergeRecordRow, MergeWrongRow, MergeDailyRow, MergeFavoriteRow, WrongBookItem, FavoriteItem } from './types';

export function initSupabase(): boolean {
  const url = localStorage.getItem('supabase_url');
  const key = localStorage.getItem('supabase_key');
  if (url && key) {
    setDb(createClient(url, key));
    document.getElementById('configBanner')?.classList.remove('show');
    const st = document.getElementById('configStatus');
    if (st) st.textContent = '✅ 已连接 Supabase';
    return true;
  }
  document.getElementById('configBanner')?.classList.add('show');
  const st = document.getElementById('configStatus');
  if (st) st.textContent = '⚠ 未连接，使用本地模式';
  return false;
}

export function saveConfig(): void {
  const url = (document.getElementById('supabaseUrl') as HTMLInputElement).value.trim();
  const key = (document.getElementById('supabaseKey') as HTMLInputElement).value.trim();
  if (!url || !key) { toast('请填写完整信息'); return; }
  localStorage.setItem('supabase_url', url);
  localStorage.setItem('supabase_key', key);
  if (initSupabase()) {
    toast('连接成功！');
    void syncQuestionsFromDB();
    void pullFromDB();
  } else {
    toast('已保存，请刷新页面');
  }
}

const inflight = new Map<string, Promise<Question[]>>();

function filterBySubject(list: Question[], subject: string): Question[] {
  return list.filter(q => q.subject === subject);
}

async function fetchFromNetwork(subject: string): Promise<Question[]> {
  const client = db;
  if (!client) return [];
  const { data } = await client.from('questions').select('*').eq('subject', subject);
  const list = (data || []) as Question[];
  const all = [...getLocal<Question[]>('questions', []).filter(q => q.subject !== subject), ...list];
  setLocal('questions', all);
  setQuestionsCache(all);
  return list;
}

function refreshInBackground(subject: string): void {
  const pending = inflight.get(subject);
  if (pending) return;
  const p = fetchFromNetwork(subject)
    .catch(() => [] as Question[])
    .finally(() => inflight.delete(subject));
  inflight.set(subject, p);
}

export async function loadQuestions(subject: string): Promise<Question[]> {
  const inMem = filterBySubject(questionsCache, subject);
  if (inMem.length > 0) {
    refreshInBackground(subject);
    return inMem;
  }
  const local = getLocal<Question[]>('questions', []);
  const fromLocal = filterBySubject(local, subject);
  if (fromLocal.length > 0) {
    setQuestionsCache(local);
    refreshInBackground(subject);
    return fromLocal;
  }
  const pending = inflight.get(subject);
  if (pending) return pending;
  const p = fetchFromNetwork(subject).finally(() => inflight.delete(subject));
  inflight.set(subject, p);
  return p;
}

export async function syncQuestionsFromDB(): Promise<void> {
  const client = db;
  if (!client) return;
  const { data } = await client.from('questions').select('*');
  if (data) {
    const list = data as Question[];
    setLocal('questions', list);
    setQuestionsCache(list);
  }
}

export async function syncRecordToDB(record: QuizRecord): Promise<void> {
  const client = db;
  if (!client || !record.question_id) return;
  try { await client.from('quiz_records').insert(record as never); } catch { /* ignore */ }
}

export async function syncWrongBookToDB(q: Question, userAnswer: string, isCorrect: boolean): Promise<void> {
  const client = db;
  if (!client || !q.id) return;
  try {
    if (isCorrect) {
      await client.from('wrong_book').delete().eq('question_id', q.id);
    } else {
      await client.from('wrong_book').upsert(
        { question_id: q.id, subject: q.subject, user_answer: userAnswer, mastered: false, updated_at: new Date().toISOString() } as never,
        { onConflict: 'question_id' }
      );
    }
  } catch { /* ignore */ }
}

export async function syncTodayToDB(todayStats: DailyStat, date: string): Promise<void> {
  const client = db;
  if (!client) return;
  try {
    await client.from('daily_stats').upsert(
      {
        stat_date: date,
        total: todayStats.total || 0,
        correct: todayStats.correct || 0,
        wrong: (todayStats.total || 0) - (todayStats.correct || 0)
      } as never,
      { onConflict: 'stat_date' }
    );
  } catch { /* ignore */ }
}

export function mergeRecords(rows: MergeRecordRow[]): void {
  const local = getLocal<QuizRecord[]>('records', []);
  const seen = new Set<string>();
  const merged: QuizRecord[] = [];
  [...rows, ...local].forEach(r => {
    if (!r || r.question_id == null) return;
    const key = r.question_id + '|' + (r.created_at || '') + '|' + (r.is_correct ? '1' : '0') + '|' + (r.user_answer || '');
    if (!seen.has(key)) { seen.add(key); merged.push(r as QuizRecord); }
  });
  merged.sort((a, b) => (a.created_at || '').localeCompare(b.created_at || ''));
  setLocal('records', merged.slice(-1000));
}

export function mergeWrongBook(rows: MergeWrongRow[]): void {
  const local = getLocal<WrongBookItem[]>('wrongBook', []);
  const cache = getLocal<Question[]>('questions', []);
  const byId: Record<string, WrongBookItem> = {};
  local.forEach(w => { if (w.id != null) byId[String(w.id)] = w; });
  rows.forEach(row => {
    if (row.question_id == null) return;
    const key = String(row.question_id);
    const fromCache = cache.find(q => String(q.id) === key);
    if (!fromCache) return;
    const ts = new Date(row.updated_at || row.created_at || '').getTime() || Date.now();
    const item: WrongBookItem = { ...fromCache, userAnswer: row.user_answer || '', mastered: !!row.mastered, reviewCount: row.review_count || 0, wrongTime: ts };
    const existing = byId[key];
    if (existing) {
      if (ts >= (existing.wrongTime || 0)) {
        byId[key] = { ...existing, ...item, mastered: existing.mastered || item.mastered };
      }
    } else {
      byId[key] = item;
    }
  });
  setLocal('wrongBook', Object.values(byId));
}

export function mergeDailyStats(rows: MergeDailyRow[]): void {
  const today = todayKey();
  rows.forEach(row => {
    if (!row || !row.stat_date) return;
    const localKey = 'today_' + row.stat_date;
    const exists = localStorage.getItem('kaoyan_' + localKey);
    const val = { total: row.total || 0, correct: row.correct || 0 };
    if (row.stat_date === today) {
      if (exists === null) setLocal(localKey, val);
    } else {
      setLocal(localKey, val);
    }
  });
}

export async function syncFavoriteToDB(q: Question, isFavorite: boolean): Promise<void> {
  const client = db;
  if (!client || !q.id) return;
  try {
    if (isFavorite) {
      await client.from('favorites').upsert(
        { question_id: q.id, subject: q.subject, created_at: new Date().toISOString() } as never,
        { onConflict: 'question_id' }
      );
    } else {
      await client.from('favorites').delete().eq('question_id', q.id);
    }
  } catch { /* ignore */ }
}

export function mergeFavorites(rows: MergeFavoriteRow[]): void {
  const local = getLocal<FavoriteItem[]>('favorites', []);
  const cache = getLocal<Question[]>('questions', []);
  const byId: Record<string, FavoriteItem> = {};
  local.forEach(f => { if (f.id != null) byId[String(f.id)] = f; });
  rows.forEach(row => {
    if (row.question_id == null) return;
    const key = String(row.question_id);
    const fromCache = cache.find(q => String(q.id) === key);
    if (!fromCache) return;
    const ts = new Date(row.created_at || '').getTime() || Date.now();
    const existing = byId[key];
    if (!existing || ts >= (existing.favoritedAt || 0)) {
      byId[key] = { ...fromCache, favoritedAt: ts };
    }
  });
  setLocal('favorites', Object.values(byId));
}

export async function pullFromDB(): Promise<void> {
  const client = db;
  if (!client) return;
  try {
    const [r1, r2, r3, r4] = await Promise.all([
      client.from('quiz_records').select('*').order('created_at', { ascending: false }).limit(1000),
      client.from('wrong_book').select('*'),
      client.from('daily_stats').select('*'),
      client.from('favorites').select('*')
    ]);
    if (r1 && r1.data && r1.data.length) mergeRecords(r1.data as MergeRecordRow[]);
    if (r2 && r2.data && r2.data.length) mergeWrongBook(r2.data as MergeWrongRow[]);
    if (r3 && r3.data && r3.data.length) mergeDailyStats(r3.data as MergeDailyRow[]);
    if (r4 && r4.data && r4.data.length) mergeFavorites(r4.data as MergeFavoriteRow[]);
  } catch { /* ignore */ }
}

export async function addQuestionToDB(q: Question): Promise<boolean> {
  const client = db;
  if (client) {
    const { error } = await client.from('questions').insert(q as never);
    if (error) { toast('添加失败: ' + error.message); return false; }
  }
  const all = getLocal<Question[]>('questions', []);
  q.id = q.id || Date.now();
  all.push(q);
  setLocal('questions', all);
  setQuestionsCache(all);
  toast('添加成功！');
  return true;
}