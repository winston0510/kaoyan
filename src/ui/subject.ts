import { SUBJECTS } from '../constants';
import { getLocal } from '../storage';
import { answerState } from '../progress';
import { esc, toast } from '../utils';
import { loadQuestions } from '../api';
import { isPaperSource, listPapers, paperLabel, paperMinutes, paperQuestions } from '../papers';
import { paperDoneFor } from '../plan';
import { switchPage } from './navigation';
import type { WrongBookItem } from '../types';

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
  const titleEl = document.getElementById('subjectTitle');
  if (titleEl) titleEl.textContent = s.name;

  content.innerHTML = '<div class="subject-loading">加载中…</div>';

  const questions = await loadQuestions(currentSubject).catch(() => null);
  if (questions === null) {
    content.innerHTML = '<div class="empty-state"><div class="empty-icon">⚠</div><div class="empty-title">题库加载失败</div><div class="empty-desc">请检查网络后返回重试</div></div>';
    return;
  }
  const state = answerState();
  const wrongBook = getLocal<WrongBookItem[]>('wrongBook', []).filter(w => w.subject === currentSubject && !w.mastered);

  const practicedIds = (id?: number | string) => id !== undefined && state[String(id)] !== undefined;

  const stats = new Map<string, ChapterStat>();
  for (const q of questions) {
    let st = stats.get(q.chapter);
    if (!st) { st = { name: q.chapter, total: 0, practiced: 0, wrong: 0 }; stats.set(q.chapter, st); }
    st.total += 1;
    if (practicedIds(q.id)) st.practiced += 1;
  }
  for (const w of wrongBook) {
    const st = stats.get(w.chapter || '');
    if (st) st.wrong += 1;
  }
  const emptyStat = (name: string): ChapterStat => ({ name, total: 0, practiced: 0, wrong: 0 });

  const known = new Set(s.chapters);
  const sections = s.sections.map(sec => ({
    name: sec.name,
    stats: sec.chapters.map(name => stats.get(name) || emptyStat(name))
  }));
  const extraNames = [...new Set(questions.filter(q => !known.has(q.chapter)).map(q => q.chapter))];
  if (extraNames.length > 0) {
    sections.push({ name: '其他章节', stats: extraNames.map(name => stats.get(name) || emptyStat(name)) });
  }

  let practicedAll = 0;
  for (const st of stats.values()) practicedAll += st.practiced;
  const totalAll = questions.length;
  const wrongAll = wrongBook.length;

  const escAttr = (v: string) => v.replace(/\\/g, '\\\\').replace(/'/g, "\\'");

  const heroHtml = `<div class="subject-hero">
    <div class="sh-info">
      <div class="sh-title">整科刷题</div>
      <div class="sh-stats">
        <span>共 <b>${totalAll}</b> 题</span>
        <span>已练 <b>${practicedAll}</b></span>
        ${wrongAll > 0 ? `<span class="text-danger">未掌握 <b>${wrongAll}</b></span>` : ''}
      </div>
    </div>
    <button class="btn btn-primary btn-sm" onclick="openQuizModal('${s.id}', '', '')">开始</button>
  </div>`;

  const paperAgg = new Map<string, { total: number; practiced: number }>();
  for (const q of questions) {
    const src = (q.source || '').trim();
    if (!isPaperSource(src)) continue;
    const agg = paperAgg.get(src) || { total: 0, practiced: 0 };
    agg.total += 1;
    if (practicedIds(q.id)) agg.practiced += 1;
    paperAgg.set(src, agg);
  }
  const papers = listPapers(questions).filter(p => (paperAgg.get(p.source)?.total || 0) > 0);
  let paperHtml = '';
  if (papers.length > 0) {
    const cards = papers.map(p => {
      const agg = paperAgg.get(p.source) || { total: p.total, practiced: 0 };
      const done = paperDoneFor(p.source, s.id);
      const typeText = ['single', 'multiple', 'fill', 'essay', 'judge'].filter(t => p.types[t]).map(t => `${TYPE_SHORT[t]}${p.types[t]}`).join(' ');
      const badge = done
        ? `<span class="paper-done">整卷完成 ${Math.round(done.correct / Math.max(1, done.total) * 100)}%</span>`
        : (p.complete ? '<span class="paper-full">完整卷</span>' : `<span class="paper-part">缺 ${Math.max(0, p.expected - p.total)} 题</span>`);
      return `<div class="paper-card" onclick="openPaperModal('${s.id}', '${escAttr(p.source)}')">
        <div class="pc-name">${esc(paperLabel(p))}</div>
        <div class="pc-meta">${esc(typeText)} · 已练 ${agg.practiced}/${agg.total} · 建议 ${paperMinutes(s.id, p.year, agg.total)} 分</div>
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
        ${c.total === 0 ? '<span class="cc-empty">暂无题目</span>' : `<span class="cc-progress">${c.practiced}/${c.total} 已练</span>`}
        <span class="subject-arrow">›</span>
      </div>
    </div>`).join('');
    return headerHtml + cardsHtml;
  }).join('');

  content.innerHTML = heroHtml + paperHtml + sectionHtml;
}

export function openQuizModal(subjectId: string, chapter: string, section: string): void {
  const s = SUBJECTS.find(x => x.id === subjectId);
  if (!s) return;
  const scope = chapter || '';
  const sec = section || '';
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
  const questions = paperQuestions(await loadQuestions(subjectId), source);
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
