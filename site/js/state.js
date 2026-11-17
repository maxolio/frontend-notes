export const THEMES = [
  { id: 'paper', label: 'Бумага', icon: '☀️', isDark: false },
  { id: 'sepia', label: 'Сепия', icon: '📖', isDark: false },
  { id: 'onedark', label: 'One Dark', icon: '🌙', isDark: true },
  { id: 'nord', label: 'Nord', icon: '❄️', isDark: true },
];

export const FONTS = [
  { id: 'inter', label: 'Inter' },
  { id: 'golos', label: 'Golos' },
  { id: 'onest', label: 'Onest' },
  { id: 'literata', label: 'Literata' },
];

const KEYS = {
  theme: 'js_conspects_theme',
  font: 'js_conspects_font',
  subject: 'js_conspects_subject',
  statuses: 'js_conspects_statuses',
  cheatMode: 'js_conspects_cheat_mode',
};

export function getSavedTheme() {
  const saved = localStorage.getItem(KEYS.theme);
  return THEMES.some((t) => t.id === saved) ? saved : THEMES[0].id;
}

export function saveTheme(themeId) {
  localStorage.setItem(KEYS.theme, themeId);
}

export function getSavedFont() {
  const saved = localStorage.getItem(KEYS.font);
  return FONTS.some((f) => f.id === saved) ? saved : FONTS[0].id;
}

export function saveFont(fontId) {
  localStorage.setItem(KEYS.font, fontId);
}

export function getSavedSubject(subjects) {
  const saved = localStorage.getItem(KEYS.subject);
  return subjects.some((s) => s.id === saved) ? saved : subjects[0]?.id;
}

export function saveSubject(subjectId) {
  localStorage.setItem(KEYS.subject, subjectId);
}

export function getStatusKey(subjectId, lessonId) {
  return `${subjectId}:${lessonId}`;
}

export function getStatuses() {
  try {
    return JSON.parse(localStorage.getItem(KEYS.statuses) || '{}');
  } catch {
    return {};
  }
}

export function setLessonStatus(subjectId, lessonId, status) {
  const statuses = getStatuses();
  const key = getStatusKey(subjectId, lessonId);
  if (statuses[key] === status) {
    delete statuses[key];
  } else {
    statuses[key] = status;
  }
  localStorage.setItem(KEYS.statuses, JSON.stringify(statuses));
  return statuses[key] || null;
}

export function getCheatMode() {
  return localStorage.getItem(KEYS.cheatMode) === 'true';
}

export function saveCheatMode(enabled) {
  localStorage.setItem(KEYS.cheatMode, String(enabled));
}
