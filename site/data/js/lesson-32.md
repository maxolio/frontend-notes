# Урок 32. Браузерные события: обработчики, всплытие и погружение

Суть урока: События вешают через addEventListener (и снимают по ссылке на ту же функцию через removeEventListener), а проходят они 3 фазы: погружение сверху вниз, целевой элемент (event.target) и всплытие вверх к document.

## 1. Три способа обработки событий и addEventListener (01:30–08:12)

[+] HTML-атрибут onclick="..." (требует вызова со скобками ()) и свойство button.onclick = fn (без скобок, только в нижнем регистре) ограничены 1 функцией — вторая затрёт первую. Единственный правильный способ — addEventListener.

```js
<!-- Способ 1 (устаревший, в HTML): нужны скобки вызова () -->
<button onclick="logMessage()">Нажми</button>

/* Способ 2 (в JS через свойство): БЕЗ скобок () и перетирает прошлый обработчик! */
const btn = document.querySelector('button');
const logMessage = () => console.log("Клик!");
btn.onclick = logMessage;   /* btn.onclick = logMessage() вызовет функцию СРАЗУ и сломает! */

/* Способ 3 (правильный): имя события без "on", можно вешать много обработчиков */
btn.addEventListener('click', () => console.log('Обработчик 1'));
btn.addEventListener('click', () => console.log('Обработчик 2'));

/* Полезные опции 3-го аргумента: */
btn.addEventListener('click', logMessage, { once: true }); /* 1 раз и удалится сам */
window.addEventListener('scroll', onScroll, { passive: true }); /* плавность на мобилках */
```

## 2. Удаление обработчика: removeEventListener (08:13–10:48)

[!] Чтобы снять обработчик через removeEventListener, нужно передать во 2-й аргумент ТУ ЖЕ САМУЮ функцию по ссылке. Анонимную стрелочную функцию удалить не получится!

```js
const firstBtn = document.querySelector('.button-1');
const secondBtn = document.querySelector('.button-2');
const onFirstClick = () => console.log('Клик по 1-й кнопке');

/* Вешаем по ссылке и снимаем по той же самой ссылке: */
firstBtn.addEventListener('click', onFirstClick);
secondBtn.addEventListener('click', () => {
  firstBtn.removeEventListener('click', onFirstClick);
});

/* ЛОВУШКА с .bind(): obj.fn.bind(obj) создаёт НОВУЮ функцию каждый раз! */
/* const boundFn = obj.fn.bind(obj); — сначала сохрани ссылку, потом передавай */
```

## 3. Объект event: target, currentTarget и this (10:49–15:40)

[+] Браузер передаёт первым аргументом в обработчик объект события event (координаты, зажатые клавиши Alt/Ctrl и ссылку на элемент).

```js
/* Разница между target и currentTarget (box3 вложен в box2 -> в box1): */
box1.addEventListener('click', function (event) {
  console.log(event.target);        /* самый глубокий элемент, куда РЕАЛЬНО кликнули */
  console.log(event.currentTarget); /* элемент, на КОТОРОМ висит обработчик (box1) */
  console.log(this);                /* в обычной function равен event.currentTarget */
});
/* В стрелочной () => {} свой this НЕ работает! Всегда надёжнее event.currentTarget */
/* Если внутри <button> лежит <span> или <svg>, event.target вернёт именно <span>,
   а НЕ кнопку — используйте event.currentTarget или event.target.closest("button") */
```

## 4. Всплытие (Bubbling) и его отмена (12:12–18:15)

[+] Событие сначала срабатывает на самом глубоком элементе (box3), затем всплывает вверх по родителям (box2 -> box1 -> ... -> document). Остановить всплытие можно двумя методами:

```js
box3.addEventListener('click', (event) => {
  /* Остановит подъём к родителям box2/box1, но другие обработчики на box3 СРАБОТАЮТ */
  event.stopPropagation();

  /* Остановит И подъём вверх, И все остальные обработчики на самом box3: */
  event.stopImmediatePropagation();
});
```

[!] Осторожнее со stopPropagation(): он создаёт «мёртвые зоны» — например, клик внутри кнопки со stopPropagation не дойдёт до document, и открытое выпадающее меню не закроется. Также помни: события focus и blur НЕ всплывают (всплывают focusin и focusout).

## 5. Три фазы события и перехват на погружении (18:16–21:14)

[+] Полный жизненный цикл события: 1) Погружение (Capturing) сверху вниз от window до цели -> 2) Цель -> 3) Всплытие (Bubbling) снизу вверх. По умолчанию addEventListener слушает только всплытие.

```js
/* 3-й аргумент { capture: true } (или просто true) включает перехват на ПОГРУЖЕНИИ */
box2.addEventListener('click', (event) => {
  console.log('Поймали сверху вниз раньше дочернего box3!');
  event.stopPropagation(); /* отменит погружение глубже (полезно для чужих виджетов) */
}, { capture: true });

/* ВАЖНО: чтобы снять такой обработчик, в removeEventListener ТОЖЕ передают capture! */
/* box2.removeEventListener('click', fn, { capture: true }); */
```

## 6. Короткая шпаргалка по событиям

- Вешать обработчик -> только addEventListener (одноразовый -> { once: true }).
- На что реально кликнули (внутри может быть иконка/текст) -> event.target (+ closest).
- На ком висит сам обработчик -> event.currentTarget (надёжнее, чем this).

## 3 главные ловушки урока (чек-лист для повторения)

1. Написать btn.onclick = fn() со скобками — функция вызовется мгновенно при старте страницы, а при клике работать перестанет.

2. Передать в addEventListener анонимную функцию () => ... и потом пытаться снять её через removeEventListener — без сохранённой в переменную ссылки не удалится.

3. Путать event.target (где кликнули) и event.currentTarget (чей обработчик сработал), или stopPropagation (только вверх) и stopImmediatePropagation (и на этом же элементе тоже).

## Вопросы для закрепления

**1. Почему ни один из этих двух вызовов `removeEventListener` не удалит обработчик с кнопки?**

```js
const btn = document.querySelector('button');
const logger = {
  logClick() { console.log('Клик!'); },
};

/* Случай 1: */
btn.addEventListener('click', logger.logClick.bind(logger));
btn.removeEventListener('click', logger.logClick.bind(logger));

/* Случай 2: */
const onBtnClick = () => console.log('Погружение');
btn.addEventListener('click', onBtnClick, { capture: true });
btn.removeEventListener('click', onBtnClick);
```

<details>
<summary>Показать ответ</summary>

1. В первом случае `.bind(logger)` при каждом вызове создаёт **новый объект функции** в памяти — поэтому `removeEventListener` получает другую ссылку и не находит исходный слушатель (ссылку нужно заранее сохранить: `const boundClick = logger.logClick.bind(logger)`).
2. Во втором случае слушатель повесили на фазу **погружения** (`{ capture: true }`), а снимают по умолчанию со всплытия — для удаления фазы должны совпадать: `removeEventListener('click', onBtnClick, { capture: true })`.

</details>

**2. Что попадёт в `event.target`, `event.currentTarget` и `this`, если пользователь кликнет по `<span>` внутри `<button>`?**

```html
<button data-js-btn><span>Сохранить</span></button>
```

```js
const btn = document.querySelector('[data-js-btn]');
btn.addEventListener('click', (event) => {
  console.log(event.target, event.currentTarget, this);
});
```

<details>
<summary>Показать ответ</summary>

- `event.target` укажет на **`<span>`** — это самый глубокий элемент, куда реально пришёлся клик.
- `event.currentTarget` укажет на **`<button>`** — элемент, к которому привязан сам обработчик.
- `this` внутри **стрелочной** функции-обработчика не равен кнопке: он берётся из внешнего окружения (`undefined` в модуле или `window`). Поэтому надёжнее всегда использовать `event.currentTarget`.

</details>

**3. Чем `event.stopPropagation()` отличается от `event.stopImmediatePropagation()`, и чем опасна частая остановка всплытия?**

<details>
<summary>Показать ответ</summary>

1. `event.stopPropagation()` прекращает движение события к **родителям** вверх (или к детям на погружении), но **остальные обработчики на этом же самом элементе всё равно сработают**. А `event.stopImmediatePropagation()` блокирует ещё и все оставшиеся обработчики на текущем элементе.
2. Побочный эффект `stopPropagation()` — «мёртвые зоны»: например, клик внутри кнопки не дойдёт до `document`, и открытое выпадающее меню на странице не сможет автоматически закрыться.

</details>

## Задачи

**Задача 1. Почини подписку `{ once: true }` и удаление обработчика по ссылке**

Сейчас `promoBtnElement.onclick = showBanner()` запускается сразу при загрузке, второй `onclick` перетирает первый, а кнопка отмены не снимает слушатель статистики. Перепиши код через `addEventListener`:
1) Сделай так, чтобы `showBanner` срабатывал **ровно один раз** при первом клике (`{ once: true }`).
2) Добавь второй обработчик `onPromoStats` для вывода `'Учёт клика в статистику'` и сними его с `promoBtnElement` по клику на `cancelBtnElement`.

```js
'use strict';

const promoBtnElement = document.querySelector('[data-js-promo]');
const cancelBtnElement = document.querySelector('[data-js-cancel]');

const showBanner = () => console.log('Показан разовый баннер!');

/* Твоё решение: */
promoBtnElement.onclick = showBanner();
promoBtnElement.onclick = () => console.log('Учёт клика в статистику');

cancelBtnElement.addEventListener('click', () => {
  /* Сними обработчик статистики с promoBtnElement */
});
```

<details>
<summary>Подсказка и решение</summary>

```js
'use strict';

const promoBtnElement = document.querySelector('[data-js-promo]');
const cancelBtnElement = document.querySelector('[data-js-cancel]');

const showBanner = () => console.log('Показан разовый баннер!');
/* Сохраняем обработчик в переменную, чтобы передать ту же ссылку в removeEventListener */
const onPromoStats = () => console.log('Учёт клика в статистику');

if (promoBtnElement && cancelBtnElement) {
  /* Передаём showBanner БЕЗ скобок () и с { once: true } — удалится сам после 1-го клика */
  promoBtnElement.addEventListener('click', showBanner, { once: true });
  promoBtnElement.addEventListener('click', onPromoStats);

  cancelBtnElement.addEventListener('click', () => {
    /* Снимаем строго по той же ссылке функции onPromoStats */
    promoBtnElement.removeEventListener('click', onPromoStats);
  });
}
```

</details>

**Задача 2. Спойлер с переключением через `event.currentTarget` (защита от клика по `<span>`)**

Напиши функцию `initSpoiler()`: по клику на кнопку `[data-js-toggle]` переключи класс `'is-hidden'` у `[data-js-content]`, а текст внутри `<span>` внутри самой кнопки смени на `'Открыть'` (если класс `'is-hidden'` сейчас есть) или `'Скрыть'` (если его нет). Используй `event.currentTarget`, чтобы код не сломался при клике прямо по `<span>`.

```js
'use strict';

/*
  HTML на странице:
  <div data-js-spoiler>
    <button type="button" data-js-toggle><span>Открыть</span></button>
    <div class="is-hidden" data-js-content>Скрытый текст</div>
  </div>
*/

/* Твоё решение: */
function initSpoiler() {
  /* ... */
}

initSpoiler();
```

<details>
<summary>Подсказка и решение</summary>

```js
'use strict';

function initSpoiler() {
  const toggleButtonElement = document.querySelector('[data-js-toggle]');
  const contentElement = document.querySelector('[data-js-content]');
  if (!toggleButtonElement || !contentElement) return;

  toggleButtonElement.addEventListener('click', (event) => {
    /* toggle вернёт true, если класс 'is-hidden' добавился, и false — если удалился */
    const isHidden = contentElement.classList.toggle('is-hidden');

    /*
      event.currentTarget — это сама <button>, даже если event.target попал в <span>.
      Поэтому поиск <span> внутри event.currentTarget всегда надёжно найдёт текст кнопки
    */
    const labelElement = event.currentTarget.querySelector('span');
    if (labelElement) {
      labelElement.textContent = isHidden ? 'Открыть' : 'Скрыть';
    }
  });
}

initSpoiler();
```

</details>

**Задача 3. Фаза погружения `{ capture: true }` и `stopImmediatePropagation`**

Допиши функцию `setupHandlers(boxElement, buttonElement)` для вложенной кнопки внутри блока:
1) На `boxElement` повесь два слушателя `'click'`: один на фазе **погружения** (`{ capture: true }`, выводит `'1. Погружение на родителе'`), второй — на всплытии (выводит `'Всплытие на родителе — не должно сработать!'`).
2) На `buttonElement` повесь два слушателя `'click'`: первый выводит `'2. Первый клик по кнопке'` и полностью обрывает дальнейшее распространение через `event.stopImmediatePropagation()`, чтобы ни второй слушатель кнопки, ни всплытие до `boxElement` не запустились.

```js
'use strict';

/* Твоё решение: */
function setupHandlers(boxElement, buttonElement) {
  /* ... */
}

const boxElement = document.querySelector('[data-js-box]');
const buttonElement = document.querySelector('[data-js-btn]');
setupHandlers(boxElement, buttonElement);
```

<details>
<summary>Подсказка и решение</summary>

```js
'use strict';

function setupHandlers(boxElement, buttonElement) {
  if (!boxElement || !buttonElement) return;

  /* 1. { capture: true } сработает на фазе ПОГРУЖЕНИЯ сверху вниз до самой кнопки */
  boxElement.addEventListener('click', () => {
    console.log('1. Погружение на родителе');
  }, { capture: true });

  /* Обычный слушатель на всплытии — до него событие не дойдёт из-за отмены на кнопке */
  boxElement.addEventListener('click', () => {
    console.log('Всплытие на родителе — не должно сработать!');
  });

  /* 2. stopImmediatePropagation остановит И второй слушатель кнопки, И всплытие вверх */
  buttonElement.addEventListener('click', (event) => {
    console.log('2. Первый клик по кнопке');
    event.stopImmediatePropagation();
  });

  buttonElement.addEventListener('click', () => {
    console.log('Второй клик по кнопке — не должно сработать!');
  });
}

const boxElement = document.querySelector('[data-js-box]');
const buttonElement = document.querySelector('[data-js-btn]');
setupHandlers(boxElement, buttonElement);
```

</details>
