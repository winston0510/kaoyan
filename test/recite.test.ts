import { describe, expect, it } from 'vitest';
import { answerPoints, isRecitable } from '../src/recite';

describe('answerPoints 拆要点', () => {
  it('按圈号分条', () => {
    const s = '①承认物质决定意识；②坚持一切从实际出发；③把尊重规律与发挥能动性结合起来';
    expect(answerPoints(s)).toHaveLength(3);
    expect(answerPoints(s)[0]).toContain('物质决定意识');
  });
  it('按（1）与 1. 分条', () => {
    expect(answerPoints('（1）新民主主义革命总路线；（2）三大法宝')).toHaveLength(2);
    expect(answerPoints('1.生产力决定生产关系 2.经济基础决定上层架构')).toHaveLength(2);
  });
  it('兼容字面 \\n 与分号混排，并过滤过短片段', () => {
    const out = answerPoints('要点一的内容说明；\\n要点二的内容说明；短');
    expect(out).toHaveLength(2);
  });
  it('要点数量上限 10', () => {
    const s = Array.from({ length: 14 }, (_, i) => `第${i}个要点的内容说明`).join('；');
    expect(answerPoints(s)).toHaveLength(10);
  });
  it('空输入返回空数组', () => {
    expect(answerPoints('')).toEqual([]);
  });
});

describe('isRecitable 背诵模式适用范围', () => {
  it('只有政治简答题且能拆出两个以上要点才启用', () => {
    expect(isRecitable('politics', 'essay', '①第一点内容；②第二点内容')).toBe(true);
    expect(isRecitable('politics', 'essay', '一句话答案')).toBe(false);
    expect(isRecitable('math2', 'essay', '①第一点内容；②第二点内容')).toBe(false);
    expect(isRecitable('politics', 'single', '①第一点内容；②第二点内容')).toBe(false);
  });
});
