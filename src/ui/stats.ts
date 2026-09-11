import { SUBJECTS } from '../constants';
import { getLocal } from '../storage';
import { calcStreak, dateKey, studyDays } from '../streak';
import type { QuizRecord, WrongBookItem } from '../types';

export function renderStats(): void {
  const records = getLocal<QuizRecord[]>('records', []);

  let totalQ = 0, totalC = 0;
  const dayMap: Record<string, { total: number; correct: number }> = {};
  records.forEach(r => {
    const parsed = r.created_at ? new Date(r.created_at) : null;
    const d = parsed && !isNaN(parsed.getTime()) ? dateKey(parsed) : '';
    if (d) {
      if (!dayMap[d]) dayMap[d] = { total: 0, correct: 0 };
      dayMap[d].total++;
      if (r.is_correct) dayMap[d].correct++;
    }
    totalQ++;
    if (r.is_correct) totalC++;
  });

  const overview = document.getElementById('statsOverview');
  if (overview) overview.innerHTML = `
    <div class="stat-item"><div class="num">${totalQ}</div><div class="lbl">累计刷题</div></div>
    <div class="stat-item"><div class="num text-success">${totalC}</div><div class="lbl">累计正确</div></div>
    <div class="stat-item"><div class="num text-primary">${totalQ > 0 ? Math.round(totalC / totalQ * 100) : 0}%</div><div class="lbl">总正确率</div></div>
    <div class="stat-item"><div class="num text-primary">${calcStreak(studyDays())}</div><div class="lbl">连续打卡</div></div>
  `;

  let weekHtml = '';
  let weekTotal = 0;
  const dayNames = ['日', '一', '二', '三', '四', '五', '六'];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const ds = dateKey(d);
    const stat = dayMap[ds] || { total: 0, correct: 0 };
    weekTotal += stat.total;
    const acc = stat.total > 0 ? Math.round(stat.correct / stat.total * 100) : 0;
    const color = acc >= 60 ? 'var(--success)' : (acc >= 30 ? 'var(--warning)' : 'var(--danger)');
    weekHtml += `<div class="week-day"><div class="bar-wrap"><div class="bar" style="height:${Math.max(2, stat.total * 4)}px;background:${color}"></div></div><div class="day-name">${dayNames[d.getDay()]}</div><div class="day-num">${stat.total}</div></div>`;
  }
  const weekEl = document.getElementById('weekChart');
  if (weekEl) weekEl.innerHTML = weekHtml;
  const weekChip = document.getElementById('weekChip');
  if (weekChip) weekChip.textContent = '本周 ' + weekTotal + ' 题';
  const subjectChip = document.getElementById('subjectChip');
  if (subjectChip) subjectChip.textContent = '共 ' + SUBJECTS.length + ' 科';

  const wrongBook = getLocal<WrongBookItem[]>('wrongBook', []);
  const subjectHtml = SUBJECTS.map(s => {
    const subRecords = records.filter(r => r.subject === s.id);
    const wrongCount = wrongBook.filter(w => w.subject === s.id && !w.mastered).length;
    return `<div class="subject-stat-row">
      <div class="ss-icon" style="background:${s.color}18">${s.icon}</div>
      <div style="flex:1"><div style="font-weight:600;font-size:.875rem">${s.name}</div><div style="font-size:.75rem;color:var(--text-secondary)">累计 ${subRecords.length} 题</div></div>
      ${wrongCount > 0 ? `<span class="tag tag-red">${wrongCount} 错题</span>` : ''}
    </div>`;
  }).join('');
  const subEl = document.getElementById('subjectStats');
  if (subEl) subEl.innerHTML = subjectHtml;
}
