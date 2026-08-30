import { SUBJECTS } from '../constants';
import { getLocal } from '../storage';
import { loadQuestions } from '../api';
import { switchPage } from './navigation';
import type { QuizRecord, WrongBookItem } from '../types';

let currentSubject = '';

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

  const questions = await loadQuestions(currentSubject);
  const records = getLocal<QuizRecord[]>('records', []).filter(r => r.subject === currentSubject);
  const wrongBook = getLocal<WrongBookItem[]>('wrongBook', []).filter(w => w.subject === currentSubject && !w.mastered);

  const practicedIds = new Set(records.filter(r => r.question_id !== null).map(r => String(r.question_id)));

  const stats = new Map<string, ChapterStat>();
  for (const q of questions) {
    let st = stats.get(q.chapter);
    if (!st) { st = { name: q.chapter, total: 0, practiced: 0, wrong: 0 }; stats.set(q.chapter, st); }
    st.total += 1;
    if (q.id !== undefined && practicedIds.has(String(q.id))) st.practiced += 1;
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

  const sectionHtml = sections.map(sec => {
    const secTotal = sec.stats.reduce((a, c) => a + c.total, 0);
    const secPracticed = sec.stats.reduce((a, c) => a + c.practiced, 0);
    const secWrong = sec.stats.reduce((a, c) => a + c.wrong, 0);
    const headerHtml = `<div class="section-header">
      <div class="section-title">${sec.name}</div>
      <div class="section-meta">
        ${secWrong > 0 ? `<span class="wrong-badge">${secWrong} 未掌握</span>` : ''}
        <span class="section-stats">${secPracticed}/${secTotal} 已练</span>
        <button class="btn btn-outline btn-sm section-start" onclick="event.stopPropagation(); openQuizModal('${s.id}', '', '${escAttr(sec.name)}')">刷题</button>
      </div>
    </div>`;
    const cardsHtml = sec.stats.map(c => `<div class="chapter-card" onclick="openQuizModal('${s.id}', '${escAttr(c.name)}', '')">
      <div class="cc-name">${c.name}</div>
      <div class="cc-meta">
        ${c.wrong > 0 ? `<span class="wrong-badge">${c.wrong} 未掌握</span>` : ''}
        ${c.total === 0 ? '<span class="cc-empty">暂无题目</span>' : `<span class="cc-progress">${c.practiced}/${c.total} 已练</span>`}
        <span class="subject-arrow">›</span>
      </div>
    </div>`).join('');
    return headerHtml + cardsHtml;
  }).join('');

  content.innerHTML = heroHtml + sectionHtml;
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
