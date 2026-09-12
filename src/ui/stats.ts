import { SUBJECTS } from '../constants';
import { getLocal } from '../storage';
import { daysForDisplay, recordsToDays } from '../stats';
import { renderDailyOverview, renderWeekChart } from './dailyStats';
import { renderSubjectStats } from './subjectStats';
import type { QuizRecord } from '../types';

export function renderStats(): void {
  const records = getLocal<QuizRecord[]>('records', []);
  const days = daysForDisplay(recordsToDays(records));
  renderDailyOverview(days);
  renderWeekChart(days);
  const chip = document.getElementById('subjectChip');
  if (chip) chip.textContent = '共 ' + SUBJECTS.length + ' 科';
  renderSubjectStats(records);
}
