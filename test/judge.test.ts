import { describe, expect, it } from 'vitest';
import { judgeAnswer, formatCorrectAnswer, isManualType, answerLetters, effectiveType, isMultiChoice, isGradeable } from '../src/judge';
import type { Question } from '../src/types';

function q(part: Partial<Question>): Question {
  return { subject: 'politics', chapter: '第1章', type: 'single', question: '题干', answer: 'A', options: ['A. 甲', 'B. 乙', 'C. 丙', 'D. 丁'], ...part } as Question;
}

describe('answerLetters 答案字母解析', () => {
  it('乱序解析后按字母升序去重', () => {
    expect(answerLetters('BA')).toEqual(['A', 'B']);
    expect(answerLetters('A,B')).toEqual(['A', 'B']);
    expect(answerLetters(' a ')).toEqual(['A']);
    expect(answerLetters('ABA')).toEqual(['A', 'B']);
  });

  it('非字母题型返回空', () => {
    expect(answerLetters('2|二')).toEqual([]);
    expect(answerLetters('')).toEqual([]);
  });
});

describe('judgeAnswer 单选/判断', () => {
  it('大小写与首尾空白不敏感', () => {
    expect(judgeAnswer('single', 'a', 'A')).toBe(true);
    expect(judgeAnswer('single', ' A ', 'a')).toBe(true);
    expect(judgeAnswer('judge', 'TRUE', 'true')).toBe(true);
  });

  it('不同选项判错', () => {
    expect(judgeAnswer('single', 'B', 'A')).toBe(false);
    expect(judgeAnswer('judge', '错', '对')).toBe(false);
  });
});

describe('judgeAnswer 多选', () => {
  it('字母顺序无关', () => {
    expect(judgeAnswer('multiple', 'CAB', 'ABC')).toBe(true);
    expect(judgeAnswer('multiple', 'abc', 'CBA')).toBe(true);
  });

  it('多选一或漏选判错', () => {
    expect(judgeAnswer('multiple', 'AB', 'ABC')).toBe(false);
    expect(judgeAnswer('multiple', 'ABCD', 'ABC')).toBe(false);
  });
});

describe('judgeAnswer 填空', () => {
  it('命中任一候选答案（| 分隔）', () => {
    expect(judgeAnswer('fill', '2', '2|二')).toBe(true);
    expect(judgeAnswer('fill', '二', '2|二')).toBe(true);
  });

  it('归一化：全角转半角 + 大小写 + 空白 + 标点', () => {
    expect(judgeAnswer('fill', 'Ａｂｃ', 'abc')).toBe(true);
    expect(judgeAnswer('fill', 'a b', 'ab')).toBe(true);
    expect(judgeAnswer('fill', '（答案）', '答案')).toBe(true);
    expect(judgeAnswer('fill', '你好，世界', '你好世界')).toBe(true);
  });

  it('未命中/空输入/无候选均判错', () => {
    expect(judgeAnswer('fill', '3', '2|二')).toBe(false);
    expect(judgeAnswer('fill', '', '2')).toBe(false);
    expect(judgeAnswer('fill', '2', '||')).toBe(false);
  });
});

describe('formatCorrectAnswer', () => {
  it('填空题候选用「或」连接并去空白', () => {
    expect(formatCorrectAnswer('fill', ' 2 | 二 |')).toBe('2 或 二');
  });

  it('其他题型原样返回', () => {
    expect(formatCorrectAnswer('single', 'A')).toBe('A');
    expect(formatCorrectAnswer('multiple', 'ABC')).toBe('ABC');
  });
});

describe('isManualType', () => {
  it('仅简答题需人工自评', () => {
    expect(isManualType('essay')).toBe(true);
    expect(isManualType('single')).toBe(false);
    expect(isManualType('fill')).toBe(false);
  });
});

describe('effectiveType 答案驱动的有效题型', () => {
  it('标单选但答案是多个字母 → 按多选处理', () => {
    expect(effectiveType(q({ type: 'single', answer: 'ABC' }))).toBe('multiple');
    expect(isMultiChoice(q({ type: 'single', answer: 'ABC' }))).toBe(true);
    expect(effectiveType(q({ type: 'single', answer: 'AB' }))).toBe('multiple');
  });

  it('标单选且答案单字母仍是单选', () => {
    expect(effectiveType(q({ type: 'single', answer: 'A' }))).toBe('single');
    expect(isMultiChoice(q({ type: 'single', answer: 'A' }))).toBe(false);
  });

  it('多选/判断/填空/简答不改变', () => {
    expect(effectiveType(q({ type: 'multiple', answer: 'A' }))).toBe('multiple');
    expect(effectiveType(q({ type: 'judge', answer: 'A', options: ['A. 正确', 'B. 错误'] }))).toBe('judge');
    expect(effectiveType(q({ type: 'fill', answer: '2|二' }))).toBe('fill');
    expect(effectiveType(q({ type: 'essay', answer: '要点' }))).toBe('essay');
  });
});

describe('judgeAnswer 错标题目的判分', () => {
  it('单选标签 + 多字母答案：选全才对，少选多选均错', () => {
    expect(judgeAnswer('single', 'ABC', 'ABC')).toBe(true);
    expect(judgeAnswer('single', 'CBA', 'ABC')).toBe(true);
    expect(judgeAnswer('single', 'AB', 'ABC')).toBe(false);
    expect(judgeAnswer('single', 'ABCD', 'ABC')).toBe(false);
    expect(judgeAnswer('single', 'A', 'A')).toBe(true);
  });

  it('多选标签 + 单字母答案：只选该字母算对', () => {
    expect(judgeAnswer('multiple', 'B', 'B')).toBe(true);
    expect(judgeAnswer('multiple', 'AB', 'B')).toBe(false);
  });
});

describe('isGradeable 可判分过滤', () => {
  it('答案越界不可判分', () => {
    expect(isGradeable(q({ type: 'multiple', answer: 'ABCDE' }))).toBe(false);
    expect(isGradeable(q({ type: 'single', answer: 'E' }))).toBe(false);
  });

  it('答案为 undefined 之类脏数据不可判分', () => {
    expect(isGradeable(q({ type: 'single', answer: 'undefined' }))).toBe(false);
    expect(isGradeable(q({ type: 'multiple', answer: 'undefined' }))).toBe(false);
  });

  it('四选项内全选可判分', () => {
    expect(isGradeable(q({ type: 'multiple', answer: 'ABCD' }))).toBe(true);
    expect(isGradeable(q({ type: 'single', answer: 'ABC' }))).toBe(true);
  });

  it('判断/填空/简答按各自形态判定', () => {
    expect(isGradeable(q({ type: 'judge', answer: 'A', options: ['A. 正确', 'B. 错误'] }))).toBe(true);
    expect(isGradeable(q({ type: 'judge', answer: 'C', options: ['A. 正确', 'B. 错误'] }))).toBe(false);
    expect(isGradeable(q({ type: 'fill', answer: '2|二' }))).toBe(true);
    expect(isGradeable(q({ type: 'fill', answer: '' }))).toBe(false);
    expect(isGradeable(q({ type: 'essay', answer: '参考答案' }))).toBe(true);
    expect(isGradeable(q({ type: 'single', answer: 'A', options: [] }))).toBe(false);
  });

  it('超长答案（字母数超过选项数）不可判分', () => {
    expect(isGradeable(q({ type: 'multiple', answer: 'ABCDEFG', options: ['A. 甲', 'B. 乙', 'C. 丙'] }))).toBe(false);
    expect(isGradeable(q({ type: 'multiple', answer: 'ABC', options: ['A. 甲', 'B. 乙', 'C. 丙'] }))).toBe(true);
  });
});
