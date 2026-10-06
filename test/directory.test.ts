import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cachedQuestions, loadDirectory, loadDirView, refreshDirectory, saveMirrorRows, warmSubjectQuestions } from '../src/api';
import type { DirIndex, DirView } from '../src/api';
import { setDb, setQuestionsCache } from '../src/state';
import { getLocal, setLocal } from '../src/storage';
import { markAnswer } from '../src/progress';
import type { Question } from '../src/types';

const PAGE = 1000;
const RETRY_MS = 20000 * 3 + 50;

const Q1: Question = { id: 11, subject: 'politics', chapter: '马原·导论', type: 'single', question: 'q1', options: ['A. a', 'B. b'], answer: 'A', source: '2020年真题' };
const Q2: Question = { id: 12, subject: 'politics', chapter: '马原·导论', type: 'single', question: 'q2', options: ['A. a', 'B. b'], answer: 'B', source: '政治题库' };
const Q_MTH: Question = { id: 13, subject: 'math2', chapter: '第1章 函数、极限、连续', type: 'fill', question: 'q3', answer: '2' };

const CHAPTERS = [{ subject: 'politics', chapter: '马原·导论', total: 2 }];
const PAPERS = [{ subject: 'politics', source: '2020年真题', type: 'single', total: 1 }];
const PRACTICED = [{ id: 11, subject: 'politics', chapter: '马原·导论', source: '2020年真题' }];

function chain(answer: (cols: string) => PromiseLike<unknown>) {
  const b: Record<string, unknown> = {};
  b.select = (cols: string) => { b.__cols = cols; return b; };
  b.eq = () => b;
  b.order = () => b;
  b.range = () => answer(String(b.__cols || '*'));
  b.in = () => answer(String(b.__cols || '*'));
  return b;
}

function viewDb(opts: { noViews?: boolean; practiced?: unknown[] } = {}) {
  const calls: string[] = [];
  const client = {
    from: (table: string) => {
      calls.push(table);
      if (table === 'v_chapter_counts') {
        return chain(() => Promise.resolve(opts.noViews
          ? { data: null, error: { message: 'relation "v_chapter_counts" does not exist' } }
          : { data: CHAPTERS, error: null }));
      }
      if (table === 'v_paper_counts') {
        return chain(() => Promise.resolve(opts.noViews
          ? { data: null, error: { message: 'relation "v_paper_counts" does not exist' } }
          : { data: PAPERS, error: null }));
      }
      return chain(() => Promise.resolve({ data: opts.practiced ?? PRACTICED, error: null }));
    }
  };
  return { client: client as never, calls };
}

function indexDb(subject: string, total: number, opts: { hangFrom?: number; failFrom?: number } = {}) {
  const calls: Array<{ table: string; from: number; cols: string }> = [];
  const rowsFor = (from: number, cols: string): Question[] => {
    const count = Math.max(0, Math.min(PAGE, total - from));
    return Array.from({ length: count }, (_, i) => ({
      id: from + i + 1,
      subject,
      chapter: '第1章 世界的物质性及发展规律',
      type: 'single' as const,
      question: '题干',
      options: ['A. a', 'B. b'],
      answer: 'A'
    }));
  };
  const client = {
    from: (table: string) => {
      const b: Record<string, unknown> = {};
      let from = 0;
      b.select = (cols: string) => { b.__c = cols; return b; };
      b.eq = () => b;
      b.order = () => b;
      b.in = () => b;
      b.range = (start: number) => {
        from = start;
        calls.push({ table, from, cols: String(b.__c || '*') });
        if (table !== 'questions') {
          return Promise.resolve({ data: null, error: { message: 'relation "' + table + '" does not exist' } });
        }
        if (opts.hangFrom !== undefined && start >= opts.hangFrom) return new Promise(() => {});
        if (opts.failFrom !== undefined && start >= opts.failFrom) {
          return Promise.resolve({ data: null, error: { message: '字段不存在' } });
        }
        return Promise.resolve({ data: rowsFor(start, String(b.__c || '*')), error: null });
      };
      return b;
    }
  };
  return { client: client as never, calls };
}

beforeEach(() => {
  localStorage.clear();
  setDb(null);
  setQuestionsCache([]);
});

afterEach(() => {
  vi.useRealTimers();
});

describe('目录计数视图', () => {
  it('视图可用时只发 3 个小请求，不再逐题分页', async () => {
    const { client, calls } = viewDb();
    setDb(client);
    markAnswer(11, true);
    const view = await loadDirView('politics');
    expect(calls).toEqual(['v_chapter_counts', 'v_paper_counts', 'questions']);
    expect(view.fromViews).toBe(true);
    expect(view.chapters).toEqual(CHAPTERS);
    expect(view.sources).toEqual(PAPERS);
    expect(view.practiced).toEqual(PRACTICED);
  });

  it('计数落盘后下次冷启动不再请求', async () => {
    setDb(viewDb().client);
    await loadDirView('politics');
    const again = viewDb();
    setDb(again.client);
    setQuestionsCache([]);
    const second = await loadDirView('politics');
    expect(again.calls).toEqual([]);
    expect(second.complete).toBe(true);
    expect(second.chapters).toHaveLength(1);
  });

  it('视图缺失时降级为逐题索引，目录照样出计数', async () => {
    const { client, calls } = indexDb('politics', 2);
    setDb(client);
    markAnswer(1, true);
    const view = await loadDirView('politics');
    expect(view.fromViews).toBe(false);
    expect(view.complete).toBe(true);
    expect(view.chapters).toEqual([{ chapter: '第1章 世界的物质性及发展规律', total: 2 }]);
    expect(view.practiced.map(p => p.id)).toEqual([1]);
    expect(calls.filter(c => c.table === 'v_chapter_counts').length).toBeGreaterThanOrEqual(1);
  });

  it('已练回查按本地答题条数复用缓存', async () => {
    markAnswer(11, true);
    const first = viewDb();
    setDb(first.client);
    await loadDirView('politics');
    expect(first.calls.filter(c => c === 'questions')).toHaveLength(1);

    localStorage.removeItem('kaoyan_questionsCounts@politics');
    const second = viewDb();
    setDb(second.client);
    await loadDirView('politics');
    expect(second.calls).toEqual(['v_chapter_counts', 'v_paper_counts']);
  });

  it('视图与索引都拿不到时给出原因而不是空目录', async () => {
    setDb(indexDb('politics', 0, { failFrom: 0 }).client);
    const view = await loadDirView('politics');
    expect(view.chapters).toHaveLength(0);
    expect(view.complete).toBe(false);
    expect(view.error).toContain('v_chapter_counts');
  });

  it('管理页导入的数据直接进计数，不请求云端', async () => {
    saveMirrorRows([Q1, Q2, Q_MTH]);
    setQuestionsCache([]);
    setDb(null);
    const view = await loadDirView('politics');
    expect(view.complete).toBe(true);
    expect(view.chapters).toEqual([{ chapter: '马原·导论', total: 2 }]);
  });

  it('预热整科题目每科只做一次', async () => {
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

describe('目录索引（降级路径）', () => {
  it('请求悬挂时按超时返回已拉到的部分目录，不再永久等待', async () => {
    vi.useFakeTimers();
    const { client, calls } = indexDb('politics', 99999, { hangFrom: 2000 });
    setDb(client);
    const p = loadDirectory('politics');
    await vi.advanceTimersByTimeAsync(RETRY_MS);
    const idx = await p;
    expect(idx.rows).toHaveLength(2000);
    expect(idx.complete).toBe(false);
    expect(idx.error).toBe('请求超时');
    expect(calls.map(c => c.from)).toEqual([0, 1000, 2000, 2000, 2000]);
    expect(calls.every(c => c.cols === 'id,subject,chapter,type,source')).toBe(true);
  });

  it('每拉到一页就回调一次，页面可以先出章节再补计数', async () => {
    const painted: number[] = [];
    setDb(indexDb('politics', 2100).client);
    const idx = await loadDirectory('politics', (r: DirIndex) => painted.push(r.rows.length));
    expect(painted).toEqual([1000, 2000, 2100]);
    expect(idx.complete).toBe(true);
    expect(idx.rows).toHaveLength(2100);
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
    const view: DirView = await cold.loadDirView('politics');
    expect(view.chapters).toEqual([{ chapter: '马原·导论', total: 1 }]);
  });

  it('目录换代后旧索引不采信', async () => {
    setLocal('questionsIdx@math2', { fp: 'v0.0.0#旧目录', at: Date.now(), complete: true, rows: [Q_MTH] });
    const idx = await loadDirectory('math2');
    expect(idx.rows).toHaveLength(0);
    expect(idx.error).toBe('未连接 Supabase');
  });

  it('部分索引下次秒开并自动后台补拉', async () => {
    vi.useFakeTimers();
    setDb(indexDb('politics', 99999, { hangFrom: 2000 }).client);
    const hanging = loadDirectory('politics');
    await vi.advanceTimersByTimeAsync(RETRY_MS);
    expect((await hanging).complete).toBe(false);

    const fixed = indexDb('politics', 2500);
    setDb(fixed.client);
    const cached = await loadDirectory('politics');
    expect(cached.rows).toHaveLength(2000);
    await vi.advanceTimersByTimeAsync(50);
    expect(fixed.calls.map(c => c.from)).toEqual([0, 1000, 2000]);
    expect(getLocal<{ complete: boolean }>('questionsIdx@politics', { complete: false }).complete).toBe(true);
    const fresh = await refreshDirectory('politics');
    expect(fresh.rows).toHaveLength(2500);
    expect(cachedQuestions().length).toBeGreaterThanOrEqual(0);
  });
});
