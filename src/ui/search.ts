import { SUBJECTS, TYPE_LABELS } from '../constants';
import { db, setQuizState } from '../state';
import { getLocal, setLocal } from '../storage';
import { formatMath } from '../utils';
import { switchPage } from './navigation';
import { renderQuestion } from './quiz';
import type { Question } from '../types';

let searchResults: Question[] = [];

function searchHit(q: Question, kw: string): boolean {
  return [q.question, q.chapter, q.source || '', q.explanation || '', ...(q.options || [])]
    .join(' ').toLowerCase().includes(kw);
}

export async function doSearch(): Promise<void> {
  const input = document.getElementById('searchInput') as HTMLInputElement | null;
  const kw = (input?.value || '').trim().toLowerCase();
  const box = document.getElementById('searchResults');
  if (!box) return;
  if (!kw) { box.style.display = 'none'; return; }

  let list = getLocal<Question[]>('questions', []);
  if (list.length === 0 && db) {
    const { data } = await db.from('questions').select('*');
    if (data) { list = data as Question[]; setLocal('questions', list); }
  }
  searchResults = list.filter(q => searchHit(q, kw)).slice(0, 50);

  if (searchResults.length === 0) {
    box.innerHTML = `<div class="empty-state"><div class="empty-icon">🔍</div><div class="empty-title">未找到相关题目</div><div class="empty-desc">换个关键词试试</div></div>`;
    box.style.display = '';
    return;
  }

  box.innerHTML = `<div style="padding:0 2px 8px;font-size:.75rem;color:var(--text-secondary)">找到 ${searchResults.length} 题，点击进入作答</div>` +
    searchResults.map((q, i) => {
      const s = SUBJECTS.find(x => x.id === q.subject);
      const typeLabel = TYPE_LABELS[q.type] || '';
      return `<div class="search-result" onclick="startSearchQuiz(${i})">
        <div><span class="tag tag-amber">${s ? s.name : q.subject}</span><span class="tag tag-gray">${typeLabel}</span>${q.chapter ? `<span class="tag tag-gray">${q.chapter}</span>` : ''}</div>
        <div class="sr-title">${formatMath(q.question)}</div>
      </div>`;
    }).join('');
  box.style.display = '';
}

export function startSearchQuiz(index: number): void {
  const q = searchResults[index];
  if (!q) return;
  const s = SUBJECTS.find(x => x.id === q.subject);
  setQuizState({
    subject: q.subject,
    subjectName: s ? s.name : '',
    questions: [q],
    index: 0,
    correct: 0,
    wrong: 0,
    total: 1
  });
  const box = document.getElementById('searchResults');
  if (box) box.style.display = 'none';
  const input = document.getElementById('searchInput') as HTMLInputElement | null;
  if (input) input.value = '';
  switchPage('quiz');
  const title = document.getElementById('quizTitle');
  if (title) title.textContent = (s ? s.name : '') + ' · 搜索精练';
  const fill = document.getElementById('progressFill');
  const prog = document.getElementById('quizProgress');
  if (fill) fill.style.width = '0%';
  if (prog) prog.textContent = '0/1';
  renderQuestion();
}