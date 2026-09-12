import { describe, expect, it } from 'vitest';
import { expectedCount, listPapers, paperLabel, paperMinutes, paperQuestions } from '../src/papers';
import type { Question } from '../src/types';

function q(id: number, subject: string, source: string, type: Question['type'] = 'single'): Question {
  return { id, subject, chapter: 'x', type, question: '题目' + id, answer: 'A', source };
}

describe('expectedCount 卷面应有题数', () => {
  it('数学二 2020 及以前 23 题，2021 起 22 题', () => {
    expect(expectedCount('math2', 2019)).toBe(23);
    expect(expectedCount('math2', 2020)).toBe(23);
    expect(expectedCount('math2', 2021)).toBe(22);
    expect(expectedCount('math2', 2026)).toBe(22);
  });
  it('英语二 48、政治 38、电路 14，未知科目 0', () => {
    expect(expectedCount('english2', 2025)).toBe(48);
    expect(expectedCount('politics', 2021)).toBe(38);
    expect(expectedCount('circuit', 2019)).toBe(14);
    expect(expectedCount('unknown', 2019)).toBe(0);
  });
});

describe('listPapers 按来源组卷', () => {
  it('只收真题与风格题来源，并按年份倒序', () => {
    const qs = [
      q(1, 'math2', '2019年真题'),
      q(2, 'math2', '2026年真题'),
      q(3, 'math2', '名师典型·李林'),
      q(4, 'math2', '数学二题库'),
      q(5, 'circuit', '2019真题风格题')
    ];
    const out = listPapers(qs);
    expect(out.map(p => p.source)).toEqual(['2026年真题', '2019年真题', '2019真题风格题']);
    expect(out[0].style).toBe(false);
    expect(out[2].style).toBe(true);
  });
  it('标注是否完整卷并统计题型', () => {
    const qs = [q(1, 'politics', '2016年真题'), q(2, 'politics', '2016年真题', 'multiple')];
    const p = listPapers(qs)[0];
    expect(p.total).toBe(2);
    expect(p.expected).toBe(38);
    expect(p.complete).toBe(false);
    expect(p.types).toEqual({ single: 1, multiple: 1 });
  });
  it('风格题单独成卷且标签写明风格', () => {
    const p = listPapers([q(1, 'circuit', '2021真题风格题')])[0];
    expect(p.style).toBe(true);
    expect(paperLabel(p)).toBe('2021 风格套卷');
    expect(p.complete).toBe(false);
  });
});

describe('paperQuestions 卷面顺序', () => {
  it('按题号数字升序而非字符串序', () => {
    const qs = [q(10, 'math2', '2019年真题'), q(9, 'math2', '2019年真题'), q(2, 'math2', '2020年真题')];
    const out = paperQuestions(qs, '2019年真题');
    expect(out.map(x => x.id)).toEqual([9, 10]);
  });
  it('忽略来源空白差异', () => {
    const one = q(1, 'math2', ' 2019年真题 ');
    expect(paperQuestions([one], '2019年真题')).toHaveLength(1);
  });
});

describe('paperMinutes 建议用时', () => {
  it('完整卷 180 分钟，按题量等比缩减', () => {
    expect(paperMinutes('math2', 2019, 23)).toBe(180);
    expect(paperMinutes('politics', 2016, 19)).toBe(90);
  });
  it('再少也不低于 15 分钟', () => {
    expect(paperMinutes('english2', 2025, 1)).toBe(15);
  });
  it('未知科目按整套 180 分钟', () => {
    expect(paperMinutes('mystery', 2020, 20)).toBe(180);
  });
});
