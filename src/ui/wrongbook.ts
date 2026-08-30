import { SUBJECTS, TYPE_LABELS } from '../constants';
import { getLocal } from '../storage';
import { todayKey } from '../storage';
import { formatMath } from '../utils';
import type { QuizRecord, WrongBookItem } from '../types';

export function renderWrongBook(): void {
  const wrongBook = getLocal<WrongBookItem[]>('wrongBook', []);
  const subjectFilter = wrongBook.filter(w => !w.mastered);
  const activeEl = document.querySelector<HTMLElement>('#wrongFilter .filter-chip.active');
  const activeSubject = activeEl?.dataset?.subject || '';

  const filterHtml = `<span class="filter-chip ${activeSubject === '' ? 'active' : ''}" data-subject="" onclick="setWrongFilter('')">全部 (${subjectFilter.length})</span>` +
    SUBJECTS.map(s => {
      const cnt = subjectFilter.filter(w => w.subject === s.id).length;
      return cnt > 0 ? `<span class="filter-chip ${activeSubject === s.id ? 'active' : ''}" data-subject="${s.id}" onclick="setWrongFilter('${s.id}')">${s.name} (${cnt})</span>` : '';
    }).join('');
  const filterEl = document.getElementById('wrongFilter');
  if (filterEl) filterEl.innerHTML = filterHtml;

  const filtered = activeSubject ? subjectFilter.filter(w => w.subject === activeSubject) : subjectFilter;
  const emptyEl = document.getElementById('wrongEmpty');
  if (emptyEl) emptyEl.style.display = filtered.length === 0 ? '' : 'none';

  const listHtml = filtered.map(q => {
    const typeLabel = TYPE_LABELS[q.type] || '';
    const sub = SUBJECTS.find(s => s.id === q.subject);
    let optHtml = '';
    if (q.options && q.options.length) {
      optHtml = q.options.map((opt, i) => {
        const letter = String.fromCharCode(65 + i);
        const cls = letter === q.answer ? 'correct-opt' : (letter === q.userAnswer ? 'wrong-opt' : '');
        return `<span class="wc-option ${cls}">${formatMath(opt)}</span>`;
      }).join('');
    }
    return `<div class="wrong-card">
      <div class="wc-header"><span class="tag tag-gray">${typeLabel}</span><span class="tag tag-red" style="font-size:.6875rem">${sub ? sub.name : ''} · ${q.chapter || ''}</span></div>
      <div class="wc-question">${formatMath(q.question)}</div>
      ${optHtml ? `<div class="wc-options">${optHtml}</div>` : ''}
      <div class="wc-answer" onclick="this.nextElementSibling.style.display=this.nextElementSibling.style.display==='none'?'':'none'">
        <span>你的答案：<b style="color:var(--danger)">${q.userAnswer}</b></span><span style="color:var(--primary)">查看答案</span>
      </div>
      <div class="wc-detail" style="display:none"><b style="color:var(--success)">正确答案：${formatMath(q.answer)}</b>${q.explanation ? `<br>${formatMath(q.explanation)}` : ''}</div>
    </div>`;
  }).join('');
  const list = document.getElementById('wrongList');
  if (list) list.innerHTML = listHtml;
}

export function setWrongFilter(subject: string): void {
  document.querySelectorAll<HTMLElement>('#wrongFilter .filter-chip').forEach(c => c.classList.toggle('active', c.dataset.subject === subject));
  renderWrongBook();
}

export function activeTodayKey(): string {
  return todayKey();
}