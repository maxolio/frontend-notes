# Worklog — Сайт (js-ucheba)

## 2026-11-26 — Контрастные блоки в сайдбаре и раздел «Архитектура веба»
- **Сделано:** Заголовки блоков `.module-title` в сайдбаре выделены оранжевым акцентом (`--review-color`, `--warn-bg`, `--warn-border`) для всех 4 тем; `Блок 0. Архитектура веба` вынесен из `js` в отдельный раздел `WEB` (`site/data/web/`).
- **Файлы:** `site/css/styles.css`, `site/data/subjects.json`, `site/data/web/lessons.json`, `site/data/web/lesson-00*.md`, `site/data/js/lessons.json`.
- **Дальше:** При необходимости добавлять общие фронтенд-темы (Git, Vite, DevTools) в раздел `WEB`.

## 2026-11-21 — Поддержка списков в «Суть урока:» и сборка индекса
- **Сделано:** `transformCallouts` в `site/js/render.js` научился рендерить списки `<ul>`/`<ol>` после `Суть урока:`; добавлены отступы в `site/css/styles.css`; пересобран `site/data/js/all-lessons.md`.
- **Файлы:** `site/js/render.js`, `site/css/styles.css`, `site/data/js/all-lessons.md`.
- **Дальше:** Проверить UI сайта после массового рефакторинга уроков JS и пересобрать `all-lessons.md`.
