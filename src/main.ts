import 'katex/dist/katex.min.css';
import { initSupabase, pullFromDB, saveConfig, syncQuestionsFromDB } from './api';
import { APP_VERSION } from './constants';
import { renderHome, selectMode } from './ui/home';
import { openQuizModal, openSubject, renderSubject } from './ui/subject';
import { switchPage } from './ui/navigation';
import { confirmQuit, finishQuiz, nextQuestion, quitQuiz, renderQuestion, resumeQuiz, retryWrong, selectOption, selfAssess, startQuiz, submitAnswer, toggleFavorite, toggleMultiOption } from './ui/quiz';
import { renderFavorites, removeFavorite, setFavFilter, startFavQuiz } from './ui/favorites';
import { renderWrongBook, setWrongFilter } from './ui/wrongbook';
import { renderStats } from './ui/stats';
import { backFromKnowledge, flipCard, openKnowledgeTopic, renderKnowledge, switchKnowledgeTab, toggleKnowledgeSection } from './ui/knowledge';
import { doSearch, startSearchQuiz } from './ui/search';
import { addOption, addQuestion, delOption, importJson, loadDemoData } from './ui/admin';
import { initTheme, toggleTheme } from './ui/theme';
import { registerSW } from './pwa';

const windowApi: Record<string, unknown> = {
  switchPage,
  renderHome,
  openSubject,
  renderSubject,
  openQuizModal,
  selectMode,
  startQuiz,
  renderQuestion,
  selectOption,
  toggleMultiOption,
  submitAnswer,
  selfAssess,
  nextQuestion,
  quitQuiz,
  resumeQuiz,
  confirmQuit,
  finishQuiz,
  retryWrong,
  renderWrongBook,
  setWrongFilter,
  toggleFavorite,
  renderFavorites,
  removeFavorite,
  setFavFilter,
  startFavQuiz,
  doSearch,
  startSearchQuiz,
  renderStats,
  renderKnowledge,
  openKnowledgeTopic,
  backFromKnowledge,
  switchKnowledgeTab,
  toggleKnowledgeSection,
  flipCard,
  saveConfig,
  loadDemoData,
  addOption,
  delOption,
  addQuestion,
  importJson,
  toggleTheme
};
Object.assign(window, windowApi);

document.addEventListener('gesturestart', e => e.preventDefault());

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  registerSW();
  initSupabase();
  void syncQuestionsFromDB();
  void pullFromDB();
  renderHome();

  const hash = location.hash.replace('#', '');
  if (['knowledge', 'favorites', 'wrongbook', 'stats', 'admin'].includes(hash)) switchPage(hash);

  const url = localStorage.getItem('supabase_url');
  const key = localStorage.getItem('supabase_key');
  if (url && key) {
    const urlEl = document.getElementById('supabaseUrl') as HTMLInputElement | null;
    const keyEl = document.getElementById('supabaseKey') as HTMLInputElement | null;
    if (urlEl) urlEl.value = url;
    if (keyEl) keyEl.value = key;
  }

  const verEl = document.getElementById('appVersion');
  if (verEl) verEl.textContent = '当前版本 ' + APP_VERSION;
});