import { beforeEach, describe, expect, it } from 'vitest';
import { answerState, markAnswer, replaceAnswerState } from '../src/progress';
import { getLocal, setLocal } from '../src/storage';
import type { AnswerState } from '../src/progress';

beforeEach(() => {
  localStorage.clear();
});

describe('markAnswer 答题状态标记', () => {
  it('首次答错标记为 w', () => {
    markAnswer(7, false);
    expect(answerState()['7']).toBe('w');
  });

  it('答错后答对升级为 c', () => {
    markAnswer(7, false);
    markAnswer(7, true);
    expect(answerState()['7']).toBe('c');
  });

  it('已答对后再答错不降级', () => {
    markAnswer('8', true);
    markAnswer('8', false);
    expect(answerState()['8']).toBe('c');
  });

  it('数字与字符串 id 归一到同一键', () => {
    markAnswer(9, false);
    markAnswer('9', true);
    expect(Object.keys(answerState())).toEqual(['9']);
    expect(answerState()['9']).toBe('c');
  });

  it('空 id 不写入', () => {
    markAnswer(null, true);
    markAnswer(undefined, true);
    expect(answerState()).toEqual({});
  });
});

describe('replaceAnswerState 云端合并', () => {
  it('保留本地更强的已答对状态', () => {
    setLocal('answerState', { '1': 'c' } as AnswerState);
    replaceAnswerState([
      { question_id: 1, is_correct: false },
      { question_id: 2, is_correct: false },
      { question_id: 3, is_correct: true }
    ]);
    const state = getLocal<AnswerState>('answerState', {});
    expect(state['1']).toBe('c');
    expect(state['2']).toBe('w');
    expect(state['3']).toBe('c');
  });

  it('question_id 为空的行跳过', () => {
    replaceAnswerState([{ question_id: null, is_correct: true }]);
    expect(answerState()).toEqual({});
  });
});
