import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { dateKey, calcStreak, studyDays } from '../src/streak';

const NOW = new Date(2026, 7, 30, 15, 0, 0);

describe('dateKey', () => {
  it('输出 YYYY-MM-DD 且补零', () => {
    expect(dateKey(new Date(2026, 0, 5))).toBe('2026-01-05');
    expect(dateKey(new Date(2026, 11, 31))).toBe('2026-12-31');
  });
});

describe('calcStreak 连续打卡', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('无任何学习日返回 0', () => {
    expect(calcStreak([])).toBe(0);
  });

  it('仅今天学习返回 1', () => {
    expect(calcStreak(['2026-08-30'])).toBe(1);
  });

  it('连续三天（含今天）返回 3', () => {
    expect(calcStreak(['2026-08-28', '2026-08-29', '2026-08-30'])).toBe(3);
  });

  it('今天未学但昨天学了：从昨天起算', () => {
    expect(calcStreak(['2026-08-28', '2026-08-29'])).toBe(2);
  });

  it('今天与昨天都未学返回 0', () => {
    expect(calcStreak(['2026-08-25', '2026-08-27'])).toBe(0);
  });

  it('中断一天则只计今天', () => {
    expect(calcStreak(['2026-08-28', '2026-08-30'])).toBe(1);
  });

  it('跨月连续不断', () => {
    expect(calcStreak(['2026-07-31', '2026-08-01'])).toBe(0);
    vi.setSystemTime(new Date(2026, 7, 1, 10, 0, 0));
    expect(calcStreak(['2026-07-31', '2026-08-01'])).toBe(2);
  });

  it('去重：同一天重复记录不重复计数', () => {
    expect(calcStreak(['2026-08-30', '2026-08-30', '2026-08-29'])).toBe(2);
  });
});

describe('studyDays', () => {
  it('从 localStorage 提取 kaoyan_today_ 前缀日期', () => {
    localStorage.clear();
    localStorage.setItem('kaoyan_today_2026-08-29', '{"total":3,"correct":2}');
    localStorage.setItem('kaoyan_today_2026-08-30', '{"total":1,"correct":1}');
    localStorage.setItem('kaoyan_questions', '[]');
    expect(studyDays().sort()).toEqual(['2026-08-29', '2026-08-30']);
  });
});
