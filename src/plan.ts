import { SUBJECTS } from './constants';
import { getLocal, setLocal, todayKey } from './storage';
import { dateKey } from './streak';
import type { QuizRecord } from './types';

export interface PlanConfig {
  examDate: string;
  weeklyMinutes: number;
  targets: Record<string, number>;
  quotas: Record<string, number>;
}

export interface PaperDone {
  source: string;
  subject: string;
  date: string;
  correct: number;
  total: number;
  minutes: number;
}

function defaultTargets(): Record<string, number> {
  const out: Record<string, number> = {};
  for (const s of SUBJECTS) out[s.id] = s.id === 'math2' || s.id === 'circuit' ? 110 : 62;
  return out;
}

function defaultQuotas(): Record<string, number> {
  const out: Record<string, number> = {};
  for (const s of SUBJECTS) out[s.id] = s.id === 'math2' ? 90 : s.id === 'circuit' ? 60 : 55;
  return out;
}

export function defaultPlan(): PlanConfig {
  return { examDate: '2026-12-19', weeklyMinutes: 1080, targets: defaultTargets(), quotas: defaultQuotas() };
}

export function loadPlan(): PlanConfig {
  const d = defaultPlan();
  const saved = getLocal<Partial<PlanConfig>>('plan', {});
  return {
    examDate: saved.examDate || d.examDate,
    weeklyMinutes: saved.weeklyMinutes || d.weeklyMinutes,
    targets: { ...d.targets, ...(saved.targets || {}) },
    quotas: { ...d.quotas, ...(saved.quotas || {}) }
  };
}

export function savePlan(p: PlanConfig): void {
  setLocal('plan', p);
}

export function parseDate(s: string): Date | null {
  const m = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec((s || '').trim());
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return isNaN(d.getTime()) ? null : d;
}

export function daysLeft(examDate: string, now: Date = new Date()): number {
  const d = parseDate(examDate);
  if (!d) return -1;
  const a = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const b = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((a.getTime() - b.getTime()) / 86400000);
}

export function weekStart(now: Date = new Date()): Date {
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const wd = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - wd);
  return d;
}

export function thisWeekRecords(records: QuizRecord[], now: Date = new Date()): QuizRecord[] {
  const start = weekStart(now).getTime();
  return records.filter(r => {
    const d = r.created_at ? new Date(r.created_at) : null;
    return !!d && !isNaN(d.getTime()) && d.getTime() >= start;
  });
}

export function weekCountBySubject(records: QuizRecord[], now: Date = new Date()): Record<string, number> {
  const out: Record<string, number> = {};
  for (const r of thisWeekRecords(records, now)) out[r.subject] = (out[r.subject] || 0) + 1;
  return out;
}

export function weekMinutesBySubject(records: QuizRecord[], now: Date = new Date()): number {
  const days = new Set<string>();
  for (const r of thisWeekRecords(records, now)) {
    const d = new Date(r.created_at);
    if (!isNaN(d.getTime())) days.add(dateKey(d));
  }
  return days.size;
}

export function loadPapersDone(): PaperDone[] {
  return getLocal<PaperDone[]>('papersDone', []);
}

export function recordPaperDone(p: PaperDone): void {
  const list = loadPapersDone().filter(x => !(x.source === p.source && x.subject === p.subject));
  list.push(p);
  setLocal('papersDone', list.slice(-80));
}

export function paperDoneFor(source: string, subject: string): PaperDone | undefined {
  return loadPapersDone().find(x => x.source === source && x.subject === subject);
}

export function planSummary(plan: PlanConfig, records: QuizRecord[], now: Date = new Date()): string[] {
  const left = daysLeft(plan.examDate, now);
  const out: string[] = [];
  if (left < 0) out.push('未设置考试日期');
  else out.push(left === 0 ? '今天开考' : `距初试 ${left} 天`);
  const targetSum = SUBJECTS.reduce((a, s) => a + (plan.targets[s.id] || 0), 0);
  out.push(`目标合计 ${targetSum} 分`);
  const days = weekMinutesBySubject(records, now);
  const wantDays = Math.max(1, Math.round(plan.weeklyMinutes / 108));
  out.push(`本周打卡 ${days}/${wantDays} 天`);
  return out;
}

export function isToday(dateStr: string): boolean {
  return dateStr === todayKey();
}
