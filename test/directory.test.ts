import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cachedQuestions, loadDirectory, loadDirView, loadScopedQuestions, refreshDirView, saveMirrorRows, warmSubjectQuestions } from '../src/api';
import type { DirView } from '../src/api';
import { setDb, setQuestionsCache } from '../src/state';
import { getLocal, setLocal } from '../src/storage';
import { markAnswer } from '../src/progress';
import { SUBJECTS } from '../src/constants';
import BANK from '../src/data/bank-counts.json';
import type { Question } from '../src/types';

const PAGE = 1000;
const RETRY_MS = 10000 * 2 + 50;

const Q1: Question = { id: 11, subject: 'politics', chapter: '马原·导论', type: 'single', question: 'q1', options: ['A. a', 'B. b'], answer: 'A', source: '2020年真题' };
const Q2: Question = { id: 12, subject: 'politics', chapter: '马原·导论', type: 'single', question: 'q2', options: ['A. a', 'B. b'], answer: 'B', source: '政治题库' };
const Q_MTH: Question = { id: 13, subject: 'math2', chapter: '第1章 函数、极限、连续', type: 'fill', question: 'q3', answer: '2' };

const CHAPTERS = [{ subject: 'politics', chapter: '马原·导论', total: 2 }];
const PAPERS = [{ subject: 'politics', source: '2020年真题', type: 'single', total: 1 }];
const PRACTICED = [{ id: 11, subject: 'politics', chapter: '马原·导论', source: '2020年真题' }];

function rowsFor(from: number, count: number, subject = 'politics'): Question[] {
  return Array.from({ length: count }, (_, i) => ({
    id: from + i + 1,
    subject,
    chapter: '第1章 世界的物质性及发展规律',
    type: 'single' as const,
    question: '题干',
    options: ['A. a', 'B. b'],
    answer: 'A'
  }));
}

interface Call { table: string; cols: string; from: number }

type Handler = (table: string, cols: string, from: number) => Promise<{ data: unknown; error: { message: string } | null }>;

function makeDb(handler: Handler) {
  const calls: Call[] = [];
  const client = {
    from: (table: string) => {
      let cols = '*';
      let from = 0;
      const b: Record<string, unknown> = {
        select: (c: string) => { cols = c; return b; },
        eq: () => b,
        in: () => b,
        order: () => b,
        range: (f: number) => { from = f; return b; },
        then: (res?: (v: unknown) => void, rej?: (e: unknown) => void) => {
          calls.push({ table, cols, from });
          return handler(table, cols, from).then(res, rej);
        }
      };
      return b;
    }
  };
  return { client: client as never, calls };
}

function viewDb(opts: { noViews?: boolean; practiced?: unknown[]; hangViews?: boolean } = {}) {
  return makeDb(table => {
    if (table === 'questions') return Promise.resolve({ data: opts.practiced ?? PRACTICED, error: null });
    if (opts.hangViews) return new Promise(() => {});
    if (opts.noViews) return Promise.resolve({ data: null, error: { message: `relation "${table}" does not exist` } });
    const data = table === 'v_chapter_counts' ? CHAPTERS : PAPERS;
    return Promise.resolve({ data, error: null });
  });
}

function indexDb(subject: string, total: number, opts: { hangFrom?: number; failFrom?: number } = {}) {
  return makeDb((table, _cols, from) => {
    if (table !== 'questions') return Promise.resolve({ data: null, error: { message: `relation "${table}" does not exist` } });
    if (opts.hangFrom !== undefined && from >= opts.hangFrom) return new Promise(() => {});
    if (opts.failFrom !== undefined && from >= opts.failFrom) return Promise.resolve({ data: null, error: { message: '字段不存在' } });
    return Promise.resolve({ data: rowsFor(from, Math.max(0, Math.min(PAGE, total - from)), subject), error: null });
  });
}

beforeEach(() => {
  localStorage.clear();
  setDb(null);
  setQuestionsCache([]);
});

afterEach(() => {
  vi.useRealTimers();
});

describe('发布快照计数', () => {
  it('快照自洽：每章计数之和等于题库行数', () => {
    const chapters = BANK.chapters as unknown as Record<string, Array<[string, number]>>;
    const sum = Object.values(chapters).reduce((a, v) => a + v.reduce((x, pair) => x + pair[1], 0), 0);
    expect(sum).toBe(BANK.rows);
  });

  it('快照里的章名都在前端目录内（否则目录会出现库外章节）', () => {
    const chapters = BANK.chapters as unknown as Record<string, Array<[string, number]>>;
    for (const sub of SUBJECTS) {
      const known = new Set(sub.chapters);
      const outside = (chapters[sub.id] || []).filter(pair => !known.has(pair[0])).map(pair => pair[0]);
      expect(outside, sub.id).toEqual([]);
    }
  });

  it('快照套卷条目是 [source, type, total] 三元组', () => {
    const papers = BANK.papers as unknown as Record<string, unknown[][]>;
    for (const sub of SUBJECTS) {
      const bad = (papers[sub.id] || []).filter(e => e.length !== 3 || typeof e[0] !== 'string' || typeof e[1] !== 'string' || typeof e[2] !== 'number');
      expect(bad, sub.id).toEqual([]);
    }
  });

  it('无缓存时目录先用快照渲染，不等网络', async () => {
    setDb(viewDb().client);
    const view = await loadDirView('politics');
    expect(view.fromStatic).toBe(true);
    expect(view.complete).toBe(false);
    expect(view.chapters.length).toBeGreaterThan(50);
    expect(view.chapters.reduce((a, c) => a + c.total, 0)).toBe(6943);
    expect(view.sources.every(s => typeof s.source === 'string' && typeof s.type === 'string'), '快照套卷的 source/type 必须是字符串，科目页渲染时会对它 trim').toBe(true);
    expect(view.sources.some(s => /^\d{4}年真题$/.test(s.source)), '快照应带出真题套卷').toBe(true);
  });

  it('快照之后后台核对云端，回调拿到完整计数', async () => {
    markAnswer(11, true);
    const db = viewDb();
    setDb(db.client);
    const painted: boolean[] = [];
    await loadDirView('politics', (v: DirView) => painted.push(v.complete));
    await vi.waitFor(() => expect(painted).toContain(true), { timeout: 2000 });
    expect(db.calls.map(c => c.table).sort()).toEqual(['questions', 'v_chapter_counts', 'v_paper_counts']);
  });

  it('云端核对失败时保留快照数字并带上原因', async () => {
    const broken = makeDb(table => Promise.resolve({ data: null, error: { message: `relation "${table}" does not exist` } }));
    setDb(broken.client);
    const fresh = await refreshDirView('math2');
    expect(fresh.complete).toBe(false);
    expect(fresh.chapters.length).toBeGreaterThan(0);
    expect(fresh.chapters.reduce((a, c) => a + c.total, 0)).toBe(2535);
    expect(fresh.error).toContain('v_chapter_counts');
  });

  it('视图缺失时降级逐题索引，仍出真实计数', async () => {
    const { client, calls } = indexDb('politics', 2);
    setDb(client);
    markAnswer(1, true);
    const view = await refreshDirView('politics');
    expect(view.fromViews).toBe(false);
    expect(view.complete).toBe(true);
    expect(view.chapters).toEqual([{ chapter: '第1章 世界的物质性及发展规律', total: 2 }]);
    expect(view.practiced.map(p => p.id)).toEqual([1]);
    expect(calls.some(c => c.table === 'v_chapter_counts')).toBe(true);
  });

  it('云端计数落盘后下次不再走快照', async () => {
    setDb(viewDb().client);
    await refreshDirView('politics');
    const second = viewDb();
    setDb(second.client);
    const cached = await loadDirView('politics');
    expect(cached.fromStatic).toBeUndefined();
    expect(cached.complete).toBe(true);
    expect(second.calls).toEqual([]);
  });

  it('管理页导入的数据直接进计数，不请求云端', async () => {
    saveMirrorRows([Q1, Q2, Q_MTH]);
    setDb(null);
    const view = await loadDirView('politics');
    expect(view.chapters).toEqual([{ chapter: '马原·导论', total: 2 }]);
  });
});

describe('按章与按卷取题', () => {
  it('按章只发一条 chapter 过滤请求，不拉整科', async () => {
    const { client, calls } = indexDb('politics', 3);
    setDb(client);
    const rows = await loadScopedQuestions('english2', { chapters: ['第1章 词汇'] });
    expect(rows).toHaveLength(3);
    expect(calls).toHaveLength(1);
    expect(calls[0].table).toBe('questions');
    expect(calls[0].cols).toBe('*');
  });

  it('按套卷取数用 source 等值过滤，同卷复用缓存', async () => {
    const first = indexDb('politics', 38);
    setDb(first.client);
    await loadScopedQuestions('politics', { source: '2018年真题' });
    expect(first.calls).toHaveLength(1);
    const again = indexDb('politics', 38);
    setDb(again.client);
    const rows = await loadScopedQuestions('politics', { source: '2018年真题' });
    expect(rows).toHaveLength(38);
    expect(again.calls).toHaveLength(0);
  });

  it('未连接 Supabase 时按范围回退到本地镜像', async () => {
    saveMirrorRows([Q1, Q2, Q_MTH]);
    setDb(null);
    expect(await loadScopedQuestions('politics', { chapters: ['马原·导论'] })).toHaveLength(2);
    expect(await loadScopedQuestions('politics', { source: '2020年真题' })).toHaveLength(1);
    expect(await loadScopedQuestions('politics', { source: '不存在来源' })).toHaveLength(0);
  });

  it('范围取数不污染整科镜像（整科仍会回源）', async () => {
    setDb(indexDb('math2', 5).client);
    await loadScopedQuestions('math2', { chapters: ['第2章 一元函数微分学'] });
    expect(cachedQuestions()).toHaveLength(0);
    expect(getLocal<Question[]>('questions@politics', [])).toHaveLength(0);
  });

  it('范围请求失败时抛出，交给页面提示而不是静默空题', async () => {
    setDb(indexDb('politics', 99999, { failFrom: 0 }).client);
    await expect(loadScopedQuestions('circuit', { chapters: ['电路模型与电路定律'] })).rejects.toThrow('字段不存在');
  });
});

describe('目录索引（降级路径）', () => {
  it('请求悬挂时按超时返回已拉到的部分目录', async () => {
    vi.useFakeTimers();
    const { client, calls } = indexDb('politics', 99999, { hangFrom: 2000 });
    setDb(client);
    const p = loadDirectory('politics');
    await vi.advanceTimersByTimeAsync(RETRY_MS);
    const idx = await p;
    expect(idx.rows).toHaveLength(2000);
    expect(idx.complete).toBe(false);
    expect(idx.error).toBe('请求超时');
    expect(calls.map(c => c.from)).toEqual([0, 1000, 2000, 2000]);
    expect(calls.every(c => c.cols === 'id,subject,chapter,type,source')).toBe(true);
  });

  it('每拉到一页就回调一次', async () => {
    const painted: number[] = [];
    setDb(indexDb('politics', 2100).client);
    const idx = await loadDirectory('politics', (r) => painted.push(r.rows.length));
    expect(painted).toEqual([1000, 2000, 2100]);
    expect(idx.complete).toBe(true);
  });

  it('发版作废旧分片时不冲掉目录索引', async () => {
    vi.resetModules();
    const seed = await import('../src/api');
    seed.saveMirrorRows([Q1]);
    const seedState = await import('../src/state');
    seedState.setQuestionsCache([]);
    setLocal('questionsDir', 'v0.0.0#旧目录');

    vi.resetModules();
    const cold = await import('../src/api');
    expect(cold.cachedQuestions()).toHaveLength(0);
    expect(getLocal<Question[]>('questions@politics', [])).toHaveLength(0);
    const idx = await cold.loadDirectory('politics');
    expect(idx.rows).toHaveLength(1);
    expect(idx.complete).toBe(true);
  });
});

describe('整科预热', () => {
  it('每科只预热一次', async () => {
    const { client, calls } = indexDb('politics', 1500);
    setDb(client);
    warmSubjectQuestions('politics');
    warmSubjectQuestions('politics');
    await vi.waitFor(() => expect(calls.filter(c => c.table === 'questions').length).toBeGreaterThanOrEqual(2), { timeout: 2000 });
    const before = calls.length;
    warmSubjectQuestions('politics');
    expect(calls.length).toBe(before);
  });
});
