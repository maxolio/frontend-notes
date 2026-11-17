# Урок 24. JavaScript в браузере: окружение, DOM и BOM

Суть урока: В браузере весь JS работает через главный глобальный объект window, который делится на сам язык JS, BOM (данные о браузере) и DOM (HTML-страница в виде дерева объектов).

## 1. Браузерное окружение и объект window (00:26–02:35)

[+] Среда запуска (браузер, сервер, микроконтроллер) даёт JS свои инструменты — окружение. В браузере всё лежит в глобальном объекте window и делится на 3 части:

- Основной JS: базовые сущности языка (Math, Object.keys/values, Number, Boolean).
- BOM (Browser Object Model): объектная модель самого браузера.
- DOM (Document Object Model): объектная модель HTML-документа (страницы).

[!] У window двойная роль: это и глобальный объект JS, и управление окном браузера (innerWidth, innerHeight). В кроссплатформенном коде (браузер + сервер Node.js) для обращения к глобальному объекту используют единое имя globalThis.

## 2. BOM — Browser Object Model (02:36–03:24)

[+] BOM даёт доступ к информации о браузере и возможностям вне самой вёрстки:

```js
window.navigator;                  /* сведения о браузере и системе */
window.screen;                     /* параметры экрана */
window.location.href;              /* текущий URL-адрес страницы */
window.history;                    /* история переходов текущей сессии */
window.localStorage;               /* хранилище данных браузера (и sessionStorage) */
window.fetch('https://...');       /* отправка сетевых запросов на сервер */
```

## 3. DOM — Document Object Model, children vs childNodes (03:24–07:50)

[+] Свойство window.document содержит представление всей HTML-страницы в виде DOM-дерева: каждый тег и даже вложенный текст — это JS-объект.

```js
console.log(document); /* выводит дерево тегов как во вкладке DevTools -> Elements */
console.dir(document); /* показывает document как JS-объект со свойствами */

/* У document.children -> [html], у html.children -> [head, body] */
console.dir(document.body.children);
/* children — ТОЛЬКО обычные HTML-элементы (теги: div, p, script и т.д.) */

console.dir(document.body.childNodes);
/* childNodes — ВСЕ узлы (ноды), ВКЛЮЧАЯ текстовые узлы! */
/* Переносы строк и пробелы между тегами в HTML тоже становятся текстовыми узлами */
/* У текстового узла нет children, но есть свойство .data с самим текстом строки */
```

[!] В childNodes попадают также HTML-комментарии <!-- ... -->: всё, что написано в разметке, становится узлом DOM. Узнать тип узла можно через свойство nodeType:

```js
/* Главные типы узлов в DOM (nodeType): */
/* 1 — элемент-тег (ELEMENT_NODE: div, body, p)   */
/* 3 — текстовый узел (TEXT_NODE: текст, пробелы) */
/* 8 — HTML-комментарий (COMMENT_NODE: <!-- -->)  */
/* 9 — сам документ (DOCUMENT_NODE: document)     */

/* Быстрые точки входа в DOM: */
document.documentElement; /* корневой тег <html> */
document.head;            /* тег <head> */
document.body;            /* тег <body> (будет null, если скрипт в <head> без module!) */
```

[!] Автоисправление HTML: при чтении битого файла браузер сам достраивает отсутствующие `<html>` и `<body>`, а внутрь любой `<table>` автоматически вставляет обёртку `<tbody>` — даже если вы не писали её в HTML.

[+] HTML vs DOM: HTML-файл — это статичный чертёж с диска, а DOM — уже построенный живой дом из объектов в памяти браузера. Когда JS добавляет кнопку или меняет текст, исходный файл на сервере не трогается, но вкладка DevTools -> Elements сразу показывает обновлённый живой DOM.

## 4. Свойства window без приставки и конфликты имён (07:52–12:56)

[+] К любому свойству window можно обращаться напрямую без "window." в начале (document, navigator, location, innerWidth, Math).

[!] Но глобальные имена могут конфликтовать с твоими переменными. В обычном `<script>` без type="module" часть имён (например, location) жёстко зарезервирована на глобальном уровне.

```js
/* Обычный глобальный <script> (без type="module"): */
console.log(innerWidth); /* ReferenceError, если ниже в файле объявить const innerWidth! */
const innerWidth = 100;  /* но window.innerWidth по-прежнему работает без ошибки */

const location = 'home'; /* сразу SyntaxError: 'location' has already been declared */

/* В <script type="module"> или внутри функции своя область видимости — ошибки нет: */
function test() {
  const location = 'home';     /* допустимо, но ПЕРЕКРЫВАЕТ глобальный location! */
  console.log(location.href);  /* undefined (ищет .href у строки "home") */
  console.log(window.location.href); /* правильно: явное обращение к браузеру */
}
```

[!] Советы: 1) не называй глобальные переменные именами из window; 2) при обращении к BOM (location, navigator) пиши window.location для ясности; 3) переменную с именем document вообще никогда не создавай.

```js
/* Почему старый JS засорял window (вне type="module"): */
var oldVar = 1;       /* записывается в window.oldVar (может перетереть чужое) */
const modernVar = 2;  /* window.modernVar === undefined (остаётся отдельной) */
```

## 5. Быстрый ориентир: когда нужен DOM, а когда BOM

- Нужно поменять или прочитать содержимое самой страницы (текст, кнопки, стили, добавить элемент) -> это DOM (window.document / document).
- Нужно узнать данные о браузере, поменять URL, сохранить состояние в память после F5 или сходить в сеть -> это BOM (location, history, localStorage, navigator, fetch).

## 3 главные ловушки урока (чек-лист для повторения)

1. Путать children и childNodes: в childNodes попадают текстовые узлы — в том числе невидимые переносы строк и пробелы между тегами в HTML.

2. Объявлять на глобальном уровне переменные с именами из window (location, innerWidth, document) — в обычном скрипте это приводит к ошибке или перекрытию.

3. Создав внутри функции/модуля свою переменную (например, location), обращаться к браузеру без "window." — JS возьмёт твою локальную переменную и вернёт undefined.

## Вопросы для закрепления

**1. Почему при одном `<p>` и одном комментарии внутри `<body>` свойство `document.body.children.length` вернёт `1`, а `document.body.childNodes.length` может вернуть `5`?**

```html
<body>
  <!-- Комментарий -->
  <p>Привет</p>
</body>
```

<details>
<summary>Показать ответ</summary>

1. Свойство `children` собирает **только HTML-элементы** (`nodeType === 1`) — здесь это один тег `<p>`.
2. Коллекция `childNodes` включает **все узлы DOM**, куда попадают и HTML-комментарии (`nodeType === 8`), и невидимые переносы строк с отступами вокруг тегов — они становятся текстовыми узлами (`nodeType === 3`).

</details>

**2. Почему `console.log(document.body)` может вернуть `null` в `<head>`, и откуда в DOM берётся `<tbody>`, если его не писали в HTML?**

<details>
<summary>Показать ответ</summary>

1. Обычный тег `<script>` без `defer` или `type="module"` внутри `<head>` запускается **сразу же**, до того как браузер дошёл до чтения `<body>` — поэтому `document.body` в этот момент ещё равен `null`.
2. При построении DOM-дерева браузер **автоматически чинит разметку**: добавляет недостающие `<html>`/`<body>` и всегда вставляет обёртку `<tbody>` внутрь любой `<table>`.

</details>

**3. Почему `const location = 'home';` внутри функции сломает `location.href`, и чем опасен глобальный `var` вне модулей?**

<details>
<summary>Показать ответ</summary>

1. Локальная переменная `const location = 'home'` перекрывает (затеняет) браузерное свойство `window.location`, поэтому `location.href` пытается прочитать `.href` у строки `'home'` и отдаёт `undefined` (надо писать явно `window.location.href`). А в обычном не-модульном `<script>` на верхнем уровне `const location = ...` сразу выдаст `SyntaxError`.
2. Объявленный через `var` на глобальном уровне (без `type="module"`) попадает прямо в объект `window` (`window.myVar`) и может случайно перетереть встроенные свойства, тогда как `let` и `const` там не создаются.

</details>

## Задачи

**Задача 1. Почини доступ к `document.body` в `<head>` и конфликт с `window.location`**

1) В HTML исправь тег `<script>` внутри `<head>`, чтобы при запуске файла `app.js` свойство `document.body` уже существовало (не равнялось `null`).
2) В функции `logPageInfo(location)` параметр перекрывает глобальный `location`. Используя `window`, выведи реальный URL страницы, ширину окна браузера, ширину экрана и сам `document.body`.

```html
<!-- 1) Внутри <head> HTML: -->
<!-- Твоё решение: -->
<head>
  <script src="./app.js"></script>
</head>
```

```js
/* 2) Файл app.js */
'use strict';

function logPageInfo(location) {
  /* Твоё решение: */
  console.log(location.href);
}

logPageInfo('main');
```

<details>
<summary>Подсказка и решение</summary>

```html
<!-- Добавляем defer (или type="module"), чтобы скрипт запустился ПОСЛЕ чтения всего HTML -->
<head>
  <script src="./app.js" defer></script>
</head>
```

```js
/* 2) Файл app.js */
'use strict';

function logPageInfo(location) {
  /*
    Явная приставка window. обращается к BOM браузера в обход локального
    параметра location ('main')
  */
  console.log('Локальный параметр:', location);
  console.log('URL страницы:', window.location.href);
  console.log('Ширина окна (viewport):', window.innerWidth);
  console.log('Ширина экрана:', window.screen.width);
  console.log('Тег body:', document.body);
}

logPageInfo('main');
```

</details>

**Задача 2. Подсчёт узлов DOM по `nodeType` (`childNodes` против `children`)**

Напиши функцию `inspectBodyNodes()`, которая перебирает `document.body.childNodes` и возвращает объект со статистикой:
- `elementsCount` — число HTML-элементов (`node.nodeType === 1`),
- `commentsCount` — число HTML-комментариев (`node.nodeType === 8`),
- `texts` — массив **непустых** строк из текстовых узлов (`node.nodeType === 3`, текст лежит в `node.data`, пробелы и переносы строк отфильтруй через `.trim()`).

```js
'use strict';

/* Твоё решение: */

console.log(inspectBodyNodes());
/* Например: { elementsCount: 3, commentsCount: 1, texts: ['Привет!'] } */
```

<details>
<summary>Подсказка и решение</summary>

```js
'use strict';

function inspectBodyNodes() {
  let elementsCount = 0;
  let commentsCount = 0;
  const texts = [];

  /* childNodes содержит ВСЕ узлы внутри body, включая пробелы-переносы и комментарии */
  for (const node of document.body.childNodes) {
    if (node.nodeType === 1) {
      elementsCount++;
    } else if (node.nodeType === 8) {
      commentsCount++;
    } else if (node.nodeType === 3) {
      /* У текстовых узлов текст хранится в свойстве .data; отсекаем пустые переносы */
      const trimmed = node.data.trim();
      if (trimmed) texts.push(trimmed);
    }
  }

  return { elementsCount, commentsCount, texts };
}

console.log(inspectBodyNodes());
```

</details>

**Задача 3. Универсальный отчёт окружения через `globalThis`, BOM и DOM**

Напиши функцию `getEnvironmentReport()`, которая безопасно собирает информацию об окружении в объект (и не падает с ошибкой, даже если скрипт запустят вне браузера, например в Node.js):
- `hasDocument`: есть ли глобальный `document` (`typeof globalThis.document !== 'undefined'`),
- `url`: текущий адрес через `globalThis.location?.href ?? 'none'`,
- `userAgent`: строка браузера из `globalThis.navigator?.userAgent ?? 'unknown'`,
- `rootChildrenCount`: сколько прямых дочерних тегов лежит внутри `<html>` (`globalThis.document?.documentElement?.children?.length ?? 0`).

```js
'use strict';

/* Твоё решение: */

console.log(getEnvironmentReport());
```

<details>
<summary>Подсказка и решение</summary>

```js
'use strict';

function getEnvironmentReport() {
  /*
    globalThis работает и в браузере (указывает на window), и в Node.js —
    поэтому проверка через него и оператор ?. безопасна в любой среде
  */
  return {
    hasDocument: typeof globalThis.document !== 'undefined',
    url: globalThis.location?.href ?? 'none',
    userAgent: globalThis.navigator?.userAgent ?? 'unknown',
    /* У валидной HTML-страницы внутри <html> ровно 2 ребёнка: <head> и <body> */
    rootChildrenCount: globalThis.document?.documentElement?.children?.length ?? 0,
  };
}

console.log(getEnvironmentReport());
```

</details>
