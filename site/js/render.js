const CALLOUT_PREFIXES = [
  { prefix: 'Суть урока:', className: 'callout-tldr', badge: 'Суть урока' },
  { prefix: '[!]', className: 'callout-warn', badge: 'Важно' },
  { prefix: '[+]', className: 'callout-tip', badge: 'На заметку' },
];

/**
 * Превращает параграфы с маркерами Суть урока:, [!], [+] в карточки,
 * сохраняя вложенные <code> элементы.
 */
function transformCallouts(container) {
  const paragraphs = [...container.querySelectorAll('p')];

  for (const p of paragraphs) {
    const trimmed = p.textContent.trimStart();
    const match = CALLOUT_PREFIXES.find((item) => trimmed.startsWith(item.prefix));
    if (!match) continue;

    stripPrefixFromFirstTextNode(p, match.prefix);

    const card = document.createElement('div');
    card.className = `callout ${match.className}`;

    const badge = document.createElement('span');
    badge.className = 'callout-badge';
    badge.textContent = match.badge;

    const nextEl = p.nextElementSibling;
    const isFollowUpList = nextEl && (nextEl.tagName === 'UL' || nextEl.tagName === 'OL');
    const hasParagraphText = p.textContent.trim().length > 0;

    if (!hasParagraphText && isFollowUpList) {
      card.append(badge, nextEl.cloneNode(true));
      nextEl.remove();
    } else {
      card.append(badge, p.cloneNode(true));
      if (hasParagraphText && isFollowUpList) {
        card.append(nextEl.cloneNode(true));
        nextEl.remove();
      }
    }

    p.replaceWith(card);
  }
}

function stripPrefixFromFirstTextNode(element, prefix) {
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  const firstText = walker.nextNode();
  if (!firstText) return;

  const trimmed = firstText.nodeValue.trimStart();
  if (trimmed.startsWith(prefix)) {
    firstText.nodeValue = trimmed.slice(prefix.length).trimStart();
  }
}

const PRACTICE_SECTIONS = [
  {
    key: 'questions',
    match: 'вопросы для закрепления',
    title: 'Вопросы для закрепления',
    icon: '❓',
    emptyText: 'Вопросы для этого урока ещё не добавлены. Их можно дописать в конце .md файла под заголовком ## Вопросы для закрепления.',
  },
  {
    key: 'tasks',
    match: 'задачи',
    title: 'Задачи',
    icon: '🧩',
    emptyText: 'Задачи для этого урока ещё не добавлены. Их можно дописать в конце .md файла под заголовком ## Задачи.',
  },
  {
    key: 'recap',
    match: 'всё, что прошли',
    title: 'Всё, что прошли',
    icon: '📌',
    optional: true,
  },
];

function collectSectionSiblings(heading) {
  const nodes = [];
  let next = heading.nextElementSibling;
  while (next && next.tagName !== 'H2' && !next.classList.contains('traps-section') && !next.classList.contains('lesson-accordion')) {
    nodes.push(next);
    next = next.nextElementSibling;
  }
  return nodes;
}

/** Оборачивает финальный раздел «3 главные ловушки урока» в акцентную секцию. */
function wrapTrapsSection(container) {
  const headings = [...container.querySelectorAll('h2')];
  const trapsHeading = headings.find((h) => h.textContent.toLowerCase().includes('ловушки урока'));
  if (!trapsHeading) return;

  const section = document.createElement('section');
  section.className = 'traps-section';

  const siblings = collectSectionSiblings(trapsHeading);
  trapsHeading.replaceWith(section);
  section.append(trapsHeading, ...siblings);
}

/** Превращает разделы «Вопросы для закрепления» и «Задачи» в раскрывающиеся блоки. */
function wrapPracticeAccordions(container) {
  for (const spec of PRACTICE_SECTIONS) {
    const headings = [...container.querySelectorAll('h2')];
    const heading = headings.find((h) => h.textContent.toLowerCase().includes(spec.match));
    if (!heading && spec.optional) continue;

    const details = document.createElement('details');
    details.className = 'lesson-accordion';
    details.dataset.section = spec.key;

    const summary = document.createElement('summary');
    summary.className = 'lesson-accordion-summary';

    const titleSpan = document.createElement('span');
    titleSpan.className = 'lesson-accordion-title';
    titleSpan.textContent = `${spec.icon} ${heading ? heading.textContent.trim() : spec.title}`;

    const chevron = document.createElement('span');
    chevron.className = 'lesson-accordion-chevron';
    chevron.setAttribute('aria-hidden', 'true');
    chevron.textContent = '▾';

    summary.append(titleSpan, chevron);

    const body = document.createElement('div');
    body.className = 'lesson-accordion-body';

    if (heading) {
      const siblings = collectSectionSiblings(heading);
      heading.replaceWith(details);
      body.append(...siblings);
    } else {
      details.classList.add('is-empty');
      const p = document.createElement('p');
      p.className = 'lesson-accordion-empty';
      p.textContent = spec.emptyText;
      body.append(p);
      container.append(details);
    }

    details.append(summary, body);
  }
}

/** Превращает элемент <details> в кнопку-аккордеон и переносит контент в .lesson-accordion-body. */
function buildAccordion(details, role = 'task') {
  const summary = details.querySelector(':scope > summary');
  if (!summary) return null;

  details.classList.add('lesson-accordion');
  if (role === 'group') {
    details.classList.add('practice-group-accordion');
  } else if (role === 'level') {
    details.classList.add('practice-level-accordion');
  }
  summary.classList.add('lesson-accordion-summary');

  const titleText = summary.textContent.trim();
  summary.textContent = '';

  const titleSpan = document.createElement('span');
  titleSpan.className = 'lesson-accordion-title';
  titleSpan.textContent = titleText;

  const chevron = document.createElement('span');
  chevron.className = 'lesson-accordion-chevron';
  chevron.setAttribute('aria-hidden', 'true');
  chevron.textContent = '▾';

  summary.append(titleSpan, chevron);

  const body = document.createElement('div');
  body.className = 'lesson-accordion-body';
  const contentNodes = [...details.childNodes].filter((node) => node !== summary);
  body.append(...contentNodes);
  details.append(body);

  return body;
}

/** Оформляет разделы, уровни сложности и задачи в практических блоках как кнопки-аккордеоны. */
function enhancePracticeTasks(container) {
  const topDetails = [...container.children].filter((el) => el.tagName === 'DETAILS');
  for (const details of topDetails) {
    const summary = details.querySelector(':scope > summary');
    if (!summary) continue;

    const text = summary.textContent.trim();
    const role = text.startsWith('🧩') ? 'task' : text.startsWith('📦') ? 'group' : 'level';
    const body = buildAccordion(details, role);
    if (!body || role === 'task') continue;

    enhancePracticeTasks(body);
  }
}

export async function copyToClipboard(text) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.append(textarea);
  textarea.focus();
  textarea.select();
  const ok = document.execCommand('copy');
  textarea.remove();
  if (!ok) {
    throw new Error('Copy failed');
  }
}

function buildCssPreviewDoc(cssText, customHtml) {
  const safeCss = cssText.replace(/<\/style/gi, '<\\/style');
  return `<!doctype html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      margin: 0;
      padding: 12px 14px;
      background: #ffffff;
      color: #1f2328;
      font-size: 15px;
      line-height: 1.5;
    }
    p { margin: 0 0 8px; }
    .preview-row { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; }
    ${safeCss}
  </style>
</head>
<body>${customHtml}</body>
</html>`;
}

function createCssSandbox(rawCode, demoHtml = '') {
  const htmlMatch = rawCode.match(/^\s*\/\*\s*html:\s*([\s\S]*?)\s*\*\/\s*/i);
  const customHtml = demoHtml
    || (htmlMatch
      ? htmlMatch[1]
      : '<p>Пример абзаца (&lt;p&gt;)</p><div class="preview-row"><a href="#" onclick="return false;">Пример ссылки (&lt;a&gt;)</a><button type="button">Кнопка (&lt;button&gt;)</button></div>');
  const initialCss = (htmlMatch ? rawCode.slice(htmlMatch[0].length) : rawCode).trim();

  const sandbox = document.createElement('div');
  sandbox.className = 'css-sandbox';

  const editorPane = document.createElement('div');
  editorPane.className = 'css-sandbox-pane';

  const editorBar = document.createElement('div');
  editorBar.className = 'css-sandbox-bar';

  const barTitle = document.createElement('span');
  barTitle.textContent = 'Редактор CSS';

  const resetBtn = document.createElement('button');
  resetBtn.type = 'button';
  resetBtn.className = 'copy-btn';
  resetBtn.textContent = 'Сбросить';

  const textarea = document.createElement('textarea');
  textarea.className = 'css-sandbox-editor';
  textarea.spellcheck = false;
  textarea.rows = Math.min(16, Math.max(5, initialCss.split(/\r?\n/).length + 1));
  textarea.value = initialCss;

  const iframe = document.createElement('iframe');
  iframe.className = 'css-preview-frame';
  iframe.setAttribute('sandbox', '');
  iframe.setAttribute('title', 'Результат CSS');
  iframe.srcdoc = buildCssPreviewDoc(initialCss, customHtml);

  textarea.addEventListener('input', () => {
    iframe.srcdoc = buildCssPreviewDoc(textarea.value, customHtml);
  });

  resetBtn.addEventListener('click', () => {
    textarea.value = initialCss;
    iframe.srcdoc = buildCssPreviewDoc(initialCss, customHtml);
  });

  editorBar.append(barTitle, resetBtn);
  editorPane.append(editorBar, textarea);
  sandbox.append(editorPane, iframe);
  return sandbox;
}

function formatConsoleArg(arg) {
  if (typeof arg === 'string') return arg;
  if (typeof arg === 'bigint') return `${arg}n`;
  if (arg === undefined) return 'undefined';
  if (arg === null || typeof arg !== 'object') return String(arg);
  try {
    return JSON.stringify(arg);
  } catch {
    return String(arg);
  }
}

function appendConsoleLine(outputEl, type, text) {
  const placeholder = outputEl.querySelector('.js-console-line.is-empty');
  if (placeholder) {
    placeholder.remove();
  }

  const line = document.createElement('div');
  line.className = `js-console-line is-${type}`;
  line.textContent = type === 'empty' ? text : `> ${text}`;
  outputEl.append(line);
  outputEl.scrollTop = outputEl.scrollHeight;
}

function createSandboxTimers() {
  const timeouts = new Set();
  const intervals = new Set();

  return {
    setTimeout(fn, delay, ...args) {
      const id = window.setTimeout(() => {
        timeouts.delete(id);
        fn(...args);
      }, delay);
      timeouts.add(id);
      return id;
    },
    setInterval(fn, delay, ...args) {
      const id = window.setInterval(fn, delay, ...args);
      intervals.add(id);
      return id;
    },
    clearTimeout(id) {
      timeouts.delete(id);
      window.clearTimeout(id);
    },
    clearInterval(id) {
      intervals.delete(id);
      window.clearInterval(id);
    },
    cleanup() {
      for (const id of timeouts) window.clearTimeout(id);
      for (const id of intervals) window.clearInterval(id);
      timeouts.clear();
      intervals.clear();
    },
  };
}

function runJsCode(code, outputEl, timers) {
  timers.cleanup();
  outputEl.innerHTML = '';

  const fakeConsole = {
    log: (...args) => appendConsoleLine(outputEl, 'log', args.map(formatConsoleArg).join(' ')),
    info: (...args) => appendConsoleLine(outputEl, 'log', args.map(formatConsoleArg).join(' ')),
    warn: (...args) => appendConsoleLine(outputEl, 'warn', args.map(formatConsoleArg).join(' ')),
    error: (...args) => appendConsoleLine(outputEl, 'error', args.map(formatConsoleArg).join(' ')),
    dir: (item) => appendConsoleLine(outputEl, 'log', formatConsoleArg(item)),
    table: (item) => appendConsoleLine(outputEl, 'log', formatConsoleArg(item)),
  };

  try {
    const fn = new Function(
      'console',
      'setTimeout',
      'setInterval',
      'clearTimeout',
      'clearInterval',
      code
    );
    const result = fn(
      fakeConsole,
      timers.setTimeout,
      timers.setInterval,
      timers.clearTimeout,
      timers.clearInterval
    );
    if (result && typeof result.catch === 'function') {
      result.catch((err) => appendConsoleLine(outputEl, 'error', `${err.name}: ${err.message}`));
    }
  } catch (err) {
    appendConsoleLine(outputEl, 'error', `${err.name}: ${err.message}`);
  }

  if (!outputEl.children.length) {
    appendConsoleLine(outputEl, 'empty', 'Код выполнен (ожидание вывода или console.log не вызван)');
  }
}

function createJsSandbox(rawCode) {
  const initialJs = rawCode.trim();
  const timers = createSandboxTimers();

  const sandbox = document.createElement('div');
  sandbox.className = 'css-sandbox';
  sandbox.cleanup = () => timers.cleanup();

  const editorPane = document.createElement('div');
  editorPane.className = 'css-sandbox-pane';

  const editorBar = document.createElement('div');
  editorBar.className = 'css-sandbox-bar';

  const barTitle = document.createElement('span');
  barTitle.textContent = 'Редактор JS';

  const barBtns = document.createElement('div');
  barBtns.className = 'code-actions';

  const runBtn = document.createElement('button');
  runBtn.type = 'button';
  runBtn.className = 'copy-btn';
  runBtn.textContent = '▶ Выполнить';

  const resetBtn = document.createElement('button');
  resetBtn.type = 'button';
  resetBtn.className = 'copy-btn';
  resetBtn.textContent = 'Сбросить';

  const textarea = document.createElement('textarea');
  textarea.className = 'css-sandbox-editor';
  textarea.spellcheck = false;
  textarea.rows = Math.min(16, Math.max(5, initialJs.split(/\r?\n/).length + 1));
  textarea.value = initialJs;

  const consolePane = document.createElement('div');
  consolePane.className = 'js-console-pane';

  const consoleBar = document.createElement('div');
  consoleBar.className = 'css-sandbox-bar';
  consoleBar.textContent = 'Консоль вывода';

  const outputEl = document.createElement('div');
  outputEl.className = 'js-console-output';

  runBtn.addEventListener('click', () => runJsCode(textarea.value, outputEl, timers));
  resetBtn.addEventListener('click', () => {
    textarea.value = initialJs;
    runJsCode(initialJs, outputEl, timers);
  });

  barBtns.append(runBtn, resetBtn);
  editorBar.append(barTitle, barBtns);
  editorPane.append(editorBar, textarea);
  consolePane.append(consoleBar, outputEl);
  sandbox.append(editorPane, consolePane);

  runJsCode(initialJs, outputEl, timers);
  return sandbox;
}

function canRunJsSnippet(rawCode, meta) {
  if (!meta || (meta.subjectId !== 'js' && meta.subjectId !== 'spa')) return false;
  if (/\b(document|window|fetch|alert|prompt|confirm|localStorage|sessionStorage|location|history|XMLHttpRequest|import|export)\b/.test(rawCode)) {
    return false;
  }

  const codeOnly = rawCode.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '').trim();
  if (!codeOnly) return false;

  try {
    new Function(rawCode);
    return true;
  } catch {
    return false;
  }
}

function extractDemoHtml(pre) {
  let prev = pre.previousSibling;
  while (prev && prev.nodeType === Node.TEXT_NODE && !prev.nodeValue.trim()) {
    prev = prev.previousSibling;
  }
  if (prev && prev.nodeType === Node.COMMENT_NODE) {
    const raw = prev.nodeValue.trim();
    if (/^demo-html:/i.test(raw)) {
      return raw.replace(/^demo-html:/i, '').trim();
    }
  }

  const details = pre.closest('details');
  if (details && !details.classList.contains('lesson-accordion')) {
    let sibling = details.previousElementSibling;
    for (let i = 0; i < 4 && sibling; i += 1) {
      if (sibling.tagName === 'DETAILS' || /^H[1-6]$/.test(sibling.tagName)) break;
      if (sibling.tagName === 'PRE') {
        const htmlCode = sibling.querySelector('code.language-html');
        if (htmlCode) return htmlCode.textContent.trim();
      }
      sibling = sibling.previousElementSibling;
    }
  }

  return '';
}

function canPreviewCss(rawCode, demoHtml = '') {
  if (!/\{[^}]*\}/.test(rawCode)) return false;
  if (demoHtml) return true;

  const withoutComments = rawCode.replace(/\/\*[\s\S]*?\*\//g, '');
  const selectors = withoutComments.replace(/\{[^}]*\}/g, ' ');
  if (/[.#\[]/.test(selectors)) return false;

  return /\b(body|p|a|button)\b/.test(selectors);
}

/** Добавляет шапку с языком, кнопку копирования, песочницы для CSS/JS и подсветку Highlight.js. */
function enhanceCodeBlocks(container, meta) {
  const preBlocks = [...container.querySelectorAll('pre')];

  for (const pre of preBlocks) {
    const code = pre.querySelector('code');
    if (!code) continue;

    const rawCode = code.textContent;
    const langMatch = code.className.match(/language-([\w-]+)/);
    const rawLang = langMatch ? langMatch[1] : 'js';
    const isCssDemo = rawLang === 'css-demo';
    const displayLang = isCssDemo ? 'css' : rawLang;
    const demoHtml = displayLang === 'css' ? extractDemoHtml(pre) : '';
    const hasCssPreview = displayLang === 'css' && canPreviewCss(rawCode, demoHtml);

    if (isCssDemo) {
      code.className = 'language-css';
    }

    const wrapper = document.createElement('div');
    wrapper.className = 'code-block';

    const header = document.createElement('div');
    header.className = 'code-header';

    const langLabel = document.createElement('span');
    langLabel.className = 'code-lang';
    langLabel.textContent = displayLang;

    const actions = document.createElement('div');
    actions.className = 'code-actions';

    let sandboxEl = null;
    const isJsRunnable = displayLang === 'js' && canRunJsSnippet(rawCode, meta);
    if (isCssDemo || hasCssPreview || isJsRunnable) {
      const previewBtn = document.createElement('button');
      previewBtn.type = 'button';
      previewBtn.className = 'copy-btn';
      const openLabel = isJsRunnable ? '▶ Запустить' : '▶ Песочница';
      previewBtn.textContent = openLabel;

      previewBtn.addEventListener('click', () => {
        if (sandboxEl) {
          sandboxEl.cleanup?.();
          sandboxEl.remove();
          sandboxEl = null;
          previewBtn.textContent = openLabel;
          return;
        }

        sandboxEl = isJsRunnable ? createJsSandbox(rawCode) : createCssSandbox(rawCode, demoHtml);
        wrapper.append(sandboxEl);
        previewBtn.textContent = '✕ Скрыть';
      });

      actions.append(previewBtn);
    }

    const copyBtn = document.createElement('button');
    copyBtn.type = 'button';
    copyBtn.className = 'copy-btn';
    copyBtn.textContent = 'Копировать';
    copyBtn.addEventListener('click', async () => {
      try {
        await copyToClipboard(rawCode);
        copyBtn.textContent = 'Скопировано ✓';
        setTimeout(() => {
          copyBtn.textContent = 'Копировать';
        }, 1500);
      } catch {
        copyBtn.textContent = 'Ошибка';
      }
    });

    actions.append(copyBtn);
    header.append(langLabel, actions);
    pre.replaceWith(wrapper);
    wrapper.append(header, pre);

    window.hljs?.highlightElement(code);
  }
}

export function renderMarkdownLesson(container, markdownText, meta = {}) {
  if (!window.marked) {
    container.textContent = markdownText;
    return;
  }

  container.innerHTML = window.marked.parse(markdownText);
  transformCallouts(container);
  wrapTrapsSection(container);
  if (meta.isPractice) {
    enhancePracticeTasks(container);
  } else {
    wrapPracticeAccordions(container);
  }
  enhanceCodeBlocks(container, meta);
}

export function renderSidebar(navElement, subjectId, lessons, activeId, statuses) {
  navElement.innerHTML = '';

  const grouped = new Map();
  for (const lesson of lessons) {
    if (!grouped.has(lesson.module)) {
      grouped.set(lesson.module, []);
    }
    grouped.get(lesson.module).push(lesson);
  }

  for (const [moduleName, items] of grouped) {
    const group = document.createElement('div');
    group.className = 'module-group';

    const title = document.createElement('h3');
    title.className = 'module-title';
    title.textContent = moduleName;
    group.append(title);

    for (const lesson of items) {
      const link = document.createElement('a');
      link.href = `#${subjectId}/${lesson.id}`;
      link.className = 'lesson-link';
      if (lesson.type === 'practice') {
        link.classList.add('is-practice');
      }
      if (lesson.type === 'cheatsheet') {
        link.classList.add('is-cheatsheet');
      }
      link.dataset.lessonId = lesson.id;
      if (lesson.id === activeId) {
        link.classList.add('active');
      }

      const dot = document.createElement('span');
      dot.className = 'lesson-dot';
      const status = statuses[`${subjectId}:${lesson.id}`];
      if (status) {
        dot.dataset.status = status;
      }

      const label = document.createElement('span');
      label.textContent = lesson.title;

      link.append(dot, label);
      group.append(link);
    }

    navElement.append(group);
  }
}

export function renderHomePage(container, { activeSubject, subjects }) {
  const subjectButtons = subjects
    .map((s) => {
      const activeClass = s.id === activeSubject.id ? ' is-active' : '';
      return `<button type="button" class="pill-btn${activeClass}" data-home-subject="${s.id}">${s.title}</button>`;
    })
    .join('');

  container.innerHTML = `
    <h1>Frontend Notes by Maxolio</h1>
    <p class="home-lead">Краткие конспекты и тренажёр памяти: до урока пробегаешь суть, после — крутишь примеры в песочнице и решаешь задачи.</p>

    <div class="home-actions">
      ${subjectButtons}
    </div>

    <dl class="home-list">
      <div class="home-list-row">
        <dt>Тема и шрифт</dt>
        <dd>Выбор из 4 тем оформления и 4 шрифтов в шапке слева.</dd>
      </div>
      <div class="home-list-row">
        <dt>Режим ⚡ (Шпаргалка)</dt>
        <dd>Скрывает длинный код и оставляет только суть, важные карточки и 3 главные ловушки.</dd>
      </div>
      <div class="home-list-row">
        <dt>▶ Песочница / Запустить</dt>
        <dd>Встроенный редактор CSS с мгновенным предпросмотром и запуск JS-примеров прямо в уроке.</dd>
      </div>
      <div class="home-list-row">
        <dt>Вопросы и задачи</dt>
        <dd>Свёрнутые блоки внизу урока — сначала отвечай по памяти и пиши код сам, потом открывай решение.</dd>
      </div>
      <div class="home-list-row">
        <dt>Статус урока</dt>
        <dd>Отметки «Изучено» и «Повторить» в шапке урока (сохраняются в браузере).</dd>
      </div>
      <div class="home-list-row">
        <dt>Поиск (Ctrl+K)</dt>
        <dd>Мгновенный поиск по всем урокам, свойствам и примерам кода с переходом к нужному разделу.</dd>
      </div>
      <div class="home-list-row">
        <dt>Для ИИ</dt>
        <dd>Копирует урок с готовым промптом или весь курс одним <code>.md</code>-файлом (кнопка внизу меню).</dd>
      </div>
    </dl>
  `;
}
