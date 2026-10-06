import { SUBJECTS } from '../constants';
import { getLocal } from '../storage';
import { esc, toast } from '../utils';
import { BANK_COUNTS_DATE, hasCloud, loadDirView, loadScopedQuestions, refreshDirView, warmSubjectQuestions } from '../api';
import type { DirView } from '../api';
import { isPaperSource, paperFromCounts, paperLabel, paperMinutes, paperQuestions } from '../papers';
import { paperDoneFor } from '../plan';
import { switchPage } from './navigation';
import type { Question, QuestionType, WrongBookItem } from '../types';

let currentSubject = '';

const TYPE_SHORT: Record<string, string> = { single: '单', multiple: '多', fill: '填', essay: '解', judge: '判' };

export function openSubject(subjectId: string): void {
  const s = SUBJECTS.find(x => x.id === subjectId);
  if (!s) return;
  currentSubject = subjectId;
  switchPage('subject');
  void renderSubject();
}

interface ChapterStat { name: string; total: number; practiced: number; wrong: number }

export async function renderSubject(): Promise<void> {
  const s = SUBJECTS.find(x => x.id === currentSubject);
  const content = document.getElementById('subjectContent');
  if (!s || !content) return;
  const subjectId = currentSubject;
  const titleEl = document.getElementById('subjectTitle');
  if (titleEl) titleEl.textContent = s.name;

  content.innerHTML = '<div class="subject-loading">加载中…</div>';

  const paint = (view: DirView): void => {
    if (currentSubject !== subjectId) return;
    const countsUnknown = view.chapters.length === 0 && !view.complete;
    const wrongBook = getLocal<WrongBookItem[]>('wrongBook', []).filter(w => w.subject === subjectId && !w.mastered);

    const chapterTotals = new Map<string, number>();
    for (const c of view.chapters) chapterTotals.set(c.chapter, (chapterTotals.get(c.chapter) || 0) + c.total);
    const practicedRows = view.practiced.filter(p => p.subject === subjectId);
    const chapterPracticed = new Map<string, number>();
    for (const p of practicedRows) chapterPracticed.set(p.chapter, (chapterPracticed.get(p.chapter) || 0) + 1);
    const chapterWrong = new Map<string, number>();
    for (const w of wrongBook) chapterWrong.set(w.chapter || '', (chapterWrong.get(w.chapter || '') || 0) + 1);

    const stat = (name: string): ChapterStat => ({
      name,
      total: chapterTotals.get(name) || 0,
      practiced: chapterPracticed.get(name) || 0,
      wrong: chapterWrong.get(name) || 0
    });

    const known = new Set(s.chapters);
    const sections = s.sections.map(sec => ({ name: sec.name, stats: sec.chapters.map(stat) }));
    const extraNames = [...new Set(view.chapters.filter(c => !known.has(c.chapter)).map(c => c.chapter))];
    if (extraNames.length > 0) {
      sections.push({ name: '其他章节', stats: extraNames.map(stat) });
    }

    const totalAll = view.chapters.reduce((a, c) => a + c.total, 0);
    const practicedAll = practicedRows.length;
    const wrongAll = wrongBook.length;

    const escAttr = (v: string) => v.replace(/\\/g, '\\\\').replace(/'/g, "\\'");

    const noteHtml = view.complete ? '' : !hasCloud()
      ? `<div class="paper-note">未连接 Supabase：题目数来自 ${esc(BANK_COUNTS_DATE)} 的发布快照，实时进度请在「管理」填入连接信息</div>`
      : countsUnknown
        ? `<div class="paper-note">目录未加载：${esc(view.error || '网络较慢')}，<span class="dir-retry" onclick="renderSubject()">点这里重试</span></div>`
        : `<div class="paper-note">题目数为 ${esc(BANK_COUNTS_DATE)} 发布快照，云端核对未成功（${esc(view.error || '网络较慢')}），<span class="dir-retry" onclick="renderSubject()">点这里重试</span></div>`;

    const heroHtml = `<div class="subject-hero">
      <div class="sh-info">
        <div class="sh-title">整科刷题</div>
        <div class="sh-stats">
          <span>${countsUnknown ? '题目数待加载' : `共 <b>${totalAll}</b> 题`}</span>
          <span>已练 <b>${practicedAll}</b></span>
          ${wrongAll > 0 ? `<span class="text-danger">未掌握 <b>${wrongAll}</b></span>` : ''}
        </div>
      </div>
      <button class="btn btn-primary btn-sm" onclick="openQuizModal('${s.id}', '', '')">开始</button>
    </div>${noteHtml}`;

    const paperTally = new Map<string, Array<{ type: QuestionType; total: number }>>();
    for (const row of view.sources) {
      if (row.subject !== subjectId) continue;
      const src = (row.source || '').trim();
      if (!isPaperSource(src)) continue;
      const arr = paperTally.get(src);
      if (arr) arr.push({ type: row.type, total: row.total });
      else paperTally.set(src, [{ type: row.type, total: row.total }]);
    }
    const paperPracticed = new Map<string, number>();
    for (const p of practicedRows) {
      const src = (p.source || '').trim();
      if (!isPaperSource(src)) continue;
      paperPracticed.set(src, (paperPracticed.get(src) || 0) + 1);
    }
    const papers = [...paperTally]
      .map(([source, tally]) => paperFromCounts(subjectId, source, tally))
      .sort((a, b) => b.year - a.year || Number(a.style) - Number(b.style));
    let paperHtml = '';
    if (papers.length > 0) {
      const cards = papers.map(p => {
        const practiced = paperPracticed.get(p.source) || 0;
        const done = paperDoneFor(p.source, s.id);
        const typeText = ['single', 'multiple', 'fill', 'essay', 'judge'].filter(t => p.types[t]).map(t => `${TYPE_SHORT[t]}${p.types[t]}`).join(' ');
        const badge = done
          ? `<span class="paper-done">整卷完成 ${Math.round(done.correct / Math.max(1, done.total) * 100)}%</span>`
          : (p.complete ? '<span class="paper-full">完整卷</span>' : `<span class="paper-part">缺 ${Math.max(0, p.expected - p.total)} 题</span>`);
        return `<div class="paper-card" onclick="openPaperModal('${s.id}', '${escAttr(p.source)}')">
          <div class="pc-name">${esc(paperLabel(p))}</div>
          <div class="pc-meta">${esc(typeText)} · 已练 ${practiced}/${p.total} · 建议 ${paperMinutes(s.id, p.year, p.total)} 分</div>
          <div class="pc-right">${badge}<span class="subject-arrow">›</span></div>
        </div>`;
      }).join('');
      const note = s.id === 'circuit' ? '<div class="paper-note">870 无官方公开真题，以下为真题风格套卷</div>' : '';
      paperHtml = `<div class="section-header"><div class="section-title">真题套卷</div><div class="section-meta">${papers.length} 套</div></div>${note}${cards}`;
    }

    const sectionHtml = sections.map(sec => {
      const secTotal = sec.stats.reduce((a, c) => a + c.total, 0);
      const secPracticed = sec.stats.reduce((a, c) => a + c.practiced, 0);
      const secWrong = sec.stats.reduce((a, c) => a + c.wrong, 0);
      const headerHtml = `<div class="section-header">
        <div class="section-title">${esc(sec.name)}</div>
        <div class="section-meta">
          ${secWrong > 0 ? `<span class="wrong-badge">${secWrong} 未掌握</span>` : ''}
          <span class="section-stats">${secPracticed}/${secTotal} 已练</span>
          <button class="btn btn-outline btn-sm section-start" onclick="event.stopPropagation(); openQuizModal('${s.id}', '', '${escAttr(sec.name)}')">刷题</button>
        </div>
      </div>`;
      const cardsHtml = sec.stats.map(c => `<div class="chapter-card" onclick="openQuizModal('${s.id}', '${escAttr(c.name)}', '')">
        <div class="cc-name">${esc(c.name)}</div>
        <div class="cc-meta">
          ${c.wrong > 0 ? `<span class="wrong-badge">${c.wrong} 未掌握</span>` : ''}
          ${c.total === 0 ? `<span class="cc-empty">${countsUnknown ? '计数待加载' : '暂无题目'}</span>` : `<span class="cc-progress">${c.practiced}/${c.total} 已练</span>`}
          <span class="subject-arrow">›</span>
        </div>
      </div>`).join('');
      return headerHtml + cardsHtml;
    }).join('');

    content.innerHTML = heroHtml + paperHtml + sectionHtml;
  };

  const view = await loadDirView(subjectId, v => { paint(v); });
  if (!view.complete && hasCloud()) void refreshDirView(subjectId, paint);
  paint(view);
}

export function openQuizModal(subjectId: string, chapter: string, section: string): void {
  const s = SUBJECTS.find(x => x.id === subjectId);
  if (!s) return;
  const scope = chapter || '';
  const sec = section || '';
  if (scope === '' && sec === '') warmSubjectQuestions(subjectId);
  const sectionChapters = sec !== '' ? (s.sections.find(x => x.name === sec)?.chapters || []) : [];
  const inScope = (w: WrongBookItem) => {
    if (scope !== '') return w.chapter === scope;
    if (sec !== '') return sectionChapters.includes(w.chapter);
    return true;
  };
  const wc = getLocal<WrongBookItem[]>('wrongBook', []).filter(w => w.subject === subjectId && !w.mastered && inScope(w)).length;

  const scopeLabel = scope !== '' ? scope : sec !== '' ? sec : '整科';

  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.dataset.subject = subjectId;
  modal.dataset.chapter = scope;
  modal.dataset.section = sec;
  modal.innerHTML = `<div class="modal-panel" onclick="event.stopPropagation()">
    <div class="modal-header"><span class="modal-title">${s.name} · ${scopeLabel}刷题设置</span><span class="modal-close" onclick="this.closest('.modal-overlay').remove()">✕</span></div>
    <div style="margin-bottom:20px"><label style="font-size:.75rem;font-weight:600;color:var(--text-secondary);display:block;margin-bottom:8px">刷题模式</label>
      <div class="mode-option active" data-mode="random" onclick="selectMode(this)"><span class="mode-title">随机刷题</span><span class="mode-desc">从范围内随机抽取题目</span></div>
      <div class="mode-option" data-mode="sequential" onclick="selectMode(this)"><span class="mode-title">顺序刷题</span><span class="mode-desc">按题库顺序练习</span></div>
      <div class="mode-option" data-mode="fresh" onclick="selectMode(this)"><span class="mode-title">顺序只刷未掌握</span><span class="mode-desc">按顺序练习，跳过已答对的题</span></div>
      <div class="mode-option" data-mode="continue" onclick="selectMode(this)"><span class="mode-title">继续刷题</span><span class="mode-desc">按顺序练习，跳过所有已答题目</span></div>
      ${wc > 0 ? `<div class="mode-option" data-mode="wrong" onclick="selectMode(this)"><span class="mode-title">错题重做</span><span class="mode-desc">仅做错题本中未掌握的 ${wc} 题</span></div>` : ''}
    </div>
    <div style="margin-bottom:20px"><label style="font-size:.75rem;font-weight:600;color:var(--text-secondary);display:block;margin-bottom:8px">题目数量：<span id="modalCount">20</span> 题</label>
      <input type="range" min="5" max="50" step="5" value="20" oninput="document.getElementById('modalCount').textContent=this.value">
    </div>
    <button class="btn btn-primary" onclick="startQuiz(this)">开始刷题</button>
  </div>`;
  modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
  document.body.appendChild(modal);
}

export async function openPaperModal(subjectId: string, source: string): Promise<void> {
  const s = SUBJECTS.find(x => x.id === subjectId);
  if (!s) return;
  let questions: Question[];
  try {
    questions = paperQuestions(await loadScopedQuestions(subjectId, { source }), source);
  } catch {
    toast('该套卷题目加载失败，请检查网络后重试');
    return;
  }
  if (questions.length === 0) {
    toast('该套卷暂无可刷题目');
    return;
  }
  const ym = /(\d{4})/.exec(source);
  const year = Number(ym ? ym[1] : 0);
  const suggested = paperMinutes(subjectId, year, questions.length);
  const opts = [
    { min: suggested, title: `限时 ${suggested} 分钟`, desc: '按整套卷的建议用时倒计时' },
    { min: 0, title: '不限时', desc: '只做质量，不练速度' },
    { min: Math.round(suggested / 2), title: `冲刺 ${Math.round(suggested / 2)} 分钟`, desc: '时间减半，练取舍与速度' }
  ];
  const done = paperDoneFor(source, subjectId);
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.dataset.subject = subjectId;
  modal.dataset.paper = source;
  modal.dataset.minutes = String(suggested);
  modal.innerHTML = `<div class="modal-panel" onclick="event.stopPropagation()">
    <div class="modal-header"><span class="modal-title">${s.name} · ${esc(source)}</span><span class="modal-close" onclick="this.closest('.modal-overlay').remove()">✕</span></div>
    <div class="paper-modal-meta">共 ${questions.length} 题，按卷面顺序出题${done ? ` · 上次整卷正确率 ${Math.round(done.correct / Math.max(1, done.total) * 100)}%` : ''}</div>
    <div style="margin-bottom:20px"><label style="font-size:.75rem;font-weight:600;color:var(--text-secondary);display:block;margin-bottom:8px">计时方式</label>
      ${opts.map((o, i) => `<div class="mode-option${i === 0 ? ' active' : ''}" data-min="${o.min}" onclick="selectMinutes(this)"><span class="mode-title">${o.title}</span><span class="mode-desc">${o.desc}</span></div>`).join('')}
    </div>
    <button class="btn btn-primary" onclick="startQuiz(this)">开始整套</button>
  </div>`;
  modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
  document.body.appendChild(modal);
}

export function selectMinutes(el: HTMLElement): void {
  const parent = el.parentElement;
  if (!parent) return;
  parent.querySelectorAll('.mode-option').forEach(o => o.classList.remove('active'));
  el.classList.add('active');
  const modal = el.closest<HTMLElement>('.modal-overlay');
  if (modal) modal.dataset.minutes = el.dataset.min || '0';
}
