import { getLocal, setLocal } from './storage';

export type AnswerMark = 'c' | 'w';
export type AnswerState = Record<string, AnswerMark>;

export function answerState(): AnswerState {
  return getLocal<AnswerState>('answerState', {});
}

export function markAnswer(id: number | string | null | undefined, correct: boolean): void {
  if (id === null || id === undefined || id === '') return;
  const key = String(id);
  const state = answerState();
  if (state[key] === 'c') return;
  state[key] = correct ? 'c' : 'w';
  setLocal('answerState', state);
}

export function replaceAnswerState(rows: { question_id: number | string | null; is_correct: boolean | null }[]): void {
  const state = answerState();
  for (const r of rows) {
    if (r.question_id === null || r.question_id === undefined) continue;
    const key = String(r.question_id);
    if (r.is_correct) state[key] = 'c';
    else if (state[key] === undefined) state[key] = 'w';
  }
  setLocal('answerState', state);
}
