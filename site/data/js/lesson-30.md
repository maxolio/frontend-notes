# Урок 30. Размеры окна и страницы, скролл: scroll, scrollBy, scrollIntoView

Суть урока: Размеры доступного окна берут из documentElement.clientWidth/Height, точную высоту всей страницы — через Math.max, а прокручивают страницу к точке (scroll), на сдвиг (scrollBy) или прямо к элементу (scrollIntoView).

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
