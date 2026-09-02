import { db } from '../state';

const TAB_PAGES = ['home', 'knowledge', 'favorites', 'wrongbook', 'stats'];
const scrollMem: Record<string, number> = {};
let currentPage = 'home';

export function switchPage(page: string): void {
  if (page !== currentPage) scrollMem[currentPage] = window.scrollY;
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const target = document.getElementById('page-' + page);
  if (target) target.classList.add('active');
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const nav = document.querySelector(`.nav-item[data-page="${page}"]`);
  if (nav) nav.classList.add('active');
  const bottomNav = document.getElementById('bottomNav');
  if (bottomNav) bottomNav.style.display = (page === 'quiz' || page === 'admin' || page === 'subject') ? 'none' : '';
  if (TAB_PAGES.includes(page)) window.scrollTo(0, scrollMem[page] || 0);
  else window.scrollTo(0, 0);
  currentPage = page;

  const w = window as unknown as Record<string, () => void>;
  if (page === 'home') w.renderHome?.();
  if (page === 'knowledge') w.renderKnowledge?.();
  if (page === 'favorites') w.renderFavorites?.();
  if (page === 'wrongbook') w.renderWrongBook?.();
  if (page === 'stats') w.renderStats?.();
  if (page === 'admin') {
    const urlEl = document.getElementById('supabaseUrl') as HTMLInputElement | null;
    const keyEl = document.getElementById('supabaseKey') as HTMLInputElement | null;
    if (urlEl) urlEl.value = localStorage.getItem('supabase_url') || '';
    if (keyEl) keyEl.value = localStorage.getItem('supabase_key') || '';
    const st = document.getElementById('configStatus');
    if (st) st.textContent = db ? '✅ 已连接 Supabase' : '⚠ 未连接，使用本地模式';
  }
}