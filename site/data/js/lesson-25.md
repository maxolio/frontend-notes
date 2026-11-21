# Урок 25. Навигация по DOM-дереву, атрибуты async и defer

Суть урока:

- **Навигация по DOM:** от любого элемента можно шагать к родителю, соседям и детям (`parentElement`, `children` и др.).
- **Порядок загрузки:** чтобы при запуске скрипта из `<head>` элементы страницы уже существовали, используют атрибут `defer`.

## 1. Где подключать `<script>`: document.body === null, defer и async (00:24–04:25)

[!] У document есть быстрые свойства: documentElement (`<html>`), head (`<head>`) и body (`<body>`). Если обычный `<script>` поставить внутри `<head>`, скрипт запустится до чтения `<body>`, и document.body вернёт null.

```html
<!-- Способ 1: поставить <script> в самом конце <body> перед </body> -->
<script src="script.js"></script>

<!-- Способ 2: оставить в <head> с defer (ждёт готовности всей разметки) -->
<script src="script.js" defer></script>

<!-- async: запускается сразу после скачивания (до или после DOM) -->
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
body.nextElementSibling;     /* null (после <body> соседей нет) */

/* Вниз (к прямым дочерним тегам) */
body.children;               /* живая HTMLCollection прямых детей-тегов */
body.firstElementChild;      /* первый дочерний тег (например, <div>) */
body.lastElementChild;       /* последний дочерний тег */

/* У <table> есть быстрые свойства (в обход скрытого <tbody>): */
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

/* При добавлении нового тега в DOM переменная bodyChildren обновится! */
const btn = document.createElement('button');
document.body.append(btn);
console.log(bodyChildren.length); /* уже 2! */

/* bodyChildren.forEach(...) -> TypeError! Превращаем в обычный массив: */
const arr1 = Array.from(bodyChildren);
const arr2 = [...bodyChildren];
arr2.forEach((el) => console.log(el));

/* Но цикл for..of перебирает коллекцию и БЕЗ превращения в массив: */
for (const el of bodyChildren) { console.log(el); }
```

[!] Не используйте for..in для перебора коллекций (он захватит лишние свойства length и item) и не пытайтесь менять коллекцию напрямую (children[0] = ... не сработает, она только для чтения).

```js
/* Ловушка удаления из живой коллекции: индексы съезжают прямо в цикле! */
/* ПЛОХО: половина элементов пропустится из-за сдвига индексов */
for (let i = 0; i < parent.children.length; i++) {
  parent.children[i].remove();
}

/* ХОРОШО: делаем неподвижную копию [...parent.children] и удаляем */
for (const child of [...parent.children]) { child.remove(); }
```

## 4. Навигация по узлам (Node) против элементов (09:17–12:03)

[+] Свойства без слова Element смотрят на ВСЕ узлы подряд (включая текстовые узлы с текстом, пробелами и переносами строк между тегами). В практике нужны редко, но важно понимать разницу:

```js
const div = document.body.firstElementChild;

/* Родитель: разница видна только на корневом <html> (documentElement) */
document.documentElement.parentElement; /* null (над <html> нет тега) */
document.documentElement.parentNode;    /* document (корень всего DOM) */

/* Соседи, первый/последний и все дети: */
div.previousElementSibling; /* null (тега перед <div> нет) */
div.previousSibling;        /* #text "\n  " (перенос и пробелы до <div>!) */

div.nextElementSibling;     /* следующий соседний тег (или null) */
div.nextSibling;            /* следующий узел (часто #text с переносом) */

div.firstElementChild;      /* vs div.firstChild (часто #text) */
div.lastElementChild;       /* vs div.lastChild (последний узел) */
div.children;               /* HTMLCollection vs div.childNodes (NodeList) */
/* У NodeList (childNodes) метод .forEach() есть, а у HTMLCollection — нет */
```

## 3 главные ловушки урока (чек-лист для повторения)

1. Подключить обычный `<script>` в `<head>` без defer (или поставить async вместо defer): на момент запуска `<body>` ещё не прочитан, и document.body вернёт null.

2. Пытаться вызвать .forEach() прямо на elem.children: у HTMLCollection нет методов массива — сперва оберни в [...elem.children] или Array.from(...).

3. Использовать firstChild / nextSibling вместо firstElementChild / nextElementSibling и вместо кнопки или блока получить текстовый узел #text с пробелами разметки.

## Вопросы для закрепления

**1. Почему обычный цикл `for` удалит лишь половину детей у `list`, и почему `list.children.forEach(...)` упадёт с `TypeError`?**

```js
const list = document.body.firstElementChild;

for (let i = 0; i < list.children.length; i++) {
  list.children[i].remove();
}
```

<details>
<summary>Показать ответ</summary>

1. Свойство `list.children` возвращает **живую коллекцию `HTMLCollection`**. Когда на шаге `i = 0` удаляется первый элемент, остальные сдвигаются влево (бывший индекс `1` становится `0`), а `.length` уменьшается. На шаге `i = 1` цикл перескакивает сдвинутый элемент, поэтому половина остаётся — удалять нужно по статичному массиву `[...list.children]`.
2. У `HTMLCollection` нет методов массива (`.forEach`, `.map`), поэтому `list.children.forEach(...)` сразу выбросит `TypeError` (в отличие от `NodeList` у `childNodes`, где `.forEach()` есть).

</details>

**2. В каком порядке запустятся скрипты `a.js` и `b.js`, если `b.js` скачается быстрее, и сработает ли `defer` на встроенном `<script defer>` без `src`?**

```html
<head>
  <script src="a.js" defer></script>
  <script src="b.js" defer></script>
</head>
```

<details>
<summary>Показать ответ</summary>

1. Первым всё равно выполнится **`a.js`**, а за ним **`b.js`** — в том порядке, как они записаны в HTML. Скрипты с `defer` ждут готовности DOM и соблюдают порядок подключения (а вот при `async` первым запустился бы более быстрый `b.js`).
2. На встроенном теге `<script>` без атрибута `src` атрибуты `defer` и `async` полностью **игнорируются** — код сработает сразу в `<head>`, пока `document.body` ещё равен `null`.

</details>

**3. В чём разница между `document.documentElement.parentElement` и `parentNode`, и почему `box.firstChild` часто возвращает `#text` вместо первого тега?**

<details>
<summary>Показать ответ</summary>

1. Над корневым `<html>` (`document.documentElement`) нет другого HTML-тега, поэтому `parentElement` вернёт **`null`**, а `parentNode` вернёт объект **`document`**.
2. Свойства без слова `Element` (`firstChild`, `nextSibling`) перебирают **все узлы подряд**, в том числе невидимые переносы строк и пробелы разметки между тегами (`#text`). Для шагов строго по тегам используют `firstElementChild` и `nextElementSibling`.

</details>

## Задачи

**Задача 1. Почини порядок подключения скриптов в `<head>`**

Исправь теги `<script>` внутри `<head>` с правильными атрибутами и порядком:

1. `core.js` и `ui.js` должны дождаться построения всей страницы и запуститься строго по порядку (`core.js` первым, `ui.js` вторым).
2. Независимый счётчик `analytics.js` не должен блокировать HTML и должен сработать сразу после скачивания, не дожидаясь DOM и остальных скриптов.

```html
<head>
  <!-- Твоё решение: -->
  <script src="analytics.js"></script>
  <script src="ui.js" async></script>
  <script src="core.js" async></script>
</head>
```

<details>
<summary>Подсказка и решение</summary>

```html
<head>
  <!--
    defer: оба файла качаются параллельно, ждут готовности DOM и
    запускаются строго по порядку (сначала core.js, затем ui.js)
  -->
  <script src="core.js" defer></script>
  <script src="ui.js" defer></script>

  <!--
    async: для независимой аналитики — запускается сразу по готовности,
    не задерживая рендер и не дожидаясь других скриптов
  -->
  <script src="analytics.js" async></script>
</head>
```

</details>

**Задача 2. Безопасная очистка живой коллекции `children`**

Сейчас функция `clearAndCount(container)` удаляет лишь половину детей (из-за сдвига индексов в живой `HTMLCollection`) и возвращает `0`. Перепиши её:

1. Сделай статичную копию-массив `[...container.children]`.
2. Удали все элементы из копии (через `.forEach((child) => child.remove())`).
3. Верни исходное количество удалённых элементов (`items.length`).

```js
'use strict';

/* Твоё решение: */
function clearAndCount(container) {
  for (let i = 0; i < container.children.length; i++) {
    container.children[i].remove();
  }
  return container.children.length;
}
```

<details>
<summary>Подсказка и решение</summary>

```js
'use strict';

function clearAndCount(container) {
  /*
    Спред [...container.children] создаёт независимый обычный массив:
    1) индексы не сдвигаются при удалении элементов из DOM
    2) появляется метод .forEach(), которого нет у живой HTMLCollection
  */
  const items = [...container.children];

  items.forEach((child) => child.remove());

  /* Возвращаем сохранённое количество удалённых элементов */
  return items.length;
}
```

</details>

**Задача 3. Шаги по DOM-элементам и быстрый доступ к таблице**

Используя только свойства навигации (без селекторов) и безопасную цепочку `?.`:

1. От `head` перейди к следующему соседнему тегу `<body>` (`bodyEl`).
2. От `currentItem` получи предыдущий соседний тег (`prevSiblingEl`, игнорируя `#text`) и родительский тег (`parentEl`).
3. У таблицы `table` найди вторую строку (`[1]`) и её первую ячейку (`[0]`) через `rows` и `cells` (`targetCell`).

```js
'use strict';

const head = document.head;
const currentItem = document.body.firstElementChild?.children[1];
const table = document.body.lastElementChild;

/* Твоё решение: */
const bodyEl = null;
const prevSiblingEl = null;
const parentEl = null;
const targetCell = null;

console.log(bodyEl === document.body); /* true */
console.log(prevSiblingEl, parentEl, targetCell);
```

<details>
<summary>Подсказка и решение</summary>

```js
'use strict';

const head = document.head;
const currentItem = document.body.firstElementChild?.children[1];
const table = document.body.lastElementChild;

/* nextElementSibling шагает строго к следующему тегу (<body> за <head>) */
const bodyEl = head.nextElementSibling;

/* Свойства с Element пропускают текстовые узлы (пробелы и переносы) */
const prevSiblingEl = currentItem?.previousElementSibling ?? null;
const parentEl = currentItem?.parentElement ?? null;

/* table.rows и row.cells автоматически обходят скрытый <tbody> */
const targetCell = table?.rows?.[1]?.cells?.[0] ?? null;

console.log(bodyEl === document.body); /* true */
console.log(prevSiblingEl, parentEl, targetCell);
```

</details>
