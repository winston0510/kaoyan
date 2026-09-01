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
  let allAnswered = false;
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
    if (mode === 'continue') {
      const scopedCount = questions.length;
      const records = getLocal<QuizRecord[]>('records', []);
      const answeredIds = new Set(records.filter(r => r.question_id !== null).map(r => String(r.question_id)));
      questions = questions.filter(q => !answeredIds.has(String(q.id)));
      if (questions.length === 0 && scopedCount > 0) allAnswered = true;
    }
    if (mode === 'random') questions = shuffle(questions);
  }
  questions = questions.slice(0, count);

  if (questions.length === 0) {
    toast(allAnswered ? '题目已全部刷完，试试「错题重做」或更换范围' : (scopeChapters !== null ? '当前范围内暂无可刷题目' : '该科目暂无题目，请先添加题目'));
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

export function submitAnswer(): void {
  const st = quizState;
  if (!st) return;
  const q = st.questions[st.index];
  const isMultiple = q.type === 'multiple';
  let userAnswer: string;

  if (q.type === 'fill') {
    const inp = document.getElementById('fillInput') as HTMLInputElement | null;
    userAnswer = (inp?.value || '').trim();
    if (!userAnswer) { toast('请填写答案'); return; }
    const isCorrect = judgeAnswer('fill', userAnswer, q.answer);
    const inp2 = document.getElementById('fillInput');
    if (inp2) {
      inp2.classList.add(isCorrect ? 'correct' : 'wrong');
      inp2.setAttribute('readonly', 'readonly');
    }
    recordResult(q, userAnswer, isCorrect);
    showFeedback(q, userAnswer, isCorrect);
    return;
  }

  if (q.type === 'essay') {
    const ta = document.getElementById('essayInput') as HTMLTextAreaElement | null;
    userAnswer = (ta?.value || '').trim();
    if (!userAnswer) { toast('请先写下你的作答'); return; }
    pendingEssay = { q, userAnswer };
    const ta2 = document.getElementById('essayInput');
    if (ta2) ta2.setAttribute('readonly', 'readonly');
    const submitBtn = document.getElementById('submitBtn');
    if (submitBtn) submitBtn.style.display = 'none';
    const feedback = document.getElementById('feedbackArea');
    if (feedback) feedback.innerHTML = `
      <div class="explanation-box"><div class="exp-label">参考答案</div><div class="exp-text">${formatMath(q.explanation || q.answer)}</div></div>
      <div style="padding:0 16px">
        <div class="self-check">
          <button class="btn btn-success" onclick="selfAssess(true)">我做对了</button>
          <button class="btn btn-danger" onclick="selfAssess(false)">我做错了</button>
        </div>
      </div>
    `;
    return;
  }

  if (isMultiple) {
    const selected = [...document.querySelectorAll('#quizContent .option.selected')].map(e => (e as HTMLElement).dataset.letter || '');
    if (selected.length === 0) { toast('请至少选择一个选项'); return; }
    userAnswer = selected.sort().join('');
  } else {
    const sel = document.querySelector('#quizContent .option.selected');
    if (!sel) { toast('请选择一个选项'); return; }
    userAnswer = (sel as HTMLElement).dataset.letter || '';
  }

  const correctAnswer = q.answer.trim().toUpperCase();
  const isCorrect = userAnswer === correctAnswer;

  const allOptions = document.querySelectorAll('#quizContent .option');
  allOptions.forEach(o => {
    const letter = (o as HTMLElement).dataset.letter;
    if (isMultiple) {
      if (letter && correctAnswer.includes(letter)) o.classList.add('correct');
      if (letter && o.classList.contains('selected') && !correctAnswer.includes(letter)) o.classList.add('wrong');
    } else {
      if (letter === correctAnswer) o.classList.add('correct');
      if (o.classList.contains('selected') && letter !== correctAnswer) o.classList.add('wrong');
    }
  });

  recordResult(q, userAnswer, isCorrect);
  showFeedback(q, userAnswer, isCorrect);
}

export function selfAssess(correct: boolean): void {
  if (!pendingEssay) return;
  const { q, userAnswer } = pendingEssay;
  pendingEssay = null;
  recordResult(q, userAnswer, correct);
  showFeedback(q, userAnswer, correct);
}

function recordResult(q: Question, userAnswer: string, isCorrect: boolean): void {
  const st = quizState;
  if (!st) return;
  if (isCorrect) st.correct++; else st.wrong++;

  const today = todayKey();
  const todayStats = getLocal<{ total: number; correct: number }>('today_' + today, { total: 0, correct: 0 }) || { total: 0, correct: 0 };
  todayStats.total++;
  if (isCorrect) todayStats.correct++;
  setLocal('today_' + today, todayStats);
  void syncTodayToDB(todayStats, today);

  const records = getLocal<QuizRecord[]>('records', []);
  const record: QuizRecord = { question_id: q.id ?? null, subject: q.subject, is_correct: isCorrect, user_answer: userAnswer, created_at: new Date().toISOString() };
  records.push(record);
  setLocal('records', records.slice(-1000));
  void syncRecordToDB(record);

  if (!isCorrect) {
    const wrongBook = getLocal<WrongBookItem[]>('wrongBook', []);
    const exists = wrongBook.find(w => w.id === q.id);
    if (!exists) {
      wrongBook.push({ ...q as WrongBookItem, userAnswer, mastered: false, reviewCount: 0, wrongTime: Date.now() });
    } else {
      exists.userAnswer = userAnswer;
      exists.wrongTime = Date.now();
    }
    setLocal('wrongBook', wrongBook);
  } else {
    const wrongBook = getLocal<WrongBookItem[]>('wrongBook', []).filter(w => w.id !== q.id);
    setLocal('wrongBook', wrongBook);
  }
  void syncWrongBookToDB(q, userAnswer, isCorrect);
}

function showFeedback(q: Question, userAnswer: string, isCorrect: boolean): void {
  const st = quizState;
  if (!st) return;
  const correctAnswer = formatCorrectAnswer(q.type, q.answer).toUpperCase();
  const submitBtn = document.getElementById('submitBtn');
  if (submitBtn) submitBtn.style.display = 'none';
  const feedback = document.getElementById('feedbackArea');
  if (feedback) feedback.innerHTML = `
    <div class="feedback-banner ${isCorrect ? 'correct' : 'wrong'}">
      <span>${isCorrect ? '✓ 回答正确！' : '✗ 回答错误'}</span>
    </div>
    ${q.explanation ? `<div class="explanation-box"><div class="exp-label">正确答案：${correctAnswer}</div><div class="exp-text">${formatMath(q.explanation)}</div></div>` : `<div class="explanation-box"><div class="exp-label">正确答案：${correctAnswer}</div></div>`}
    <div style="padding:0 16px">
      <button class="btn btn-primary mt-16" onclick="nextQuestion()">${st.index + 1 < st.total ? '下一题' : '查看结果'}</button>
    </div>
  `;
}

export function nextQuestion(): void {
  const st = quizState;
  if (!st) return;
  st.index++;
  renderQuestion();
  const content = document.getElementById('quizContent');
  if (content) content.scrollIntoView({ behavior: 'smooth' });
}

export function quitQuiz(): void {
  const st = quizState;
  if (!st || st.correct + st.wrong === 0) {
    pendingEssay = null;
    setQuizState(null);
    switchPage('home');
    return;
  }
  renderQuitSummary();
}

function renderQuitSummary(): void {
  const st = quizState;
  if (!st) return;
  pendingEssay = null;
  const answered = st.correct + st.wrong;
  const remaining = st.total - answered;
  const accuracy = Math.round((st.correct / answered) * 100);
  const content = document.getElementById('quizContent');
  if (!content) return;
  content.innerHTML = `
    <div class="result-hero">
      <div class="msg">✓ 已答 ${answered} 题，作答记录已保存</div>
    </div>
    <div class="result-grid">
      <div class="result-item"><div class="num">${answered}</div><div class="lbl">已答题</div></div>
      <div class="result-item"><div class="num text-success">${st.correct}</div><div class="lbl">正确</div></div>
      <div class="result-item"><div class="num text-danger">${st.wrong}</div><div class="lbl">错误</div></div>
    </div>
    <div class="accuracy-ring"><div class="pct">${accuracy}%</div><div class="lbl">正确率</div></div>
    <div style="padding:0 16px">
      ${remaining > 0 ? `<button class="btn btn-primary" onclick="resumeQuiz()">继续作答（剩 ${remaining} 题）</button>` : ''}
      <button class="btn btn-outline mt-8" onclick="confirmQuit()">返回首页</button>
    </div>
  `;
  const fill = document.getElementById('progressFill');
  if (fill) fill.style.width = ((answered / st.total) * 100) + '%';
}

export function resumeQuiz(): void {
  const st = quizState;
  if (!st) return;
  if (st.index < st.correct + st.wrong) st.index++;
  renderQuestion();
  const content = document.getElementById('quizContent');
  if (content) content.scrollIntoView({ behavior: 'smooth' });
}

export function confirmQuit(): void {
  pendingEssay = null;
  setQuizState(null);
  switchPage('home');
}

export function finishQuiz(): void {
  const correct = quizState?.correct || 0;
  const wrong = quizState?.wrong || 0;
  const total = quizState?.total || 0;
  const subject = quizState?.subject || '';
  const subjectName = quizState?.subjectName || '';
  setQuizState(null);
  const resultEl = document.getElementById('quizContent');
  if (!resultEl) return;
  resultEl.dataset.subject = subject;
  resultEl.dataset.subjectName = subjectName;
  const accuracy = total > 0 ? Math.round(correct / total * 100) : 0;
  let stars = 1, msg = '继续加油！';
  if (accuracy >= 90) { stars = 5; msg = '太棒了！掌握得非常好！'; }
  else if (accuracy >= 80) { stars = 4; msg = '很不错，再巩固一下薄弱点！'; }
  else if (accuracy >= 60) { stars = 3; msg = '还可以，需要加强练习！'; }
  else if (accuracy >= 40) { stars = 2; msg = '基础还有些薄弱，多刷题！'; }

  resultEl.innerHTML = `
    <div class="result-hero">
      <div class="stars">${'★'.repeat(stars).split('').map(() => '<span class="star-on">★</span>').join('')}${'★'.repeat(5 - stars)}</div>
      <div class="msg">${msg}</div>
    </div>
    <div class="result-grid">
      <div class="result-item"><div class="num">${total}</div><div class="lbl">总题数</div></div>
      <div class="result-item"><div class="num text-success">${correct}</div><div class="lbl">正确</div></div>
      <div class="result-item"><div class="num text-danger">${wrong}</div><div class="lbl">错误</div></div>
    </div>
    <div class="accuracy-ring"><div class="pct">${accuracy}%</div><div class="lbl">正确率</div></div>
    <div style="padding:0 16px">
      <button class="btn btn-primary" onclick="switchPage('home')">继续刷题</button>
      ${wrong > 0 ? `<button class="btn btn-outline mt-8" onclick="retryWrong()">重做错题 (${wrong}题)</button>` : ''}
    </div>
  `;
  const fill = document.getElementById('progressFill');
  const prog = document.getElementById('quizProgress');
  if (fill) fill.style.width = '100%';
  if (prog) prog.textContent = `${total}/${total}`;
}

export function retryWrong(): void {
  const resultEl = document.getElementById('quizContent');
  if (!resultEl) return;
  const subject = resultEl.dataset.subject || '';
  const subjectName = resultEl.dataset.subjectName || '';
  const wrongBook = getLocal<WrongBookItem[]>('wrongBook', []).filter(q => q.subject === subject && !q.mastered);
  if (wrongBook.length === 0) { toast('没有错题'); return; }
  setQuizState({ subject, subjectName, questions: wrongBook, index: 0, correct: 0, wrong: 0, total: wrongBook.length });
  const title = document.getElementById('quizTitle');
  if (title) title.textContent = subjectName ? subjectName + ' · 错题重做' : '错题重做';
  const fill = document.getElementById('progressFill');
  const prog = document.getElementById('quizProgress');
  if (fill) fill.style.width = '0%';
  if (prog) prog.textContent = '0/' + wrongBook.length;
  renderQuestion();
}
