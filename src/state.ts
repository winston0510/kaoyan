import type { SupabaseClient } from '@supabase/supabase-js';
import { isGradeable } from './judge';
import type { Question, QuizState } from './types';

export let db: SupabaseClient | null = null;
export let questionsCache: Question[] = [];
export let quizState: QuizState | null = null;

export function setDb(client: SupabaseClient | null): void {
  db = client;
}

export function setQuestionsCache(list: Question[]): void {
  questionsCache = list;
}

export function setQuizState(state: QuizState | null): void {
  if (!state) {
    quizState = null;
    return;
  }
  const questions = state.questions.filter(isGradeable);
  quizState = questions.length === state.questions.length ? state : { ...state, questions, total: questions.length };
}
