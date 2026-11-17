# Урок 29. Размеры и координаты DOM-элементов

Суть урока: Размеры элемента в JS читают готовыми числовыми свойствами (offset*, client*, scroll*) вместо getComputedStyle, а точные координаты получают через getBoundingClientRect() (+ window.scrollX/scrollY для всей страницы).

## 1. Полные размеры: offsetWidth / offsetHeight и рамка clientLeft / Top (00:46–04:39)

[+] Все метрики возвращают чистые числа в CSS-пикселях (без "px"). Полные внешние размеры зависят от box-sizing: при content-box они складывают width + padding + border.

```js
const box = document.querySelector('.box');

/* Полные внешние габариты (контент + padding + border + scrollbar) */
console.log(box.offsetWidth, box.offsetHeight);
/* Координаты относительно ближайшего позиционированного предка (offsetParent): */
console.log(box.offsetParent, box.offsetLeft, box.offsetTop);

/* Отступ от левого/верхнего внешнего края до контентной зоны (padding) */
console.log(box.clientLeft, box.clientTop); /* обычно ширина левого и верхнего border */
/* При direction: rtl скроллбар уезжает влево и добавляется к clientLeft! */
```

[!] Если элемент (или его предок) скрыт через display: none, все его размеры равны 0, а offsetParent === null. Поэтому по box.offsetWidth проверяют, видим ли блок на экране.

## 2. Внутренние размеры без рамки: clientWidth и clientHeight (04:40–05:50)

[+] clientWidth / clientHeight дают видимую внутреннюю область (контент + padding), вычитая border и толщину видимого скроллбара (при overflow: hidden не вычитается).

```js
/* Например: offsetHeight 200, border по 20 сверху/снизу, scrollbar 15 */
console.log(box.clientHeight); /* 200 - 20 - 20 - 15 = 145 (без scroll -> 160) */
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

/* scrollLeft / scrollTop — единственные метрики, куда можно ЗАПИСЫВАТЬ значения: */
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
console.log(rect.x, rect.y);          /* левый верхний угол (как left и top) */
console.log(rect.width, rect.height); /* точные (дробные) с учётом CSS transform: scale */
/* offsetWidth всегда целое и ИГНОРИРУЕТ CSS-масштабирование transform: scale(...) */
console.log(rect.top, rect.right, rect.bottom, rect.left);

/* Координаты относительно НАЧАЛА ВСЕЙ СТРАНИЦЫ (постоянны при скролле): */
const pageX = rect.left + window.scrollX; /* подходят для position: absolute */
const pageY = rect.top + window.scrollY;  /* rect.top/left — для position: fixed */

/* Обратная задача: какой самый глубокий элемент лежит в окне в точке (x, y)? */
const elAtPoint = document.elementFromPoint(100, 200); /* или null за экраном */
```

## 6. Шпаргалка-матрёшка размеров и 2 главные формулы практики

[+] Как мгновенно отличить 3 семейства:
- offset* -> снаружи с рамкой (border + scrollbar + видимое).
- client* -> внутри видимое окно (без border и без скроллбара).
- scroll* -> вся простыня целиком (видимое + всё спрятанное за скроллом).

```js
/* Формула 1: пользователь доскроллил блок до самого низа? (-1 от дробного зума) */
const isAtBottom = box.scrollTop + box.clientHeight >= box.scrollHeight - 1;

/* Формула 2: элемент сейчас виден хотя бы частично в окне браузера? */
const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
```

## 3 главные ловушки урока (чек-лист для повторения)

1. Пытаться менять offsetWidth или clientHeight напрямую — почти все метрики только для чтения; записывать числа можно только в scrollLeft и scrollTop.

2. Путать координаты getBoundingClientRect() (от окна, меняются при скролле) с координатами на странице (к ним нужно прибавить window.scrollX и window.scrollY).

3. Ждать, что второй вызов box.scroll(10, 50) докрутит ещё 50px — scroll() задаёт абсолютную точку от (0, 0), а не относительный сдвиг.
