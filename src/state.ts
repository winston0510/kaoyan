import type { SupabaseClient } from '@supabase/supabase-js';
import type { Question, QuizState } from './types';

export let db: SupabaseClient | null = null;
export let questionsCache: Question[] = [];
export let quizState: QuizState | null = null;
export let currentPage = 'home';

export function setDb(client: SupabaseClient | null): void {
  db = client;
}

export function setQuestionsCache(list: Question[]): void {
  questionsCache = list;
}

export function setQuizState(state: QuizState | null): void {
  quizState = state;
}

export function setCurrentPage(page: string): void {
  currentPage = page;
}