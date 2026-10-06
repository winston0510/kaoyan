import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { loadDirectory, refreshDirectory, saveMirrorRows } from '../src/api';
import { setDb, setQuestionsCache } from '../src/state';
import { getLocal, setLocal } from '../src/storage';
import type { Question } from '../src/types';

const PAGE = 1000;
const RETRY_MS = 6000 * 2 + 50;

const Q_POL: Question = { id: 1, subject: 'politics', chapter: '马原·导论', type: 'single', question: 'q', options: ['A. a', 'B. b'], answer: 'A', source: '2020年真题' };
const Q_MTH: Question = { id: 2, subject: 'math2', chapter: '第1章 函数、极限、连续', type: 'fill', question: 'q2', answer: '2' };

function pageRows(subject: string, from: number, count: number): Question[] {
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

function fakeDb(hangFrom: number, total: number) {
  const calls: Array<{ cols: string; from: number }> = [];
  const client = {
    from: () => ({
      select: (cols: string) => ({
        eq: () => ({
          order: () => ({
            range: (from: number) =>
              new Promise(resolve => {
                calls.push({ cols, from });
                if (from >= hangFrom) return;
                const count = Math.max(0, Math.min(PAGE, total - from));
                resolve({ data: pageRows('politics', from, count), error: null });
              })
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

  it('目录换代后旧索引不采信', async () => {
    setLocal('questionsIdx@math2', { fp: 'v0.0.0#旧目录', complete: true, rows: [Q_MTH] });
    const dir = await loadDirectory('math2');
    expect(dir.rows).toHaveLength(0);
    expect(dir.complete).toBe(false);
  });

  it('请求悬挂时按超时返回已拉到的部分目录，不再永久等待', async () => {
    const { client, calls } = fakeDb(2000, 99999);
    setDb(client);
    const p = loadDirectory('politics');
    await vi.advanceTimersByTimeAsync(RETRY_MS);
    const dir = await p;
    expect(dir.rows).toHaveLength(2000);
    expect(dir.complete).toBe(false);
    expect(calls.map(c => c.from)).toEqual([0, 1000, 2000, 2000]);
    expect(calls.every(c => c.cols === 'id,subject,chapter,type,source')).toBe(true);
  });

  it('部分目录落盘后下次秒开，并自动后台补拉一次', async () => {
    const first = fakeDb(2000, 99999);
    setDb(first.client);
    const hanging = loadDirectory('politics');
    await vi.advanceTimersByTimeAsync(RETRY_MS);
    expect((await hanging).complete).toBe(false);

    const second = fakeDb(99999, 3000);
    setDb(second.client);
    const cached = await loadDirectory('politics');
    expect(cached.rows).toHaveLength(2000);
    await vi.advanceTimersByTimeAsync(50);
    expect(second.calls.map(c => c.from)).toEqual([0, 1000, 2000, 3000]);
    const stored = getLocal<{ complete: boolean; rows: unknown[] }>('questionsIdx@politics', { complete: false, rows: [] });
    expect(stored.complete).toBe(true);
    expect(stored.rows).toHaveLength(3000);

    const fresh = await refreshDirectory('politics');
    expect(fresh.complete).toBe(true);
    expect(fresh.rows).toHaveLength(3000);
  });
});
