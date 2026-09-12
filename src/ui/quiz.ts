import { SUBJECTS, TYPE_LABELS } from '../constants';
import { quizState, setQuizState } from '../state';
import { getLocal, setLocal, todayKey } from '../storage';
import { answerState, markAnswer } from '../progress';
import { shuffle, formatMath, toast, esc } from '../utils';
import { loadQuestions, syncFavoriteToDB, syncRecordToDB, syncWrongBookToDB } from '../api';
import { judgeAnswer, formatCorrectAnswer, isManualType, answerLetters } from '../judge';
import { paperQuestions, paperMinutes } from '../papers';
import { answerPoints, isRecitable } from '../recite';
import { recordPaperDone } from '../plan';
import { switchPage } from './navigation';
import type { FavoriteItem, Question, QuizRecord, WrongBookItem } from '../types';

let pendingEssay: { q: Question; userAnswer: string } | null = null;
let favIds = new Set<string>();
let favIdsLoaded = false;
let paperCtx: { source: string; label: string; minutes: number } | null = null;
let timerId: number | null = null;
let paperDeadline = 0;
let paperStartedAt = 0;

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
  try {
    const modal = btn.closest<HTMLElement>('.modal-overlay');
    if (!modal) { btn.disabled = false; btn.textContent = '开始刷题'; return; }
    const subjectId = modal.dataset.subject || '';
    const chapter = modal.dataset.chapter || '';
    const section = modal.dataset.section || '';
    const modeEl = modal.querySelector<HTMLElement>('.mode-option.active');
    const mode = modeEl?.dataset.mode || 'random';
    const rangeEl = modal.querySelector<HTMLInputElement>('input[type=range]');
    const count = rangeEl ? parseInt(rangeEl.value) : 20;

    const s = SUBJECTS.find(x => x.id === subjectId);
    const paperSource = (modal.dataset.paper || '').trim();
    const paperMin = parseInt(modal.dataset.minutes || '0', 10) || 0;
    let scopeChapters: string[] | null = null;
    if (chapter !== '') scopeChapters = [chapter];
    else if (section !== '') scopeChapters = s?.sections.find(x => x.name === section)?.chapters || null;
    const inScope = (ch: string) => scopeChapters === null || scopeChapters.includes(ch);

    let questions: Question[] = [];
    let allAnswered = false;
    if (paperSource !== '') {
      questions = paperQuestions(await loadQuestions(subjectId), paperSource);
    } else if (mode === 'wrong') {
      questions = getLocal<WrongBookItem[]>('wrongBook', []).filter(q => q.subject === subjectId && !q.mastered && inScope(q.chapter));
    } else {
      questions = await loadQuestions(subjectId);
      questions = questions.filter(q => inScope(q.chapter));
      const state = answerState();
      if (mode === 'fresh') {
        const unmasteredIds = new Set(getLocal<WrongBookItem[]>('wrongBook', []).filter(w => !w.mastered).map(w => String(w.id)));
        questions = questions.filter(q => state[String(q.id)] !== 'c' || unmasteredIds.has(String(q.id)));
      }
      if (mode === 'continue') {
        const scopedCount = questions.length;
        questions = questions.filter(q => state[String(q.id)] === undefined);
        if (questions.length === 0 && scopedCount > 0) allAnswered = true;
      }
      if (mode === 'random') questions = shuffle(questions);
    }
    if (paperSource === '') questions = questions.slice(0, count);

    if (questions.length === 0) {
      toast(allAnswered ? '题目已全部刷完，试试「错题重做」或更换范围' : (scopeChapters !== null ? '当前范围内暂无可刷题目' : '该科目暂无题目，请先添加题目'));
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
    stopTimer();
    if (paperSource !== '') {
      const subject = s ? s.id : subjectId;
      const yearMatch = /(\d{4})/.exec(paperSource);
      const limit = paperMin > 0 ? paperMin : paperMinutes(subject, Number(yearMatch?.[1] || 0), questions.length);
      paperCtx = { source: paperSource, label: `${s ? s.name : ''} · ${paperSource}`, minutes: limit };
      startTimer(limit);
    } else {
      paperCtx = null;
    }
    const paperName = paperCtx ? (paperCtx.label.split(' · ')[1] || '') : '';
    const scopeLabel = paperName !== '' ? paperName : chapter !== '' ? chapter : section !== '' ? section : '';
    const title = document.getElementById('quizTitle');
    if (title) title.textContent = s ? `${s.name}${scopeLabel !== '' ? ' · ' + scopeLabel : ''}` : '刷题';
    renderQuestion();
  } catch (e) {
    toast('题目加载失败，请检查网络后重试');
  } finally {
    btn.disabled = false;
    btn.textContent = '开始刷题';
  }
}

function fmtClock(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(s / 3600);
  const tail = String(Math.floor((s % 3600) / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
  return h > 0 ? h + ':' + tail : tail;
}

function timerEl(): HTMLElement | null {
  const existing = document.getElementById('quizTimer');
  if (existing) return existing;
  const host = document.querySelector<HTMLElement>('#page-quiz .tb-right');
  if (!host) return null;
  const el = document.createElement('span');
  el.id = 'quizTimer';
  el.className = 'tb-btn tb-text';
  host.insertBefore(el, host.firstChild);
  return el;
}

function tickTimer(): void {
  const el = timerEl();
  if (!el) return;
  if (!paperCtx) { el.textContent = ''; return; }
  if (paperDeadline > 0) {
    const left = paperDeadline - Date.now();
    el.textContent = '⏳' + fmtClock(left);
    el.classList.toggle('urgent', left <= 600000);
    if (left <= 0) {
      el.textContent = '⏰ 时间到';
      el.classList.remove('urgent');
      paperDeadline = -1;
      toast('套卷时间已到，可继续做完但计时已停止');
    }
  } else {
    el.textContent = '⏱' + fmtClock(Date.now() - paperStartedAt);
  }
}

export function startTimer(minutes: number): void {
  stopTimer();
  paperStartedAt = Date.now();
  paperDeadline = minutes > 0 ? Date.now() + minutes * 60000 : 0;
  timerId = window.setInterval(tickTimer, 1000);
  tickTimer();
}

export function stopTimer(): void {
  if (timerId !== null) {
    window.clearInterval(timerId);
    timerId = null;
  }
  const el = document.getElementById('quizTimer');
  if (el) {
    el.textContent = '';
    el.classList.remove('urgent');
  }
}

function elapsedMinutes(): number {
  if (!paperStartedAt) return 0;
  return Math.max(1, Math.round((Date.now() - paperStartedAt) / 60000));
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
          <span class="tag tag-gray">${esc(q.chapter || '')}</span>
          ${q.source ? `<span class="tag tag-green">${esc(q.source)}</span>` : ''}
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

  if (isManualType(q.type)) {
    const ta = document.getElementById('essayInput') as HTMLTextAreaElement | null;
    userAnswer = (ta?.value || '').trim();
    if (!userAnswer) { toast('请先写下你的作答'); return; }
    pendingEssay = { q, userAnswer };
    const ta2 = document.getElementById('essayInput');
    if (ta2) ta2.setAttribute('readonly', 'readonly');
    const submitBtn = document.getElementById('submitBtn');
    if (submitBtn) submitBtn.style.display = 'none';
    const feedback = document.getElementById('feedbackArea');
    const points = answerPoints(q.answer || '');
    if (feedback && isRecitable(q.subject, q.type, q.answer || '')) {
      feedback.innerHTML = `
        <div class="recite-box">
          <div class="recite-head">背诵要点<span id="reciteCount">已勾选 0/${points.length}</span></div>
          <div class="recite-hint">先自己复述，再点开对照；说到就打勾</div>
          ${points.map((p, i) => `<div class="recite-item">
            <span class="recite-no">${i + 1}</span>
            <span class="recite-text mask" onclick="revealPoint(this)">${formatMath(p)}</span>
            <input type="checkbox" class="recite-check" onchange="countPoints()">
          </div>`).join('')}
          ${q.explanation ? `<details class="recite-more"><summary>看完整解析</summary><div class="exp-text">${formatMath(q.explanation)}</div></details>` : ''}
          <div class="self-check">
            <button class="btn btn-success" onclick="selfAssess(true)">要点基本说到</button>
            <button class="btn btn-danger" onclick="selfAssess(false)">漏点较多</button>
          </div>
        </div>`;
      return;
    }
    if (feedback) feedback.innerHTML = `
      <div class="explanation-box"><div class="exp-label">参考答案</div><div class="exp-text">${formatMath(q.explanation || q.answer)}</div></div>
      <div style="padding:0 16px">
        <div class="self-check">
          <button class="btn btn-success" onclick="selfAssess(true)">我做对了</button>
          <button class="btn btn-danger" onclick="selfAssess(false)">我做错了</button>
        </div>
      </div>`;
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

  const isCorrect = judgeAnswer(q.type, userAnswer, q.answer);
  const letters = answerLetters(q.answer);

  const allOptions = document.querySelectorAll('#quizContent .option');
  allOptions.forEach(o => {
    const letter = (o as HTMLElement).dataset.letter || '';
    const inAnswer = isMultiple ? letters.includes(letter) : letter === letters[0];
    if (inAnswer) o.classList.add('correct');
    if (o.classList.contains('selected') && !inAnswer) o.classList.add('wrong');
  });

  recordResult(q, userAnswer, isCorrect);
  showFeedback(q, userAnswer, isCorrect);
}

export function revealPoint(el: HTMLElement): void {
  el.classList.remove('mask');
}

export function countPoints(): void {
  const boxes = document.querySelectorAll<HTMLInputElement>('.recite-check');
  let done = 0;
  boxes.forEach(b => { if (b.checked) done++; });
  const label = document.getElementById('reciteCount');
  if (label) label.textContent = `已勾选 ${done}/${boxes.length}`;
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

  const records = getLocal<QuizRecord[]>('records', []);
  const record: QuizRecord = { question_id: q.id ?? null, subject: q.subject, is_correct: isCorrect, user_answer: userAnswer, created_at: new Date().toISOString() };
  records.push(record);
  setLocal('records', records.slice(-1000));
  markAnswer(q.id, isCorrect);
  void syncRecordToDB(record);

  if (!isCorrect) {
    const wrongBook = getLocal<WrongBookItem[]>('wrongBook', []);
    const exists = wrongBook.find(w => String(w.id) === String(q.id));
    if (!exists) {
      wrongBook.push({ ...q as WrongBookItem, userAnswer, mastered: false, reviewCount: 0, wrongTime: Date.now() });
    } else {
      exists.userAnswer = userAnswer;
      exists.wrongTime = Date.now();
    }
    setLocal('wrongBook', wrongBook);
  } else {
    const wrongBook = getLocal<WrongBookItem[]>('wrongBook', []).filter(w => String(w.id) !== String(q.id));
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
    ${q.explanation ? `<div class="explanation-box"><div class="exp-label">正确答案：${esc(correctAnswer)}</div><div class="exp-text">${formatMath(q.explanation)}</div></div>` : `<div class="explanation-box"><div class="exp-label">正确答案：${esc(correctAnswer)}</div></div>`}
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
    stopTimer();
    paperCtx = null;
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
  stopTimer();
  paperCtx = null;
  setQuizState(null);
  switchPage('home');
}

export function finishQuiz(): void {
  const correct = quizState?.correct || 0;
  const wrong = quizState?.wrong || 0;
  const total = quizState?.total || 0;
  const subject = quizState?.subject || '';
  const subjectName = quizState?.subjectName || '';
  const donePaper = paperCtx;
  const usedMinutes = donePaper ? elapsedMinutes() : 0;
  if (donePaper) {
    recordPaperDone({ source: donePaper.source, subject, date: todayKey(), correct, total, minutes: usedMinutes });
  }
  stopTimer();
  paperCtx = null;
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

  const paperLine = donePaper
    ? `<div class="paper-result">套卷 ${esc(donePaper.source)}：用时 <b>${usedMinutes}</b> 分 / 建议 ${donePaper.minutes} 分${usedMinutes > donePaper.minutes ? '（超时）' : '（未超时）'}</div>`
    : '';
  resultEl.innerHTML = `
    <div class="result-hero">
      <div class="stars">${'★'.repeat(stars).split('').map(() => '<span class="star-on">★</span>').join('')}${'★'.repeat(5 - stars)}</div>
      <div class="msg">${msg}</div>
    </div>
    ${paperLine}
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
