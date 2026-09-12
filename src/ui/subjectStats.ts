import { SUBJECTS } from '../constants';
import { getLocal } from '../storage';
import { dayCount, recordsToDays, subjectsForDisplay } from '../stats';
import type { QuizRecord, WrongBookItem } from '../types';

export function renderSubjectStats(records: QuizRecord[]): void {
  const subjectTotals = subjectsForDisplay(subjectTotalsFromRecords(records));
  const wrongBook = getLocal<WrongBookItem[]>('wrongBook', []);
  const html = SUBJECTS.map(s => {
    const answered = dayCount(subjectTotals, s.id).total;
    const wrongCount = wrongBook.filter(w => w.subject === s.id && !w.mastered).length;
    return `<div class="subject-stat-row">
      <div class="ss-icon" style="background:${s.color}18">${s.icon}</div>
      <div style="flex:1"><div style="font-weight:600;font-size:.875rem">${s.name}</div><div style="font-size:.75rem;color:var(--text-secondary)">累计 ${answered} 题</div></div>
      ${wrongCount > 0 ? `<span class="tag tag-red">${wrongCount} 错题</span>` : ''}
    </div>`;
  }).join('');
  const el = document.getElementById('subjectStats');
  if (el) el.innerHTML = html;
}

function subjectTotalsFromRecords(records: QuizRecord[]): ReturnType<typeof recordsToDays> {
  const out: ReturnType<typeof recordsToDays> = {};
  for (const r of records) {
    if (!r || !r.subject) continue;
    const cur = out[r.subject] || { total: 0, correct: 0 };
    cur.total++;
    if (r.is_correct) cur.correct++;
    out[r.subject] = cur;
  }
  return out;
}
