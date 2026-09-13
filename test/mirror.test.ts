import { beforeEach, describe, expect, it } from 'vitest';
import { cachedQuestions, saveMirrorRows } from '../src/api';
import { setQuestionsCache } from '../src/state';
import { getLocal, setLocal } from '../src/storage';
import { APP_VERSION, SUBJECTS } from '../src/constants';
import type { Question } from '../src/types';

const POLITICS_CH = SUBJECTS.find(s => s.id === 'politics')!.chapters[0];
const MATH_CH = SUBJECTS.find(s => s.id === 'math2')!.chapters[0];
const Q1: Question = { id: 1, subject: 'politics', chapter: POLITICS_CH, type: 'single', question: 'q1', options: ['A. a', 'B. b'], answer: 'A' };
const Q2: Question = { id: 2, subject: 'math2', chapter: MATH_CH, type: 'fill', question: 'q2', answer: '2' };

beforeEach(() => {
  localStorage.clear();
  setQuestionsCache([]);
});

describe('题库本地镜像', () => {
  it('冷启动丢弃过期目录的旧分片与废弃整库单键', () => {
    setLocal('questions@politics', [Q1]);
    setLocal('questions', [Q1, Q2]);
    setLocal('questionsDir', 'v0.0.0#旧目录');
    expect(cachedQuestions()).toHaveLength(0);
    expect(getLocal<Question[]>('questions@politics', [])).toHaveLength(0);
    expect(getLocal<Question[]>('questions', [])).toHaveLength(0);
  });
});

describe('镜像写入', () => {
  it('按科目分片落盘并登记目录指纹', () => {
    saveMirrorRows([Q1, Q2]);
    expect(getLocal<Question[]>('questions@politics', [])).toHaveLength(1);
    expect(getLocal<Question[]>('questions@math2', [])).toHaveLength(1);
    expect(getLocal<string>('questionsDir', '')).toContain(APP_VERSION);
    expect(cachedQuestions()).toHaveLength(2);
  });

  it('未登记科目的题目不落盘成分片', () => {
    saveMirrorRows([{ ...Q1, subject: 'unknown' }]);
    expect(SUBJECTS.every(s => getLocal<Question[]>('questions@' + s.id, []).length === 0)).toBe(true);
  });
});
