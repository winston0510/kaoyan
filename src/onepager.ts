import '../css/onepager.css';
import { esc, formatMath } from './utils';
import type { Question } from './types';

export interface KPoint {
  t: string;
  k: string;
  s: string;
  tex: string;
}

export interface KSet {
  slug: string;
  lecture: string;
  chapter: string;
  pager: string;
  points: KPoint[];
}

const KIND_CLASS: Record<string, string> = {
  '概念': 'concept',
  '公式': 'formula',
  '方法': 'method',
  '步骤': 'step',
  '口诀': 'mnemonic',
  '易错': 'pitfall'
};

let sets: KSet[] = [];
let pending: Promise<boolean> | null = null;

export function setOnePager(rows: unknown): void {
  sets = Array.isArray(rows)
    ? rows.filter((k): k is KSet => !!k && typeof k.chapter === 'string' && Array.isArray(k.points))
    : [];
}

export function onePagerSets(): KSet[] {
  return sets;
}

export function loadOnePager(): Promise<boolean> {
  if (sets.length > 0) return Promise.resolve(true);
  if (!pending) {
    pending = fetch('/onepager.json')
      .then(r => (r.ok ? r.json() : []))
      .then(rows => {
        setOnePager(rows);
        return sets.length > 0;
      })
      .catch(() => false);
  }
  return pending;
}

export function onePagerFor(subject: string, chapter: string): KSet[] {
  if (subject !== 'math2' || !chapter) return [];
  return sets.filter(k => k.chapter === chapter);
}

function texLines(tex: string): string {
  return tex.split(/[；;]/)
    .map(s => s.trim())
    .filter(s => s.length > 0)
    .map(s => `<div class="kc-tex-line">${formatMath(s)}</div>`)
    .join('');
}

function pointHtml(p: KPoint): string {
  const kind = KIND_CLASS[p.k] || 'concept';
  const formula = p.tex ? `<div class="kc-tex">${texLines(p.tex)}</div>` : '';
  return `<div class="kc-item"><span class="kc-kind kc-${kind}">${esc(p.k)}</span>`
    + `<div class="kc-text"><b>${esc(p.t)}</b><div class="kc-s">${esc(p.s)}</div>${formula}</div></div>`;
}

function setHtml(set: KSet, open: boolean): string {
  return `<details class="kcard"${open ? ' open' : ''}>`
    + `<summary><span class="kc-title">${esc(set.lecture)}</span><span class="kc-count">${set.points.length} 条</span></summary>`
    + `<div class="kc-body">${set.points.map(pointHtml).join('')}`
    + `<a class="kc-pager" href="${esc(set.pager)}" target="_blank" rel="noopener">看这一页原图 ↗</a>`
    + `</div></details>`;
}

export function onePagerBlock(q: Question, isCorrect: boolean): string {
  const hits = onePagerFor(q.subject, q.chapter);
  if (hits.length === 0) return '';
  const open = !isCorrect;
  const head = open
    ? '<div class="kc-head kc-head-hint">这章的速查卡，看完再走下一题</div>'
    : '<div class="kc-head">本章速查卡</div>';
  return `<div class="kcard-box">${head}${hits.map(s => setHtml(s, open)).join('')}</div>`;
}
