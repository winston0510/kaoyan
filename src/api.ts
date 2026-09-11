import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import { SUBJECTS } from './constants';
import { db, setDb, questionsCache, setQuestionsCache } from './state';
import { getLocal, setLocal, todayKey } from './storage';
import { replaceAnswerState } from './progress';
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
    void pullFromDB();
  } else {
    toast('已保存，请刷新页面');
  }
}

const PAGE_SIZE = 1000;
const MAX_PAGES = 50;
const ID_CHUNK = 200;

const inflight = new Map<string, Promise<Question[]>>();

function filterBySubject(list: Question[], subject: string): Question[] {
  return list.filter(q => q.subject === subject);
}

let storageMirror: Question[] | null = null;

function cachedQuestions(): Question[] {
  if (questionsCache.length > 0) return questionsCache;
  if (storageMirror === null) storageMirror = getLocal<Question[]>('questions', []);
  return storageMirror;
}

export function localId(offset = 0): number {
  return Date.now() + offset;
}

async function fetchSubjectPage(client: SupabaseClient, subject: string, from: number): Promise<Question[]> {
  const { data, error } = await client
    .from('questions')
    .select('*')
    .eq('subject', subject)
    .order('id', { ascending: true })
    .range(from, from + PAGE_SIZE - 1);
  if (error) throw error;
  return (data || []) as Question[];
}

function commitSubject(subject: string, rows: Question[]): void {
  const merged = [...cachedQuestions().filter(q => q.subject !== subject), ...rows];
  storageMirror = merged;
  setQuestionsCache(merged);
  setLocal('questions', merged);
}

async function fetchFromNetwork(subject: string): Promise<Question[]> {
  const client = db;
  if (!client) return [];
  const rows: Question[] = [];
  for (let page = 0; page < MAX_PAGES; page++) {
    const chunk = await fetchSubjectPage(client, subject, page * PAGE_SIZE);
    for (const row of chunk) rows.push(row);
    if (chunk.length < PAGE_SIZE) break;
  }
  commitSubject(subject, rows);
  return rows;
}

async function fetchQuestionsByIds(ids: string[]): Promise<Question[]> {
  const client = db;
  if (!client || ids.length === 0) return [];
  const out: Question[] = [];
  for (let i = 0; i < ids.length; i += ID_CHUNK) {
    const { data, error } = await client.from('questions').select('*').in('id', ids.slice(i, i + ID_CHUNK));
    if (error) break;
    for (const row of (data || []) as Question[]) out.push(row);
  }
  return out;
}

function refreshInBackground(subject: string): void {
  if (!db || inflight.has(subject)) return;
  const p = fetchFromNetwork(subject)
    .catch(() => [] as Question[])
    .finally(() => inflight.delete(subject));
  inflight.set(subject, p);
}

export async function loadQuestions(subject: string): Promise<Question[]> {
  const inMem = filterBySubject(cachedQuestions(), subject);
  if (inMem.length > 0) {
    refreshInBackground(subject);
    return inMem;
  }
  if (!db) return inMem;
  const pending = inflight.get(subject);
  if (pending) return pending;
  const p = fetchFromNetwork(subject)
    .catch(() => filterBySubject(getLocal<Question[]>('questions', []), subject))
    .finally(() => inflight.delete(subject));
  inflight.set(subject, p);
  return p;
}

let allPending: Promise<Question[]> | null = null;

export function ensureAllQuestions(): Promise<Question[]> {
  if (allPending) return allPending;
  const p = (async () => {
    for (const s of SUBJECTS) {
      if (filterBySubject(cachedQuestions(), s.id).length > 0) continue;
      if (!db) break;
      try {
        await fetchFromNetwork(s.id);
      } catch {
      }
    }
    return cachedQuestions();
  })().finally(() => {
    if (allPending === p) allPending = null;
  });
  allPending = p;
  return p;
}

function markDirty(key: 'dirtyWrong' | 'dirtyFav' | 'dirtyDaily', id: string): void {
  const list = getLocal<string[]>(key, []);
  if (!list.includes(id)) list.push(id);
  setLocal(key, list.slice(-500));
}

function shiftDirty(key: 'dirtyWrong' | 'dirtyFav' | 'dirtyDaily', kept: string[]): void {
  setLocal(key, kept.slice(-500));
}

function pushPendingRecord(rec: QuizRecord): void {
  const list = getLocal<QuizRecord[]>('pendingRecords', []);
  list.push(rec);
  setLocal('pendingRecords', list.slice(-200));
}

async function insertRecordRow(client: SupabaseClient, rec: QuizRecord): Promise<'ok' | 'retry' | 'drop'> {
  const { error } = await client.from('quiz_records').insert(rec as never);
  if (!error) return 'ok';
  return error.code === '23503' ? 'drop' : 'retry';
}

async function upsertWrongRow(client: SupabaseClient, item: WrongBookItem): Promise<boolean> {
  const { error } = await client.from('wrong_book').upsert(
    {
      question_id: item.id,
      subject: item.subject,
      user_answer: item.userAnswer || '',
      mastered: !!item.mastered,
      updated_at: new Date().toISOString()
    } as never,
    { onConflict: 'question_id' }
  );
  return !error;
}

async function upsertFavoriteRow(client: SupabaseClient, item: FavoriteItem): Promise<boolean> {
  const { error } = await client.from('favorites').upsert(
    { question_id: item.id, subject: item.subject, created_at: new Date().toISOString() } as never,
    { onConflict: 'question_id' }
  );
  return !error;
}

async function deleteByQuestion(client: SupabaseClient, table: 'wrong_book' | 'favorites', questionId: string): Promise<boolean> {
  const { error } = await client.from(table).delete().eq('question_id', questionId);
  return !error;
}

async function upsertDailyRow(client: SupabaseClient, date: string, stat: DailyStat): Promise<boolean> {
  const { error } = await client.from('daily_stats').upsert(
    {
      stat_date: date,
      total: stat.total || 0,
      correct: stat.correct || 0,
      wrong: (stat.total || 0) - (stat.correct || 0)
    } as never,
    { onConflict: 'stat_date' }
  );
  return !error;
}

export async function syncRecordToDB(record: QuizRecord): Promise<void> {
  const client = db;
  if (!client || !record.question_id) return;
  const result = await insertRecordRow(client, record);
  if (result === 'retry') pushPendingRecord(record);
}

export async function syncWrongBookToDB(q: Question, userAnswer: string, isCorrect: boolean): Promise<void> {
  const client = db;
  if (!client || q.id === undefined || q.id === null) return;
  const id = String(q.id);
  const ok = isCorrect
    ? await deleteByQuestion(client, 'wrong_book', id)
    : await upsertWrongRow(client, { ...q, userAnswer } as WrongBookItem);
  if (!ok) markDirty('dirtyWrong', id);
}

export async function syncFavoriteToDB(q: Question, isFavorite: boolean): Promise<void> {
  const client = db;
  if (!client || q.id === undefined || q.id === null) return;
  const id = String(q.id);
  const ok = isFavorite
    ? await upsertFavoriteRow(client, { ...q, favoritedAt: Date.now() } as FavoriteItem)
    : await deleteByQuestion(client, 'favorites', id);
  if (!ok) markDirty('dirtyFav', id);
}

export async function syncTodayToDB(todayStats: DailyStat, date: string): Promise<void> {
  const client = db;
  if (!client) return;
  const ok = await upsertDailyRow(client, date, todayStats);
  if (!ok) markDirty('dirtyDaily', date);
}

export async function flushPending(): Promise<void> {
  const client = db;
  if (!client) return;
  const wrongIds = getLocal<string[]>('dirtyWrong', []);
  const favIds = getLocal<string[]>('dirtyFav', []);
  const dates = getLocal<string[]>('dirtyDaily', []);
  const records = getLocal<QuizRecord[]>('pendingRecords', []);
  if (!wrongIds.length && !favIds.length && !dates.length && !records.length) return;

  const wrongBook = getLocal<WrongBookItem[]>('wrongBook', []);
  const favorites = getLocal<FavoriteItem[]>('favorites', []);
  const keepWrong: string[] = [];
  const keepFav: string[] = [];
  const keepDates: string[] = [];
  const keepRecords: QuizRecord[] = [];

  for (const id of wrongIds) {
    const item = wrongBook.find(w => String(w.id) === id);
    const ok = item ? await upsertWrongRow(client, item) : await deleteByQuestion(client, 'wrong_book', id);
    if (!ok) keepWrong.push(id);
  }
  for (const id of favIds) {
    const item = favorites.find(f => String(f.id) === id);
    const ok = item ? await upsertFavoriteRow(client, item) : await deleteByQuestion(client, 'favorites', id);
    if (!ok) keepFav.push(id);
  }
  for (const date of dates) {
    const stat = getLocal<DailyStat>('today_' + date, { total: 0, correct: 0 });
    if (!(await upsertDailyRow(client, date, stat))) keepDates.push(date);
  }
  for (const rec of records) {
    const result = await insertRecordRow(client, rec);
    if (result === 'retry') keepRecords.push(rec);
  }
  shiftDirty('dirtyWrong', keepWrong);
  shiftDirty('dirtyFav', keepFav);
  shiftDirty('dirtyDaily', keepDates);
  if (records.length) setLocal('pendingRecords', keepRecords.slice(-200));
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
  replaceAnswerState(merged);
  setLocal('records', merged.slice(-1000));
}

function questionIndex(): Map<string, Question> {
  const map = new Map<string, Question>();
  for (const q of getLocal<Question[]>('questions', [])) map.set(String(q.id), q);
  for (const q of questionsCache) if (!map.has(String(q.id))) map.set(String(q.id), q);
  return map;
}

export async function mergeWrongBook(rows: MergeWrongRow[]): Promise<void> {
  const local = getLocal<WrongBookItem[]>('wrongBook', []);
  const known = questionIndex();
  const missing = [...new Set(rows.filter(r => r.question_id != null).map(r => String(r.question_id)))].filter(id => !known.has(id));
  if (missing.length > 0) {
    for (const q of await fetchQuestionsByIds(missing)) known.set(String(q.id), q);
  }
  const byId: Record<string, WrongBookItem> = {};
  local.forEach(w => { if (w.id != null) byId[String(w.id)] = w; });
  rows.forEach(row => {
    if (row.question_id == null) return;
    const key = String(row.question_id);
    const fromCache = known.get(key);
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

export async function mergeFavorites(rows: MergeFavoriteRow[]): Promise<void> {
  const local = getLocal<FavoriteItem[]>('favorites', []);
  const known = questionIndex();
  const missing = [...new Set(rows.filter(r => r.question_id != null).map(r => String(r.question_id)))].filter(id => !known.has(id));
  if (missing.length > 0) {
    for (const q of await fetchQuestionsByIds(missing)) known.set(String(q.id), q);
  }
  const byId: Record<string, FavoriteItem> = {};
  local.forEach(f => { if (f.id != null) byId[String(f.id)] = f; });
  rows.forEach(row => {
    if (row.question_id == null) return;
    const key = String(row.question_id);
    const fromCache = known.get(key);
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
    await flushPending();
    const [r1, r2, r3, r4] = await Promise.all([
      client.from('quiz_records').select('*').order('created_at', { ascending: false }).limit(1000),
      client.from('wrong_book').select('*'),
      client.from('daily_stats').select('*'),
      client.from('favorites').select('*')
    ]);
    if (r1 && r1.data && r1.data.length) mergeRecords(r1.data as MergeRecordRow[]);
    if (r2 && r2.data && r2.data.length) await mergeWrongBook(r2.data as MergeWrongRow[]);
    if (r3 && r3.data && r3.data.length) mergeDailyStats(r3.data as MergeDailyRow[]);
    if (r4 && r4.data && r4.data.length) await mergeFavorites(r4.data as MergeFavoriteRow[]);
  } catch {
  }
}

export async function addQuestionToDB(q: Question): Promise<boolean> {
  const client = db;
  if (client) {
    const { data, error } = await client.from('questions').insert(q as never).select('id');
    if (error) { toast('添加失败: ' + error.message); return false; }
    const row = (data || [])[0] as { id?: number } | undefined;
    if (row && row.id !== undefined) q.id = row.id;
  }
  if (q.id === undefined || q.id === null) q.id = localId();
  const all = [...cachedQuestions(), q];
  setQuestionsCache(all);
  setLocal('questions', all);
  toast('添加成功！');
  return true;
}

export async function insertQuestionsBatch(list: Question[]): Promise<Question[]> {
  const client = db;
  if (!client) return list.map((q, i) => ({ ...q, id: q.id ?? localId(i) }));
  const out: Question[] = [];
  for (let i = 0; i < list.length; i += 100) {
    const chunk = list.slice(i, i + 100).map(({ id, dedup_key, ...rest }) => rest as Question);
    const { data, error } = await client.from('questions').insert(chunk as never).select('id');
    if (error) { toast('导入失败: ' + error.message); break; }
    const rows = (data || []) as { id: number }[];
    chunk.forEach((q, j) => out.push({ ...q, id: rows[j]?.id ?? localId(i + j) }));
  }
  return out;
}
