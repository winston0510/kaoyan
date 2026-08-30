import * as katex from 'katex';

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const SUP_MAP: Record<string, string> = {
  '²': '<sup>2</sup>', '³': '<sup>3</sup>', '⁴': '<sup>4</sup>', '⁵': '<sup>5</sup>', '⁶': '<sup>6</sup>',
  '⁷': '<sup>7</sup>', '⁸': '<sup>8</sup>', '⁹': '<sup>9</sup>', '⁰': '<sup>0</sup>', '¹': '<sup>1</sup>'
};

const SUB_MAP: Record<string, string> = {
  '₁': '<sub>1</sub>', '₂': '<sub>2</sub>', '₃': '<sub>3</sub>', '₄': '<sub>4</sub>', '₅': '<sub>5</sub>',
  '₆': '<sub>6</sub>', '₇': '<sub>7</sub>', '₈': '<sub>8</sub>', '₉': '<sub>9</sub>', '₀': '<sub>0</sub>'
};

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function applySupSub(s: string): string {
  let r = s;
  for (const [k, v] of Object.entries(SUP_MAP)) r = r.split(k).join(v);
  for (const [k, v] of Object.entries(SUB_MAP)) r = r.split(k).join(v);
  return r;
}

function renderTex(tex: string, displayMode: boolean): string {
  try {
    return katex.renderToString(tex, { throwOnError: false, displayMode });
  } catch {
    return escapeHtml(tex);
  }
}

const MATH_RE = /\$\$([\s\S]+?)\$\$|\$([^$\n]+?)\$/g;

export function formatMath(str: string): string {
  if (!str) return '';
  let out = '';
  let last = 0;
  MATH_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = MATH_RE.exec(str)) !== null) {
    out += applySupSub(escapeHtml(str.slice(last, m.index)));
    if (m[1] !== undefined) {
      out += '<span class="math-block">' + renderTex(m[1].trim(), true) + '</span>';
    } else {
      out += '<span class="math-inline">' + renderTex(m[2].trim(), false) + '</span>';
    }
    last = m.index + m[0].length;
  }
  out += applySupSub(escapeHtml(str.slice(last)));
  return out;
}

export function toast(msg: string): void {
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => { t.remove(); }, 2000);
}