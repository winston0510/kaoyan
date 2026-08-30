export type QuestionType = 'single' | 'multiple' | 'judge' | 'fill' | 'essay';

export interface SectionDef {
  name: string;
  chapters: string[];
}

export interface SubjectDef {
  id: string;
  name: string;
  icon: string;
  color: string;
  sections: SectionDef[];
  chapters: string[];
}

export interface Question {
  id?: number | string;
  subject: string;
  chapter: string;
  type: QuestionType;
  question: string;
  options?: string[];
  answer: string;
  explanation?: string;
  difficulty?: number;
  source?: string;
  created_at?: string;
  userAnswer?: string;
  mastered?: boolean;
  reviewCount?: number;
  wrongTime?: number;
}

export interface QuizRecord {
  question_id: number | string | null;
  subject: string;
  is_correct: boolean;
  user_answer: string;
  created_at: string;
}

export interface WrongBookItem extends Question {
  userAnswer: string;
  mastered: boolean;
  reviewCount: number;
  wrongTime: number;
}

export interface FavoriteItem extends Question {
  favoritedAt: number;
}

export interface MergeFavoriteRow {
  question_id: number | string | null;
  subject?: string | null;
  created_at?: string | null;
}

export interface DailyStat {
  total: number;
  correct: number;
}

export interface QuizState {
  subject: string;
  subjectName: string;
  questions: Question[];
  index: number;
  correct: number;
  wrong: number;
  total: number;
}

export interface MergeRecordRow {
  question_id: number | string | null;
  created_at?: string | null;
  is_correct: boolean | null;
  user_answer?: string | null;
}

export interface MergeWrongRow {
  question_id: number | string | null;
  user_answer?: string | null;
  mastered?: boolean | null;
  review_count?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface MergeDailyRow {
  stat_date: string | null;
  total?: number | null;
  correct?: number | null;
}