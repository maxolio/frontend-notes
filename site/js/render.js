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

    card.append(badge, p.cloneNode(true));
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

/** Добавляет шапку с языком, кнопку копирования и подсветку Highlight.js. */
function enhanceCodeBlocks(container) {
  const preBlocks = [...container.querySelectorAll('pre')];

  for (const pre of preBlocks) {
    const code = pre.querySelector('code');
    if (!code) continue;

    const langMatch = code.className.match(/language-([\w-]+)/);
    const lang = langMatch ? langMatch[1] : 'js';

    const wrapper = document.createElement('div');
    wrapper.className = 'code-block';

    const header = document.createElement('div');
    header.className = 'code-header';

    const langLabel = document.createElement('span');
    langLabel.className = 'code-lang';
    langLabel.textContent = lang;

    const copyBtn = document.createElement('button');
    copyBtn.type = 'button';
    copyBtn.className = 'copy-btn';
    copyBtn.textContent = 'Копировать';
    copyBtn.addEventListener('click', async () => {
      try {
        await copyToClipboard(code.textContent);
        copyBtn.textContent = 'Скопировано ✓';
        setTimeout(() => {
          copyBtn.textContent = 'Копировать';
        }, 1500);
      } catch {
        copyBtn.textContent = 'Ошибка';
      }
    });

    header.append(langLabel, copyBtn);
    pre.replaceWith(wrapper);
    wrapper.append(header, pre);

    window.hljs?.highlightElement(code);
  }
}

export function renderMarkdownLesson(container, markdownText) {
  if (!window.marked) {
    container.textContent = markdownText;
    return;
  }

  container.innerHTML = window.marked.parse(markdownText);
  transformCallouts(container);
  wrapTrapsSection(container);
  wrapPracticeAccordions(container);
  enhanceCodeBlocks(container);
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
