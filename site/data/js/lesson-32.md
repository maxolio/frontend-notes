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
