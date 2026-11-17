# Урок 33. Делегирование событий, preventDefault и свои события

Суть урока: Делегирование позволяет ловить события сразу от всех (и даже будущих!) элементов одним слушателем на родителе + closest(), стандартные действия браузера отменяет preventDefault(), а модули общаются через CustomEvent и dispatchEvent().

## 1. Делегирование событий: один слушатель + closest() (00:31–08:31)

[!] Вешать click в цикле на каждый .todo-item плохо: 1) перегружает память при 1000+ элементов; 2) элементы, добавленные через JS позже, вообще не будут кликаться. Делегирование решает обе проблемы через 1 обработчик на родителе или document.

```js
const onTodoItemClick = (todoItemElement) => {
  todoItemElement.classList.toggle('is-completed');
};

/* Плохо для вложенных тегов (если внутри лежит <span>, event.target вернёт <span>!): */
/* if (event.target.classList.contains('todo-item')) ... */

/* ПРАВИЛЬНО: ищем от event.target вверх по дереву нужный элемент через closest() */
document.addEventListener('click', (event) => {
  const todoItemElement = event.target.closest('.todo-item');

  if (todoItemElement) {
    onTodoItemClick(todoItemElement);
  }
});

/* Если слушатель висит не на document, а на конкретном list, проверяй .contains(),
   чтобы closest() при вложенности не выскочил за пределы нужного контейнера: */
/* if (!todoItemElement || !listElement.contains(todoItemElement)) return; */

/* Приём с data-action: 1 слушатель обрабатывает разные кнопки по dataset.action */
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

/* Другой обработчик может узнать, отменили ли уже действие: event.defaultPrevented */
/* ВАЖНО: return false внутри addEventListener действие браузера НЕ отменяет! */
```

[!] Не путай два разных рычага: preventDefault() отменяет действие браузера (переход по ссылке / отправку), но событие продолжает всплывать. А stopPropagation() останавливает всплытие, но ссылка всё равно откроется!

## 3. Свои события: Event, CustomEvent и dispatchEvent (10:13–20:00)

[+] Свои события помогают разделить модули, чтобы они не дёргали функции друг друга напрямую (например, preloader.js просто сообщает о закрытии, а animateSections.js слушает это событие).

```js
/* --- Модуль preloader.js: отправляем событие после конца CSS-анимации fade-out --- */
const preloader = document.querySelector('.preloader');

preloader.addEventListener('animationend', (event) => {
  if (event.animationName === 'fade-out') {
    /* new Event(...) — если данные не нужны; CustomEvent — чтобы передать detail */
    preloader.dispatchEvent(new CustomEvent('preloaderClose', {
      bubbles: true,    /* обязательно true, иначе событие НЕ всплывёт до document! */
      cancelable: true, /* позволяет слушателям вызвать event.preventDefault() */
      detail: { animationName: event.animationName, time: event.elapsedTime },
    }));
    /* dispatchEvent() работает СИНХРОННО и вернёт false, если кто-то вызвал
       preventDefault() на кастомном событии с cancelable: true */
  }
});

/* --- Модуль animateSections.js: подписываемся на своё событие --- */
document.addEventListener('preloaderClose', (event) => {
  console.log(event.detail); /* { animationName: "fade-out", time: ... } */
  animateSections();
});
/* Совет: в проектах свои события удобно называть через двоеточие ("preloader:close",
   "cart:add"), чтобы они не пересекались со стандартными событиями браузера */
```

## 3 главные ловушки урока (чек-лист для повторения)

1. Проверять делегирование через event.target.classList.contains(...) вместо event.target.closest(...) — любой вложенный `<span>` или иконка внутри сломают клик.

2. Вешать клик на форму вместо события submit — отправка по клавише Enter проскочит мимо, и preventDefault() на кнопке не сработает.

3. Забыть bubbles: true при отправке new CustomEvent(...) на дочернем элементе — слушатель на document или родителе такое событие просто не поймает.
