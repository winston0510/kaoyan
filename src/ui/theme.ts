const THEME_KEY = 'kaoyan_theme';
const DARK_QUERY = '(prefers-color-scheme: dark)';

function applyTheme(theme: 'dark' | 'light'): void {
  document.documentElement.dataset.theme = theme;
  const btn = document.getElementById('themeToggle');
  if (btn) btn.textContent = theme === 'dark' ? '☀️' : '🌙';
  const tc = document.querySelector('meta[name="theme-color"]');
  if (tc) tc.setAttribute('content', theme === 'dark' ? '#000000' : '#FFFFFF');
  const sb = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
  if (sb) sb.setAttribute('content', theme === 'dark' ? 'black-translucent' : 'default');
}

function detectTheme(): 'dark' | 'light' {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === 'dark' || saved === 'light') return saved;
  return window.matchMedia(DARK_QUERY).matches ? 'dark' : 'light';
}

export function initTheme(): void {
  applyTheme(detectTheme());
}

export function toggleTheme(): void {
  const next: 'dark' | 'light' = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  localStorage.setItem(THEME_KEY, next);
  applyTheme(next);
}