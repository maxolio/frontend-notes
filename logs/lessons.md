# Worklog — Уроки JS (site/data/js)

## 2026-11-26 — Оптимизация Урока 09 и 2 шпаргалки в «Шпаргалки и справочники»
- **Сделано:** Оптимизирован `lesson-09.md` (таблицы видов функций и префиксов, `На вырост` для `this` и объектов); добавлены `cheatsheet-checks.md` и `cheatsheet-functions.md` (HtDF + CQS + 3 этажа) в `lessons.json`; `validate-lessons.mjs` (`42` файла, `0` ошибок) и пересобран `all-lessons.md` (`47` уроков).
- **Файлы:** `site/data/js/lesson-09.md`, `site/data/js/cheatsheet-checks.md`, `site/data/js/cheatsheet-functions.md`, `site/data/js/lessons.json`, `site/data/js/all-lessons.md`.
- **Дальше:** Оптимизировать `lesson-10.md` и далее (старт нового чата через `@HANDOFF-lessons-js.md продолжай`).

## 2026-11-24 — Точечная оптимизация Уроков 07 и 08
- **Сделано:** Оптимизированы `lesson-07.md` (ловушки `const i` и `while` + `continue`, таблица сравнения циклов, форматирование) и `lesson-08.md` (исправлен баг с `NaN` в `getAgeType`, уточнены дефолтные параметры, добавлена таблица `return`); прогнан `validate-lessons.mjs` (`0 issues`) и пересобран `all-lessons.md`.
- **Файлы:** `site/data/js/lesson-07.md`, `site/data/js/lesson-08.md`, `site/data/js/all-lessons.md`.
- **Дальше:** Оптимизировать следующие уроки JS (`lesson-09.md`+) или перейти к системной Практике 1 (`site/data/js/practice-01.md`).

## 2026-11-22 — Правила оформления JS, IDEAS.md и handoff для Практики 1
- **Сделано:** Зафиксированы правила оформления JS-уроков и Правило 7 в `AGENTS.md`, создан чек-лист будущего урока-шпаргалки `IDEAS.md` и собран `HANDOFF-решаем задачи и улучшаем проект сайта.md`.
- **Файлы:** `AGENTS.md`, `IDEAS.md`, `HANDOFF-решаем задачи и улучшаем проект сайта.md`.
- **Дальше:** Открыть новый чат с `@HANDOFF-решаем задачи и улучшаем проект сайта.md продолжай` и перейти к системной Практике 1 (Уроки 01–14, `site/data/js/practice-01.md`).

## 2026-11-21 — Финал рефакторинга всех 45 уроков JS, бандлы и validate-lessons.mjs
- **Сделано:** Завершены Пачка 6 (`lesson-30`..`36`) и Пачка 7 (`lesson-37`..`42`), добавлены кодовые сниппеты в вопросы (`34, 35, 39, 41, 42`), проверены `pointercancel`, `window blur`, `String(!isValid)` и `startUrl.searchParams.set('tab', initialTab)`. Убраны 6 двойных бэктиков (`06, 12, 19, 22`), перенесён валидатор в `scripts/validate-lessons.mjs` (`0 issues` по всем 45 файлам), удалены временные валидаторы из `scratch/`, пересобраны `all-lessons.md` и `all-questions-and-tasks.md`.
- **Файлы:** `site/data/js/lesson-06.md`, `12`, `19`, `22`, `30..42`, `site/data/js/all-lessons.md`, `site/data/js/all-questions-and-tasks.md`, `scripts/validate-lessons.mjs`, `logs/lessons.md`.
- **Дальше:** Вернуться к системной **Практике 1** по Урокам 01–14 (`site/data/js/practice-01.md` + `LEARNING_LOG.md`).

## 2026-11-21 — Шаг 0, Шаг 1 (11 багов) и Пачки 1–5 (32 из 45 уроков)
- **Сделано:** Создан валидатор `scratch/validate_js_lessons.py`, исправлены все 11 багов из аудита (`00b`, `01`, `11`, `13`, `17`, `18`, `19`, `34`, `35`, `39`, `42`), приведены к стандарту 32 урока (`lesson-00.md` .. `lesson-29.md`) с `0 issues` (Правило 7, `/* ... */`, длина строк `≤ 78`, вынос HTML в ```` ```html ````).
- **Файлы:** `site/data/js/lesson-00.md`..`29.md`, `site/data/js/lesson-34.md`, `35`, `39`, `42`, `scratch/validate_js_lessons.py`, `HANDOFF.md`.
- **Дальше:** В новом чате добить последние 2 пачки (`lesson-30`..`36` и `lesson-37`..`42`), добавить кодовые сниппеты в вопросы уроков `34, 35, 39, 41, 42`, прогнать валидатор по всем 45 файлам, пересобрать бандлы и перенести валидатор в `scripts/validate-lessons.mjs`.

## 2026-11-21 — Перенос контекста и подготовка рефакторинга 44 уроков
- **Сделано:** Блок `Суть урока:` переведён на списки во всех 45 файлах JS; обновлены `lesson-02`, `03`, `05`, `10`; собрана выжимка `all-questions-and-tasks.md`; проведён аудит багов и правил.
- **Файлы:** `site/data/js/lesson-00.md`..`42.md`, `site/data/js/all-questions-and-tasks.md`, `HANDOFF.md`.
- **Дальше:** Шаг 0Б (git commit + скрипт-валидатор в `scratch/`), затем Шаг 1 (11 точечных багов) и Шаг 2 (рефакторинг пачками).
