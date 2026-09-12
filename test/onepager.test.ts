import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { loadOnePager, onePagerBlock, onePagerFor, onePagerSets, setOnePager } from '../src/onepager';
import { SUBJECTS } from '../src/constants';
import type { Question } from '../src/types';
import rawJson from '../public/onepager.json';

const KINDS = new Set(['概念', '公式', '方法', '步骤', '口诀', '易错']);
const RAW = rawJson;
const MATH2_CHAPTERS = new Set(SUBJECTS.find(s => s.id === 'math2')!.chapters);
const realFetch = globalThis.fetch;

function q(subject: string, chapter: string): Question {
  return { id: 1, subject, chapter, type: 'single', question: '题干', options: ['A. 1', 'B. 2'], answer: 'A' };
}

beforeEach(() => setOnePager(RAW));
afterEach(() => { globalThis.fetch = realFetch; });

describe('onepager.json 数据契约', () => {
  it('slug 唯一、pager 与 slug 对应、章节都在数学二目录内', () => {
    const slugs = RAW.map((k: { slug: string }) => k.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const k of RAW) {
      expect(k.pager).toBe(`/pagers/${k.slug}.pdf`);
      expect(MATH2_CHAPTERS.has(k.chapter), k.chapter).toBe(true);
    }
  });
  it('每条要点都有标题与说明、分类合法、公式 $ 成对', () => {
    for (const k of RAW) {
      expect(k.points.length).toBeGreaterThanOrEqual(8);
      for (const p of k.points) {
        expect(p.t.length).toBeGreaterThan(0);
        expect(p.s.length).toBeGreaterThan(0);
        expect(KINDS.has(p.k)).toBe(true);
        expect(p.tex.split('$').length % 2).toBe(1);
      }
    }
  });
  it('覆盖数学二每个编号章节', () => {
    const covered = new Set(RAW.map((k: { chapter: string }) => k.chapter));
    for (const ch of MATH2_CHAPTERS) {
      if (ch.includes('综合')) continue;
      expect(covered.has(ch), ch).toBe(true);
    }
  });
});

describe('取数与渲染', () => {
  it('非数学二、空章节或脏数据都不出卡', () => {
    expect(onePagerFor('politics', '马原·导论')).toEqual([]);
    expect(onePagerFor('math2', '')).toEqual([]);
    expect(onePagerFor('circuit', '正弦稳态分析')).toEqual([]);
    setOnePager([{ chapter: 1 }, null, { points: [] }] as unknown);
    expect(onePagerFor('math2', '第6章 二次型')).toEqual([]);
  });
  it('答错自动展开、答对折叠', () => {
    const htmlWrong = onePagerBlock(q('math2', '第6章 二次型'), false);
    const htmlRight = onePagerBlock(q('math2', '第6章 二次型'), true);
    expect(htmlWrong).toContain('<details class="kcard" open>');
    expect(htmlWrong).toContain('kc-head-hint');
    expect(htmlRight).toContain('<details class="kcard">');
    expect(htmlRight).not.toContain('kc-head-hint');
  });
  it('公式走 KaTeX 且多条公式分行，不留裸 $', () => {
    const html = onePagerBlock(q('math2', '第2章 一元函数微分学'), true);
    expect(html).toContain('katex');
    expect(html).toContain('kc-tex-line');
    expect(html).not.toMatch(/class="kc-tex(-line)?">\s*\$/);
    expect(html).not.toContain('<script');
  });
  it('数据未就绪时整块为空，拉取成功后可用', async () => {
    setOnePager([]);
    expect(onePagerBlock(q('math2', '第6章 二次型'), false)).toBe('');
    const stub = vi.fn(async (_url: string) => ({ ok: true, json: async () => RAW }));
    globalThis.fetch = stub as unknown as typeof fetch;
    await expect(loadOnePager()).resolves.toBe(true);
    expect(stub.mock.calls[0][0]).toBe('/onepager.json');
    expect(onePagerSets().length).toBe(rawJson.length);
    expect(onePagerBlock(q('math2', '第6章 二次型'), false)).toContain('kc-pager');
  });
});
