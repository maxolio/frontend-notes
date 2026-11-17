# Урок 25. Навигация по DOM-дереву, атрибуты async и defer

Суть урока: От любого DOM-элемента можно шагать к родителю, соседям и детям через свойства вроде parentElement и children, а чтобы при запуске скрипта в `<head>` элементы страницы уже существовали, используют атрибут defer.

## 1. Где подключать `<script>`: document.body === null, defer и async (00:24–04:25)

[!] У document есть быстрые свойства: documentElement (`<html>`), head (`<head>`) и body (`<body>`). Если обычный `<script>` поставить внутри `<head>`, скрипт запустится до чтения `<body>`, и document.body вернёт null.

```html
<!-- Способ 1: поставить <script> в самом конце <body> перед </body> -->
<script src="script.js"></script>

<!-- Способ 2: оставить в <head>, но добавить defer (ждёт готовности всей разметки) -->
<script src="script.js" defer></script>

<!-- Атрибут async: качается и запускается в случайный момент (до или после DOM) -->
<!-- Не подходит для работы с DOM; ставят для метрик и аналитики -->
<script src="analytics.js" async></script>
```

[!] Важно: defer и async работают ТОЛЬКО у внешних скриптов с атрибутом src. Несколько defer-скриптов выполняются строго по порядку в HTML (прямо перед событием DOMContentLoaded), даже если второй файл скачался быстрее первого. А скрипты с async запускаются по принципу «кто первый скачался, тот первый сработал». При этом у модулей (`<script type="module">`) поведение defer встроено по умолчанию.

## 2. Навигация от элемента к элементу (04:26–09:16)

[+] Свойства со словом Element (и children) работают ТОЛЬКО с HTML-тегами, игнорируя пробелы, переносы строк и текст:

```js
const body = document.body;

/* Вверх (к родителю) и в стороны (к соседям на одном уровне) */
body.parentElement;          /* <html> */
body.previousElementSibling; /* <head> (предыдущий соседний тег) */
body.nextElementSibling;     /* null (после <body> на том же уровне никого нет) */

/* Вниз (к прямым дочерним тегам) */
body.children;               /* живая коллекция HTMLCollection всех прямых детей-тегов */
body.firstElementChild;      /* первый дочерний тег (например, <div>) */
body.lastElementChild;       /* последний дочерний тег */

/* У таблиц <table> есть отдельные быстрые свойства (в обход скрытого <tbody>): */
table.rows;                  /* все строки <tr> таблицы */
table.rows[0].cells;         /* все ячейки <td> и <th> в первой строке */
```

[+] Зачем нужны шаги: когда пользователь нажал кнопку внутри карточки товара, не нужно искать всю страницу заново — от самой кнопки через parentElement или previousElementSibling сразу выходят на нужное поле этой же карточки.

## 3. Живая коллекция HTMLCollection (children) и массив (06:27–08:40)

[!] Свойство children возвращает не массив, а живую коллекцию HTMLCollection: она сама обновляется при изменении DOM, но не имеет методов массива (forEach и др.).

```js
const bodyChildren = document.body.children;
console.log(bodyChildren.length); /* 1 (например, только один <div>) */
console.log(bodyChildren[0]);     /* по индексу обращаться можно */

/* Если добавить новый тег в DOM, старая переменная bodyChildren САМА обновится! */
const btn = document.createElement('button');
document.body.append(btn);
console.log(bodyChildren.length); /* уже 2! */

/* bodyChildren.forEach(...) -> TypeError! Сначала превращаем в обычный массив: */
const arr1 = Array.from(bodyChildren);
const arr2 = [...bodyChildren];
arr2.forEach((el) => console.log(el));

/* Но цикл for..of перебирает коллекцию и БЕЗ превращения в массив: */
for (const el of bodyChildren) { console.log(el); }
```

[!] Не используйте for..in для перебора коллекций (он захватит лишние свойства length и item) и не пытайтесь менять коллекцию напрямую (children[0] = ... не сработает, она только для чтения).

```js
/* Ловушка удаления из живой коллекции: при удалении индексы съезжают прямо в цикле! */
/* ПЛОХО: удалить всё не выйдет — половина элементов пропустится из-за сдвига */
for (let i = 0; i < parent.children.length; i++) { parent.children[i].remove(); }

/* ХОРОШО: делаем неподвижную копию-массив [...parent.children] и удаляем спокойно */
for (const child of [...parent.children]) { child.remove(); }
```

## 4. Навигация по узлам (Node) против элементов (09:17–12:03)

[+] Свойства без слова Element смотрят на ВСЕ узлы подряд (включая текстовые узлы с текстом, пробелами и переносами строк между тегами). В практике нужны редко, но важно понимать разницу:

```js
const div = document.body.firstElementChild;

/* Родитель: разница видна только на корневом теге <html> (documentElement) */
document.documentElement.parentElement; /* null (над <html> нет HTML-тега) */
document.documentElement.parentNode;    /* объект document (корень всего DOM) */

/* Соседи, первый/последний и все дети: */
div.previousElementSibling; /* null (тега перед <div> нет) */
div.previousSibling;        /* #text "\n  " (перенос строки и пробелы до <div>!) */

div.nextElementSibling;     /* следующий соседний тег (или null) */
div.nextSibling;            /* следующий узел (часто #text с переносом строки) */

div.firstElementChild;      /* vs div.firstChild (первый узел, часто #text) */
div.lastElementChild;       /* vs div.lastChild (последний узел) */
div.children;               /* HTMLCollection (теги) vs div.childNodes (NodeList: всё) */
/* У NodeList (childNodes) метод .forEach() есть сразу, а у HTMLCollection — нет */
```

## 3 главные ловушки урока (чек-лист для повторения)

1. Подключить обычный `<script>` в `<head>` без defer (или поставить async вместо defer): на момент запуска `<body>` ещё не прочитан, и document.body вернёт null.

2. Пытаться вызвать .forEach() прямо на elem.children: у HTMLCollection нет методов массива — сперва оберни в [...elem.children] или Array.from(...).

3. Использовать firstChild / nextSibling вместо firstElementChild / nextElementSibling и вместо кнопки или блока получить текстовый узел #text с пробелами разметки.

## Вопросы для закрепления

**1. Почему при подключении обычного `<script src="app.js">` внутри `<head>` выражение `document.body` вернёт `null`, а `defer` это исправляет?**

<details>
<summary>Показать ответ</summary>

Обычный `<script>` останавливает парсинг HTML сразу внутри `<head>`, когда браузер ещё не дошёл до тега `<body>`. Скрипт с `defer` скачивается параллельно и запускается только после полного построения DOM, перед `DOMContentLoaded`.

</details>

**2. В чём разница между `elem.children` и `elem.childNodes`, и сработает ли `elem.children.forEach(...)`?**

<details>
<summary>Показать ответ</summary>

`children` возвращает живую коллекцию `HTMLCollection` только из HTML-тегов (метода `.forEach()` у неё нет — нужно `[...elem.children]`). `childNodes` возвращает `NodeList` со всеми узлами подряд, включая текстовые узлы `#text` с пробелами и переносами строк.

</details>

**3. Что вернёт `document.documentElement.parentElement` против `document.documentElement.parentNode`?**

<details>
<summary>Показать ответ</summary>

`parentElement` вернёт `null` (над тегом `<html>` нет другого HTML-элемента), а `parentNode` вернёт объект `document`.

</details>

## Задачи

**Задача 1. Безопасная очистка контейнера**

Напиши цикл, который удалит все дочерние теги внутри `list`, не пропуская элементы из-за живой коллекции `children`.

```js
const list = document.body.firstElementChild;

/* Твоё решение: */
```

<details>
<summary>Подсказка и решение</summary>

```js
/* Делаем снимок-массив через spread, чтобы индексы не сдвигались при удалении */
for (const item of [...list.children]) {
  item.remove();
}
```

</details>

**Задача 2. Шаг к соседнему элементу и первой ячейке таблицы**

От элемента `head` получи `<body>`, а от таблицы `table` — текст первой ячейки во второй строке (`rows` и `cells`).

```js
const head = document.head;
const table = document.body.firstElementChild;

/* Твоё решение: */
```

<details>
<summary>Подсказка и решение</summary>

```js
const bodyEl = head.nextElementSibling;
const cellText = table.rows[1]?.cells[0]?.textContent;
```

</details>
