# Урок 31. Манипуляции с DOM: создание, вставка, удаление, клонирование

Суть урока: Текст меняют через textContent, HTML-разметку — через innerHTML или insertAdjacentHTML, а новые теги создают через createElement() и вставляют в DOM методами append / prepend / before / after / replaceWith.

## 1. Содержимое элементов: textContent, innerHTML, outerHTML (00:31–05:31)

[+] textContent работает только с чистым текстом (теги из строки не парсит, а старых детей стирает). innerHTML читает/пишет HTML внутри элемента, а outerHTML захватывает и сам тег элемента.

```js
const box = document.querySelector('.box');

/* textContent: склеивает текст всех детей; при записи сотрёт все вложенные теги! */
box.textContent = '<p>Текст</p>'; /* на экране выведет буквы '<p>Текст</p>', а не тег */
/* БЕЗОПАСНОСТЬ (XSS): чужой текст от пользователя вставляй ТОЛЬКО через textContent! */

/* innerHTML: парсит теги; "+=" не только медленный, но и СТИРАЕТ фокус и обработчики */
box.innerHTML = '<p>Обновлённый абзац</p>';
box.innerHTML += '<p>Ещё один в конец</p>';

/* outerHTML: включает сам тег .box; в старой переменной box останется УДАЛЁННЫЙ тег! */
box.outerHTML = '<section>Вместо box</section>';
```

## 2. Создание createElement и 5 методов вставки в DOM (05:32–11:08)

[+] Самый правильный способ добавления элементов: создать узел в памяти через document.createElement(tag), настроить его и вставить одним из 5 методов.

```js
const getNewParagraph = () => {
  const p = document.createElement('p'); /* создан в памяти, в DOM пока отсутствует */
  p.textContent = 'Новый параграф';
  p.classList.add('paragraph-4');
  return p;
};

/* 5 методов вставки относительно опорного элемента box: */
box.append(getNewParagraph(), "просто текст"); /* внутрь в КОНЕЦ (+ строки как текст) */
box.prepend(getNewParagraph());                /* внутрь в НАЧАЛО */
box.before(getNewParagraph());                 /* снаружи ДО открывающего тега box */
box.after(getNewParagraph());                  /* снаружи ПОСЛЕ закрывающего тега box */
box.replaceWith(getNewParagraph());            /* ЗАМЕНЯЕТ сам элемент box */

/* Пакетная вставка 100 элементов без 100 перерисовок: DocumentFragment или ...массив */
const fragment = document.createDocumentFragment(); /* виртуальный контейнер */
for (let i = 0; i < 3; i++) { fragment.append(getNewParagraph()); }
box.append(fragment); /* сам fragment растворится, внутри box окажутся только 3 <p> */

/* ВАЖНО: один и тот же созданный объект нельзя вставить дважды — он ПЕРЕМЕСТИТСЯ! */
/* И помни: box.append(p) всегда возвращает undefined, а НЕ вставленный элемент p */
```

## 3. Точная вставка HTML-строки: insertAdjacentHTML / Element (11:09–14:06)

[+] insertAdjacentHTML хирургически вставляет строку с HTML-разметкой в нужное место БЕЗ медленной перезаписи соседей (как при innerHTML +=). Аналог для готового элемента — insertAdjacentElement (принимает ровно 1 элемент).

```js
/* 4 позиции вставки (1-й аргумент): */
box.insertAdjacentHTML('beforebegin', '<p>До box снаружи</p>');
box.insertAdjacentHTML('afterbegin',  '<p>Внутрь в начало</p>');
box.insertAdjacentHTML('beforeend',   '<p>Внутрь в конец</p>');
box.insertAdjacentHTML('afterend',    '<p>После box снаружи</p>');

/* Для готового DOM-элемента (только 1 элемент) и безопасного текста: */
box.insertAdjacentElement('beforeend', getNewParagraph());
box.insertAdjacentText('beforeend', 'Безопасный текст (как textContent)');
```

## 4. Удаление, клонирование и перемещение элементов (14:07–16:43)

[+] Все методы вставки (append, after и др.) автоматически ПЕРЕМЕЩАЮТ уже существующие на странице элементы — удалять их перед переносом не нужно.

```js
const box1 = document.querySelector('.box-1');
const box3 = document.querySelector('.box-3');

/* Удаление элемента из DOM (в переменной box1 он остаётся живым — можно вставить снова): */
box1.remove();

/* Клонирование элемента: */
const shallowClone = box1.cloneNode();     /* ПОВЕРХНОСТНОЕ: тег пустой, без детей! */
const deepClone = box1.cloneNode(true);    /* ГЛУБОКОЕ (но НЕ копирует addEventListener!) */
box1.after(deepClone);

/* Перемещение существующего элемента (box1 исчезнет со старого места и встанет за box3): */
box3.after(box1);
```

## 5. Быстрая очистка replaceChildren() и шпаргалка выбора

[+] Чтобы полностью очистить всё содержимое внутри контейнера без innerHTML = "", вызывают box.replaceChildren() (без аргументов — удалит всех детей).

[+] Шпаргалка выбора инструмента:
- Поменять или вставить только текст -> textContent (или insertAdjacentText).
- Вставить готовую HTML-строку без перезаписи соседей -> insertAdjacentHTML.
- Собрать пачку элементов в цикле -> createElement + DocumentFragment + append.
- Очистить всё внутри контейнера -> box.replaceChildren().

## 3 главные ловушки урока (чек-лист для повторения)

1. Вызвать elem.cloneNode() без аргумента true — получится пустая оболочка элемента без внутреннего текста и дочерних тегов.

2. Пытаться вставить одну и ту же переменную в 2 места сразу (она просто переедет в последнее место) или передавать HTML-строку "`<p>`...`</p>`" в append / textContent.

3. Дописывать множество новых элементов в цикле через box.innerHTML += ... (тормозит браузер полной перестройкой внутренностей) вместо append() / insertAdjacentHTML.

## Вопросы для закрепления

**1. Сколько тегов `<p>` окажется внутри `boxElement`, в каком порядке и почему последний будет пустым?**

```js
const boxElement = document.querySelector('.box');
const itemElement = document.createElement('p');
itemElement.textContent = 'Привет';

boxElement.append(itemElement);
boxElement.prepend(itemElement);

const copy = itemElement.cloneNode();
boxElement.append(copy);
```

<details>
<summary>Показать ответ</summary>

Внутри `boxElement` окажется **два** тега `<p>`: первый с текстом `'Привет'` (в самом начале) и второй — **полностью пустой** `<p></p>` в конце.
1. Один и тот же DOM-объект нельзя вставить дважды: `prepend(itemElement)` не копирует его, а **перемещает** из конца в начало.
2. Вызов `cloneNode()` без аргумента `true` создаёт **поверхностную** копию — клонируется только сам пустой тег `<p>` без его текстового узла `'Привет'` (для глубокой копии пишут `cloneNode(true)`).

</details>

**2. Почему ввод пользователя нельзя вставлять через `innerHTML`, и чем плоха запись `list.innerHTML += '<li>Новый</li>'`?**

<details>
<summary>Показать ответ</summary>

1. Через `innerHTML` браузер парсит теги — злоумышленник сможет выполнить опасный скрипт или обработчик события (**XSS-атака**). Пользовательский текст всегда выводят через `textContent` или `insertAdjacentText`.
2. Оператор `+=` на `innerHTML` считывает всю текущую разметку, полностью сносит старые DOM-узлы (убивая фокус в `<input>`, выделение текста и навешанные события) и парсит всё заново. Для точечного добавления HTML-строки используют `list.insertAdjacentHTML('beforeend', '<li>Новый</li>')`.

</details>

**3. Что останется в переменной `cardElement` после `cardElement.outerHTML = '<section>Новый</section>'`, и что вернёт вызов `box.append(p)`?**

<details>
<summary>Показать ответ</summary>

1. В переменной `cardElement` останется ссылка на **старый удалённый тег**, которого уже нет на странице (`outerHTML` заменил сам тег в DOM, но не переменную в JS).
2. Методы вставки (`append`, `prepend`, `after`) всегда возвращают **`undefined`**, а не вставленный элемент — строить на них цепочку вызовов нельзя.

</details>

## Задачи

**Задача 1. Безопасная пакетная вставка комментариев через `DocumentFragment`**

Напиши функцию `renderComments(listElement, items)`:
1) Полностью очисти содержимое `listElement` современным методом `.replaceChildren()`.
2) С помощью `document.createDocumentFragment()` собери в памяти список `<li>` (добавь каждому класс `'comment-item'`), записывая текст так, чтобы опасные теги вроде `'<script>...'` вывелись как обычный безопасный текст.
3) Вставь весь фрагмент в `listElement` одной операцией через `.append()`.

```js
'use strict';

const comments = [
  'Отличная статья!',
  '<script>alert("XSS")</script> Опасный ввод',
  'Спасибо за разбор',
];

/* Твоё решение: */
function renderComments(listElement, items) {
  /* ... */
}

const commentsListElement = document.querySelector('[data-js-comments]');
renderComments(commentsListElement, comments);
```

<details>
<summary>Подсказка и решение</summary>

```js
'use strict';

const comments = [
  'Отличная статья!',
  '<script>alert("XSS")</script> Опасный ввод',
  'Спасибо за разбор',
];

function renderComments(listElement, items) {
  if (!listElement) return;

  /* Быстрая очистка всех старых детей контейнера без innerHTML = '' */
  listElement.replaceChildren();

  /* DocumentFragment копит узлы в памяти — браузер перерисует страницу лишь 1 раз */
  const fragment = document.createDocumentFragment();

  items.forEach((commentText) => {
    const itemElement = document.createElement('li');
    itemElement.classList.add('comment-item');

    /* textContent экранирует теги: <script> выведется строкой и НЕ выполнится */
    itemElement.textContent = commentText;
    fragment.append(itemElement);
  });

  /* Сам fragment исчезает, передав внутрь listElement только собранные <li> */
  listElement.append(fragment);
}

const commentsListElement = document.querySelector('[data-js-comments]');
renderComments(commentsListElement, comments);
```

</details>

**Задача 2. Точечная вставка `insertAdjacentHTML` и глубокое клонирование `cloneNode(true)`**

Допиши функцию `updateCard(cardElement)`:
1) Вставь HTML-строку `'<span class="badge">Новинка</span>'` внутрь карточки **в самое начало** (сразу после открывающего тега `<article>`), не перестраивая существующих детей через `innerHTML +=`.
2) Найди внутри карточки кнопку `[data-js-buy]` (если найдена) и вставь её **глубокую** копию снаружи **сразу после** карточки через `.after()`.

```js
'use strict';

/*
  HTML на странице:
  <article class="card" data-js-card>
    <h3>Товар</h3>
    <button type="button" data-js-buy>Купить</button>
  </article>
*/

/* Твоё решение: */
function updateCard(cardElement) {
  if (!cardElement) return;
  /* ... */
}

const cardElement = document.querySelector('[data-js-card]');
updateCard(cardElement);
```

<details>
<summary>Подсказка и решение</summary>

```js
'use strict';

function updateCard(cardElement) {
  if (!cardElement) return;

  /*
    'afterbegin' вставляет HTML-строку внутрь cardElement перед первым ребёнком,
    оставляя существующие <h3> и <button> нетронутыми в памяти
  */
  cardElement.insertAdjacentHTML('afterbegin', '<span class="badge">Новинка</span>');

  const buyButtonElement = cardElement.querySelector('[data-js-buy]');
  if (buyButtonElement) {
    /* Обязательно передаём true в cloneNode, чтобы скопировался текст 'Купить' внутри */
    const clonedButtonElement = buyButtonElement.cloneNode(true);
    cardElement.after(clonedButtonElement);
  }
}

const cardElement = document.querySelector('[data-js-card]');
updateCard(cardElement);
```

</details>

**Задача 3. Рекурсивное создание вложенного меню из объекта (`createTree`)**

Напиши функцию `createTree(containerElement, treeObj)`, которая строит вложенный список `<ul>` / `<li>` на любую глубину из переданного объекта:
- Если у объекта нет ключей (`Object.keys(obj).length === 0`), вложенный `<ul>` не создавай.
- Для каждого ключа создай `<li>`, запиши имя ключа через `textContent`, а если внутри есть дочерний объект с ключами — рекурсивно создай вложенный `<ul>` и добавь его в этот `<li>`.

```js
'use strict';

const menuData = {
  'Фронтенд': {
    'HTML и CSS': {},
    'JavaScript': {
      'DOM': {},
      'Асинхронность': {},
    },
  },
  'Бэкенд': {
    'Node.js': {},
  },
};

/* Твоё решение: */
function createTree(containerElement, treeObj) {
  /* ... */
}

const containerElement = document.querySelector('[data-js-tree]');
createTree(containerElement, menuData);
```

<details>
<summary>Подсказка и решение</summary>

```js
'use strict';

const menuData = {
  'Фронтенд': {
    'HTML и CSS': {},
    'JavaScript': {
      'DOM': {},
      'Асинхронность': {},
    },
  },
  'Бэкенд': {
    'Node.js': {},
  },
};

function buildTreeList(obj) {
  /* Базовый случай рекурсии: для пустого объекта {} не создаём пустой <ul> */
  if (!obj || Object.keys(obj).length === 0) return null;

  const ulElement = document.createElement('ul');

  for (const key in obj) {
    const liElement = document.createElement('li');
    liElement.textContent = key;

    /* Рекурсивно строим дочерний список для значения и крепим внутрь <li> */
    const nestedListElement = buildTreeList(obj[key]);
    if (nestedListElement) {
      liElement.append(nestedListElement);
    }

    ulElement.append(liElement);
  }

  return ulElement;
}

function createTree(containerElement, treeObj) {
  if (!containerElement) return;

  const treeElement = buildTreeList(treeObj);
  if (treeElement) {
    containerElement.append(treeElement);
  }
}

const containerElement = document.querySelector('[data-js-tree]');
createTree(containerElement, menuData);
```

</details>
