import type { Question } from './types';

export interface PaperInfo {
  source: string;
  year: number;
  style: boolean;
  total: number;
  expected: number;
  complete: boolean;
  types: Record<string, number>;
}

const REAL = /^(\d{4})年真题$/;
const STYLE = /^(\d{4})真题风格题$/;

const FULL_COUNT: Record<string, number> = {
  english2: 48,
  politics: 38,
  circuit: 14
};

export function expectedCount(subject: string, year: number): number {
  if (subject === 'math2') return year <= 2020 ? 23 : 22;
  return FULL_COUNT[subject] || 0;
}

export function paperMinutes(subject: string, year: number, total: number): number {
  const full = expectedCount(subject, year) || total;
  if (full <= 0) return 180;
  return Math.max(15, Math.round(180 * Math.min(1, total / full)));
}

function sourceYear(source: string): number {
  const m = REAL.exec(source) || STYLE.exec(source);
  return m ? Number(m[1]) : 0;
}

export function isPaperSource(source?: string): boolean {
  const s = (source || '').trim();
  return REAL.test(s) || STYLE.test(s);
}

export function listPapers(questions: Question[]): PaperInfo[] {
  const groups = new Map<string, Question[]>();
  for (const q of questions) {
    const s = (q.source || '').trim();
    if (!isPaperSource(s)) continue;
    const arr = groups.get(s);
    if (arr) arr.push(q);
    else groups.set(s, [q]);
  }
  const out: PaperInfo[] = [];
  groups.forEach((arr, source) => {
    const year = sourceYear(source);
    const types: Record<string, number> = {};
    for (const q of arr) types[q.type] = (types[q.type] || 0) + 1;
    const expected = expectedCount(arr[0].subject, year);
    out.push({
      source,
      year,
      style: STYLE.test(source),
      total: arr.length,
      expected,
      complete: expected > 0 && arr.length >= expected,
      types
    });
  });
  return out.sort((a, b) => b.year - a.year || Number(a.style) - Number(b.style));
}

function numId(id?: number | string): number {
  const n = Number(id);
  return Number.isFinite(n) ? n : 0;
}

export function paperQuestions(questions: Question[], source: string): Question[] {
  return questions
    .filter(q => (q.source || '').trim() === source)
    .sort((a, b) => numId(a.id) - numId(b.id));
}

export function paperLabel(p: PaperInfo): string {
  return p.style ? `${p.year} 风格套卷` : `${p.year} 真题卷`;
}
