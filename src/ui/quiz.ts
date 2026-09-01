import { SUBJECTS, TYPE_LABELS } from '../constants';
import { quizState, setQuizState } from '../state';
import { getLocal, setLocal, todayKey } from '../storage';
import { shuffle, formatMath, toast } from '../utils';
import { loadQuestions, syncFavoriteToDB, syncRecordToDB, syncTodayToDB, syncWrongBookToDB } from '../api';
import { judgeAnswer, formatCorrectAnswer, isManualType } from '../judge';
import { switchPage } from './navigation';
import type { FavoriteItem, Question, QuizRecord, QuizState, WrongBookItem } from '../types';

let pendingEssay: { q: Question; userAnswer: string } | null = null;
let favIds = new Set<string>();
let favIdsLoaded = false;

function refreshFavIds(): void {
  favIds = new Set(getLocal<FavoriteItem[]>('favorites', []).map(f => String(f.id)));
  favIdsLoaded = true;
}

export function invalidateFavIds(): void {
  favIdsLoaded = false;
}

export async function startQuiz(btn: HTMLButtonElement): Promise<void> {
  btn.disabled = true;
  btn.textContent = '加载中...';
  const modal = btn.closest<HTMLElement>('.modal-overlay');
  if (!modal) { btn.disabled = false; return; }
  const subjectId = modal.dataset.subject || '';
  const chapter = modal.dataset.chapter || '';
  const section = modal.dataset.section || '';
  const modeEl = modal.querySelector<HTMLElement>('.mode-option.active');
  const mode = modeEl?.dataset.mode || 'random';
  const rangeEl = modal.querySelector<HTMLInputElement>('input[type=range]');
  const count = rangeEl ? parseInt(rangeEl.value) : 20;

  const s = SUBJECTS.find(x => x.id === subjectId);
  let scopeChapters: string[] | null = null;
  if (chapter !== '') scopeChapters = [chapter];
  else if (section !== '') scopeChapters = s?.sections.find(x => x.name === section)?.chapters || null;
  const inScope = (ch: string) => scopeChapters === null || scopeChapters.includes(ch);

  let questions: Question[] = [];
  if (mode === 'wrong') {
    questions = getLocal<WrongBookItem[]>('wrongBook', []).filter(q => q.subject === subjectId && !q.mastered && inScope(q.chapter));
  } else {
    questions = await loadQuestions(subjectId);
    questions = questions.filter(q => inScope(q.chapter));
    if (mode === 'fresh') {
      const records = getLocal<QuizRecord[]>('records', []);
      const correctIds = new Set(records.filter(r => r.is_correct && r.question_id !== null).map(r => String(r.question_id)));
      const unmasteredIds = new Set(getLocal<WrongBookItem[]>('wrongBook', []).filter(w => !w.mastered).map(w => String(w.id)));
      questions = questions.filter(q => !correctIds.has(String(q.id)) || unmasteredIds.has(String(q.id)));
    }
    if (mode === 'random') questions = shuffle(questions);
  }
  questions = questions.slice(0, count);

  if (questions.length === 0) {
    toast(scopeChapters !== null ? '当前范围内暂无可刷题目' : '该科目暂无题目，请先添加题目');
    btn.disabled = false;
    btn.textContent = '开始刷题';
    return;
  }

  setQuizState({
    subject: subjectId,
    subjectName: s ? s.name : '',
    questions,
    index: 0,
    correct: 0,
    wrong: 0,
    total: questions.length
  });

  modal.remove();
  switchPage('quiz');
  const scopeLabel = chapter !== '' ? chapter : section !== '' ? section : '';
  const title = document.getElementById('quizTitle');
  if (title) title.textContent = s ? `${s.name}${scopeLabel !== '' ? ' · ' + scopeLabel : ''}` : '刷题';
  renderQuestion();
}

export function renderQuestion(): void {
  const st = quizState;
  if (!st || st.index >= st.total) {
    finishQuiz();
    return;
  }
  const q = st.questions[st.index];
  const pct = (st.index / st.total) * 100;
  const fill = document.getElementById('progressFill');
  const prog = document.getElementById('quizProgress');
  if (fill) fill.style.width = pct + '%';
  if (prog) prog.textContent = `${st.index + 1}/${st.total}`;

  const typeLabel = TYPE_LABELS[q.type] || '单选题';
  const isMultiple = q.type === 'multiple';
  const isFav = isFavorite(q.id);

  let optionsHtml = '';
  if (q.options && q.options.length > 0) {
    optionsHtml = q.options.map((opt, i) => {
      const letter = String.fromCharCode(65 + i);
      const text = opt.replace(/^[A-Z][.、．]\s*/, '');
      return `<div class="option" data-letter="${letter}" onclick="${isMultiple ? 'toggleMultiOption' : 'selectOption'}(this, '${letter}')">
        <span class="option-letter">${letter}</span><span class="option-text">${formatMath(text)}</span>
      </div>`;
    }).join('');
  }

  const content = document.getElementById('quizContent');
  if (!content) return;
  content.innerHTML = `
    <div class="question-area">
      <div class="q-meta">
        <div class="q-tags">
          <span class="tag tag-blue">${typeLabel}</span>
          <span class="tag tag-gray">${q.chapter || ''}</span>
          ${q.source ? `<span class="tag tag-green">${q.source}</span>` : ''}
        </div>
        <button class="fav-btn ${isFav ? 'active' : ''}" onclick="toggleFavorite(this)" title="收藏/取消收藏">${isFav ? '★' : '☆'}</button>
      </div>
      <div class="q-title">${formatMath(q.question)}</div>
      ${optionsHtml}
      ${q.type === 'fill' ? `<input class="fill-input" id="fillInput" placeholder="请输入答案" autocomplete="off">` : ''}
      ${q.type === 'essay' ? `<textarea class="essay-textarea" id="essayInput" placeholder="写出你的作答，提交后查看参考答案并自评"></textarea>` : ''}
      <button class="btn btn-primary mt-24" onclick="submitAnswer()" id="submitBtn">确认答案</button>
    </div>
    <div id="feedbackArea"></div>
  `;
}

export function selectOption(el: HTMLElement, letter: string): void {
  const parent = el.parentElement;
  if (!parent) return;
  if (parent.querySelector('.option.correct')) return;
  parent.querySelectorAll('.option').forEach(o => o.classList.remove('selected'));
  el.classList.add('selected');
}

export function toggleMultiOption(el: HTMLElement, letter: string): void {
  const parent = el.parentElement;
  if (!parent) return;
  if (parent.querySelector('.option.correct')) return;
  el.classList.toggle('selected');
}

export function isFavorite(id?: number | string): boolean {
  if (id == null) return false;
  if (!favIdsLoaded) refreshFavIds();
  return favIds.has(String(id));
}

export function toggleFavorite(el: HTMLElement | null): void {
  const st = quizState;
  if (!st) return;
  const q = st.questions[st.index];
  if (q.id == null) return;
  const idKey = String(q.id);
  if (!favIdsLoaded) refreshFavIds();
  const wasFav = favIds.has(idKey);
  let nowFav: boolean;
  if (wasFav) {
    favIds.delete(idKey);
    const favorites = getLocal<FavoriteItem[]>('favorites', []).filter(f => String(f.id) !== idKey);
    setLocal('favorites', favorites);
    nowFav = false;
  } else {
    favIds.add(idKey);
    const favorites = getLocal<FavoriteItem[]>('favorites', []);
    favorites.push({ ...q as FavoriteItem, favoritedAt: Date.now() });
    setLocal('favorites', favorites);
    nowFav = true;
  }
  void syncFavoriteToDB(q, nowFav);
  if (el) {
    el.classList.toggle('active', nowFav);
    el.innerHTML = nowFav ? '★' : '☆';
  }
  toast(nowFav ? '已收藏' : '已取消收藏');
}
