const { chromium } = require('playwright-core');

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const USER_DATA_DIR = require('path').join(__dirname, '..', 'node_modules', '.cache', 'edge-smoke');
require('fs').rmSync(USER_DATA_DIR, { recursive: true, force: true });

(async () => {
  const context = await chromium.launchPersistentContext(USER_DATA_DIR, { executablePath: EDGE_PATH, headless: true });
  const page = context.pages()[0] || await context.newPage();
  const errors = [];
  const notFound = [];
  page.on('console', m => {
    if (m.type() === 'error') errors.push('[console.error] ' + m.text());
    if (m.type() === 'warning' && m.text().includes('404')) notFound.push(m.text());
  });
  page.on('requestfailed', r => notFound.push(r.url()));
  page.on('response', r => { if (r.status() === 404) notFound.push(r.url()); });
  page.on('pageerror', e => errors.push('[pageerror] ' + e.message));
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });

  await page.evaluate(() => {
    if (!window.loadDemoData) throw new Error('window.loadDemoData missing');
    loadDemoData();
  });
  await page.waitForTimeout(300);

  const home = await page.evaluate(() => ({
    subjectCards: document.querySelectorAll('.subject-card').length,
    version: document.getElementById('appVersion')?.textContent,
    todayTotal: document.getElementById('todayTotal')?.textContent,
    todayStreak: document.getElementById('todayStreak')?.textContent,
  }));
  console.log('HOME:', JSON.stringify(home));

  const opened = await page.evaluate(() => {
    try {
      if (typeof openSubject !== 'function') return { err: 'openSubject not on window', has: typeof window.openSubject };
      openSubject('politics');
      return { ok: true };
    } catch (e) {
      return { err: e.message };
    }
  });
  console.log('OPEN_SUBJECT:', JSON.stringify(opened));
  await page.waitForSelector('#page-subject.active', { timeout: 5000 });
  await page.waitForSelector('.chapter-card', { timeout: 5000 });
  const subjectPage = await page.evaluate(() => ({
    chapterCards: document.querySelectorAll('.chapter-card').length,
    hero: !!document.querySelector('.subject-hero'),
    title: document.getElementById('subjectTitle')?.textContent,
  }));
  console.log('SUBJECT_PAGE:', JSON.stringify(subjectPage));

  await page.evaluate(() => { openQuizModal('politics', ''); });
  await page.waitForSelector('.modal-overlay', { timeout: 5000 });
  const modeCount = await page.locator('.modal-overlay .mode-option').count();
  console.log('MODES:', modeCount);
  await page.evaluate(() => {
    const start = document.querySelector('.modal-overlay button[onclick^="startQuiz"]');
    if (start) start.click();
  });
  await page.waitForSelector('#quizContent');
  await page.waitForTimeout(300);

  const quiz = await page.evaluate(() => ({
    progress: document.querySelector('.progress-text, .progress')?.textContent?.trim().slice(0, 20),
    options: document.querySelectorAll('.option').length,
    typeLabel: document.querySelector('.type-label, .q-type')?.textContent?.trim(),
  }));
  console.log('QUIZ:', JSON.stringify(quiz));

  await page.evaluate(() => {
    const opt = document.querySelector('.option');
    if (opt) opt.click();
  });
  await page.evaluate(() => { window.submitAnswer(); });
  await page.waitForTimeout(300);
  const afterSubmit = await page.evaluate(() => ({
    correctMarked: document.querySelectorAll('.option.correct').length,
    wrongMarked: document.querySelectorAll('.option.wrong').length,
    hasNext: !!document.querySelector('button[onclick*="nextQuestion"], button[onclick*="NextQuestion"]'),
    feedback: !!document.getElementById('feedbackArea'),
  }));
  console.log('SUBMIT:', JSON.stringify(afterSubmit));

  await page.evaluate(() => { window.nextQuestion(); });
  await page.waitForTimeout(200);

  for (let i = 0; i < 4; i++) {
    await page.evaluate(() => {
      const opt = document.querySelector('.option:not(.correct):not(.wrong)');
      if (opt) opt.click();
      window.submitAnswer();
    });
    await page.waitForTimeout(200);
    await page.evaluate(() => { window.nextQuestion(); }).catch(() => {});
    await page.waitForTimeout(200);
  }

  const hasResult = await page.locator('.result-hero, .result-grid').count();
  console.log('RESULT_PAGE:', hasResult > 0);

  await page.evaluate(() => switchPage('wrongbook'));
  await page.waitForTimeout(300);
  const wrongHtml = await page.evaluate(() => ({
    cards: document.querySelectorAll('.wrong-card').length,
    filters: document.querySelectorAll('.filter-chip').length,
    empty: !!document.querySelector('.empty-state'),
  }));
  console.log('WRONGBOOK:', JSON.stringify(wrongHtml));

  await page.evaluate(() => switchPage('stats'));
  await page.waitForTimeout(300);
  const stats = await page.evaluate(() => ({
    gridItems: document.querySelectorAll('.stat-item').length,
    streakItem: document.querySelectorAll('.stat-item .lbl')[3]?.textContent?.trim(),
    subjectRows: document.querySelectorAll('.subject-stat-row').length,
    body: document.body.textContent.trim().slice(0, 120).replace(/\s+/g, ' '),
  }));
  console.log('STATS:', JSON.stringify(stats));

  await page.evaluate(() => switchPage('admin'));
  await page.waitForTimeout(300);
  const admin = await page.evaluate(() => ({
    formFields: !!document.getElementById('addQuestion'),
    hasSubjectSel: !!document.getElementById('addSubject'),
    typeOptions: [...document.querySelector('#addType').options].map(o => o.value),
  }));
  console.log('ADMIN:', JSON.stringify(admin));

  await page.evaluate(() => switchPage('home'));
  await page.waitForTimeout(300);
  const walkSubject = async (subjectId) => {
    await page.evaluate((sid) => {
      if (typeof openSubject !== 'function') throw new Error('openSubject missing');
      openSubject(sid);
    }, subjectId);
    await page.waitForSelector('#page-subject.active', { timeout: 5000 });
    await page.evaluate((sid) => { openQuizModal(sid, ''); }, subjectId);
    await page.waitForSelector('.modal-overlay', { timeout: 5000 });
    await page.evaluate(() => {
      const start = document.querySelector('.modal-overlay button[onclick^="startQuiz"]');
      if (start) start.click();
    });
    await page.waitForSelector('#quizContent');
    await page.waitForTimeout(300);
    let fillHit = 0;
    let essayHit = 0;
    let katexHit = 0;
    let walk = 0;
    while (walk < 200) {
      walk++;
      const phase = await page.evaluate(() => {
        if (document.querySelector('.result-hero, .result-grid')) return { done: true };
        const fi = document.getElementById('fillInput');
        const ta = document.getElementById('essayInput');
        if (fi) {
          fi.value = '1';
          window.submitAnswer();
          return { kind: 'fill' };
        }
        if (ta) {
          ta.value = '测试作答';
          window.submitAnswer();
          return { kind: 'essay' };
        }
        const opt = document.querySelector('.option');
        if (opt) opt.click();
        window.submitAnswer();
        return { kind: 'choice' };
      });
      if (phase.done) break;
      if (await page.evaluate(() => !!document.querySelector('#quizContent .katex'))) katexHit++;
      if (phase.kind === 'fill') {
        await page.waitForTimeout(200);
        const fb = await page.evaluate(() => ({
          banner: !!document.querySelector('.feedback-banner'),
          correctMarked: (document.getElementById('fillInput')?.classList.contains('correct') || false),
        }));
        fillHit++;
        console.log('FILL_OK:', JSON.stringify(fb));
      } else if (phase.kind === 'essay') {
        await page.waitForTimeout(200);
        const fb = await page.evaluate(() => {
          const hasSelfCheck = !!document.querySelector('.self-check');
          const hasSelfAssess = typeof window.selfAssess === 'function';
          const btn = document.querySelector('.self-check button');
          if (btn) btn.click();
          return { hasSelfCheck, hasSelfAssess, banner: !!document.querySelector('.feedback-banner') };
        });
        essayHit++;
        console.log('ESSAY_OK:', JSON.stringify(fb));
        await page.waitForTimeout(200);
      } else {
        await page.waitForTimeout(150);
      }
      await page.evaluate(() => { window.nextQuestion(); }).catch(() => {});
      await page.waitForTimeout(150);
    }
    return { fillHit, essayHit, katexHit, walk };
  };

  const favTest = { favBtn: false, toggleActive: false, listCount: 0, emptyShown: false, removed: false, removeCard: false };
  await page.evaluate(() => { openSubject('math2'); });
  await page.waitForSelector('#page-subject.active', { timeout: 5000 });
  await page.evaluate(() => { openQuizModal('math2', ''); });
  await page.waitForSelector('.modal-overlay', { timeout: 5000 });
  await page.evaluate(() => {
    const start = document.querySelector('.modal-overlay button[onclick^="startQuiz"]');
    if (start) start.click();
  });
  await page.waitForSelector('#quizContent');
  await page.waitForTimeout(300);
  favTest.favBtn = (await page.locator('#quizContent .fav-btn').count()) === 1;
  await page.evaluate(() => {
    const btn = document.querySelector('#quizContent .fav-btn');
    if (btn) btn.click();
  });
  await page.waitForTimeout(200);
  favTest.toggleActive = await page.evaluate(() => document.querySelector('#quizContent .fav-btn')?.classList.contains('active') || false);
  await page.evaluate(() => switchPage('favorites'));
  await page.waitForTimeout(300);
  favTest.listCount = await page.locator('.fav-card').count();
  favTest.emptyShown = await page.evaluate(() => document.getElementById('favEmpty')?.style.display !== 'none');
  await page.evaluate(() => {
    const btn = document.querySelector('.fav-card .btn-danger');
    if (btn) btn.click();
  });
  await page.waitForTimeout(200);
  favTest.removed = (await page.locator('.fav-card').count()) === 0;
  favTest.removeCard = favTest.removed && (await page.evaluate(() => document.getElementById('favEmpty')?.style.display === ''));
  console.log('FAVORITES:', JSON.stringify(favTest));
  await page.evaluate(() => switchPage('home'));
  await page.waitForTimeout(300);

  const searchTest = { found: 0, clickOk: false, title: '' };
  await page.evaluate(() => {
    const input = document.getElementById('searchInput');
    if (input) input.value = '极限';
    window.doSearch();
  });
  await page.waitForTimeout(400);
  searchTest.found = await page.locator('.search-result').count();
  if (searchTest.found > 0) {
    await page.evaluate(() => {
      const first = document.querySelector('.search-result');
      if (first) first.click();
    });
    await page.waitForTimeout(300);
    searchTest.title = await page.evaluate(() => document.getElementById('quizTitle')?.textContent || '');
    searchTest.clickOk = (await page.locator('#quizContent .q-title').count()) === 1;
    await page.evaluate(() => window.quitQuiz());
    await page.waitForTimeout(300);
  }
  console.log('SEARCH:', JSON.stringify(searchTest));

  const fillWalk = await walkSubject('math2');
  const essayWalk = await walkSubject('circuit');
  const fillEssay = { fillHit: fillWalk.fillHit, essayHit: essayWalk.essayHit, katexHit: fillWalk.katexHit, walkMath2: fillWalk.walk, walkCircuit: essayWalk.walk };
  console.log('FILL_ESSAY:', JSON.stringify(fillEssay));

  const themeTest = { btn: false, toggleDark: false, persist: false, backLight: false };
  if ((await page.locator('#themeToggle').count()) === 1) {
    themeTest.btn = true;
    await page.evaluate(() => { window.toggleTheme(); });
    await page.waitForTimeout(150);
    themeTest.toggleDark = await page.evaluate(() => document.documentElement.getAttribute('data-theme') === 'dark' && document.getElementById('themeToggle')?.textContent === '☀️');
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForTimeout(300);
    themeTest.persist = await page.evaluate(() => document.documentElement.getAttribute('data-theme') === 'dark');
    await page.evaluate(() => {
      if (document.documentElement.getAttribute('data-theme') === 'dark') window.toggleTheme();
    });
    await page.waitForTimeout(150);
    themeTest.backLight = await page.evaluate(() => document.documentElement.getAttribute('data-theme') === 'light');
  }
  console.log('THEME:', JSON.stringify(themeTest));

  const pwaTest = { swSupported: false, manifestLink: false, manifestOk: false, swRegistered: false };
  pwaTest.swSupported = await page.evaluate(() => 'serviceWorker' in navigator);
  pwaTest.manifestLink = await page.evaluate(() => !!document.querySelector('link[rel="manifest"]'));
  pwaTest.manifestOk = (await page.evaluate(async () => (await fetch('/manifest.webmanifest')).status)) === 200;
  pwaTest.swRegistered = await page.evaluate(() =>
    Promise.race([
      navigator.serviceWorker.ready.then(() => true).catch(() => false),
      new Promise((resolve) => setTimeout(() => resolve(false), 4000))
    ])
  );
  console.log('PWA:', JSON.stringify(pwaTest));

  console.log('JS_ERRORS:', errors.length ? errors : 'none');
  console.log('NOT_FOUND:', notFound.length ? notFound : 'none');
  try { await context.close(); } catch (e) { /* ignore sandbox noise */ }
  process.exit(errors.length || home.subjectCards < 4 || home.todayStreak !== '0' || subjectPage.chapterCards < 1 || !subjectPage.hero || subjectPage.title !== '政治' || modeCount < 3 || stats.gridItems !== 4 || stats.streakItem !== '连续打卡' || searchTest.found < 1 || !searchTest.clickOk || fillEssay.fillHit < 1 || fillEssay.essayHit < 1 || fillEssay.katexHit < 1 || !favTest.favBtn || !favTest.toggleActive || favTest.listCount < 1 || !favTest.removed || !themeTest.btn || !themeTest.toggleDark || !themeTest.persist || !themeTest.backLight || !pwaTest.swSupported || !pwaTest.manifestLink || !pwaTest.manifestOk || !pwaTest.swRegistered ? 1 : 0);
})();