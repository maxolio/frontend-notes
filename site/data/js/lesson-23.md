# Урок 23. Модули в JavaScript: декомпозиция, import и export

Суть урока: Модуль — это отдельный JS-файл со своей изолированной областью видимости; связи между такими файлами строят явно через export и import, а в HTML подключают один главный файл с атрибутом type="module".

## 1. Декомпозиция, рефакторинг и включение type="module" (00:26–06:55)

[+] Декомпозиция — разделение большого файла (например, script.js с табами, модалками и слайдерами) на отдельные файлы по задачам. Рефакторинг — улучшение структуры кода без изменения его поведения.

[!] Просто разрезать код на `<script src="...">` — ещё НЕ модули: все файлы сидят в одной глобальной области видимости, перезаписывают чужие переменные и падают с ReferenceError, если порядок тегов `<script>` перепутан. Атрибут type="module" изолирует каждый файл.

```html
<!-- Без type="module": общая область видимости, критичен порядок подключения -->
<script src="tabs.js"></script>
<script src="modals.js"></script>

<!-- С type="module": у каждого файла своя область видимости -->
<script src="tabs.js" type="module"></script>
<script src="modals.js" type="module"></script>
```

## 2. Именованный export и import, правила путей (06:55–10:52)

[+] Чтобы переменную или функцию модуля увидели другие файлы, её помечают ключевым словом export (сразу при объявлении или общим списком в конце файла) и подключают через import { ... } строго вверху принимающего файла.

```js
/* --- Файл tabs.js: способ 1 — export сразу при объявлении --- */
export const tabsSelectors = { root: '.tabs' };

/* --- Файл tabs.js: способ 2 — единый список в конце файла (чаще удобнее) --- */
const tabsSelectors = { root: '.tabs' };
const tabsData = [1, 2, 3];
export { tabsSelectors, tabsData };

/* --- Файл modals.js: импорт в самом начале файла --- */
import { tabsSelectors, tabsData } from './tabs.js';
/* Для браузерных JS-модулей обязательны "./" в начале и расширение ".js" в конце */
```

[!] Импортированная сущность — не копия, а «живая ссылка» (live binding) только для чтения. Если переменная поменяется внутри исходного файла, она обновится и у получателя, но напрямую перезаписать импорт снаружи нельзя (будет TypeError).

## 3. Конфликт имён и переименование через as (10:52–13:05)

[!] Если в двух модулях есть одинаковые имена (например, selectors и там, и там), при импорте возникнет конфликт. Сущность можно переименовать через as при экспорте или при импорте (при импорте — удобнее).

```js
/* Вариант 1: переименование при экспорте (только в списке в конце файла!) */
const selectors = {};
export { selectors as tabsSelectors }; /* нельзя: export const selectors as ... */

/* Вариант 2 (лучше): переименование при импорте в файле-получателе */
import { selectors as tabsSelectors } from './tabs.js';
const selectors = {}; /* локальная переменная этого файла больше не конфликтует */
```

## 4. Точка входа script.js и export default (13:05–18:38)

[+] Модули не должны запускать себя сами — вызовы init-функций переносят в общую точку входа (script.js). Если в модуле одна главная сущность, её можно экспортировать через export default.

```js
/* --- Файл tabs.js --- */
export const tabsSelectors = { root: '.tabs' }; /* именованный экспорт */
export default function initTabs() {            /* экспорт по умолчанию (1 на файл) */
  console.log('Табы запущены');
}

/* Особенность со стрелочной функцией: export default const fn = ... даст ошибку! */
const initSliders = () => {};
export default initSliders;   /* выносим отдельно или пишем: export default () => {} */

/* --- Файл script.js (главная точка входа) --- */
/* default импортируется БЕЗ фигурных скобок и под ЛЮБЫМ именем */
import anyTabsName, { tabsSelectors } from './tabs.js';
anyTabsName();
```

[!] Совет по практике: с export default лучше быть осторожнее — произвольные имена при импорте путают читаемость и мешают автоимпорту в IDE. Именованный export предпочтительнее.

## 5. Импорт всего (import * as) и реэкспорт через index.js (18:38–23:52)

[+] Звёздочка собирает все экспорты модуля в один объект. А индексный файл index.js внутри папки собирает экспорты из глубоких подпапок через реэкспорт (export * from), чтобы не писать длинные пути.

```js
/* --- Файл constants.js --- */
export const a = 1;
export const b = 2;
const hiddenD = 4;               /* без export НЕ попадёт в объект импорта * */
export default function logCat() { console.log("Кот"); }

/* --- Импорт всего файла в объект --- */
import * as constants from './constants.js';
console.log(constants.a);        /* 1 */
constants.default();             /* default-экспорт лежит в свойстве .default */

/* --- Реэкспорт в файле constants/index.js --- */
export * from './folder1/folder2/constants.js';
export { default as logCat } from './folder1/folder2/constants.js'; /* явный реэкспорт */
/* Звёздочка забирает только именованные экспорты; default пробрасывают строкой выше */
/* В сборщиках (Vite/Webpack) путь сокращается до "./constants", но в чистом браузере
   без сборщика короткий путь даст 404 — нужно явно писать "./constants/index.js" */
```

## 6. Неочевидные особенности модулей в браузере (23:52–31:40)

1. Код модуля выполняется ровно 1 раз: сколько бы раз файл ни импортировали в разных местах (или ни подключали в HTML), браузер выполнит его тело только при первом обращении (обычный `<script>` без type="module" выполнится столько раз, сколько тегов написано). Благодаря этому модуль удобно использовать как общее хранилище данных в памяти без глобальных переменных в window.

```js
/* --- Файл store.js (создаётся в памяти ровно один раз) --- */
export const cart = [];

/* header.js и catalog.js импортируют ОДИН И ТОТ ЖЕ массив cart */
import { cart } from './store.js';
cart.push('Товар 1'); /* изменение сразу увидят все остальные модули */
```

2. В модуле только объявляем, но не запускаем: на верхнем уровне файла модуля не вызывают функции, не крутят циклы и не меняют данные — всё запускается в точке входа (script.js), чтобы контролировать порядок работы приложения.

3. В HTML остаётся только один `<script type="module" src="./script.js">`: браузер сам догрузит все зависимости по import. При этом модули всегда выполняются ПОСЛЕ обычных `<script>`, поэтому в модуле уже видно DOM-дерево, даже если он подключён внутри `<head>`.

```html
<!-- Порядок в браузере при подключении скриптов -->
<script src="before.js"></script>                <!-- 1. Выполнится первым -->
<script src="script.js" type="module"></script>  <!-- 3. Модуль выполнится ПОСЛЕДНИМ! -->
<script src="after.js"></script>                 <!-- 2. Выполнится вторым -->
```

[+] Визуальная разница между обычным `<script>`, `defer` и `type="module"` (в `type="module"` поведение `defer` уже встроено по умолчанию, поэтому писать `defer` рядом с ним избыточно):

```text
1) Обычный <script src="./scripts/main.js">
   HTML: [=== парсинг ===]..........(ПАУЗА!)..........[=== парсинг ===]
   Сеть:                  [скачивает]
   JS:                               [выполняет main.js]
   Итог: считывает файл сплошным текстом; import/export нет; всё в глобале.

2) Только с defer: <script src="./scripts/main.js" defer>
   HTML: [============= парсинг всего HTML =============]
   Сеть:        [скачивает в фоне]
   JS:                                                 [main.js] -> DOMContentLoaded
   Итог: HTML не тормозит; видит весь DOM; import/export всё ещё запрещены.

3) С модулем: <script src="./scripts/main.js" type="module">
   HTML: [============= парсинг всего HTML =============]
   Сеть:        [main.js] -> [import A] -> [import B]
   JS:                                                 [граф модулей] -> DOMContentLoaded
   Итог: defer уже встроен в type="module"; изолированная область; есть import/export.
```

| Вариант подключения | Тормозит HTML? | Когда запускается JS? | Как читает код? | Область видимости |
| :--- | :--- | :--- | :--- | :--- |
| `<script src="...">` | **Да**, ставит на паузу | Сразу после скачивания | Сплошной текст файла | Глобальная (`window`) |
| `<script src="..." defer>` | **Нет**, грузится в фоне | После разбора всего HTML | Сплошной текст файла | Глобальная (`window`) |
| `<script src="..." type="module">` | **Нет** (`defer` встроен) | После HTML + загрузки `import` | Как систему модулей | Изолированная в файле |

4. Не работают через file:// (CORS) и всегда в use strict: если открыть HTML двойным кликом с диска, браузер заблокирует import ошибкой CORS (нужен локальный сервер, например Live Server). Внутри любого модуля автоматически включён строгий режим.

## 7. Динамический import() по условию или клику

[+] Обычный import статичен — его нельзя спрятать внутрь if или склеить путь из переменной. Когда тяжёлый модуль нужно загрузить не сразу, а только при клике или по условию, используют функцию import(путь) — она возвращает Promise.

```js
/* Модуль подгрузится только в момент вызова функции (ленивая загрузка) */
async function openModal() {
  const modalModule = await import('./modals.js');
  modalModule.default(); /* если в файле был export default */
}
```

## 8. Архитектура: избегай «круга из импортов» (цикличных зависимостей)

[!] Если файл A импортирует B, а B импортирует обратно A, в момент старта одна из сущностей окажется ещё не создана (ошибка ReferenceError или undefined). Связи модулей должны идти деревом сверху вниз, а всё общее выносят в отдельный файл.

```js
/* ПЛОХО (круг):   tabs.js <-> modals.js (модули тянут друг друга напрямую) */
/* ХОРОШО (дерево): script.js -> tabs.js, modals.js -> оба импортируют utils.js */
```

## 3 главные ловушки урока (чек-лист для повторения)

1. Забыть "./" или расширение ".js" в пути import, либо забыть атрибут type="module" у корневого `<script>` (ошибка Cannot use import statement outside a module).

2. Написать "export default const fn = () => {}" (SyntaxError) или пытаться пробросить default-экспорт через реэкспорт "export * from ..." (звёздочка переносит только именованные экспорты).

3. Ожидать повторного выполнения файла при втором import или смешивать порядок с обычными `<script>`: модуль всегда вычисляется 1 раз и запускается после всех обычных не-модульных скриптов.

## Вопросы для закрепления

**1. Почему строка `export default const sum = (a, b) => a + b;` вызовет `SyntaxError`, и попадёт ли `default` при реэкспорте `export * from './math.js'`?**

<details>
<summary>Показать ответ</summary>

1. После `export default` ожидается **значение** (выражение, `function` или `class`), а не объявление переменной `const`/`let`. Стрелочную функцию нужно либо сначала сохранить и затем написать `export default sum;`, либо экспортировать анонимно: `export default (a, b) => a + b;`.
2. **Не попадёт**: `export * from ...` переносит только именованные экспорты. Чтобы пробросить наружу и `default`, его дописывают отдельно: `export { default } from './math.js';` (или `export { default as initMath }`).

</details>

**2. Что произойдёт, если модуль `counter.js` импортируют 3 разных файла, и почему `count = 10` в получателе вызовет ошибку, а `items.push('Товар')` — нет?**

```js
/* counter.js */
export let count = 0;
export const items = [];
```

<details>
<summary>Показать ответ</summary>

1. Код модуля `counter.js` выполнится **ровно 1 раз**, а все три файла получат ссылки на одни и те же общие сущности в памяти.
2. Импорт в JS — это **«живая ссылка» (live binding) только для чтения**. Переназначить сам импорт `count = 10` снаружи запрещено (`TypeError`), а вот мутировать содержимое импортированного массива или объекта (`items.push(...)`) можно — это изменение сразу увидят все остальные модули.

</details>

**3. Какой файл запустится первым в этом HTML и почему при открытии HTML с диска (`file://`) модули перестают работать?**

```html
<script src="first.js" type="module"></script>
<script src="second.js"></script>
```

<details>
<summary>Показать ответ</summary>

Первым выполнится **`second.js`**, а **`first.js`** запустится уже после него. Скрипт с `type="module"` работает по правилам `defer`: грузится параллельно и всегда ждёт завершения разбора HTML и выполнения всех обычных не-модульных `<script>`. При открытии двойным кликом с диска (`file://`) браузер блокирует загрузку `import` политикой безопасности **CORS**, поэтому модули запускают через локальный сервер (например, Live Server или Vite).

</details>

## Задачи

**Задача 1. Почини `export default`, пути и конфликт имён через `as`**

В коде двух модулей допущены 4 ошибки: неверный `export default const`, забытый экспорт `CURRENCY`, неполный браузерный путь в `import` и конфликт локального имени `CURRENCY`. Исправь оба файла так, чтобы они работали в браузере, а `console.log` вывел `500 ₽`, `'USD'` и `'RUB'`.

```js
/* --- Файл utils.js --- */
/* Твоё решение: */
export default const formatPrice = (val) => `${val} ₽`;
const CURRENCY = 'RUB';

/* --- Файл script.js --- */
/* Твоё решение: */
import { formatPrice, CURRENCY } from 'utils';

const CURRENCY = 'USD';
console.log(formatPrice(500), CURRENCY, mainCurrency);
```

<details>
<summary>Подсказка и решение</summary>

```js
/* --- Файл utils.js --- */
/*
  Выносим объявление стрелочной функции отдельно: писать export default const
  запрещено синтаксисом; для CURRENCY добавляем именованный export
*/
const formatPrice = (val) => `${val} ₽`;
export default formatPrice;
export const CURRENCY = 'RUB';

/* --- Файл script.js --- */
/*
  1. default-экспорт импортируем БЕЗ фигурных скобок
  2. Именованный CURRENCY переименовываем через as в mainCurrency против конфликта
  3. Для браузера обязательно пишем './' в начале пути и '.js' в конце
*/
import formatPrice, { CURRENCY as mainCurrency } from './utils.js';

const CURRENCY = 'USD';
console.log(formatPrice(500), CURRENCY, mainCurrency); /* 500 ₽ 'USD' 'RUB' */
```

</details>

**Задача 2. Сборщик реэкспортов `index.js` и импорт в объект `import * as`**

Сделай файл-агрегатор `ui/index.js`: реэкспортируй из `./modals.js` все именованные экспорты через `export *` и отдельно пробрось его `default`-экспорт под именем `initModals`. Затем в `script.js` импортируй весь `ui/index.js` в один объект `ui` через `import * as` и вызови оба метода.

```js
/* --- Файл ui/modals.js (менять не нужно) --- */
export const modalSelector = '.modal';
export function openModal() { console.log('Модалка открыта'); }
export default function () { console.log('Модалки инициализированы'); }

/* --- Файл ui/index.js --- */
/* Твоё решение: */

/* --- Файл script.js --- */
/* Твоё решение: */
```

<details>
<summary>Подсказка и решение</summary>

```js
/* --- Файл ui/index.js --- */
/* Звёздочка * реэкспортирует ТОЛЬКО именованные сущности (modalSelector, openModal) */
export * from './modals.js';
/* default-экспорт пробрасываем отдельно с явным именем initModals */
export { default as initModals } from './modals.js';

/* --- Файл script.js --- */
/*
  Собираем все экспорты из ui/index.js под единым пространством имён ui;
  в браузере без сборщика указываем полный путь './ui/index.js'
*/
import * as ui from './ui/index.js';

ui.initModals(); /* 'Модалки инициализированы' */
ui.openModal();  /* 'Модалка открыта' */
console.log(ui.modalSelector); /* '.modal' */
```

</details>

**Задача 3. Единая точка входа в HTML и ленивый динамический `import()`**

1) В HTML оставь подключение только главного файла `./script.js` с правильным атрибутом `type="module"` (зависимости браузер догрузит сам).
2) В `script.js` напиши асинхронную функцию `handleOpenGallery(shouldLoad)`: если `shouldLoad` истинно, динамически подгрузи модуль `'./gallery.js'` через `await import(...)` внутри `try...catch` и вызови его экспорт по умолчанию (`.default()`).

```html
<!-- 1) Внутри <head> HTML: -->
<!-- Твоё решение: -->
<script src="gallery.js"></script>
<script src="script.js"></script>
```

```js
/* 2) Файл script.js: */
/* Твоё решение: */

handleOpenGallery(false); /* ./gallery.js НЕ должен грузиться */
handleOpenGallery(true);  /* подгрузит модуль и вызовет его default() */
```

<details>
<summary>Подсказка и решение</summary>

```html
<!-- Подключаем только точку входа с type="module" — зависимости загрузятся по import -->
<script src="./script.js" type="module"></script>
```

```js
/* 2) Файл script.js: */
async function handleOpenGallery(shouldLoad) {
  if (!shouldLoad) return;

  try {
    /*
      Динамический import() возвращает Promise и грузит файл только в момент вызова —
      так тяжёлые модули не замедляют первый запуск страницы
    */
    const galleryModule = await import('./gallery.js');
    galleryModule.default();
  } catch (err) {
    console.log('Не удалось загрузить галерею:', err.message);
  }
}

handleOpenGallery(false);
handleOpenGallery(true);
```

</details>
