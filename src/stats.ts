import { getLocal } from './storage';
import { dateKey } from './streak';

export interface DayCount {
  total: number;
  correct: number;
}

export type DayMap = Record<string, DayCount>;

let cloudDays: DayMap = {};
let cloudSubjects: DayMap = {};
let daysLoaded = false;
let subjectsLoaded = false;

export interface DayRow {
  day?: string | null;
  total?: number | string | null;
  correct?: number | string | null;
}

export interface SubjectRow {
  subject?: string | null;
  total?: number | string | null;
  correct?: number | string | null;
}

function num(v: number | string | null | undefined): number {
  const n = Number(v);
  return isNaN(n) ? 0 : n;
}

export function setCloudDays(rows: DayRow[]): void {
  const out: DayMap = {};
  for (const r of rows || []) {
    const key = String(r?.day ?? '').slice(0, 10);
    if (!key) continue;
    out[key] = { total: num(r.total), correct: num(r.correct) };
  }
  cloudDays = out;
  daysLoaded = true;
}

export function setCloudSubjects(rows: SubjectRow[]): void {
  const out: DayMap = {};
  for (const r of rows || []) {
    const key = String(r?.subject ?? '');
    if (!key) continue;
    out[key] = { total: num(r.total), correct: num(r.correct) };
  }
  cloudSubjects = out;
  subjectsLoaded = true;
}

export function cloudLoaded(): boolean {
  return daysLoaded;
}

export function cloudSubjectsLoaded(): boolean {
  return subjectsLoaded;
}

export function cloudDaysMap(): DayMap {
  return cloudDays;
}

export function cloudSubjectsMap(): DayMap {
  return cloudSubjects;
}

export function daysForDisplay(fallback: DayMap): DayMap {
  return daysLoaded ? cloudDays : fallback;
}

export function subjectsForDisplay(fallback: DayMap): DayMap {
  return subjectsLoaded ? cloudSubjects : fallback;
}

export function dayCount(days: DayMap, key: string): DayCount {
  return days[key] || { total: 0, correct: 0 };
}

export function sumDays(days: DayMap): DayCount {
  let total = 0;
  let correct = 0;
  for (const key of Object.keys(days)) {
    total += days[key].total;
    correct += days[key].correct;
  }
  return { total, correct };
}

export function activeDayKeys(days: DayMap): string[] {
  return Object.keys(days).filter(k => days[k].total > 0);
}

export function mergeDayMaps(base: DayMap, extra: DayMap): DayMap {
  const out: DayMap = {};
  for (const k of Object.keys(base)) out[k] = { ...base[k] };
  for (const k of Object.keys(extra)) {
    if (!out[k] || extra[k].total > out[k].total) out[k] = { ...extra[k] };
  }
  return out;
}

export function recordsToDays(records: { created_at?: string | null; is_correct: boolean }[]): DayMap {
  const out: DayMap = {};
  for (const r of records) {
    if (!r || !r.created_at) continue;
    const parsed = new Date(r.created_at);
    if (isNaN(parsed.getTime())) continue;
    const key = dateKey(parsed);
    const cur = out[key] || { total: 0, correct: 0 };
    cur.total++;
    if (r.is_correct) cur.correct++;
    out[key] = cur;
  }
  return out;
}

export function localTodayDays(): DayMap {
  const out: DayMap = {};
  const prefix = 'kaoyan_today_';
  for (let i = 0; i < localStorage.length; i++) {
    const storageKey = localStorage.key(i);
    if (!storageKey || !storageKey.startsWith(prefix)) continue;
    const day = storageKey.slice(prefix.length);
    const stat = getLocal<DayCount>(`today_${day}`, { total: 0, correct: 0 });
    if (stat && stat.total > 0) out[day] = { total: stat.total, correct: stat.correct || 0 };
  }
  return out;
}

export function accuracyOf(stat: DayCount): number {
  return stat.total > 0 ? Math.round(stat.correct / stat.total * 100) : 0;
}
