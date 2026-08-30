import { SUBJECTS, TYPE_LABELS } from '../constants';
import { getLocal, setLocal } from '../storage';
import { setQuizState } from '../state';
import { syncFavoriteToDB } from '../api';
import { toast, formatMath } from '../utils';
import { switchPage } from './navigation';
import { renderQuestion, invalidateFavIds } from './quiz';
import type { FavoriteItem } from '../types';

let favFilter = '';

function favTitle(subject: string): string {
  const s = SUBJECTS.find(x => x.id === subject);
  return s ? s.name : subject;
}

export function renderFavorites(): void {
  const favorites = getLocal<FavoriteItem[]>('favorites', []);
  const list = favFilter ? favorites.filter(f => f.subject === favFilter) : favorites;
  const activeEl = document.querySelector<HTMLElement>('#favFilter .filter-chip.active');
  const current = activeEl?.dataset?.subject || favFilter;

  const filterHtml = `<span class="filter-chip ${current === '' ? 'active' : ''}" data-subject="" onclick="setFavFilter('')">全部 (${favorites.length})</span>` +
    SUBJECTS.map(s => {
      const cnt = favorites.filter(f => f.subject === s.id).length;
      return cnt > 0 ? `<span class="filter-chip ${current === s.id ? 'active' : ''}" data-subject="${s.id}" onclick="setFavFilter('${s.id}')">${s.name} (${cnt})</span>` : '';
    }).join('');
  const filterEl = document.getElementById('favFilter');
  if (filterEl) filterEl.innerHTML = filterHtml;

  const emptyEl = document.getElementById('favEmpty');
  if (emptyEl) emptyEl.style.display = list.length === 0 ? '' : 'none';

  const listHtml = list.map(q => {
    const typeLabel = TYPE_LABELS[q.type] || '';
    return `<div class="fav-card" data-id="${q.id}">
      <div class="wc-header"><span class="tag tag-gray">${typeLabel}</span><span class="tag tag-amber">${favTitle(q.subject)} · ${q.chapter || ''}</span></div>
      <div class="fav-question">${formatMath(q.question)}</div>
      <div class="fav-actions">
        <button class="btn btn-sm btn-outline" onclick="startFavQuiz()">开始作答</button>
        <button class="btn btn-sm btn-danger" onclick="removeFavorite('${q.id}', this)">取消收藏</button>
      </div>
    </div>`;
  }).join('');
  const listEl = document.getElementById('favList');
  if (listEl) listEl.innerHTML = listHtml;
}

export function setFavFilter(subject: string): void {
  favFilter = subject;
  document.querySelectorAll<HTMLElement>('#favFilter .filter-chip').forEach(c => c.classList.toggle('active', c.dataset.subject === subject));
  renderFavorites();
}

export function removeFavorite(id: number | string, el: HTMLElement | null): void {
  const favorites = getLocal<FavoriteItem[]>('favorites', []);
  const idx = favorites.findIndex(f => String(f.id) === String(id));
  if (idx < 0) return;
  const [removed] = favorites.splice(idx, 1);
  setLocal('favorites', favorites);
  invalidateFavIds();
  void syncFavoriteToDB(removed as FavoriteItem, false);
  toast('已取消收藏');
  if (el) {
    const card = el.closest('.fav-card');
    if (card) card.remove();
  }
  renderFavorites();
}

export function startFavQuiz(): void {
  const favorites = getLocal<FavoriteItem[]>('favorites', []);
  const list = favFilter ? favorites.filter(f => f.subject === favFilter) : favorites;
  if (list.length === 0) { toast('没有收藏题目'); return; }
  const sub = SUBJECTS.find(s => s.id === list[0].subject);
  setQuizState({
    subject: list[0].subject,
    subjectName: sub ? sub.name : '',
    questions: list,
    index: 0,
    correct: 0,
    wrong: 0,
    total: list.length
  });
  const title = document.getElementById('quizTitle');
  if (title) title.textContent = (sub ? sub.name : '') + ' · 收藏题';
  switchPage('quiz');
  const fill = document.getElementById('progressFill');
  const prog = document.getElementById('quizProgress');
  if (fill) fill.style.width = '0%';
  if (prog) prog.textContent = '0/' + list.length;
  renderQuestion();
}