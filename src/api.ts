import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import { APP_VERSION, SUBJECTS } from './constants';
import { db, setDb, questionsCache, setQuestionsCache } from './state';
import { getLocal, removeLocal, setLocal } from './storage';
import { answerState, replaceAnswerState } from './progress';
import { setCloudDays, setCloudSubjects } from './stats';
import { toast } from './utils';
import BANK_RAW from './data/bank-counts.json';
import type { Question, QuestionType, QuizRecord, MergeRecordRow, MergeWrongRow, MergeFavoriteRow, WrongBookItem, FavoriteItem, DirectoryRow } from './types';

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
const ROWS_RETRY = 1;
const ROWS_TIMEOUT_MS = 20000;
const DIR_RETRY = 1;
const DIR_TIMEOUT_MS = 10000;
const DIR_STALE_MS = 12 * 60 * 60 * 1000;
const DIR_COLS = 'id,subject,chapter,type,source';

const inflight = new Map<string, Promise<Question[]>>();

function filterBySubject(list: Question[], subject: string): Question[] {
  return list.filter(q => q.subject === subject);
}

const SHARD_PREFIX = 'questions@';
const DIR_KEY = 'questionsDir';

function chapterFingerprint(): string {
  return SUBJECTS.map(s => s.id + ':' + s.chapters.join(',')).join('#');
}

function dirFingerprint(): string {
  return APP_VERSION + '#' + chapterFingerprint();
}

function readShard(subject: string): Question[] {
  return getLocal<Question[]>(SHARD_PREFIX + subject, []);
}

function writeShard(subject: string, rows: Question[]): boolean {
  if (setLocal(SHARD_PREFIX + subject, rows)) return true;
  removeLocal(SHARD_PREFIX + subject);
  return false;
}

let mirrorLoaded = false;

function loadMirror(): Question[] {
  if (mirrorLoaded) return questionsCache;
  mirrorLoaded = true;
  if (getLocal<string>(DIR_KEY, '') !== dirFingerprint()) {
    SUBJECTS.forEach(s => removeLocal(SHARD_PREFIX + s.id));
    removeLocal(DIR_KEY);
    removeLocal('questions');
    return questionsCache;
  }
  setQuestionsCache(SUBJECTS.flatMap(s => readShard(s.id)));
  return questionsCache;
}

function cachedQuestions(): Question[] {
  if (questionsCache.length > 0) return questionsCache;
  return loadMirror();
}

export function localId(offset = 0): number {
  return Date.now() + offset;
}

function withTimeout<T>(task: PromiseLike<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('请求超时')), ms);
    Promise.resolve(task).then(
      v => { clearTimeout(timer); resolve(v); },
      e => { clearTimeout(timer); reject(e); }
    );
  });
}

type PagedQuery = PromiseLike<{ data: unknown; error: { message: string } | null }>;

async function runQuery<T>(task: () => PagedQuery, timeoutMs: number, retries: number): Promise<T[]> {
  let lastError: unknown = new Error('题库分页失败');
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const { data, error } = await withTimeout(task(), timeoutMs);
      if (error) throw new Error(error.message);
      return (data || []) as T[];
    } catch (e) {
      lastError = e;
    }
  }
  throw lastError instanceof Error ? lastError : new Error('题库分页失败');
}

function fetchQuestionPage<T>(client: SupabaseClient, subject: string, from: number, cols: string, timeoutMs: number, retries: number): Promise<T[]> {
  return runQuery<T>(() => client
    .from('questions')
    .select(cols)
    .eq('subject', subject)
    .order('id', { ascending: true })
    .range(from, from + PAGE_SIZE - 1) as unknown as PagedQuery, timeoutMs, retries);
}

function fetchViewPage<T>(client: SupabaseClient, view: string, subject: string, order: string): Promise<T[]> {
  return runQuery<T>(() => client
    .from(view)
    .select('*')
    .eq('subject', subject)
    .order(order, { ascending: true })
    .range(0, PAGE_SIZE - 1) as unknown as PagedQuery, DIR_TIMEOUT_MS, DIR_RETRY);
}

async function fetchSubjectPage(client: SupabaseClient, subject: string, from: number): Promise<Question[]> {
  return fetchQuestionPage<Question>(client, subject, from, '*', ROWS_TIMEOUT_MS, ROWS_RETRY);
}

function commitSubject(subject: string, rows: Question[]): void {
  const merged = [...cachedQuestions().filter(q => q.subject !== subject), ...rows];
  if (writeShard(subject, rows)) setLocal(DIR_KEY, dirFingerprint());
  writeDirIndex(subject, { fp: chapterFingerprint(), at: Date.now(), complete: true, rows: toDirRows(rows) });
  setQuestionsCache(merged);
}

export function saveMirrorRows(rows: Question[]): void {
  const fp = dirFingerprint();
  const now = Date.now();
  setQuestionsCache(rows);
  mirrorLoaded = true;
  for (const s of SUBJECTS) {
    const part = rows.filter(q => q.subject === s.id);
    if (part.length === 0) continue;
    if (writeShard(s.id, part)) setLocal(DIR_KEY, fp);
    writeDirIndex(s.id, { fp: chapterFingerprint(), at: now, complete: true, rows: toDirRows(part) });
  }
}

export { cachedQuestions };

const DIR_PREFIX = 'questionsIdx@';

export interface DirIndex {
  fp: string;
  at: number;
  complete: boolean;
  rows: DirectoryRow[];
  error?: string;
}

function emptyDirIndex(error: string): DirIndex {
  return { fp: chapterFingerprint(), at: 0, complete: false, rows: [], error };
}

function readDirIndex(subject: string): DirIndex | null {
  const raw = getLocal<DirIndex | null>(DIR_PREFIX + subject, null);
  if (!raw || raw.fp !== chapterFingerprint() || !Array.isArray(raw.rows)) return null;
  return raw;
}

function writeDirIndex(subject: string, idx: DirIndex): void {
  if (!setLocal(DIR_PREFIX + subject, idx)) removeLocal(DIR_PREFIX + subject);
}

function toDirRows(rows: Question[]): DirectoryRow[] {
  return rows.map(q => ({ id: q.id, subject: q.subject, chapter: q.chapter, type: q.type, source: q.source }));
}

async function fetchDirectory(subject: string, onProgress?: (idx: DirIndex) => void): Promise<DirIndex> {
  const client = db;
  if (!client) return readDirIndex(subject) || emptyDirIndex('未连接 Supabase');
  const rows: DirectoryRow[] = [];
  let error = '';
  for (let page = 0; page < MAX_PAGES; page++) {
    let chunk: DirectoryRow[];
    try {
      chunk = await fetchQuestionPage<DirectoryRow>(client, subject, page * PAGE_SIZE, DIR_COLS, DIR_TIMEOUT_MS, DIR_RETRY);
    } catch (e) {
      error = e instanceof Error ? e.message : '目录请求失败';
      break;
    }
    for (const r of chunk) rows.push(r);
    const partial: DirIndex = {
      fp: chapterFingerprint(),
      at: Date.now(),
      complete: chunk.length < PAGE_SIZE,
      rows: rows.slice()
    };
    writeDirIndex(subject, partial);
    if (partial.complete) {
      if (onProgress) onProgress(partial);
      return partial;
    }
    if (onProgress) onProgress(partial);
  }
  const idx: DirIndex = { fp: chapterFingerprint(), at: Date.now(), complete: false, rows, error: error || '目录未拉全' };
  if (rows.length === 0) {
    const cached = readDirIndex(subject);
    return cached ? { ...cached, error: idx.error } : idx;
  }
  writeDirIndex(subject, idx);
  return idx;
}

const dirInflight = new Map<string, Promise<DirIndex>>();
const dirRefreshed = new Set<string>();

function runDirectoryFetch(subject: string, onProgress?: (idx: DirIndex) => void): Promise<DirIndex> {
  const running = dirInflight.get(subject);
  if (running) {
    if (onProgress) running.then(idx => onProgress(idx)).catch(() => undefined);
    return running;
  }
  const p = fetchDirectory(subject, onProgress).finally(() => {
    if (dirInflight.get(subject) === p) dirInflight.delete(subject);
  });
  dirInflight.set(subject, p);
  return p;
}

export function hasCloud(): boolean {
  return db !== null;
}

export function loadDirectory(subject: string, onProgress?: (idx: DirIndex) => void): Promise<DirIndex> {
  const cached = readDirIndex(subject);
  if (cached) {
    const stale = Date.now() - (cached.at || 0) > DIR_STALE_MS;
    if ((!cached.complete || stale) && db && !dirRefreshed.has(subject)) {
      dirRefreshed.add(subject);
      void runDirectoryFetch(subject, onProgress);
    }
    return Promise.resolve(cached);
  }
  const inMem = filterBySubject(cachedQuestions(), subject);
  if (inMem.length > 0) return Promise.resolve({ fp: chapterFingerprint(), at: Date.now(), complete: true, rows: toDirRows(inMem) });
  return runDirectoryFetch(subject, onProgress);
}

export function refreshDirectory(subject: string, onProgress?: (idx: DirIndex) => void): Promise<DirIndex> {
  if (!db) return Promise.resolve(readDirIndex(subject) || emptyDirIndex('未连接 Supabase'));
  dirRefreshed.add(subject);
  return runDirectoryFetch(subject, onProgress);
}

const warmed = new Set<string>();

export function warmSubjectQuestions(subject: string): void {
  if (!db || warmed.has(subject) || inflight.has(subject)) return;
  if (filterBySubject(cachedQuestions(), subject).length > 0) return;
  warmed.add(subject);
  void loadQuestions(subject).catch(() => undefined);
}

const CHAPTER_VIEW = 'v_chapter_counts';
const PAPER_VIEW = 'v_paper_counts';
const VIEW_STALE_MS = 6 * 60 * 60 * 1000;
const PRACTICE_KEY = 'practicedRows';

export interface ChapterCount {
  chapter: string;
  total: number;
}

export interface SourceCount {
  subject: string;
  source: string;
  type: QuestionType;
  total: number;
}

export interface PracticedRow {
  id?: number | string;
  subject: string;
  chapter: string;
  source?: string;
}

export interface DirView {
  at: number;
  complete: boolean;
  fromViews: boolean;
  fromStatic?: boolean;
  chapters: ChapterCount[];
  sources: SourceCount[];
  practiced: PracticedRow[];
  error?: string;
}

interface BankCounts {
  at: string;
  rows: number;
  chapters: Record<string, Array<[string, number]>>;
  papers: Record<string, Array<[string, string, number]>>;
}

const BANK = BANK_RAW as unknown as BankCounts;

export const BANK_COUNTS_DATE = BANK.at;

function practicedFromIndex(subject: string): PracticedRow[] {
  const idx = readDirIndex(subject);
  if (!idx) return [];
  const state = answerState();
  return idx.rows
    .filter(r => r.id !== undefined && state[String(r.id)] !== undefined)
    .map(r => ({ id: r.id, subject: r.subject, chapter: r.chapter, source: r.source }));
}

function staticDirView(subject: string): DirView {
  return {
    at: 0,
    complete: false,
    fromViews: false,
    fromStatic: true,
    chapters: (BANK.chapters[subject] || []).map(([chapter, total]) => ({ chapter, total })),
    sources: (BANK.papers[subject] || []).map(([source, type, total]) => ({ subject, source, type: type as QuestionType, total })),
    practiced: practicedFromIndex(subject)
  };
}

async function fetchViewRows<T>(client: SupabaseClient, view: string, subject: string, order: string): Promise<T[]> {
  const chunk = await fetchViewPage<T>(client, view, subject, order);
  if (chunk.length >= PAGE_SIZE) throw new Error('计数视图超出单页上限');
  return chunk;
}

function cachedPracticedRows(): PracticedRow[] | null {
  const ids = Object.keys(answerState());
  if (ids.length === 0) return [];
  const cached = getLocal<{ at: number; ids: number; rows: PracticedRow[] } | null>(PRACTICE_KEY, null);
  if (!cached || cached.ids !== ids.length || !Array.isArray(cached.rows)) return null;
  return Date.now() - cached.at > VIEW_STALE_MS ? null : cached.rows;
}

async function fetchPracticedRows(client: SupabaseClient): Promise<PracticedRow[]> {
  const hit = cachedPracticedRows();
  if (hit) return hit;
  const ids = Object.keys(answerState());
  if (ids.length === 0) return [];
  const rows: PracticedRow[] = [];
  for (let i = 0; i < ids.length; i += ID_CHUNK) {
    const part = ids.slice(i, i + ID_CHUNK).map(Number).filter(n => !Number.isNaN(n));
    if (part.length === 0) continue;
    try {
      const chunk = await runQuery<PracticedRow>(() => client
        .from('questions')
        .select('id,subject,chapter,source')
        .in('id', part) as unknown as PagedQuery, DIR_TIMEOUT_MS, DIR_RETRY);
      for (const r of chunk) rows.push(r);
    } catch {
      break;
    }
  }
  setLocal(PRACTICE_KEY, { at: Date.now(), ids: ids.length, rows });
  return rows;
}

function emptyView(at: number, error: string): DirView {
  return { at, complete: false, fromViews: false, chapters: [], sources: [], practiced: [], error };
}

function viewFromRows(rows: DirectoryRow[]): DirView {
  const state = answerState();
  const chapters = new Map<string, number>();
  const sources = new Map<string, number>();
  const practiced: PracticedRow[] = [];
  for (const r of rows) {
    chapters.set(r.chapter, (chapters.get(r.chapter) || 0) + 1);
    const key = r.subject + '|' + (r.source || '') + '|' + r.type;
    sources.set(key, (sources.get(key) || 0) + 1);
    if (r.id !== undefined && state[String(r.id)] !== undefined) {
      practiced.push({ id: r.id, subject: r.subject, chapter: r.chapter, source: r.source });
    }
  }
  return {
    at: Date.now(),
    complete: true,
    fromViews: false,
    chapters: [...chapters].map(([chapter, total]) => ({ chapter, total })),
    sources: [...sources].map(([key, total]) => {
      const [subject, source, type] = key.split('|');
      return { subject, source, type: type as QuestionType, total };
    }),
    practiced
  };
}

const viewInflight = new Map<string, Promise<DirView>>();
const COUNTS_PREFIX = 'questionsCounts@';

function readViewCache(subject: string): DirView | null {
  const raw = getLocal<DirView | null>(COUNTS_PREFIX + subject, null);
  if (!raw || !Array.isArray(raw.chapters) || !Array.isArray(raw.sources)) return null;
  return raw;
}

async function fetchDirView(subject: string): Promise<DirView> {
  const client = db;
  if (!client) {
    const idx = await loadDirectory(subject);
    return idx.rows.length > 0 ? viewFromRows(idx.rows) : emptyView(0, idx.error || '未连接 Supabase');
  }
  let viewError = '';
  try {
    const [chapters, sources, practiced] = await Promise.all([
      fetchViewRows<ChapterCount>(client, CHAPTER_VIEW, subject, 'chapter'),
      fetchViewRows<SourceCount>(client, PAPER_VIEW, subject, 'source'),
      fetchPracticedRows(client)
    ]);
    return { at: Date.now(), complete: true, fromViews: true, chapters, sources, practiced };
  } catch (e) {
    viewError = e instanceof Error ? e.message : '计数视图不可用';
  }
  const idx = await loadDirectory(subject);
  if (idx.rows.length > 0) return viewFromRows(idx.rows);
  return { ...staticDirView(subject), complete: false, error: viewError || '计数与目录均不可用' };
}

function runViewFetch(subject: string, onUpdate?: (v: DirView) => void): Promise<DirView> {
  const running = viewInflight.get(subject);
  if (running) {
    if (onUpdate) running.then(v => onUpdate(v)).catch(() => undefined);
    return running;
  }
  const p = fetchDirView(subject).then(v => {
    if (v.complete) setLocal(COUNTS_PREFIX + subject, v);
    if (onUpdate) onUpdate(v);
    return v;
  }).finally(() => {
    if (viewInflight.get(subject) === p) viewInflight.delete(subject);
  });
  viewInflight.set(subject, p);
  return p;
}

export function loadDirView(subject: string, onUpdate?: (v: DirView) => void): Promise<DirView> {
  const cached = readViewCache(subject);
  if (cached) {
    if (!cached.complete || Date.now() - cached.at > VIEW_STALE_MS) void runViewFetch(subject, onUpdate);
    return Promise.resolve(cached);
  }
  const idx = readDirIndex(subject);
  if (idx && idx.rows.length > 0) {
    if (db && !idx.complete) void runViewFetch(subject, onUpdate);
    return Promise.resolve(viewFromRows(idx.rows));
  }
  if (questionsCache.length > 0) {
    const inMem = filterBySubject(questionsCache, subject);
    if (inMem.length > 0) {
      void runViewFetch(subject, onUpdate);
      return Promise.resolve(viewFromRows(inMem));
    }
  }
  void runViewFetch(subject, onUpdate);
  return Promise.resolve(staticDirView(subject));
}

export function refreshDirView(subject: string, onUpdate?: (v: DirView) => void): Promise<DirView> {
  return runViewFetch(subject, onUpdate);
}

export interface QuestionScope {
  chapters?: string[];
  source?: string;
}

const scopedCache = new Map<string, Question[]>();
const scopedInflight = new Map<string, Promise<Question[]>>();

function scopedQuery(client: SupabaseClient, subject: string, scope: QuestionScope, from: number): PagedQuery {
  const base = client.from('questions').select('*').eq('subject', subject);
  const filtered = scope.source ? base.eq('source', scope.source)
    : scope.chapters && scope.chapters.length > 0 ? base.in('chapter', scope.chapters)
      : base;
  return filtered
    .order('id', { ascending: true })
    .range(from, from + PAGE_SIZE - 1) as unknown as PagedQuery;
}

function scopeKey(subject: string, scope: QuestionScope): string {
  return subject + '|' + (scope.source || '') + '|' + (scope.chapters ? scope.chapters.join(',') : '');
}

async function fetchScoped(subject: string, scope: QuestionScope): Promise<Question[]> {
  const client = db;
  if (!client) {
    const inScope = (q: Question) => (scope.source ? (q.source || '').trim() === scope.source : true)
      && (scope.chapters && scope.chapters.length > 0 ? scope.chapters.includes(q.chapter) : true);
    return filterBySubject(cachedQuestions(), subject).filter(inScope);
  }
  const rows: Question[] = [];
  for (let page = 0; page < MAX_PAGES; page++) {
    const chunk = await runQuery<Question>(() => scopedQuery(client, subject, scope, page * PAGE_SIZE), ROWS_TIMEOUT_MS, ROWS_RETRY);
    for (const r of chunk) rows.push(r);
    if (chunk.length < PAGE_SIZE) break;
  }
  return rows;
}

export function loadScopedQuestions(subject: string, scope: QuestionScope): Promise<Question[]> {
  const key = scopeKey(subject, scope);
  const hit = scopedCache.get(key);
  if (hit) return Promise.resolve(hit);
  const running = scopedInflight.get(key);
  if (running) return running;
  const p = fetchScoped(subject, scope).then(rows => {
    scopedCache.set(key, rows);
    return rows;
  }).finally(() => {
    if (scopedInflight.get(key) === p) scopedInflight.delete(key);
  });
  scopedInflight.set(key, p);
  return p;
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
    .catch(() => filterBySubject(cachedQuestions(), subject))
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

function markDirty(key: 'dirtyWrong' | 'dirtyFav', id: string): void {
  const list = getLocal<string[]>(key, []);
  if (!list.includes(id)) list.push(id);
  setLocal(key, list.slice(-500));
}

function shiftDirty(key: 'dirtyWrong' | 'dirtyFav', kept: string[]): void {
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

export async function flushPending(): Promise<void> {
  const client = db;
  if (!client) return;
  const wrongIds = getLocal<string[]>('dirtyWrong', []);
  const favIds = getLocal<string[]>('dirtyFav', []);
  const records = getLocal<QuizRecord[]>('pendingRecords', []);
  if (!wrongIds.length && !favIds.length && !records.length) return;

  const wrongBook = getLocal<WrongBookItem[]>('wrongBook', []);
  const favorites = getLocal<FavoriteItem[]>('favorites', []);
  const keepWrong: string[] = [];
  const keepFav: string[] = [];
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
  for (const rec of records) {
    const result = await insertRecordRow(client, rec);
    if (result === 'retry') keepRecords.push(rec);
  }
  shiftDirty('dirtyWrong', keepWrong);
  shiftDirty('dirtyFav', keepFav);
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
  for (const q of cachedQuestions()) map.set(String(q.id), q);
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

export async function refreshCloudStats(): Promise<boolean> {
  const client = db;
  if (!client) return false;
  const [days, subjects] = await Promise.all([
    client.from('v_daily_stats').select('day, total, correct').order('day', { ascending: true }),
    client.from('v_subject_stats').select('subject, total, correct').order('subject')
  ]);
  if (days.error || !days.data) return false;
  setCloudDays(days.data as { day: string; total: number; correct: number }[]);
  if (!subjects.error && subjects.data) setCloudSubjects(subjects.data as { subject: string; total: number; correct: number }[]);
  return true;
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
    const [r1, r2, r4] = await Promise.all([
      client.from('quiz_records').select('*').order('created_at', { ascending: false }).limit(1000),
      client.from('wrong_book').select('*'),
      client.from('favorites').select('*'),
      refreshCloudStats()
    ]);
    if (r1 && r1.data && r1.data.length) mergeRecords(r1.data as MergeRecordRow[]);
    if (r2 && r2.data && r2.data.length) await mergeWrongBook(r2.data as MergeWrongRow[]);
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
  saveMirrorRows([...cachedQuestions(), q]);
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
