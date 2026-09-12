import { describe, expect, it } from 'vitest';
import { daysLeft, parseDate, planSummary, weekCountBySubject, weekStart } from '../src/plan';
import type { QuizRecord } from '../src/types';

function rec(subject: string, at: Date, correct = true): QuizRecord {
  return { question_id: 1, subject, is_correct: correct, user_answer: 'A', created_at: at.toISOString() };
}

describe('parseDate 与 daysLeft', () => {
  it('只接受 YYYY-M-D，非法输入返回 null', () => {
    expect(parseDate('2026-12-19')?.getFullYear()).toBe(2026);
    expect(parseDate('2026/12/19')).toBeNull();
    expect(parseDate('')).toBeNull();
  });
  it('倒计时按自然日计算，考试当天为 0', () => {
    expect(daysLeft('2026-12-19', new Date(2026, 8, 12))).toBe(98);
    expect(daysLeft('2026-09-12', new Date(2026, 8, 12))).toBe(0);
    expect(daysLeft('2026-09-01', new Date(2026, 8, 12))).toBeLessThan(0);
    expect(daysLeft('bad', new Date(2026, 8, 12))).toBe(-1);
  });
});

describe('weekStart 周起点', () => {
  it('总是回到本周周一且不超过当天', () => {
    for (const d of [new Date(2026, 8, 12), new Date(2026, 8, 7), new Date(2026, 8, 13, 23, 30)]) {
      const w = weekStart(d);
      expect(w.getDay()).toBe(1);
      expect(w.getTime()).toBeLessThanOrEqual(d.getTime());
      expect(d.getTime() - w.getTime()).toBeLessThan(7 * 86400000);
    }
  });
});

describe('weekCountBySubject 本周各科题量', () => {
  const now = new Date(2026, 8, 12, 12, 0, 0);
  it('只统计本周记录并按科目聚合', () => {
    const out = weekCountBySubject([rec('math2', now), rec('math2', now), rec('circuit', now), rec('politics', new Date(2026, 7, 20))], now);
    expect(out.math2).toBe(2);
    expect(out.circuit).toBe(1);
    expect(out.politics).toBeUndefined();
  });
  it('空记录返回空对象', () => {
    expect(weekCountBySubject([], now)).toEqual({});
  });
});

describe('planSummary 计划概览', () => {
  it('输出剩余天数与目标合计', () => {
    const plan = { examDate: '2026-12-19', weeklyMinutes: 1080, targets: { math2: 110, circuit: 110, english2: 62, politics: 62 }, quotas: {} };
    const out = planSummary(plan, [rec('math2', new Date(2026, 8, 12))], new Date(2026, 8, 12)).join('|');
    expect(out).toContain('距初试 98 天');
    expect(out).toContain('目标合计 344 分');
    expect(out).toContain('本周打卡 1/10 天');
  });
  it('未设日期时给出提示而非负数', () => {
    const plan = { examDate: '', weeklyMinutes: 600, targets: {}, quotas: {} };
    expect(planSummary(plan, []).join('|')).toContain('未设置考试日期');
  });
});
