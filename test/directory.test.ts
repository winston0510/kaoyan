import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cachedQuestions, loadDirectory, refreshDirectory, saveMirrorRows } from '../src/api';
import { setDb, setQuestionsCache } from '../src/state';
import { getLocal, setLocal } from '../src/storage';
import type { DirIndex } from '../src/api';
import type { Question } from '../src/types';

const PAGE = 1000;
const RETRY_MS = 20000 * 3 + 50;

const Q_POL: Question = { id: 1, subject: 'politics', chapter: '马原·导论', type: 'single', question: 'q', options: ['A. a', 'B. b'], answer: 'A', source: '2020年真题' };
const Q_MTH: Question = { id: 2, subject: 'math2', chapter: '第1章 函数、极限、连续', type: 'fill', question: 'q2', answer: '2' };

function pageRows(from: number, count: number): Question[] {
  return Array.from({ length: count }, (_, i) => ({
    id: from + i + 1,
    subject: 'politics',
    chapter: '第1章 世界的物质性及发展规律',
    type: 'single' as const,
    question: '题干',
    options: ['A. a', 'B. b'],
    answer: 'A'
  }));
}

function fakeDb(opts: { hangFrom?: number; failFrom?: number; total?: number } = {}) {
  const calls: Array<{ cols: string; from: number }> = [];
  const total = opts.total ?? 99999;
  const client = {
    from: () => ({
      select: (cols: string) => ({
        eq: () => ({
          order: () => ({
            range: (from: number) => {
              calls.push({ cols, from });
              if (opts.hangFrom !== undefined && from >= opts.hangFrom) return new Promise(() => {});
              if (opts.failFrom !== undefined && from >= opts.failFrom) return Promise.resolve({ data: null, error: { message: '字段不存在' } });
              return Promise.resolve({ data: pageRows(from, Math.max(0, Math.min(PAGE, total - from))), error: null });
            }
          })
        })
      })
    })
  };
  return { client: client as never, calls };
}

beforeEach(() => {
  vi.useFakeTimers();
  localStorage.clear();
  setDb(null);
  setQuestionsCache([]);
});

afterEach(() => {
  vi.useRealTimers();
});

describe('章节目录索引', () => {
  it('内存镜像已有该科题目时直接派生目录，不发请求', async () => {
    setQuestionsCache([Q_POL, Q_MTH]);
    const dir = await loadDirectory('politics');
    expect(dir.complete).toBe(true);
    expect(dir.rows.map(r => r.chapter)).toEqual(['马原·导论']);
    expect(dir.rows[0].source).toBe('2020年真题');
  });

  it('导入的题目同时进目录索引，管理页添加后章节计数即时生效', async () => {
    saveMirrorRows([Q_POL]);
    const dir = await loadDirectory('politics');
    expect(dir.complete).toBe(true);
    expect(dir.rows).toHaveLength(1);
    expect(getLocal<{ rows: unknown[] }>('questionsIdx@politics', { rows: [] }).rows).toHaveLength(1);
  });

  it('发版作废旧分片时不冲掉目录索引（否则每版都要重拉云端才能看目录）', async () => {
    vi.resetModules();
    const seedApi = await import('../src/api');
    seedApi.saveMirrorRows([Q_POL]);
    const seedState = await import('../src/state');
    seedState.setQuestionsCache([]);
    setLocal('questionsDir', 'v0.0.0#旧目录');

    vi.resetModules();
    const cold = await import('../src/api');
    expect(cold.cachedQuestions()).toHaveLength(0);
    expect(getLocal<Question[]>('questions@politics', [])).toHaveLength(0);
    expect(getLocal<{ rows: unknown[] }>('questionsIdx@politics', { rows: [] }).rows).toHaveLength(1);
    const dir = await cold.loadDirectory('politics');
    expect(dir.rows).toHaveLength(1);
    expect(dir.complete).toBe(true);
  });

  it('目录换代后旧索引不采信，拉不到时给出原因而不是空白', async () => {
    setLocal('questionsIdx@math2', { fp: 'v0.0.0#旧目录', at: Date.now(), complete: true, rows: [Q_MTH] });
    const dir = await loadDirectory('math2');
    expect(dir.rows).toHaveLength(0);
    expect(dir.error).toBe('未连接 Supabase');
  });

  it('请求悬挂时按超时返回已拉到的部分目录，不再永久等待', async () => {
    const { client, calls } = fakeDb({ hangFrom: 2000 });
    setDb(client);
    const p = loadDirectory('politics');
    await vi.advanceTimersByTimeAsync(RETRY_MS);
    const dir = await p;
    expect(dir.rows).toHaveLength(2000);
    expect(dir.complete).toBe(false);
    expect(dir.error).toBe('请求超时');
    expect(calls.map(c => c.from)).toEqual([0, 1000, 2000, 2000, 2000]);
    expect(calls.every(c => c.cols === 'id,subject,chapter,type,source')).toBe(true);
  });

  it('每拉到一页就回调一次，页面可以先出章节再补计数', async () => {
    setDb(fakeDb({ total: 2100 }).client);
    const painted: number[] = [];
    const dir = await loadDirectory('politics', (idx: DirIndex) => painted.push(idx.rows.length));
    expect(painted).toEqual([1000, 2000, 2100]);
    expect(dir.complete).toBe(true);
    expect(dir.rows).toHaveLength(2100);
  });

  it('字段报错时保留已拉到的部分并落盘，下次秒开后再补拉', async () => {
    const broken = fakeDb({ failFrom: 1000 });
    setDb(broken.client);
    const first = await loadDirectory('politics');
    expect(first.rows).toHaveLength(1000);
    expect(first.complete).toBe(false);

    const fixed = fakeDb({ total: 2500 });
    setDb(fixed.client);
    const cached = await loadDirectory('politics');
    expect(cached.rows).toHaveLength(1000);
    await vi.advanceTimersByTimeAsync(50);
    expect(fixed.calls.map(c => c.from)).toEqual([0, 1000, 2000]);
    expect(getLocal<{ complete: boolean }>('questionsIdx@politics', { complete: false }).complete).toBe(true);

    const fresh = await refreshDirectory('politics');
    expect(fresh.rows).toHaveLength(2500);
  });
});
