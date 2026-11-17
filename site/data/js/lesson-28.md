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
