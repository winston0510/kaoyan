import { calcStreak, dateKey } from '../streak';
import { accuracyOf, activeDayKeys, dayCount, sumDays } from '../stats';
import type { DayMap } from '../stats';

export function renderDailyOverview(days: DayMap): void {
  const sum = sumDays(days);
  const el = document.getElementById('statsOverview');
  if (el) el.innerHTML = `
    <div class="stat-item"><div class="num">${sum.total}</div><div class="lbl">累计刷题</div></div>
    <div class="stat-item"><div class="num text-success">${sum.correct}</div><div class="lbl">累计正确</div></div>
    <div class="stat-item"><div class="num text-primary">${accuracyOf(sum)}%</div><div class="lbl">总正确率</div></div>
    <div class="stat-item"><div class="num text-primary">${calcStreak(activeDayKeys(days))}</div><div class="lbl">连续打卡</div></div>
  `;
}

export function renderWeekChart(days: DayMap): void {
  let html = '';
  let total = 0;
  const names = ['日', '一', '二', '三', '四', '五', '六'];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const stat = dayCount(days, dateKey(d));
    total += stat.total;
    const acc = accuracyOf(stat);
    const color = acc >= 60 ? 'var(--success)' : (acc >= 30 ? 'var(--warning)' : 'var(--danger)');
    html += `<div class="week-day"><div class="bar-wrap"><div class="bar" style="height:${Math.max(2, stat.total * 4)}px;background:${color}"></div></div><div class="day-name">${names[d.getDay()]}</div><div class="day-num">${stat.total}</div></div>`;
  }
  const chart = document.getElementById('weekChart');
  if (chart) chart.innerHTML = html;
  const chip = document.getElementById('weekChip');
  if (chip) chip.textContent = '本周 ' + total + ' 题';
}
