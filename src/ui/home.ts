import { SUBJECTS } from '../constants';
import { getLocal, todayKey } from '../storage';
import { calcStreak, studyDays } from '../streak';
import type { WrongBookItem } from '../types';

export function renderHome(): void {
  const today = getLocal<{ total: number; correct: number }>('today_' + todayKey(), { total: 0, correct: 0 });
  const tToday = today || { total: 0, correct: 0 };
  const el1 = document.getElementById('todayTotal');
  const el2 = document.getElementById('todayCorrect');
  const el3 = document.getElementById('todayRate');
  if (el1) el1.textContent = String(tToday.total);
  if (el2) el2.textContent = String(tToday.correct);
  if (el3) el3.textContent = tToday.total > 0 ? Math.round(tToday.correct / tToday.total * 100) + '%' : '-';
  const el4 = document.getElementById('todayStreak');
  if (el4) el4.textContent = String(calcStreak(studyDays()));

  const wrongBook = getLocal<WrongBookItem[]>('wrongBook', []);
  const html = SUBJECTS.map(s => {
    const wc = wrongBook.filter(w => w.subject === s.id && !w.mastered).length;
    return `<div class="subject-card" onclick="openSubject('${s.id}')">
      <div class="subject-icon" style="background:${s.color}18">${s.icon}</div>
      <div class="subject-info"><div class="subject-name">${s.name}</div><div class="subject-chapters">${s.chapters.length} 个章节</div></div>
      <div class="subject-right">${wc > 0 ? `<span class="wrong-badge">${wc} 错题</span>` : ''}<span class="subject-arrow">›</span></div>
    </div>`;
  }).join('');
  const list = document.getElementById('subjectList');
  if (list) list.innerHTML = html;
}

export function selectMode(el: HTMLElement): void {
  const parent = el.parentElement;
  if (!parent) return;
  parent.querySelectorAll('.mode-option').forEach(o => o.classList.remove('active'));
  el.classList.add('active');
}
