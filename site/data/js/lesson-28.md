# Урок 28. Стили и CSS-классы в DOM: style, getComputedStyle, classList

Суть урока: Оптимальнее управлять внешним видом через CSS-классы с помощью elem.classList; инлайновые стили задают через elem.style (и CSS-переменные через setProperty), а реальные стили из CSS-файлов читают через getComputedStyle(elem).

## 1. Инлайновые стили: elem.style и style.cssText (00:21–03:04)

[+] Свойство elem.style позволяет точечно менять CSS-свойства прямо в атрибуте style элемента (в camelCase). А style.cssText задаёт сразу несколько свойств строкой в обычном CSS-формате.

```js
const boxElement = document.querySelector('.box');

/* Точечное изменение (добавляется в атрибут style="...") */
boxElement.style.position = 'absolute';
boxElement.style.top = '10px'; /* число 10 без 'px' проигнорируется! */
boxElement.style.top = '';     /* пустая строка СБРАСЫВАЕТ стиль обратно к CSS-файлу */

/* Перезапись сразу группой свойств (СТИРАЕТ прошлые инлайн-стили, например height!) */
boxElement.style.cssText = `
  position: absolute;
  top: 20px;
`;

/* Чтобы ДОПИСАТЬ к текущим инлайн-стилям, используют += */
boxElement.style.cssText += 'left: 30px;';
```

## 2. Чтение реальных стилей: getComputedStyle (03:05–05:20)

[!] Свойство elem.style видит ТОЛЬКО инлайновые стили из атрибута style="...". Если ширина задана в отдельном CSS-файле, boxElement.style.width вернёт пустую строку "". Реальные итоговые стили читают через getComputedStyle().

```js
console.log(boxElement.style.width); /* "" если ширина задана в .css файле */

/* getComputedStyle(elem) — итоговые стили со всех CSS (как DevTools -> Computed) */
const boxStyles = getComputedStyle(boxElement); /* объект ТОЛЬКО для чтения */
console.log(boxStyles.width);     /* например, "200px" */
console.log(boxStyles.marginTop); /* просите ПОЛНЫЕ свойства, а не просто "margin"! */

/* Для расчётов снимаем "px" через parseFloat, потом доклеиваем "px" обратно: */
const newWidth = parseFloat(boxStyles.width) + 50;
boxElement.style.width = `${newWidth}px`;

/* 2-й аргумент читает стили псевдоэлемента (обязательно с двумя двоеточиями "::") */
const afterStyles = getComputedStyle(boxElement, '::after');
console.log(afterStyles.textDecoration);
```

## 3. CSS-классы: className против classList (05:21–10:27)

[+] Свойства elem.class нет (зарезервированное слово JS). Вместо него есть строка className (перезаписывает все классы сразу, неудобно) и главный инструмент — объект classList с четырьмя методами.

```js
boxElement.className = 'red'; /* ПЛОХО: сотрёт исходный класс 'box'! */

/* ПРАВИЛЬНО — через classList: */
boxElement.classList.add('red', 'big');    /* добавит 1 или несколько классов */
boxElement.classList.remove('red', 'big'); /* удалит 1 или несколько классов */

/* toggle: если класса нет — добавит; если есть — удалит */
boxElement.classList.toggle('red');

/* Супер-фишка toggle: 2-й аргумент-условие (boolean) для принудительного состояния */
const hasError = true;
boxElement.classList.toggle('is-invalid', hasError); /* true -> добавит, false -> уберёт */

/* contains: проверяет наличие класса (true / false) */
console.log(boxElement.classList.contains('box'));
boxElement.classList.replace('old', 'new'); /* заменяет старый класс на новый */
for (const cls of boxElement.classList) { console.log(cls); } /* перебор классов */
```

## 4. Управление CSS-переменными в JS: setProperty (10:28–11:50)

[+] Кастомные CSS-переменные (например, --border-color) меняют через метод elem.style.setProperty(). Приоритет important указывается только 3-м аргументом.

```js
boxElement.style.setProperty('--border-color', 'blue');

/* Если нужен !important — передаём ТОЛЬКО 3-м аргументом без "!" */
boxElement.style.setProperty('--border-color', 'blue', 'important');
/* setProperty("--border-color", "blue !important") — НЕ сработает! */

/* Чтение CSS-переменной (включая заданные во внешнем CSS-файле): */
const color = getComputedStyle(boxElement).getPropertyValue('--border-color').trim();
```

## 5. Правило каскада и шпаргалка выбора: classList vs style

[!] Инлайновые стили из elem.style имеют максимальный вес в CSS — они перебивают любой класс и даже #id. Если задать box.style.display = "none", то класс .is-open его не покажет, пока не сбросите инлайн через "".

[+] Шпаргалка выбора:
- Вкл/выкл состояния (активность, ошибка, открытие) -> всегда classList.
- Динамические числа (координаты мыши, прогресс 0..100%) -> elem.style или style.setProperty("--var", ...), если от числа зависят сразу несколько стилей.
- Прочитать реальные размеры/цвета из CSS -> getComputedStyle(elem).

## 3 главные ловушки урока (чек-лист для повторения)

1. Искать стили из CSS-файла в elem.style.width — там лежат только инлайновые стили; реальные вычисленные значения даёт только getComputedStyle(elem).

2. Менять классы через elem.className = "new" (или стили через style.cssText = "...") — это стирает все прежние классы и инлайн-стили; для классов нужен classList.

3. Дописывать "!important" в строку значения внутри setProperty("--var", "blue !important") — инструкция просто проигнорируется (important — 3-й аргумент).

## Вопросы для закрепления

**1. Почему этот код выведет `""`, не сдвинет блок на `20px` и не покажет отступ `margin`?**

```css
/* style.css */
.box { width: 200px; margin: 16px; }
```

```js
const boxElement = document.querySelector('.box');
console.log(boxElement.style.width);
boxElement.style.top = 20;
console.log(getComputedStyle(boxElement).margin);
```

<details>
<summary>Показать ответ</summary>

1. `boxElement.style.width` смотрит только в инлайновый атрибут `style="..."`, а не в CSS-файлы — поэтому возвращает `""`. Реальную ширину читают через `getComputedStyle(boxElement).width`.
2. Число `20` без единицы измерения (`'20px'`) браузер молча игнорирует.
3. В `getComputedStyle` нужно запрашивать **конкретные полные свойства** (`marginTop`, `marginLeft`), а сокращённое `margin` часто даёт пустую строку.

</details>

**2. Почему после `cardElement.style.display = 'none'` добавление класса `.is-open` с `display: block` не вернёт карточку на экран?**

<details>
<summary>Показать ответ</summary>

Инлайновые стили внутри `elem.style` имеют максимальный приоритет в каскаде CSS — они перебивают любые классы и даже `#id`. Чтобы стили из класса `.is-open` снова заработали, инлайновое свойство нужно сбросить пустой строкой: `cardElement.style.display = ''`.

</details>

**3. Почему `setProperty('--accent', 'red !important')` не применится, и что делает второй аргумент в `classList.toggle('is-error', hasError)`?**

<details>
<summary>Показать ответ</summary>

1. Приоритет `'important'` в `setProperty` передаётся **строго третьим аргументом без знака `!`**: `setProperty('--accent', 'red', 'important')` — внутри второго аргумента он игнорируется.
2. Второй булев аргумент в `toggle('is-error', hasError)` принудительно синхронизирует класс с состоянием: при `true` всегда добавит класс, а при `false` всегда удалит (в отличие от обычного `toggle` без второго аргумента, который просто переключает наличие).

</details>

## Задачи

**Задача 1. Управление состояниями через `classList` вместо `className`**

Сейчас функция `setCardState` затирает исходный класс `'card'` через `className = ...`. Перепиши её на методы `classList`: замени `'is-loading'` на `'is-ready'` (`.replace`), включи или сними класс `'is-error'` по булеву флагу `hasError` одним вызовом `.toggle`, и выведи в консоль результат проверки наличия `'card'` через `.contains`.

```js
'use strict';

/*
  HTML на странице:
  <div class="card is-loading" data-js-card></div>
*/
function setCardState(cardElement, hasError) {
  if (!cardElement) return;

  /* Твоё решение: */
  cardElement.className = hasError ? 'is-error' : 'is-ready';
}

const cardElement = document.querySelector('[data-js-card]');
setCardState(cardElement, true);
/* Ожидаемые классы на карточке: 'card', 'is-ready', 'is-error' */
```

<details>
<summary>Подсказка и решение</summary>

```js
'use strict';

function setCardState(cardElement, hasError) {
  if (!cardElement) return;

  /*
    classList.replace меняет 'is-loading' на 'is-ready', не трогая остальные классы ('card').
    2-й аргумент toggle гарантирует: true -> добавить 'is-error', false -> убрать
  */
  cardElement.classList.replace('is-loading', 'is-ready');
  cardElement.classList.toggle('is-error', Boolean(hasError));

  console.log('Есть класс card:', cardElement.classList.contains('card')); /* true */
}

const cardElement = document.querySelector('[data-js-card]');
setCardState(cardElement, true);
```

</details>

**Задача 2. Чтение ширины через `getComputedStyle` и CSS-переменная `setProperty`**

Напиши функцию `expandPanel(panelElement, extraPx, accentColor)`:
1) Если `!panelElement`, сразу выйди.
2) Получи текущие вычисленные стили через `getComputedStyle(panelElement)`, вытащи числовую ширину (`parseFloat`), прибавь `extraPx` и запиши новое значение в `panelElement.style.width` с единицами `'px'`.
3) Установи CSS-переменную `--panel-accent` в `accentColor` с приоритетом `'important'` (третьим аргументом `setProperty`) и выведи её прочитанное через `getComputedStyle(...).getPropertyValue(...)` значение.

```js
'use strict';

/* Твоё решение: */
function expandPanel(panelElement, extraPx, accentColor) {
  /* ... */
}

const panelElement = document.querySelector('[data-js-panel]');
expandPanel(panelElement, 40, '#2563eb');
```

<details>
<summary>Подсказка и решение</summary>

```js
'use strict';

function expandPanel(panelElement, extraPx, accentColor) {
  if (!panelElement) return;

  /* getComputedStyle читает итоговую ширину, даже если она задана в внешнем .css файле */
  const computedStyles = getComputedStyle(panelElement);
  const currentWidth = parseFloat(computedStyles.width) || 0;

  /* Инлайновому style обязательно дописываем единицы 'px' */
  panelElement.style.width = `${currentWidth + extraPx}px`;

  /* Меняем CSS-переменную и передаём 'important' строго 3-м аргументом без '!' */
  panelElement.style.setProperty('--panel-accent', accentColor, 'important');

  /* Проверяем итоговое значение переменной с обрезкой лишних пробелов */
  const appliedColor = getComputedStyle(panelElement)
    .getPropertyValue('--panel-accent')
    .trim();
  console.log('Цвет акцента:', appliedColor);
}

const panelElement = document.querySelector('[data-js-panel]');
expandPanel(panelElement, 40, '#2563eb');
```

</details>

**Задача 3. Всплывающий тост `showToast(options)` на `classList`, `style` и таймере**

Напиши функцию `showToast({ top = 16, right = 16, extraClass = '', duration = 1500 } = {})`, которая создаёт новый элемент `<div>` (`document.createElement`), задаёт ему класс `'toast'` и при наличии — `extraClass` через `classList.add`, выставляет `position = 'fixed'`, отступы `top` и `right` в пикселях через `style`, добавляет элемент в `document.body` (`.append`) и удаляет его по таймеру `setTimeout` через `duration` миллисекунд.

```js
'use strict';

/* Твоё решение: */

showToast({ top: 20, right: 24, extraClass: 'toast--success', duration: 2000 });
```

<details>
<summary>Подсказка и решение</summary>

```js
'use strict';

/* Деструктуризация с дефолтами и '= {}' на случай вызова showToast() без аргументов */
function showToast({ top = 16, right = 16, extraClass = '', duration = 1500 } = {}) {
  const toastElement = document.createElement('div');

  /* Базовый и дополнительный модификатор вешаем через classList */
  toastElement.classList.add('toast');
  if (extraClass) {
    toastElement.classList.add(extraClass);
  }

  /* Динамические координаты задаём через инлайн-стили с обязательным 'px' */
  toastElement.style.position = 'fixed';
  toastElement.style.top = `${top}px`;
  toastElement.style.right = `${right}px`;

  document.body.append(toastElement);

  /* Удаляем элемент из DOM после завершения показа */
  setTimeout(() => {
    toastElement.remove();
  }, duration);
}

showToast({ top: 20, right: 24, extraClass: 'toast--success', duration: 2000 });
```

</details>
