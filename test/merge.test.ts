import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mergeRecords, mergeWrongBook, mergeDailyStats, mergeFavorites } from '../src/api';
import { setLocal, getLocal } from '../src/storage';
import type { Question, QuizRecord, WrongBookItem, FavoriteItem, MergeRecordRow, MergeWrongRow, MergeDailyRow, MergeFavoriteRow } from '../src/types';

const NOW = new Date(2026, 7, 30, 15, 0, 0);

const Q1: Question = { id: 1, subject: 'politics', chapter: '马原', type: 'single', question: '题1', options: ['A. x', 'B. y'], answer: 'A' };
const Q2: Question = { id: 2, subject: 'math2', chapter: '高等数学', type: 'fill', question: '题2', answer: '2' };

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(NOW);
  localStorage.clear();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('mergeRecords 答题记录合并', () => {
  it('云端与本地并集去重（同 key 只留一条）', () => {
    const local: QuizRecord[] = [
      { question_id: 1, subject: 'politics', is_correct: true, user_answer: 'A', created_at: '2026-08-29T10:00:00Z' }
    ];
    setLocal('records', local);
    const rows: MergeRecordRow[] = [
      { question_id: 1, is_correct: true, user_answer: 'A', created_at: '2026-08-29T10:00:00Z' },
      { question_id: 2, is_correct: false, user_answer: '3', created_at: '2026-08-28T09:00:00Z' }
    ];
    mergeRecords(rows);
    const merged = getLocal<QuizRecord[]>('records', []);
    expect(merged).toHaveLength(2);
  });

  it('按 created_at 升序排列', () => {
    mergeRecords([
      { question_id: 1, is_correct: true, user_answer: 'A', created_at: '2026-08-29T10:00:00Z' },
      { question_id: 2, is_correct: false, user_answer: 'B', created_at: '2026-08-28T09:00:00Z' }
    ]);
    const merged = getLocal<QuizRecord[]>('records', []);
    expect(merged.map(r => r.question_id)).toEqual([2, 1]);
  });

  it('跳过 question_id 为空的行', () => {
    mergeRecords([{ question_id: null, is_correct: true, user_answer: 'A', created_at: '2026-08-29T10:00:00Z' }]);
    expect(getLocal<QuizRecord[]>('records', [])).toHaveLength(0);
  });

  it('最多保留最近 1000 条', () => {
    const rows: MergeRecordRow[] = [];
    for (let i = 0; i < 1200; i++) {
      rows.push({ question_id: i, is_correct: true, user_answer: 'A', created_at: '2026-01-01T00:00:0' + String(i % 10) + 'Z' });
    }
    mergeRecords(rows);
    expect(getLocal<QuizRecord[]>('records', [])).toHaveLength(1000);
  });
});

describe('mergeWrongBook 错题本合并', () => {
  it('仅合并在题目缓存中存在的行', () => {
    setLocal('questions', [Q1]);
    mergeWrongBook([
      { question_id: 1, user_answer: 'B', mastered: false, review_count: 1, updated_at: '2026-08-29T10:00:00Z' },
      { question_id: 999, user_answer: 'C', mastered: false, review_count: 0, updated_at: '2026-08-29T10:00:00Z' }
    ] as MergeWrongRow[]);
    const merged = getLocal<WrongBookItem[]>('wrongBook', []);
    expect(merged).toHaveLength(1);
    expect(merged[0].id).toBe(1);
    expect(merged[0].userAnswer).toBe('B');
    expect(merged[0].question).toBe('题1');
  });

  it('云端更新更晚时覆盖本地，但 mastered 取或', () => {
    setLocal('questions', [Q1]);
    const localItem: WrongBookItem = { ...Q1, userAnswer: 'C', mastered: true, reviewCount: 5, wrongTime: new Date('2026-08-28T00:00:00Z').getTime() };
    setLocal('wrongBook', [localItem]);
    mergeWrongBook([{ question_id: 1, user_answer: 'B', mastered: false, review_count: 2, updated_at: '2026-08-29T10:00:00Z' }] as MergeWrongRow[]);
    const merged = getLocal<WrongBookItem[]>('wrongBook', []);
    expect(merged).toHaveLength(1);
    expect(merged[0].userAnswer).toBe('B');
    expect(merged[0].reviewCount).toBe(2);
    expect(merged[0].mastered).toBe(true);
  });

  it('云端记录更旧时保留本地', () => {
    setLocal('questions', [Q1]);
    const localItem: WrongBookItem = { ...Q1, userAnswer: 'C', mastered: false, reviewCount: 5, wrongTime: new Date('2026-08-29T10:00:00Z').getTime() };
    setLocal('wrongBook', [localItem]);
    mergeWrongBook([{ question_id: 1, user_answer: 'B', mastered: true, review_count: 1, updated_at: '2026-08-28T00:00:00Z' }] as MergeWrongRow[]);
    const merged = getLocal<WrongBookItem[]>('wrongBook', []);
    expect(merged[0].userAnswer).toBe('C');
    expect(merged[0].reviewCount).toBe(5);
  });
});

describe('mergeDailyStats 每日统计合并', () => {
  it('历史记录直接写入对应日期键', () => {
    mergeDailyStats([{ stat_date: '2026-08-01', total: 10, correct: 8 }] as MergeDailyRow[]);
    expect(JSON.parse(localStorage.getItem('kaoyan_today_2026-08-01') as string)).toEqual({ total: 10, correct: 8 });
  });

  it('今天已有本地数据时不被云端覆盖', () => {
    setLocal('today_2026-08-30', { total: 5, correct: 4 });
    mergeDailyStats([{ stat_date: '2026-08-30', total: 1, correct: 0 }] as MergeDailyRow[]);
    expect(getLocal('today_2026-08-30', { total: 0, correct: 0 })).toEqual({ total: 5, correct: 4 });
  });

  it('今天无本地数据时写入云端值', () => {
    mergeDailyStats([{ stat_date: '2026-08-30', total: 2, correct: 1 }] as MergeDailyRow[]);
    expect(getLocal('today_2026-08-30', { total: 0, correct: 0 })).toEqual({ total: 2, correct: 1 });
  });

  it('stat_date 为空的行跳过', () => {
    mergeDailyStats([{ stat_date: null, total: 9, correct: 9 }] as MergeDailyRow[]);
    expect(localStorage.getItem('kaoyan_today_null')).toBeNull();
  });
});

describe('mergeFavorites 收藏合并', () => {
  it('仅合并在题目缓存中存在的行', () => {
    setLocal('questions', [Q2]);
    mergeFavorites([
      { question_id: 2, subject: 'math2', created_at: '2026-08-29T10:00:00Z' },
      { question_id: 999, subject: 'x', created_at: '2026-08-29T10:00:00Z' }
    ] as MergeFavoriteRow[]);
    const merged = getLocal<FavoriteItem[]>('favorites', []);
    expect(merged).toHaveLength(1);
    expect(merged[0].id).toBe(2);
    expect(merged[0].question).toBe('题2');
  });

  it('云端收藏更晚时更新 favoritedAt', () => {
    setLocal('questions', [Q2]);
    const oldTs = new Date('2026-08-01T00:00:00Z').getTime();
    const localFav: FavoriteItem = { ...Q2, favoritedAt: oldTs };
    setLocal('favorites', [localFav]);
    mergeFavorites([{ question_id: 2, created_at: '2026-08-29T10:00:00Z' }] as MergeFavoriteRow[]);
    const merged = getLocal<FavoriteItem[]>('favorites', []);
    expect(merged).toHaveLength(1);
    expect(merged[0].favoritedAt).toBeGreaterThan(oldTs);
  });

  it('云端收藏更旧时保留本地时间', () => {
    setLocal('questions', [Q2]);
    const newTs = new Date('2026-08-29T10:00:00Z').getTime();
    const localFav: FavoriteItem = { ...Q2, favoritedAt: newTs };
    setLocal('favorites', [localFav]);
    mergeFavorites([{ question_id: 2, created_at: '2026-08-01T00:00:00Z' }] as MergeFavoriteRow[]);
    const merged = getLocal<FavoriteItem[]>('favorites', []);
    expect(merged[0].favoritedAt).toBe(newTs);
  });
});
