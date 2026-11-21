# Урок 29. Размеры и координаты DOM-элементов

Суть урока:

- **Метрики элемента:** размеры читают готовыми числовыми свойствами (`offset*`, `client*`, `scroll*`) вместо `getComputedStyle`.
- **Координаты:** точное положение на экране даёт `getBoundingClientRect()` (плюс `window.scrollX/scrollY` для всей страницы).

## 1. Полные размеры: offsetWidth / offsetHeight и рамка clientLeft / Top (00:46–04:39)

[+] Все метрики возвращают чистые числа в CSS-пикселях (без "px"). Полные внешние размеры зависят от box-sizing: при content-box они складывают width + padding + border.

```js
const box = document.querySelector('.box');

/* Полные внешние габариты (контент + padding + border + scrollbar) */
console.log(box.offsetWidth, box.offsetHeight);
/* Координаты относительно позиционированного предка (offsetParent): */
console.log(box.offsetParent, box.offsetLeft, box.offsetTop);

/* Отступ от левого/верхнего края до контента (обычно ширина border) */
console.log(box.clientLeft, box.clientTop);
/* При direction: rtl скроллбар уезжает влево и добавляется к clientLeft! */
```

[!] Если элемент (или его предок) скрыт через display: none, все его размеры равны 0, а offsetParent === null. Поэтому по box.offsetWidth проверяют, видим ли блок на экране.

## 2. Внутренние размеры без рамки: clientWidth и clientHeight (04:40–05:50)

[+] clientWidth / clientHeight дают видимую внутреннюю область (контент + padding), вычитая border и толщину видимого скроллбара (при overflow: hidden не вычитается).

```js
/* Например: offsetHeight 200, border по 20 сверху/снизу, scrollbar 15 */
console.log(box.clientHeight); /* 200 - 40 - 15 = 145 (без scroll -> 160) */
console.log(box.clientWidth);
```

## 3. Прокрутка: scrollWidth, scrollHeight, scrollLeft, scrollTop (05:51–08:52)

[!] scrollWidth / scrollHeight — полная внутренняя ширина/высота ВМЕСТЕ со скрытой прокручиваемой частью (без border). Из ВСЕХ метрик только scrollLeft и scrollTop можно менять (остальные только для чтения!).

```js
/* Сколько пикселей ещё осталось проскроллить вниз: */
const hiddenPart = box.scrollHeight - box.clientHeight;

/* Программный скролл относительно (0, 0) — не суммируется при повторе! */
box.scroll(10, 50); /* вправо на 10px, вниз на 50px */
box.scroll({ left: 10, top: 50, behavior: 'smooth' }); /* плавный вариант */

/* scrollLeft / scrollTop — единственные метрики, куда можно записывать: */
box.scrollLeft = 10;
box.scrollTop = 50;
console.log(box.scrollLeft, box.scrollTop); /* сколько уже прокручено */
```

## 4. Почему метрики лучше getComputedStyle для размеров (08:53–11:10)

[!] Для расчётов размеров лучше метрики, чем getComputedStyle(box), по 3 причинам: 1) строчные элементы (display: inline / `<span>`) вернут "auto"; 2) размеры приходят строкой с "px" и их надо парсить; 3) Chrome и Firefox по-разному считают скроллбар.

## 5. Координаты относительно окна и относительно страницы (11:11–14:58)

[+] Метод elem.getBoundingClientRect() даёт актуальные координаты углов элемента относительно ВИДИМОГО ОКНА браузера (при скролле страницы они меняются).

```js
const rect = box.getBoundingClientRect();

/* Координаты левого верхнего угла и всех сторон относительно ОКНА: */
console.log(rect.x, rect.y);          /* левый верхний угол (left и top) */
console.log(rect.width, rect.height); /* точные, с учётом transform: scale */
/* offsetWidth всегда целое и ИГНОРИРУЕТ CSS-масштабирование scale(...) */
console.log(rect.top, rect.right, rect.bottom, rect.left);

/* Координаты относительно НАЧАЛА СТРАНИЦЫ (постоянны при скролле): */
const pageX = rect.left + window.scrollX; /* для position: absolute */
const pageY = rect.top + window.scrollY;  /* rect.top/left -> fixed */

/* Какой самый глубокий элемент лежит в окне в точке (x, y)? */
const elAtPoint = document.elementFromPoint(100, 200); /* или null */
```

## 6. Шпаргалка-матрёшка размеров и 2 главные формулы практики

[+] Как мгновенно отличить 3 семейства:
- offset* -> снаружи с рамкой (border + scrollbar + видимое).
- client* -> внутри видимое окно (без border и без скроллбара).
- scroll* -> вся простыня целиком (видимое + всё спрятанное за скроллом).

```js
/* Формула 1: блок доскроллен до самого низа? (-1 от дробного зума) */
const isAtBottom = box.scrollTop + box.clientHeight >= box.scrollHeight - 1;

/* Формула 2: элемент сейчас виден хотя бы частично в окне браузера? */
const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
```

## 3 главные ловушки урока (чек-лист для повторения)

1. Пытаться менять offsetWidth или clientHeight напрямую — почти все метрики только для чтения; записывать числа можно только в scrollLeft и scrollTop.

2. Путать координаты getBoundingClientRect() (от окна, меняются при скролле) с координатами на странице (к ним нужно прибавить window.scrollX и window.scrollY).

3. Ждать, что второй вызов box.scroll(10, 50) докрутит ещё 50px — scroll() задаёт абсолютную точку от (0, 0), а не относительный сдвиг.

## Вопросы для закрепления

**1. В чём разница между `offsetWidth`, `clientWidth` и `scrollHeight`, и чему они равны при `display: none`?**

<details>
<summary>Показать ответ</summary>

1. `offsetWidth` — **полная внешняя** ширина (контент + `padding` + `border` + скроллбар).
2. `clientWidth` — **видимая внутренняя** область (контент + `padding`, без `border` и без скроллбара).
3. `scrollHeight` — **вся высота целиком**, включая спрятанную скроллом часть.

Если сам элемент или его предок скрыт через `display: none`, все его размеры равны **`0`**, а `offsetParent` равен **`null`** (так по `elem.offsetWidth === 0` проверяют, виден ли элемент в потоке).

</details>

**2. Сработают ли эти три строки как изменение высоты и прокрутка на `100px` вниз?**

```js
box.clientHeight = 300;
box.scroll(0, 50);
box.scroll(0, 50);
```

<details>
<summary>Показать ответ</summary>

Нет, не сработают:
1. Почти все метрики (`clientHeight`, `offsetWidth`, `scrollHeight`) работают **только для чтения** — запись `box.clientHeight = 300` проигнорируется (менять размер нужно через `box.style.height`). Изменять можно только `scrollTop` и `scrollLeft`.
2. Метод `box.scroll(0, 50)` задаёт **абсолютную** позицию от начала `(0, 0)`, поэтому повторный вызов оставит прокрутку на `50px` (для прибавления сдвига пишут `box.scrollTop += 50`).

</details>

**3. Чем координаты `rect.top` из `getBoundingClientRect()` отличаются от `rect.top + window.scrollY`, и когда `rect.width` не совпадает с `box.offsetWidth`?**

<details>
<summary>Показать ответ</summary>

1. `rect.top` измеряется от верхнего края **видимого окна** браузера и меняется при прокрутке (нужен для `position: fixed`). А `rect.top + window.scrollY` — постоянная координата от **начала всей страницы** (нужна для `position: absolute`).
2. `offsetWidth` всегда округляется до целого числа и **игнорирует `transform: scale(...)`**, тогда как `rect.width` возвращает точную дробную ширину с учётом CSS-масштабирования.

</details>

## Задачи

**Задача 1. Остаток прокрутки снизу и ширина системного скроллбара**

Напиши две утилиты на основе DOM-метрик:

1. `getScrollBottom(boxElement)` — вычисляет, сколько пикселей ещё осталось проскроллить до самого конца `boxElement` (через `scrollHeight`, `scrollTop` и `clientHeight`).
2. `getScrollbarWidth()` — создаёт `<div>` `50px` x `50px` с `overflowY = 'scroll'`, временно вставляет в `document.body`, считает `offsetWidth - clientWidth` и сразу удаляет элемент через `.remove()`.

```js
'use strict';

/* Твоё решение: */
function getScrollBottom(boxElement) {
  /* ... */
}

function getScrollbarWidth() {
  /* ... */
}

console.log('Ширина скроллбара (px):', getScrollbarWidth());
```

<details>
<summary>Подсказка и решение</summary>

```js
'use strict';

function getScrollBottom(boxElement) {
  if (!boxElement) return 0;

  /*
    scrollHeight (вся высота) минус уже прокрученное сверху (scrollTop)
    и видимое окно блока (clientHeight) = остаток снизу
  */
  return (
    boxElement.scrollHeight - boxElement.scrollTop - boxElement.clientHeight
  );
}

function getScrollbarWidth() {
  const probeElement = document.createElement('div');
  probeElement.style.overflowY = 'scroll';
  probeElement.style.width = '50px';
  probeElement.style.height = '50px';

  /* Пока элемент не в DOM, браузер не вычисляет размеры (все = 0) */
  document.body.append(probeElement);

  /* Разница полной ширины и внутренней видимой зоны — толщина скроллбара */
  const scrollbarWidth = probeElement.offsetWidth - probeElement.clientWidth;

  /* Обязательно убираем временный элемент со страницы */
  probeElement.remove();

  return scrollbarWidth;
}

console.log('Ширина скроллбара (px):', getScrollbarWidth());
```

</details>

**Задача 2. Помести мяч точно в центр поля (`client*` против `offset*`)**

Напиши функцию `centerBallInField(fieldElement, ballElement)` для точного центрирования:

1. Вычисли `left` и `top` так, чтобы центр мяча совпал с центром **внутренней** области поля (рамка `border` поля не должна сбивать расчёт — используй `clientWidth` / `clientHeight` поля и `offsetWidth` / `offsetHeight` мяча).
2. Округли координаты через `Math.round` и запиши их в `ballElement.style.left` / `top` с единицами `'px'`.

```html
<div
  data-js-field
  style="position: relative; border: 10px solid #000;
         width: 300px; height: 200px;"
>
  <div
    data-js-ball
    style="position: absolute; width: 40px; height: 40px;"
  ></div>
</div>
```

```js
'use strict';

/* Твоё решение: */
function centerBallInField(fieldElement, ballElement) {
  /* ... */
}

const fieldElement = document.querySelector('[data-js-field]');
const ballElement = document.querySelector('[data-js-ball]');
centerBallInField(fieldElement, ballElement);
```

<details>
<summary>Подсказка и решение</summary>

```js
'use strict';

function centerBallInField(fieldElement, ballElement) {
  if (!fieldElement || !ballElement) return;

  /*
    left/top у position: absolute считаются от ВНУТРЕННЕГО края поля
    (после border), поэтому берём clientWidth/clientHeight поля.
    У мяча берём полные offsetWidth/offsetHeight и сдвигаем на половину
  */
  const left = Math.round(
    fieldElement.clientWidth / 2 - ballElement.offsetWidth / 2
  );
  const top = Math.round(
    fieldElement.clientHeight / 2 - ballElement.offsetHeight / 2
  );

  ballElement.style.left = `${left}px`;
  ballElement.style.top = `${top}px`;
}

const fieldElement = document.querySelector('[data-js-field]');
const ballElement = document.querySelector('[data-js-ball]');
centerBallInField(fieldElement, ballElement);
```

</details>

**Задача 3. Координаты на странице и проверка видимости элемента в окне**

Напиши функцию `getTargetMetrics(targetElement)` на основе `getBoundingClientRect()`, возвращающую объект:

1. `pageTop` и `pageLeft` — координаты верхнего левого угла **относительно всей страницы** (с учётом `window.scrollY` / `window.scrollX`, округлённые через `Math.round`).
2. `isVisible` — виден ли элемент прямо сейчас хотя бы частично в окне браузера (и не скрыт через `display: none`).

```js
'use strict';

/* Твоё решение: */
function getTargetMetrics(targetElement) {
  /* ... */
}

const cardElement = document.querySelector('[data-js-card]');
console.log(getTargetMetrics(cardElement));
```

<details>
<summary>Подсказка и решение</summary>

```js
'use strict';

function getTargetMetrics(targetElement) {
  if (!targetElement) return null;

  /* Координаты относительно видимого окна браузера (viewport) */
  const rect = targetElement.getBoundingClientRect();

  /* Переводим координаты окна в координаты документа через scrollY/X */
  const pageTop = Math.round(rect.top + window.scrollY);
  const pageLeft = Math.round(rect.left + window.scrollX);

  /* Проверяем, что блок не скрыт (offsetWidth > 0) и пересекается с окном */
  const isInViewport =
    targetElement.offsetWidth > 0 &&
    rect.top < window.innerHeight &&
    rect.bottom > 0 &&
    rect.left < window.innerWidth &&
    rect.right > 0;

  return {
    pageTop,
    pageLeft,
    isVisible: isInViewport,
  };
}

const cardElement = document.querySelector('[data-js-card]');
console.log(getTargetMetrics(cardElement));
```

</details>
