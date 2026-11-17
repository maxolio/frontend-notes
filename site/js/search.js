const markdownCache = new Map();
const parsedCache = new Map();
const preloadPromises = new Map();

function getCacheKey(subjectId, lessonId) {
  return `${subjectId}:${lessonId}`;
}

/**
 * Загружает Markdown урока выбранного предмета с кэшированием в памяти.
 */
export async function getLessonMarkdown(subject, lesson) {
  const key = getCacheKey(subject.id, lesson.id);
  if (markdownCache.has(key)) {
    return markdownCache.get(key);
  }

  const response = await fetch(`${subject.basePath}/${lesson.file}`);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const text = await response.text();
  markdownCache.set(key, text);
  parsedCache.set(key, parseLessonSections(text));
  return text;
}

/**
 * Предзагружает все .md файлы активного предмета для мгновенного поиска.
 */
export function preloadAllLessons(subject, lessons) {
  if (preloadPromises.has(subject.id)) {
    return preloadPromises.get(subject.id);
  }

  const promise = Promise.allSettled(lessons.map((lesson) => getLessonMarkdown(subject, lesson)));
  preloadPromises.set(subject.id, promise);
  return promise;
}

function parseLessonSections(markdown) {
  const lines = markdown.split(/\r?\n/);
  const sections = [];
  let currentHeading = '';
  let buffer = [];

  for (const line of lines) {
    if (line.startsWith('## ')) {
      if (buffer.length || currentHeading) {
        sections.push({
          heading: currentHeading,
          body: buffer.join('\n').trim(),
        });
      }
      currentHeading = line.slice(3).replace(/`/g, '').trim();
      buffer = [];
    } else if (!line.startsWith('# ')) {
      buffer.push(line);
    }
  }

  if (buffer.length || currentHeading) {
    sections.push({
      heading: currentHeading,
      body: buffer.join('\n').trim(),
    });
  }

  return sections;
}

function cleanSnippetText(rawText) {
  return rawText
    .replace(/```[a-z]*\n?/gi, '')
    .replace(/```/g, '')
    .replace(/`/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractSnippet(text, terms) {
  const clean = cleanSnippetText(text);
  if (!clean) return '';

  const lower = clean.toLowerCase();
  let firstHit = -1;
  for (const term of terms) {
    const idx = lower.indexOf(term);
    if (idx !== -1 && (firstHit === -1 || idx < firstHit)) {
      firstHit = idx;
    }
  }

  if (firstHit === -1) {
    return clean.length > 120 ? `${clean.slice(0, 117)}...` : clean;
  }

  const start = Math.max(0, firstHit - 36);
  const end = Math.min(clean.length, firstHit + 88);
  const prefix = start > 0 ? '...' : '';
  const suffix = end < clean.length ? '...' : '';
  return `${prefix}${clean.slice(start, end)}${suffix}`;
}

/**
 * Полнотекстовый поиск по урокам выбранного предмета.
 */
export function searchLessons(subjectId, lessons, rawQuery) {
  const query = rawQuery.trim().toLowerCase();
  if (!query) return [];

  const terms = query.split(/\s+/).filter(Boolean);
  const results = [];

  for (const lesson of lessons) {
    const key = getCacheKey(subjectId, lesson.id);
    const titleLower = lesson.title.toLowerCase();
    const moduleLower = lesson.module.toLowerCase();
    const tldrLower = (lesson.tldr || '').toLowerCase();
    const trapsText = (lesson.traps || []).join('\n');
    const trapsLower = trapsText.toLowerCase();
    const markdown = markdownCache.get(key) || '';
    const markdownLower = markdown.toLowerCase();

    const fullHaystack = `${titleLower}\n${moduleLower}\n${tldrLower}\n${trapsLower}\n${markdownLower}`;
    const matchesAllTerms = terms.every((term) => fullHaystack.includes(term));
    if (!matchesAllTerms) continue;

    let score = 0;
    let matchedHeading = '';
    let snippetSource = lesson.tldr || '';

    for (const term of terms) {
      if (titleLower.includes(term)) score += 100;
      if (tldrLower.includes(term)) score += 45;
      if (trapsLower.includes(term)) score += 35;
      if (moduleLower.includes(term)) score += 20;
    }

    const sections = parsedCache.get(key) || [];
    for (const section of sections) {
      const headingLower = section.heading.toLowerCase();
      const bodyLower = section.body.toLowerCase();
      let sectionScore = 0;

      for (const term of terms) {
        if (headingLower.includes(term)) sectionScore += 55;
        if (bodyLower.includes(term)) sectionScore += 15;
      }

      if (sectionScore > 0) {
        score += sectionScore;
        if (!matchedHeading || sectionScore >= 55) {
          matchedHeading = section.heading;
          snippetSource = section.body || section.heading;
        }
      }
    }

    if (trapsLower && terms.some((t) => trapsLower.includes(t)) && !matchedHeading) {
      snippetSource = trapsText;
    }

    results.push({
      lesson,
      score,
      matchedHeading,
      snippet: extractSnippet(snippetSource, terms),
      terms,
    });
  }

  results.sort((a, b) => b.score - a.score || a.lesson.number - b.lesson.number);
  return results;
}

/**
 * Безопасно строит фрагмент DOM с подсветкой совпадений <mark>.
 */
export function buildHighlightedFragment(text, terms) {
  const fragment = document.createDocumentFragment();
  if (!text || !terms.length) {
    fragment.append(document.createTextNode(text || ''));
    return fragment;
  }

  const sorted = [...terms].sort((a, b) => b.length - a.length);
  const escaped = sorted.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const regex = new RegExp(`(${escaped.join('|')})`, 'gi');
  const parts = text.split(regex);

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if (!part) continue;
    if (i % 2 === 1) {
      const mark = document.createElement('mark');
      mark.textContent = part;
      fragment.append(mark);
    } else {
      fragment.append(document.createTextNode(part));
    }
  }

  return fragment;
}
