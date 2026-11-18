import {
  FONTS,
  THEMES,
  getCheatMode,
  getSavedFont,
  getSavedSubject,
  getSavedTheme,
  getStatusKey,
  getStatuses,
  saveCheatMode,
  saveFont,
  saveSubject,
  saveTheme,
  setLessonStatus,
} from './state.js';
import { copyToClipboard, renderHomePage, renderMarkdownLesson, renderSidebar } from './render.js';
import {
  buildHighlightedFragment,
  getLessonMarkdown,
  preloadAllLessons,
  searchLessons,
} from './search.js';

const dom = {
  appearanceWrap: document.querySelector('.appearance-wrap'),
  appearanceBtn: document.getElementById('appearance-btn'),
  appearanceMenu: document.getElementById('appearance-menu'),
  themeOptions: document.getElementById('theme-options'),
  fontOptions: document.getElementById('font-options'),

  subjectWrap: document.querySelector('.subject-wrap'),
  subjectBtn: document.getElementById('subject-btn'),
  subjectLabel: document.getElementById('subject-label'),
  subjectMenu: document.getElementById('subject-menu'),
  subjectOptions: document.getElementById('subject-options'),

  hljsLight: document.getElementById('hljs-light'),
  hljsDark: document.getElementById('hljs-dark'),

  cheatBtn: document.getElementById('cheat-btn'),
  searchWrap: document.querySelector('.search-wrap'),
  searchInput: document.getElementById('search-input'),
  searchResults: document.getElementById('search-results'),
  sidebarToggle: document.getElementById('sidebar-toggle'),
  sidebar: document.getElementById('sidebar'),
  sidebarBackdrop: document.getElementById('sidebar-backdrop'),

  lessonNav: document.getElementById('lesson-nav'),
  homeLink: document.getElementById('home-link'),
  bundleLink: document.getElementById('bundle-link'),
  progressBadge: document.getElementById('progress-badge'),
  mainContent: document.getElementById('main-content'),
  articleToolbar: document.getElementById('article-toolbar'),
  lessonModule: document.getElementById('lesson-module'),
  lessonArticle: document.getElementById('lesson-article'),
  statusDoneBtn: document.getElementById('status-done-btn'),
  statusReviewBtn: document.getElementById('status-review-btn'),
  aiWrap: document.querySelector('.ai-wrap'),
  aiBtn: document.getElementById('ai-btn'),
  aiMenu: document.getElementById('ai-menu'),
  docxLink: document.getElementById('docx-link'),
};

const PUBLIC_SITE_BASE = 'https://maxolio.github.io/frontend-notes/site/';

const FONT_PREVIEW = {
  inter: '"Inter Variable", sans-serif',
  golos: '"Golos Text Variable", sans-serif',
  onest: '"Onest Variable", sans-serif',
  literata: '"Literata Variable", serif',
};

let allSubjects = [];
let activeSubject = null;
let allLessons = [];
let activeLessonId = null;
let currentSearchResults = [];
let selectedSearchIndex = -1;
let searchDebounceId = null;
const lessonsIndexCache = new Map();

function renderAppearanceOptions() {
  dom.themeOptions.innerHTML = '';
  for (const theme of THEMES) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'appearance-option';
    btn.dataset.themeId = theme.id;
    btn.textContent = `${theme.icon} ${theme.label}`;
    dom.themeOptions.append(btn);
  }

  dom.fontOptions.innerHTML = '';
  for (const font of FONTS) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'appearance-option';
    btn.dataset.fontId = font.id;
    btn.style.fontFamily = FONT_PREVIEW[font.id] || 'inherit';
    btn.textContent = font.label;
    dom.fontOptions.append(btn);
  }
}

function renderSubjectOptions() {
  dom.subjectOptions.innerHTML = '';
  for (const subject of allSubjects) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'subject-option';
    btn.dataset.subjectId = subject.id;

    const badge = document.createElement('span');
    badge.className = 'subject-badge';
    badge.textContent = subject.badge;

    const title = document.createElement('span');
    title.textContent = subject.title;

    btn.append(badge, title);
    dom.subjectOptions.append(btn);
  }
}

function setAppearanceMenuOpen(isOpen) {
  dom.appearanceMenu.hidden = !isOpen;
  dom.appearanceBtn.setAttribute('aria-expanded', String(isOpen));
  if (isOpen) setSubjectMenuOpen(false);
}

function setSubjectMenuOpen(isOpen) {
  dom.subjectMenu.hidden = !isOpen;
  dom.subjectBtn.setAttribute('aria-expanded', String(isOpen));
  if (isOpen) {
    dom.appearanceMenu.hidden = true;
    dom.appearanceBtn.setAttribute('aria-expanded', 'false');
  }
}

function setAiMenuOpen(isOpen) {
  dom.aiMenu.hidden = !isOpen;
  dom.aiBtn.setAttribute('aria-expanded', String(isOpen));
}

function getPublicBaseUrl() {
  const host = window.location.hostname;
  const isLocal =
    !host ||
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host.startsWith('192.168.') ||
    host.startsWith('10.');
  return isLocal ? PUBLIC_SITE_BASE : new URL('./', window.location.href).href;
}

let aiFlashTimer = null;
function flashAiLabel(label) {
  const labelSpan = dom.aiBtn.firstElementChild;
  if (!labelSpan) return;
  labelSpan.textContent = label;
  clearTimeout(aiFlashTimer);
  aiFlashTimer = setTimeout(() => {
    labelSpan.textContent = '🤖 Для ИИ';
  }, 1500);
}

function applyTheme(themeId) {
  const theme = THEMES.find((t) => t.id === themeId) || THEMES[0];
  document.documentElement.dataset.theme = theme.id;
  dom.hljsLight.disabled = theme.isDark;
  dom.hljsDark.disabled = !theme.isDark;
  saveTheme(theme.id);

  for (const btn of dom.themeOptions.querySelectorAll('[data-theme-id]')) {
    btn.dataset.active = String(btn.dataset.themeId === theme.id);
  }
}

function applyFont(fontId) {
  const font = FONTS.find((f) => f.id === fontId) || FONTS[0];
  document.documentElement.dataset.font = font.id;
  saveFont(font.id);

  for (const btn of dom.fontOptions.querySelectorAll('[data-font-id]')) {
    btn.dataset.active = String(btn.dataset.fontId === font.id);
  }
}

function applyCheatMode(enabled) {
  dom.mainContent.classList.toggle('cheat-mode', enabled);
  dom.cheatBtn.setAttribute('aria-pressed', String(enabled));
  saveCheatMode(enabled);
}

function setSidebarOpen(isOpen) {
  dom.sidebar.classList.toggle('open', isOpen);
  dom.sidebarBackdrop.hidden = !isOpen;
  dom.sidebarToggle.setAttribute('aria-expanded', String(isOpen));
}

function updateProgressAndStatusUI() {
  if (!activeSubject) return;
  const statuses = getStatuses();
  const doneCount = allLessons.filter(
    (l) => statuses[getStatusKey(activeSubject.id, l.id)] === 'done'
  ).length;
  dom.progressBadge.textContent = `${doneCount} / ${allLessons.length}`;

  const currentStatus = statuses[getStatusKey(activeSubject.id, activeLessonId)] || null;
  dom.statusDoneBtn.dataset.active = String(currentStatus === 'done');
  dom.statusReviewBtn.dataset.active = String(currentStatus === 'review');

  const query = dom.searchInput.value.trim();
  const filtered = query
    ? searchLessons(activeSubject.id, allLessons, query).map((r) => r.lesson)
    : allLessons;
  renderSidebar(dom.lessonNav, activeSubject.id, filtered, activeLessonId, statuses);
}

function hideSearchResults() {
  dom.searchResults.hidden = true;
  selectedSearchIndex = -1;
}

function renderSearchDropdown(results) {
  currentSearchResults = results.slice(0, 8);
  selectedSearchIndex = currentSearchResults.length ? 0 : -1;
  dom.searchResults.innerHTML = '';

  if (!currentSearchResults.length) {
    const empty = document.createElement('div');
    empty.className = 'search-empty';
    empty.textContent = 'Ничего не найдено';
    dom.searchResults.append(empty);
    dom.searchResults.hidden = false;
    return;
  }

  currentSearchResults.forEach((item, index) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'search-result-item';
    btn.setAttribute('role', 'option');
    if (index === selectedSearchIndex) {
      btn.classList.add('is-selected');
    }

    const titleEl = document.createElement('span');
    titleEl.className = 'search-result-title';
    titleEl.append(buildHighlightedFragment(item.lesson.title, item.terms));
    btn.append(titleEl);

    if (item.matchedHeading) {
      const sectionEl = document.createElement('span');
      sectionEl.className = 'search-result-section';
      sectionEl.append(buildHighlightedFragment(item.matchedHeading, item.terms));
      btn.append(sectionEl);
    }

    if (item.snippet) {
      const snippetEl = document.createElement('span');
      snippetEl.className = 'search-result-snippet';
      snippetEl.append(buildHighlightedFragment(item.snippet, item.terms));
      btn.append(snippetEl);
    }

    btn.addEventListener('click', () => {
      selectSearchResult(item);
    });

    dom.searchResults.append(btn);
  });

  dom.searchResults.hidden = false;
}

function updateSelectedSearchItem() {
  const items = [...dom.searchResults.querySelectorAll('.search-result-item')];
  items.forEach((el, idx) => {
    const isSelected = idx === selectedSearchIndex;
    el.classList.toggle('is-selected', isSelected);
    if (isSelected) {
      el.scrollIntoView({ block: 'nearest' });
    }
  });
}

async function selectSearchResult(item) {
  hideSearchResults();
  dom.searchInput.blur();
  await openLesson(item.lesson.id, item.matchedHeading);
}

async function runSearch() {
  if (!activeSubject) return;
  const query = dom.searchInput.value.trim();
  if (!query) {
    hideSearchResults();
    updateProgressAndStatusUI();
    return;
  }

  await preloadAllLessons(activeSubject, allLessons);
  const results = searchLessons(activeSubject.id, allLessons, query);
  renderSearchDropdown(results);
  updateProgressAndStatusUI();
}

function scrollToMatchedHeading(headingText) {
  if (!headingText) return false;
  const query = headingText.trim();
  const headings = [...dom.lessonArticle.querySelectorAll('h2, .lesson-accordion-title')];
  const target = headings.find((el) => {
    const clean = el.textContent.replace(/^[❓🧩]\s*/, '').trim();
    return clean === query;
  });
  if (!target) return false;

  const accordion = target.closest('.lesson-accordion');
  if (accordion) {
    accordion.open = true;
  }

  const scrollTarget = accordion || target;
  scrollTarget.scrollIntoView({ behavior: 'smooth', block: 'start' });
  scrollTarget.classList.remove('section-flash');
  void scrollTarget.offsetWidth;
  scrollTarget.classList.add('section-flash');
  return true;
}

function openHomePage() {
  if (!activeSubject) return;
  activeLessonId = null;
  if (window.location.hash !== '#home') {
    window.history.replaceState(null, '', '#home');
  }

  dom.articleToolbar.hidden = true;
  dom.lessonArticle.classList.add('is-home');
  dom.homeLink.classList.add('active');
  updateProgressAndStatusUI();

  renderHomePage(dom.lessonArticle, {
    activeSubject,
    lessons: allLessons,
    subjects: allSubjects,
    statuses: getStatuses(),
  });
  document.title = 'Frontend Notes by Maxolio — База конспектов';
  window.scrollTo({ top: 0, behavior: 'instant' });
}

async function openLesson(lessonId, scrollToHeading = '') {
  const lesson = allLessons.find((l) => l.id === lessonId) || allLessons[0];
  if (!lesson || !activeSubject) return;

  activeLessonId = lesson.id;
  dom.articleToolbar.hidden = false;
  dom.lessonArticle.classList.remove('is-home');
  dom.homeLink.classList.remove('active');

  const targetHash = `#${activeSubject.id}/${lesson.id}`;
  if (window.location.hash !== targetHash) {
    window.history.replaceState(null, '', targetHash);
  }

  dom.lessonModule.textContent = lesson.module;
  if (lesson.sourceDocx) {
    dom.docxLink.href = lesson.sourceDocx;
    dom.docxLink.hidden = false;
  } else {
    dom.docxLink.hidden = true;
  }

  updateProgressAndStatusUI();
  dom.lessonArticle.innerHTML = '<p class="loading-text">Загружаем конспект...</p>';

  try {
    const markdown = await getLessonMarkdown(activeSubject, lesson);
    renderMarkdownLesson(dom.lessonArticle, markdown, {
      subjectId: activeSubject.id,
      lessonNumber: lesson.number,
    });
    document.title = `${lesson.title} — ${activeSubject.title} | Frontend Notes by Maxolio`;

    if (!scrollToMatchedHeading(scrollToHeading)) {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  } catch (error) {
    dom.lessonArticle.innerHTML = `
      <div class="callout callout-warn">
        <span class="callout-badge">Ошибка загрузки</span>
        <p>Не удалось загрузить <code>${activeSubject.basePath}/${lesson.file}</code> (${error.message}).
        Убедись, что сайт открыт через локальный сервер (<code>npm run site</code>).</p>
      </div>
    `;
  }
}

async function selectSubject(subjectId, targetLessonId = '', { showHome = false } = {}) {
  const subject = allSubjects.find((s) => s.id === subjectId) || allSubjects[0];
  if (!subject) return;

  activeSubject = subject;
  saveSubject(subject.id);
  dom.subjectLabel.textContent = subject.title;
  dom.searchInput.value = '';
  hideSearchResults();

  if (subject.bundleFile) {
    dom.bundleLink.href = subject.bundleFile;
    dom.bundleLink.download = `${subject.id}-all-lessons.md`;
    dom.bundleLink.hidden = false;
  } else {
    dom.bundleLink.hidden = true;
  }

  const bundleCopyBtn = dom.aiMenu.querySelector('[data-ai-action="copy-bundle-url"]');
  if (bundleCopyBtn) bundleCopyBtn.hidden = !subject.bundleFile;

  const shareBtn = dom.aiMenu.querySelector('[data-ai-action="share-url"]');
  if (shareBtn) shareBtn.hidden = typeof navigator.share !== 'function';

  for (const btn of dom.subjectOptions.querySelectorAll('[data-subject-id]')) {
    btn.dataset.active = String(btn.dataset.subjectId === subject.id);
  }

  try {
    if (lessonsIndexCache.has(subject.id)) {
      allLessons = lessonsIndexCache.get(subject.id);
    } else {
      const response = await fetch(subject.indexFile);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      allLessons = await response.json();
      lessonsIndexCache.set(subject.id, allLessons);
    }

    if (showHome) {
      openHomePage();
    } else {
      const nextLessonId = targetLessonId || allLessons[0]?.id;
      await openLesson(nextLessonId);
    }
    setTimeout(() => preloadAllLessons(subject, allLessons), 300);
  } catch (error) {
    dom.lessonArticle.innerHTML = `
      <div class="callout callout-warn">
        <span class="callout-badge">Ошибка раздела</span>
        <p>Не удалось загрузить индекс <code>${subject.indexFile}</code> (${error.message}).</p>
      </div>
    `;
  }
}

function parseLocationHash() {
  const raw = window.location.hash.slice(1);
  if (!raw || raw === 'home') return { isHome: true, subjectId: null, lessonId: null };
  if (raw.includes('/')) {
    const [subjectId, lessonId] = raw.split('/');
    return { isHome: false, subjectId, lessonId };
  }
  return { isHome: false, subjectId: null, lessonId: raw };
}

function bindEvents() {
  dom.appearanceBtn.addEventListener('click', () => {
    setAppearanceMenuOpen(dom.appearanceMenu.hidden);
  });

  dom.subjectBtn.addEventListener('click', () => {
    setSubjectMenuOpen(dom.subjectMenu.hidden);
  });

  dom.themeOptions.addEventListener('click', (event) => {
    const btn = event.target.closest('[data-theme-id]');
    if (!btn) return;
    applyTheme(btn.dataset.themeId);
  });

  dom.fontOptions.addEventListener('click', (event) => {
    const btn = event.target.closest('[data-font-id]');
    if (!btn) return;
    applyFont(btn.dataset.fontId);
  });

  dom.subjectOptions.addEventListener('click', (event) => {
    const btn = event.target.closest('[data-subject-id]');
    if (!btn) return;
    setSubjectMenuOpen(false);
    if (btn.dataset.subjectId !== activeSubject?.id) {
      selectSubject(btn.dataset.subjectId);
    }
  });

  dom.cheatBtn.addEventListener('click', () => {
    const isPressed = dom.cheatBtn.getAttribute('aria-pressed') === 'true';
    applyCheatMode(!isPressed);
  });

  dom.searchInput.addEventListener('input', () => {
    clearTimeout(searchDebounceId);
    searchDebounceId = setTimeout(runSearch, 120);
  });

  dom.searchInput.addEventListener('focus', () => {
    if (dom.searchInput.value.trim()) {
      runSearch();
    }
  });

  dom.searchInput.addEventListener('keydown', (event) => {
    if (dom.searchResults.hidden || !currentSearchResults.length) {
      if (event.key === 'Escape') {
        dom.searchInput.value = '';
        hideSearchResults();
        updateProgressAndStatusUI();
      }
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      selectedSearchIndex = (selectedSearchIndex + 1) % currentSearchResults.length;
      updateSelectedSearchItem();
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      selectedSearchIndex =
        (selectedSearchIndex - 1 + currentSearchResults.length) % currentSearchResults.length;
      updateSelectedSearchItem();
    } else if (event.key === 'Enter' && selectedSearchIndex >= 0) {
      event.preventDefault();
      selectSearchResult(currentSearchResults[selectedSearchIndex]);
    } else if (event.key === 'Escape') {
      hideSearchResults();
    }
  });

  document.addEventListener('click', (event) => {
    if (!dom.searchWrap.contains(event.target)) {
      hideSearchResults();
    }
    if (!dom.appearanceWrap.contains(event.target)) {
      setAppearanceMenuOpen(false);
    }
    if (!dom.subjectWrap.contains(event.target)) {
      setSubjectMenuOpen(false);
    }
    if (!dom.aiWrap.contains(event.target)) {
      setAiMenuOpen(false);
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      setAppearanceMenuOpen(false);
      setSubjectMenuOpen(false);
      setAiMenuOpen(false);
    }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      dom.searchInput.focus();
      dom.searchInput.select();
    }
  });

  dom.statusDoneBtn.addEventListener('click', () => {
    if (!activeSubject || !activeLessonId) return;
    setLessonStatus(activeSubject.id, activeLessonId, 'done');
    updateProgressAndStatusUI();
  });

  dom.statusReviewBtn.addEventListener('click', () => {
    if (!activeSubject || !activeLessonId) return;
    setLessonStatus(activeSubject.id, activeLessonId, 'review');
    updateProgressAndStatusUI();
  });

  dom.aiBtn.addEventListener('click', () => {
    setAiMenuOpen(dom.aiMenu.hidden);
  });

  dom.aiMenu.addEventListener('click', async (event) => {
    const btn = event.target.closest('[data-ai-action]');
    if (!btn) return;

    const action = btn.dataset.aiAction;
    const lesson = allLessons.find((l) => l.id === activeLessonId);
    if (!activeSubject || !lesson) return;

    setAiMenuOpen(false);

    try {
      if (action === 'copy-text') {
        const markdown = await getLessonMarkdown(activeSubject, lesson);
        const prompt = [
          'Ты — мой Senior Frontend-наставник. Ниже мой конспект урока в формате Markdown.',
          'Помоги закрепить тему: задай 2–3 вопроса с подвохом или разбери со мной задачу без готового ответа сразу.',
          '',
          '---',
          '',
          markdown.trim(),
        ].join('\n');
        await copyToClipboard(prompt);
        flashAiLabel('Скопировано ✓');
      } else if (action === 'copy-lesson-url') {
        const url = `${getPublicBaseUrl()}${activeSubject.basePath}/${lesson.file}`;
        await copyToClipboard(url);
        flashAiLabel('Ссылка ✓');
      } else if (action === 'copy-bundle-url' && activeSubject.bundleFile) {
        const url = `${getPublicBaseUrl()}${activeSubject.bundleFile}`;
        await copyToClipboard(url);
        flashAiLabel('Курс ✓');
      } else if (action === 'share-url' && navigator.share) {
        const url = `${getPublicBaseUrl()}${activeSubject.basePath}/${lesson.file}`;
        await navigator.share({ title: lesson.title, url });
      }
    } catch (error) {
      if (error?.name !== 'AbortError') {
        flashAiLabel('Ошибка');
      }
    }
  });

  dom.sidebarToggle.addEventListener('click', () => {
    const isOpen = dom.sidebar.classList.contains('open');
    setSidebarOpen(!isOpen);
  });

  dom.sidebarBackdrop.addEventListener('click', () => setSidebarOpen(false));

  dom.lessonNav.addEventListener('click', (event) => {
    const link = event.target.closest('.lesson-link');
    if (!link) return;
    setSidebarOpen(false);
  });

  dom.homeLink.addEventListener('click', (event) => {
    event.preventDefault();
    setSidebarOpen(false);
    openHomePage();
  });

  dom.lessonArticle.addEventListener('click', (event) => {
    const lessonBtn = event.target.closest('[data-home-lesson]');
    if (lessonBtn) {
      openLesson(lessonBtn.dataset.homeLesson);
      return;
    }

    const subjectBtn = event.target.closest('[data-home-subject]');
    if (subjectBtn) {
      selectSubject(subjectBtn.dataset.homeSubject);
    }
  });

  window.addEventListener('hashchange', () => {
    const { isHome, subjectId, lessonId } = parseLocationHash();
    if (isHome) {
      openHomePage();
    } else if (subjectId && subjectId !== activeSubject?.id) {
      selectSubject(subjectId, lessonId || '');
    } else if (lessonId && lessonId !== activeLessonId) {
      openLesson(lessonId);
    }
  });
}

async function init() {
  renderAppearanceOptions();
  applyTheme(getSavedTheme());
  applyFont(getSavedFont());
  applyCheatMode(getCheatMode());
  bindEvents();

  try {
    const response = await fetch('data/subjects.json');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    allSubjects = await response.json();
    renderSubjectOptions();

    const { isHome, subjectId, lessonId } = parseLocationHash();
    const initialSubjectId =
      subjectId && allSubjects.some((s) => s.id === subjectId)
        ? subjectId
        : getSavedSubject(allSubjects);
    await selectSubject(initialSubjectId, lessonId || '', { showHome: isHome });
  } catch (error) {
    dom.lessonArticle.innerHTML = `
      <div class="callout callout-warn">
        <span class="callout-badge">Ошибка запуска</span>
        <p>Не удалось загрузить <code>data/subjects.json</code> (${error.message}).
        Запусти <code>npm run site</code> в корне проекта и открой <code>/site/</code>.</p>
      </div>
    `;
  }
}

init();
