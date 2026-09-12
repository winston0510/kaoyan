import { SUBJECTS } from '../constants';
import { getLocal, todayKey } from '../storage';
import { calcStreak } from '../streak';
import { activeDayKeys, cloudDaysMap, cloudLoaded, dayCount, localTodayDays, mergeDayMaps } from '../stats';
import { daysLeft, loadPapersDone, loadPlan, planSummary, savePlan, weekCountBySubject } from '../plan';
import { esc, toast } from '../utils';
import type { QuizRecord, WrongBookItem } from '../types';

export function renderHome(): void {
  const localToday = getLocal<{ total: number; correct: number }>('today_' + todayKey(), { total: 0, correct: 0 });
  const cloud = cloudDaysMap();
  const today = cloudLoaded() ? dayCount(cloud, todayKey()) : localToday;
  const streakDays = activeDayKeys(mergeDayMaps(cloud, localTodayDays()));
  const el1 = document.getElementById('todayTotal');
  const el2 = document.getElementById('todayCorrect');
  const el3 = document.getElementById('todayRate');
  if (el1) el1.textContent = String(today.total);
  if (el2) el2.textContent = String(today.correct);
  if (el3) el3.textContent = today.total > 0 ? Math.round(today.correct / today.total * 100) + '%' : '-';
  const el4 = document.getElementById('todayStreak');
  if (el4) el4.textContent = String(calcStreak(streakDays));
  const sub = document.getElementById('homeSub');
  if (sub) {
    const n = new Date();
    sub.textContent = (n.getMonth() + 1) + '月' + n.getDate() + '日';
  }

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
  renderPlanStrip();
}

function planHost(): HTMLElement | null {
  const existing = document.getElementById('planStrip');
  if (existing) return existing;
  const list = document.getElementById('subjectList');
  if (!list || !list.parentElement) return null;
  const host = document.createElement('div');
  host.id = 'planStrip';
  list.parentElement.insertBefore(host, list);
  return host;
}

export function renderPlanStrip(): void {
  const host = planHost();
  if (!host) return;
  const plan = loadPlan();
  const records = getLocal<QuizRecord[]>('records', []);
  const week = weekCountBySubject(records);
  const left = daysLeft(plan.examDate);
  const papers = loadPapersDone();
  const lastPaper = papers.length > 0 ? papers[papers.length - 1] : null;
  const rows = SUBJECTS.map(s => {
    const quota = plan.quotas[s.id] || 0;
    const done = week[s.id] || 0;
    const pct = quota > 0 ? Math.min(100, Math.round(done / quota * 100)) : 0;
    return `<div class="plan-row">
      <span class="plan-name">${s.icon} ${s.name}</span>
      <span class="plan-bar"><i style="width:${pct}%"></i></span>
      <span class="plan-num">${done}/${quota}</span>
      <span class="plan-target">目标 ${plan.targets[s.id] || 0}</span>
    </div>`;
  }).join('');
  host.innerHTML = `<div class="plan-card">
    <div class="plan-head">
      <div class="plan-title">${left < 0 ? '未设置考试日期' : left === 0 ? '今天开考' : `距初试 ${left} 天`}</div>
      <button class="btn btn-outline btn-sm" onclick="openPlanModal()">设置计划</button>
    </div>
    ${rows}
    <div class="plan-foot">
      <span>${planSummary(plan, records).join(' · ')}</span>
      ${lastPaper ? `<span>最近套卷 ${esc(lastPaper.source)} ${Math.round(lastPaper.correct / Math.max(1, lastPaper.total) * 100)}%</span>` : ''}
    </div>
  </div>`;
}

export function openPlanModal(): void {
  const plan = loadPlan();
  const rows = SUBJECTS.map(s => `<div class="plan-edit-row">
    <span class="per-name">${s.icon} ${s.name}</span>
    <label>目标分<input type="number" min="0" max="${s.id === 'math2' || s.id === 'circuit' ? 150 : 100}" data-sub="${s.id}" class="pe-target" value="${plan.targets[s.id] || 0}"></label>
    <label>每周题量<input type="number" min="0" max="500" step="5" data-sub="${s.id}" class="pe-quota" value="${plan.quotas[s.id] || 0}"></label>
  </div>`).join('');
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `<div class="modal-panel" onclick="event.stopPropagation()">
    <div class="modal-header"><span class="modal-title">备考计划</span><span class="modal-close" onclick="this.closest('.modal-overlay').remove()">✕</span></div>
    <div class="plan-field"><label>初试日期</label><input type="date" id="peExamDate" value="${esc(plan.examDate)}"></div>
    <div class="plan-field"><label>每周可投入（分钟）</label><input type="number" min="60" max="3000" step="30" id="peWeekly" value="${plan.weeklyMinutes}"></div>
    <div class="plan-edit-head">各科目标分与每周题量</div>
    ${rows}
    <button class="btn btn-primary" onclick="savePlanForm()">保存计划</button>
  </div>`;
  modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
  document.body.appendChild(modal);
}

export function savePlanForm(): void {
  const plan = loadPlan();
  const dateEl = document.getElementById('peExamDate') as HTMLInputElement | null;
  const weeklyEl = document.getElementById('peWeekly') as HTMLInputElement | null;
  if (dateEl && dateEl.value) plan.examDate = dateEl.value;
  if (weeklyEl) {
    const w = parseInt(weeklyEl.value, 10);
    if (w > 0) plan.weeklyMinutes = w;
  }
  document.querySelectorAll<HTMLInputElement>('.pe-target').forEach(i => {
    const sub = i.dataset.sub;
    const v = parseInt(i.value, 10);
    if (sub && v >= 0) plan.targets[sub] = v;
  });
  document.querySelectorAll<HTMLInputElement>('.pe-quota').forEach(i => {
    const sub = i.dataset.sub;
    const v = parseInt(i.value, 10);
    if (sub && v >= 0) plan.quotas[sub] = v;
  });
  savePlan(plan);
  document.querySelector('.modal-overlay')?.remove();
  renderPlanStrip();
  toast('计划已保存');
}

export function selectMode(el: HTMLElement): void {
  const parent = el.parentElement;
  if (!parent) return;
  parent.querySelectorAll('.mode-option').forEach(o => o.classList.remove('active'));
  el.classList.add('active');
}
