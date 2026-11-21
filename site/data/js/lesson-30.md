# Урок 30. Размеры окна и страницы, скролл: scroll, scrollBy, scrollIntoView

Суть урока:

- **Размеры окна и страницы:** доступное окно берут из `documentElement.clientWidth/Height`, точную высоту всей страницы — через `Math.max`.
- **Прокрутка:** скроллят страницу к точке (`scroll`), на сдвиг (`scrollBy`) или прямо к элементу (`scrollIntoView`).

## 1. Размеры окна (viewport): documentElement vs window (00:26–02:45)

[+] Для позиционирования элементов нужна ширина/высота БЕЗ полос прокрутки — её дают clientWidth и clientHeight на document.documentElement (теге `<html>`).

```js
const htmlElement = document.documentElement;

/* ПРАВИЛЬНО: чистое доступное пространство без полос прокрутки */
console.log(htmlElement.clientWidth, htmlElement.clientHeight);

/* ОШИБКА ДЛЯ ПОЗИЦИОНИРОВАНИЯ: учитывают ширину скроллбара */
console.log(window.innerWidth, window.innerHeight);
/* Условие: в HTML обязательно должен быть <!DOCTYPE html>, иначе метрики врут */
```

## 2. Полная высота всей страницы и позиция скролла (02:46–05:00)

[!] У documentElement.scrollHeight бывает баг — иногда он возвращает значение меньше высоты окна. Для надёжности берут максимум из 6 свойств у body и html.

```js
const fullPageHeight = Math.max(
  document.body.scrollHeight, document.documentElement.scrollHeight,
  document.body.offsetHeight, document.documentElement.offsetHeight,
  document.body.clientHeight, document.documentElement.clientHeight,
);

/* Текущая позиция скролла страницы (актуальный способ, без deprecated): */
console.log(window.scrollX, window.scrollY);
/* Надёжнее, чем body.scrollTop / htmlElement.scrollTop (в браузерах они расходились) */
/* window.pageXOffset / pageYOffset — устарели (deprecated) */
```

## 3. Прокрутка страницы: scroll() / scrollTo() против scrollBy() (05:01–07:09)

[+] Методы работают и у window, и у любого элемента. scroll() и scrollTo() делают одно и то же — крутят к абсолютной точке от (0, 0), а scrollBy() сдвигает от текущего места.

```js
/* Абсолютный скролл до точки y = 200 (от самого верха страницы): */
window.scroll({ top: 200, behavior: 'smooth' }); /* или window.scrollTo(...) */
/* ВАЖНО: smooth-скролл идёт во времени — сразу на строке ниже window.scrollY ещё 0! */
/* Повторный вызов window.scroll({ top: 100 }) прокрутит ОБРАТНО ВВЕРХ до 100! */

/* Относительный сдвиг от текущей позиции (scrollBy): */
window.scrollBy({ top: 200, behavior: 'smooth' });
setTimeout(() => {
  window.scrollBy({ top: 100, behavior: 'smooth' }); /* итого спустимся на 300px */
}, 2000);

/* Блокировка скролла страницы (например, для открытой модалки): */
const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
document.body.style.overflow = 'hidden'; /* запретить скролл (+ paddingRight = scrollbar) */
document.body.style.overflow = '';       /* вернуть скролл при закрытии модалки */
```

## 4. Прокрутка прямо к элементу: elem.scrollIntoView() (07:10–10:19)

[+] Удобный метод, который сам вычисляет координаты и скроллит страницу так, чтобы элемент оказался в окне. На слабых устройствах при старте страницы его иногда оборачивают в небольшой setTimeout(..., 300), чтобы вёрстка успела отрисоваться.

```js
const reviewsSectionElement = document.querySelector('#reviews');

/* Выравнивание по вертикали (block) и горизонтали (inline):
   "start" (по умолчанию, к верхнему краю) | "center" | "end" | "nearest" */
reviewsSectionElement.scrollIntoView({
  behavior: 'smooth',
  block: 'start',
  inline: 'nearest',
});

/* Короткий старый синтаксис: true = block: "start" (верх), false = block: "end" (низ) */
reviewsSectionElement.scrollIntoView(false);

/* Если у сайта фиксированная шапка (fixed), добавьте секции в CSS: */
/* #reviews { scroll-margin-top: 80px; } — и заголовок не уедет под шапку! */
```

## 5. Шпаргалка по сценариям скролла

- Кнопка «Наверх» -> window.scroll({ top: 0, behavior: "smooth" }).
- Переход к нужному разделу сайта -> section.scrollIntoView({ behavior: "smooth" }).
- Пролистать карусель / ленту на 1 шаг вперёд -> slider.scrollBy({ left: 300 }).
- Запретить скролл под модалкой без «прыжка» -> overflow = "hidden" + paddingRight.

## 3 главные ловушки урока (чек-лист для повторения)

1. Брать ширину окна из window.innerWidth вместо documentElement.clientWidth — лишние пиксели полосы прокрутки испортят расчёты.

2. Ждать от window.scroll({ top: 100 }) сдвига «ещё на 100px вниз» — scroll() и scrollTo() работают от (0, 0); для сдвига «от текущего места» нужен scrollBy().

3. Брать высоту всей страницы одним documentElement.scrollHeight (надёжнее Math.max из 6 метрик body/html) или забыть block: "center" / "nearest" у scrollIntoView.

## Вопросы для закрепления

**1. Почему ширину видимого окна берут из `document.documentElement.clientWidth` вместо `window.innerWidth`, а высоту всей страницы считают через `Math.max` из 6 свойств?**

<details>
<summary>Показать ответ</summary>

1. `window.innerWidth` учитывает толщину вертикального скроллбара, поэтому для точной вёрстки и позиционирования нужна чистая ширина без него — `document.documentElement.clientWidth` (при условии наличия `<!DOCTYPE html>`).
2. В разных браузерах `documentElement.scrollHeight` иногда оказывается меньше высоты самого окна. Чтобы получить гарантированно точную полную высоту страницы, берут `Math.max` сразу по `scrollHeight`, `offsetHeight` и `clientHeight` для `body` и `documentElement`.

</details>

**2. Что выведет `console.log(window.scrollY)` сразу после плавного скролла и куда попадёт страница, если затем вызвать `window.scroll({ top: 100 })`?**

```js
window.scroll({ top: 300, behavior: 'smooth' });
console.log(window.scrollY);
```

<details>
<summary>Показать ответ</summary>

1. `console.log(window.scrollY)` сразу выведет старое значение (например, **`0`**): плавная прокрутка `behavior: 'smooth'` идёт **во времени**, а следующая строка выполняется мгновенно ещё до сдвига.
2. Повторный вызов `window.scroll({ top: 100 })` прокрутит страницу **назад вверх к точке `100px`**, потому что `scroll()` и `scrollTo()` считают от абсолютного начала `(0, 0)`. Для сдвига от текущего места используют `scrollBy()`.

</details>

**3. Что сделает старый вызов `elem.scrollIntoView(false)` и почему при `block: 'start'` блок может оказаться под фиксированной шапкой сайта?**

<details>
<summary>Показать ответ</summary>

Аргумент `false` включает выравнивание по **нижнему** краю окна (`block: 'end'`), тогда как без аргументов (или с `true`) элемент прижимается к верхнему (`block: 'start'`). Если у сайта сверху есть шапка с `position: fixed`, при `block: 'start'` верх секции уедет прямо под неё — в CSS это решает отступ `scroll-margin-top`.

</details>

## Задачи

**Задача 1. Надёжная высота документа и процент прокрутки страницы**

Напиши две функции:
1) `getDocumentHeight()` — возвращает точную полную высоту страницы через `Math.max` из 6 свойств (`scrollHeight`, `offsetHeight`, `clientHeight` у `document.body` и `document.documentElement`).
2) `getScrollProgress()` — возвращает процент прокрутки от `0` до `100` (целое число через `Math.round`): раздели `window.scrollY` на доступный запас скролла `(getDocumentHeight() - document.documentElement.clientHeight)` и умножь на `100` (если страница целиком помещается на экран и запас `<= 0`, верни `0`).

```js
'use strict';

/* Твоё решение: */
function getDocumentHeight() {
  /* ... */
}

function getScrollProgress() {
  /* ... */
}

console.log('Высота страницы:', getDocumentHeight());
console.log('Прочитано (%):', getScrollProgress());
```

<details>
<summary>Подсказка и решение</summary>

```js
'use strict';

function getDocumentHeight() {
  const { body, documentElement } = document;

  /* Берём максимум из 6 метрик, чтобы избежать расхождений между браузерами */
  return Math.max(
    body.scrollHeight, documentElement.scrollHeight,
    body.offsetHeight, documentElement.offsetHeight,
    body.clientHeight, documentElement.clientHeight
  );
}

function getScrollProgress() {
  /* Доступный максимум скролла = полная высота минус чистое окно без скроллбара */
  const maxScroll = getDocumentHeight() - document.documentElement.clientHeight;
  if (maxScroll <= 0) return 0;

  return Math.round((window.scrollY / maxScroll) * 100);
}

console.log('Высота страницы:', getDocumentHeight());
console.log('Прочитано (%):', getScrollProgress());
```

</details>

**Задача 2. Запрет скролла страницы под модалкой без «прыжка» контента**

Напиши функцию `togglePageScroll(isLocked)`:
- При `isLocked === true`: сначала вычисли толщину полосы прокрутки (`window.innerWidth - document.documentElement.clientWidth`), компенсируй её через `document.body.style.paddingRight` (в `'px'`) и отключи прокрутку через `document.body.style.overflow = 'hidden'`.
- При `isLocked === false`: верни исходное поведение CSS, сбросив оба инлайн-стиля пустой строкой `''`.

```js
'use strict';

/* Твоё решение: */
function togglePageScroll(isLocked) {
  /* ... */
}

togglePageScroll(true);  /* страница зафиксирована, контент не сместился */
togglePageScroll(false); /* скролл и отступы возвращены к CSS по умолчанию */
```

<details>
<summary>Подсказка и решение</summary>

```js
'use strict';

function togglePageScroll(isLocked) {
  if (isLocked) {
    /*
      Считаем ширину скроллбара строго ДО установки overflow: 'hidden',
      иначе полоса исчезнет и разница сразу станет равна 0
    */
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.body.style.paddingRight = `${scrollbarWidth}px`;
    document.body.style.overflow = 'hidden';
  } else {
    /* Пустая строка полностью снимает инлайновые стили, возвращая правила CSS-файла */
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
  }
}

togglePageScroll(true);
togglePageScroll(false);
```

</details>

**Задача 3. Плавная прокрутка к секции (`scrollIntoView`) и сдвиг слайдера (`scrollBy`)**

Напиши две утилиты:
1) `scrollToSection(selector)` — ищет элемент по селектору и, если он найден, плавно прокручивает к нему страницу так, чтобы блок оказался **по центру** экрана (`behavior: 'smooth'`, `block: 'center'`).
2) `shiftSlider(sliderElement, stepPx)` — сдвигает элемент-слайдер по горизонтали **от текущей позиции** на `stepPx` пикселей плавно через `scrollBy`.

```js
'use strict';

/* Твоё решение: */
function scrollToSection(selector) {
  /* ... */
}

function shiftSlider(sliderElement, stepPx) {
  /* ... */
}

scrollToSection('[data-js-reviews]');
const sliderElement = document.querySelector('[data-js-slider]');
shiftSlider(sliderElement, 300);
```

<details>
<summary>Подсказка и решение</summary>

```js
'use strict';

function scrollToSection(selector) {
  const sectionElement = document.querySelector(selector);
  if (!sectionElement) return;

  /* block: 'center' ставит секцию в центр видимого окна, behavior: 'smooth' делает плавно */
  sectionElement.scrollIntoView({
    behavior: 'smooth',
    block: 'center',
  });
}

function shiftSlider(sliderElement, stepPx) {
  if (!sliderElement) return;

  /*
    scrollBy (в отличие от scroll) прибавляет сдвиг к текущей прокрутке,
    поэтому повторные вызовы шагают дальше по ленте слайдера
  */
  sliderElement.scrollBy({
    left: stepPx,
    behavior: 'smooth',
  });
}

scrollToSection('[data-js-reviews]');
const sliderElement = document.querySelector('[data-js-slider]');
shiftSlider(sliderElement, 300);
```

</details>
