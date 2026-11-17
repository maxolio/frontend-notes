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
