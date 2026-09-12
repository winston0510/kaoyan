import { beforeEach, describe, expect, it } from 'vitest';
import {
  accuracyOf,
  activeDayKeys,
  cloudDaysMap,
  cloudLoaded,
  cloudSubjectsLoaded,
  dayCount,
  daysForDisplay,
  localTodayDays,
  recordsToDays,
  setCloudDays,
  setCloudSubjects,
  subjectsForDisplay,
  sumDays
} from '../src/stats';
import { setLocal } from '../src/storage';

beforeEach(() => {
  localStorage.clear();
});

describe('云端统计缓存', () => {
  it('未加载前 cloudLoaded 为 false', () => {
    expect(cloudLoaded()).toBe(false);
    expect(cloudSubjectsLoaded()).toBe(false);
  });

  it('写入行后按日期建索引并可读回', () => {
    setCloudDays([
      { day: '2026-09-10', total: '12', correct: '9' },
      { day: '2026-09-11', total: 5, correct: 5 }
    ]);
    expect(cloudLoaded()).toBe(true);
    expect(dayCount(cloudDaysMap(), '2026-09-10')).toEqual({ total: 12, correct: 9 });
    expect(sumDays(cloudDaysMap())).toEqual({ total: 17, correct: 14 });
  });

  it('忽略缺少日期或为空的行', () => {
    setCloudDays([{ day: '', total: 3, correct: 1 }, { day: '2026-09-12', total: 2, correct: 1 }]);
    expect(Object.keys(cloudDaysMap())).toEqual(['2026-09-12']);
  });
});

describe('recordsToDays 本机记录分桶', () => {
  it('按本地日期聚合并统计正确数', () => {
    const days = recordsToDays([
      { created_at: '2026-09-11T01:30:00.000Z', is_correct: true },
      { created_at: '2026-09-11T10:00:00.000Z', is_correct: false }
    ]);
    expect(Object.values(days).reduce((a, b) => a + b.total, 0)).toBe(2);
  });

  it('跳过无日期与非法日期', () => {
    const days = recordsToDays([
      { created_at: '', is_correct: true },
      { created_at: 'not-a-date', is_correct: true },
      { is_correct: true } as never
    ]);
    expect(days).toEqual({});
  });
});

describe('daysForDisplay 单一来源选择器', () => {
  it('云端已加载时只返回云端日集，不掺本机值', () => {
    setCloudDays([{ day: '2026-09-11', total: 30, correct: 25 }]);
    const local = { '2026-09-11': { total: 40, correct: 30 }, '2026-09-10': { total: 7, correct: 7 } };
    const days = daysForDisplay(local);
    expect(days).toEqual({ '2026-09-11': { total: 30, correct: 25 } });
    expect(sumDays(days)).toEqual({ total: 30, correct: 25 });
  });

  it('分科与日集使用同一来源，Σ分科可与总量对齐', () => {
    setCloudSubjects([{ subject: 'math2', total: 21, correct: 17 }]);
    const subjects = subjectsForDisplay({ circuit: { total: 99, correct: 99 } });
    expect(Object.keys(subjects)).toEqual(['math2']);
    expect(dayCount(subjects, 'circuit').total).toBe(0);
  });
});

describe('打卡与展示辅助', () => {
  it('activeDayKeys 过滤零作答日', () => {
    expect(activeDayKeys({ a: { total: 0, correct: 0 }, b: { total: 1, correct: 0 } })).toEqual(['b']);
  });

  it('accuracyOf 无作答时为 0', () => {
    expect(accuracyOf({ total: 0, correct: 0 })).toBe(0);
    expect(accuracyOf({ total: 4, correct: 3 })).toBe(75);
  });

  it('localTodayDays 收集本机今日计数键', () => {
    setLocal('today_2026-09-11', { total: 6, correct: 5 });
    setLocal('today_2026-09-09', { total: 0, correct: 0 });
    const days = localTodayDays();
    expect(days['2026-09-11']).toEqual({ total: 6, correct: 5 });
    expect(days['2026-09-09']).toBeUndefined();
  });
});
