# Урок 33. Делегирование событий, preventDefault и свои события

Суть урока:

- **Делегирование:** ловим события от всех (и будущих) элементов одним слушателем на родителе + `closest()`.
- **Отмена и свои события:** стандартное поведение отменяет `preventDefault()`, а модули общаются через `CustomEvent` и `dispatchEvent()`.

## 1. Делегирование событий: один слушатель + closest() (00:31–08:31)

[!] Вешать click в цикле на каждый .todo-item плохо: 1) перегружает память при 1000+ элементов; 2) элементы, добавленные через JS позже, вообще не будут кликаться. Делегирование решает обе проблемы через 1 обработчик на родителе или document.

```js
const onTodoItemClick = (todoItemElement) => {
  todoItemElement.classList.toggle('is-completed');
};

/* Плохо при вложенных тегах (клик по <span> даст event.target === <span>): */
/* if (event.target.classList.contains('todo-item')) ... */

/* ПРАВИЛЬНО: ищем от event.target вверх по дереву через closest(): */
document.addEventListener('click', (event) => {
  const todoItemElement = event.target.closest('.todo-item');

  if (todoItemElement) {
    onTodoItemClick(todoItemElement);
  }
});

/*
  Если слушатель на конкретном list, проверяй .contains(),
  чтобы closest() не выскочил за пределы нужного контейнера:
*/
/* if (!todoItemElement || !listElement.contains(todoItemElement)) return; */

/* Приём с data-action: 1 слушатель обрабатывает кнопки по dataset.action: */
/* const btn = event.target.closest('[data-action]'); */
/* if (btn?.dataset.action === 'delete') deleteItem(); */
```

[+] В реальном проекте слушатель списка лучше вешать не на весь document, а на ближайший статичный контейнер (todoListElement), чтобы не проверять лишние клики по шапке и футеру сайта. На document вешают только глобальные события.

## 2. Отмена действий браузера: event.preventDefault() (08:32–10:12)

[+] По клику на ссылку браузер уводит на другой URL, а по submit формы — отправляет запрос и перезагружает страницу. Чтобы отменить стандартное поведение (например, ради своей валидации формы), вызывают event.preventDefault().

```js
const linkElement = document.querySelector('a');
const formElement = document.querySelector('form');

linkElement.addEventListener('click', (event) => {
  event.preventDefault(); /* отменим переход по ссылке */
});

formElement.addEventListener('submit', (event) => {
  event.preventDefault(); /* отменим отправку и перезагрузку страницы */
});

/* Проверить, отменили ли уже действие: event.defaultPrevented */
/* ВАЖНО: return false в addEventListener действие браузера НЕ отменяет! */
```

[!] Не путай два разных рычага: preventDefault() отменяет действие браузера (переход по ссылке / отправку), но событие продолжает всплывать. А stopPropagation() останавливает всплытие, но ссылка всё равно откроется!

## 3. Свои события: Event, CustomEvent и dispatchEvent (10:13–20:00)

[+] Свои события помогают разделить модули, чтобы они не дёргали функции друг друга напрямую (например, preloader.js просто сообщает о закрытии, а animateSections.js слушает это событие).

```js
/* Модуль preloader.js: отправляем событие после конца CSS-анимации */
const preloader = document.querySelector('.preloader');

preloader.addEventListener('animationend', (event) => {
  if (event.animationName === 'fade-out') {
    /* Event — без данных; CustomEvent — чтобы передать объект detail: */
    preloader.dispatchEvent(new CustomEvent('preloaderClose', {
      bubbles: true,    /* обязательно, иначе НЕ всплывёт до document */
      cancelable: true, /* разрешает слушателям event.preventDefault() */
      detail: {
        animationName: event.animationName,
        time: event.elapsedTime,
      },
    }));
    /*
      dispatchEvent() работает СИНХРОННО и вернёт false,
      если кто-то вызвал preventDefault() (при cancelable: true)
    */
  }
});

/* Модуль animateSections.js: подписываемся на своё событие */
document.addEventListener('preloaderClose', (event) => {
  console.log(event.detail); /* { animationName: "fade-out", time: ... } */
  animateSections();
});
/*
  Совет: в проектах свои события называют через двоеточие
  ('preloader:close', 'cart:add'), чтобы не путать со стандартными
*/
```

## 3 главные ловушки урока (чек-лист для повторения)

1. Проверять делегирование через event.target.classList.contains(...) вместо event.target.closest(...) — любой вложенный `<span>` или иконка внутри сломают клик.

2. Вешать клик на форму вместо события submit — отправка по клавише Enter проскочит мимо, и preventDefault() на кнопке не сработает.

3. Забыть bubbles: true при отправке new CustomEvent(...) на дочернем элементе — слушатель на document или родителе такое событие просто не поймает.

## Вопросы для закрепления

**1. Почему при делегировании проверка `event.target.classList.contains('btn')` ломается на вложенных тегах и зачем вместе с `closest()` используют `.contains()`?**

<details>
<summary>Показать ответ</summary>

1. Если внутри `<button class="btn">` лежит `<span>` или `<svg>`, клик по тексту запишет в `event.target` именно внутренний `<span>`, а не кнопку — поэтому ищут вверх от цели через `event.target.closest('.btn')`.
2. Если `closest('.btn')` не найдёт класс внутри нужного списка, он продолжит подниматься выше по странице и может зацепить кнопку с таким же классом в родителе. Проверка `if (!btn || !listElement.contains(btn)) return;` отсекает всё, что лежит снаружи контейнера.

</details>

**2. Отменит ли этот код переход по ссылке и в чём разница между `preventDefault()` и `stopPropagation()`?**

```js
linkElement.addEventListener('click', (event) => {
  event.stopPropagation();
  return false;
});
```

<details>
<summary>Показать ответ</summary>

Переход по ссылке **не отменится**:
1. Внутри `addEventListener` инструкция `return false` ничего не отменяет (она работала только в старом `onclick = ...`) — нужно явно вызывать `event.preventDefault()`.
2. Это два разных механизма: `preventDefault()` отменяет **действие браузера** (переход по ссылке `<a>`, отправку формы `<form>`), но событие всё ещё всплывает; а `stopPropagation()` останавливает **всплытие** к родителям, но браузер всё равно перейдёт по ссылке.

</details>

**3. Почему обработчик на `document` не поймает это событие `card:close` и как отправитель узнает, что кто-то вызвал `event.preventDefault()`?**

```js
cardElement.dispatchEvent(new CustomEvent('card:close', {
  detail: { id: 7 },
}));

document.addEventListener('card:close', (event) => {
  console.log(event.detail.id);
});
```

<details>
<summary>Показать ответ</summary>

1. По умолчанию у `CustomEvent` опция `bubbles` равна `false`, поэтому событие остаётся на `cardElement` и **не всплывает** к `document` — нужно явно передать `bubbles: true`.
2. Метод `dispatchEvent()` срабатывает **синхронно**: если передать ещё `cancelable: true`, а любой слушатель вызовет `event.preventDefault()`, то `dispatchEvent(...)` вернёт **`false`** (иначе `true`).

</details>

## Задачи

**Задача 1. Единый обработчик списка задач (`data-action` + `closest` + `contains`)**

Нужно обрабатывать клики по кнопкам списка задач одним слушателем на `listElement`, чтобы работали динамически добавленные пункты и вложенные `<span>`. Напиши функцию `initTodoActions(listElement)`:

1. Найди нажатую кнопку действия `[data-action]` через `closest` и проверь через `.contains()`, что она принадлежит `listElement`.
2. Найди родительский пункт `[data-js-todo-item]` через `closest`.
3. Если `dataset.action === 'complete'` — переключи у пункта класс `'is-completed'`, если `'delete'` — удали пункт из DOM (`.remove()`).

```html
<ul data-js-todo-list>
  <li data-js-todo-item>
    <span>Купить молоко</span>
    <button type="button" data-action="complete"><span>Готово</span></button>
    <button type="button" data-action="delete"><span>Удалить</span></button>
  </li>
</ul>
```

```js
'use strict';

/* Твоё решение: */
function initTodoActions(listElement) {
  /* ... */
}

const todoListElement = document.querySelector('[data-js-todo-list]');
initTodoActions(todoListElement);
```

<details>
<summary>Подсказка и решение</summary>

```js
'use strict';

function initTodoActions(listElement) {
  if (!listElement) return;

  listElement.addEventListener('click', (event) => {
    /*
      closest('[data-action]') найдёт кнопку даже при клике в <span>.
      contains(actionButtonElement) страхует от выхода за listElement
    */
    const actionButtonElement = event.target.closest('[data-action]');
    if (
      !actionButtonElement ||
      !listElement.contains(actionButtonElement)
    ) {
      return;
    }

    const todoItemElement = actionButtonElement.closest(
      '[data-js-todo-item]'
    );
    if (!todoItemElement) return;

    const action = actionButtonElement.dataset.action;

    if (action === 'complete') {
      todoItemElement.classList.toggle('is-completed');
    } else if (action === 'delete') {
      todoItemElement.remove();
    }
  });
}

const todoListElement = document.querySelector('[data-js-todo-list]');
initTodoActions(todoListElement);
```

</details>

**Задача 2. Перехват перехода по ссылкам (`preventDefault` + делегирование)**

Перед переходом по внешним ссылкам внутри статьи нужно спрашивать подтверждение у пользователя. Напиши функцию `protectExternalNavigation(containerElement)`:

1. Повесь на `containerElement` один обработчик `'click'`.
2. Если клик пришёлся по ссылке `<a>` внутри контейнера (учитывай вложенные теги вроде `<i>` через `closest('a')`), спроси подтверждение через `confirm(...)` с указанием адреса.
3. Если пользователь нажал Отмена — отмени стандартный переход браузера через `event.preventDefault()`.

```html
<div data-js-contents>
  Подробнее на <a href="https://example.com"><i>внешнем сайте</i></a>.
</div>
```

```js
'use strict';

/* Твоё решение: */
function protectExternalNavigation(containerElement) {
  /* ... */
}

const contentsElement = document.querySelector('[data-js-contents]');
protectExternalNavigation(contentsElement);
```

<details>
<summary>Подсказка и решение</summary>

```js
'use strict';

function protectExternalNavigation(containerElement) {
  if (!containerElement) return;

  containerElement.addEventListener('click', (event) => {
    /* Ищем ближайшую ссылку вверх от target, чтобы работал клик по <i> */
    const linkElement = event.target.closest('a');
    if (!linkElement || !containerElement.contains(linkElement)) return;

    const url = linkElement.getAttribute('href');
    const shouldLeave = confirm(`Перейти на внешний сайт ${url}?`);

    /* Если пользователь отказался — отменяем переход браузера */
    if (!shouldLeave) {
      event.preventDefault();
    }
  });
}

const contentsElement = document.querySelector('[data-js-contents]');
protectExternalNavigation(contentsElement);
```

</details>

**Задача 3. Общение модулей через `CustomEvent` и `dispatchEvent`**

Нужно связать кнопку добавления товара и модуль корзины через кастомное событие `'cart:add'`. Выполни два шага:

1. Подпишись на `'cart:add'` на `document`: достань объект товара из `event.detail`; если `price <= 0`, вызови `event.preventDefault()`, иначе выведи `'Добавлен товар: <имя>'`.
2. Напиши функцию `emitAddToCart(buttonElement, item)`, которая создаёт и отправляет на `buttonElement` событие `new CustomEvent('cart:add', ...)` так, чтобы оно **всплыло до `document`**, могло **отменяться** и передавало `detail: item`. Верни результат `dispatchEvent(...)` (`true` или `false`).

```js
'use strict';

/* Твоё решение: */
document.addEventListener('cart:add', (event) => {
  /* ... */
});

function emitAddToCart(buttonElement, item) {
  /* ... */
}

const addButtonElement = document.querySelector('[data-js-add-cart]');
const res1 = emitAddToCart(addButtonElement, { name: 'Книга', price: 500 });
const res2 = emitAddToCart(addButtonElement, { name: 'Ошибка', price: 0 });
console.log('Успешно 1:', res1);
console.log('Успешно 2:', res2);
```

<details>
<summary>Подсказка и решение</summary>

```js
'use strict';

document.addEventListener('cart:add', (event) => {
  const { name, price } = event.detail;

  /* Отменяем событие при невалидной цене, чтобы отправитель получил false */
  if (price <= 0) {
    event.preventDefault();
    return;
  }

  console.log(`Добавлен товар: ${name}`);
});

function emitAddToCart(buttonElement, item) {
  if (!buttonElement) return false;

  /*
    bubbles: true — позволяет событию дойти до слушателя на document
    cancelable: true — разрешает отменить его через event.preventDefault()
  */
  const customEvent = new CustomEvent('cart:add', {
    bubbles: true,
    cancelable: true,
    detail: item,
  });

  /* dispatchEvent запускает слушателей синхронно; вернёт false при отмене */
  return buttonElement.dispatchEvent(customEvent);
}

const addButtonElement = document.querySelector('[data-js-add-cart]');
const res1 = emitAddToCart(addButtonElement, { name: 'Книга', price: 500 });
const res2 = emitAddToCart(addButtonElement, { name: 'Ошибка', price: 0 });
console.log('Успешно 1:', res1);
console.log('Успешно 2:', res2);
```

</details>
