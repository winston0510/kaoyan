import { describe, expect, it } from 'vitest';
import { judgeAnswer, formatCorrectAnswer, isManualType } from '../src/judge';

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
