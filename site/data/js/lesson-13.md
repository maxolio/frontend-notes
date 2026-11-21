# Урок 13. Методы примитивов, числа, Math, округление и парсинг строк

Суть урока:

- **Методы примитивов:** числа получают методы через временный объект-обёртку; `toFixed()` и `toPrecision()` возвращают строку.
- **Объект `Math`:** даёт `random()`, `min()`/`max()` (через `...arr`) и 4 способа округления (`round`, `floor`, `ceil`, `trunc`).
- **Парсинг чисел:** строки вроде `'100.5px'` разбирают через `parseInt` / `parseFloat`.

## 1. Методы примитивов и чисел: toFixed, toPrecision, toString (00:26–05:24)

[+] При вызове метода у числа JS на миг создаёт временный объект-обёртку, выполняет метод и сразу удаляет её. У целых чисел напрямую метод вызывают через две точки (..), у дробных — в скобках.

```js
const price = 99.984;
console.log(price.toFixed(2));     /* '99.98' (СТРОКА! без аргумента -> 0 знаков) */
console.log((100).toFixed(2));     /* '100.00' или 100..toFixed(2) — допишет нули */
console.log(price.toPrecision(4)); /* '99.98' — 4 значащих цифры с начала числа */

const num = 255;
console.log(num.toString());       /* '255' */
console.log(num.toString(2));      /* '11111111' — система счисления от 2 до 36 */
/* У null и undefined НЕТ обёрток/методов (TypeError). НЕ пишите new Number(0) — в if */
/* объект всегда true! Подвох IEEE 754: (6.35).toFixed(1) === "6.3" (лечат Math.round). */
```

## 2. Объект Math и 4 способа округления чисел (05:25–08:36)

[+] Math хранит математические константы (Math.PI) и методы. В Math.min / Math.max массив передают только со спредом (...nums), иначе будет NaN.

```js
console.log(Math.random());          /* случайная дробь от 0 (вкл.) до 1 (не вкл.) */
const randInt = (min, max) => Math.floor(min + Math.random() * (max + 1 - min));
/* Случайное целое [min..max] с равной вероятностью (Math.round сбивает края в 2 раза!) */
console.log(Math.abs(-5));           /* 5 (модуль числа), Math.pow(2, 10) === 1024 */
console.log(Math.sqrt(16), Math.cbrt(27)); /* 4 (кв. корень) и 3 (куб. корень) */
const nums = [10, -5, 42];
console.log(Math.max(...nums));      /* 42 (без ... будет NaN!) */

/* 4 округления (пример на положительном 3.6 и отрицательном -3.6): */
Math.round(3.6);  /* 4  — к ближайшему целому (0.5 вверх) */
Math.floor(-3.6); /* -4 — всегда ВНИЗ ("пол") */
Math.ceil(-3.6);  /* -3 — всегда ВВЕРХ ("потолок") */
Math.trunc(-3.6); /* -3 — просто отрезает дробную часть без учёта знака */
```

## 3. Парсинг чисел из строк: parseInt и parseFloat (08:37–10:48)

[+] Обычный Number("100px") даст NaN, а parseInt / parseFloat считывают число слева направо до первого нечислового символа (пробелы в начале игнорируются).

```js
console.log(parseInt('100px'));     /* 100 — отбросил 'px' (2-й арг. — основание 2..36) */
console.log(parseInt('100.5px'));   /* 100 — точку считает остановкой */
console.log(parseFloat('100.5px')); /* 100.5 — читает и дробную часть */
console.log(parseInt('a100px'));    /* NaN — нечисловой символ стоит в самом начале! */

/* Строгие проверки чисел (НЕ приводят аргумент к числу, в отличие от глобальных!): */
console.log(Number.isNaN('str'));    /* false (глобальный isNaN('str') вернёт true!) */
console.log(Number.isFinite('123')); /* false (глобальный isFinite('123') вернёт true!) */
```

## 3 главные ловушки урока (чек-лист для повторения)

1. Ждать от price.toFixed(2) число для дальнейшей математики — метод возвращает строку (при сложении "10.00" + 5 выйдет строка "10.005").

2. Передать массив в Math.max(nums) без спреда ...nums (вернёт NaN) или путать Math.floor(-3.1) (-4) с Math.trunc(-3.1) (-3).

3. Ждать число от parseInt("$100") или parseFloat("px100") — если нецифровой символ идёт перед цифрами, парсинг сразу вернёт NaN.

## Вопросы для закрепления

**1. Почему `100.toFixed(2)` упадёт с ошибкой, что вернёт `(6.35).toFixed(1)` и что получится в выражении `(10.5).toFixed(2) + 5`?**

<details>
<summary>Показать ответ</summary>

1. `100.toFixed(2)` вызовет **`SyntaxError`**, потому что точку сразу после целого числа JS считает началом десятичной дроби (`100.`), а следом встречает буквы. Нужно либо обернуть в скобки `(100).toFixed(2)`, либо поставить две точки: `100..toFixed(2)`.
2. `(6.35).toFixed(1)` вернёт **`'6.3'`** вместо `'6.4'`: из-за двоичной точности IEEE 754 число `6.35` хранится в памяти как `6.349999999...`, поэтому округляется вниз. Надёжный обход — `Math.round(6.35 * 10) / 10`.
3. `(10.5).toFixed(2) + 5` склеит строку **`'10.505'`**, так как `toFixed()` всегда возвращает **строку**, а не число.

</details>

**2. Что вернут `Math.floor(-3.2)`, `Math.trunc(-3.2)` и `Math.max([5, 10, 2])`?**

<details>
<summary>Показать ответ</summary>

1. `Math.floor(-3.2)` вернёт **`-4`** (округляет всегда вниз, к меньшему числу: `-4 < -3.2`), а `Math.trunc(-3.2)` вернёт **`-3`** (просто отрезает дробную часть).
2. `Math.max([5, 10, 2])` вернёт **`NaN`**, потому что `Math.max` и `Math.min` принимают числа через запятую, а не массив — перед передачей массив нужно развернуть спредом: `Math.max(...[5, 10, 2])`.

</details>

**3. Чем строгий `Number.isFinite('123')` отличается от глобального `isFinite('123')`, и что вернут `parseInt('12.9px')` и `parseFloat('$12.9')`?**

<details>
<summary>Показать ответ</summary>

Глобальный `isFinite('123')` неявно переводит строку в число и возвращает `true`, тогда как **`Number.isFinite('123')` типы не приводит и возвращает `false`** (проверяет, что аргумент уже является валидным конечным числом). `parseInt('12.9px')` вернёт **`12`** (остановится на первой точке), а `parseFloat('$12.9')` сразу вернёт **`NaN`**, так как первый символ `'$'` нечисловой.

</details>

## Задачи

**Задача 1. Почини парсинг `px`, математику после `toFixed` и округление `6.35`**

Сейчас `widthNumber` отбрасывает дробную часть, `totalSum` склеивает строку `'10.505.25'` вместо `15.75`, а `roundedRating` возвращает строку `'6.3'` вместо числа `6.4`. Исправь все три расчёта, используя инструменты урока.

```js
'use strict';

const cssWidth = '45.8px';
const rawPrice1 = (10.5).toFixed(2);
const rawPrice2 = 5.25;
const rating = 6.35;

/* Твоё решение: */
const widthNumber = parseInt(cssWidth);
const totalSum = rawPrice1 + rawPrice2;
const roundedRating = rating.toFixed(1);

console.log(widthNumber);   /* должно быть: 45.8 */
console.log(totalSum);      /* должно быть: 15.75 */
console.log(roundedRating); /* должно быть: 6.4 */
```

<details>
<summary>Подсказка и решение</summary>

```js
'use strict';

const cssWidth = '45.8px';
const rawPrice1 = (10.5).toFixed(2);
const rawPrice2 = 5.25;
const rating = 6.35;

/* parseFloat, в отличие от parseInt, считывает и дробную часть до 'px' */
const widthNumber = parseFloat(cssWidth);

/* toFixed() возвращает строку '10.50', поэтому приводим её к числу перед + */
const totalSum = Number(rawPrice1) + rawPrice2;

/*
  Умножаем на 10 до округления, чтобы обойти погрешность IEEE 754 у 6.35,
  округляем до целого и делим обратно -> получаем число 6.4
*/
const roundedRating = Math.round(rating * 10) / 10;

console.log(widthNumber);   /* 45.8 */
console.log(totalSum);      /* 15.75 */
console.log(roundedRating); /* 6.4 */
```

</details>

**Задача 2. Надёжный ввод числа `readNumber()`**

Напиши функцию `readNumber()`, которая в цикле запрашивает ввод через `prompt('Введите число:', '')`, пока пользователь не введёт корректное конечное число (проверку строй на строгом `Number.isFinite`). Если пользователь нажал Cancel (`null`) или оставил пустую строку (`''`), функция должна вернуть `null`, иначе — введённое число типа `number`.

```js
'use strict';

/* Твоё решение: */

console.log(`Результат: ${readNumber()}`);
```

<details>
<summary>Подсказка и решение</summary>

```js
'use strict';

function readNumber() {
  let raw;

  do {
    raw = prompt('Введите число:', '');

    /*
      Проверяем отмену (null) и пустой ввод ('') ДО приведения к числу,
      иначе +null и +'' превратятся в 0 и сломают смысл отмены
    */
    if (raw === null || raw === '') return null;
  } while (!Number.isFinite(+raw));
  /*
    Number.isFinite(+raw) вернёт false и повторит запрос, если ввели
    буквы (NaN) или Infinity — выйдет только на настоящем конечном числе
  */

  return +raw;
}

console.log(`Результат: ${readNumber()}`);
```

</details>

**Задача 3. Равномерный бросок кубика `randomInteger(min, max)` и поиск минимума/максимума**

Напиши функцию `randomInteger(min, max)`, возвращающую случайное целое число от `min` до `max` включительно с равной вероятностью для каждого числа (через `Math.floor` и `Math.random`). Сделай 3 броска кубика (`1..6`) в массив `rolls` и выведи сам массив, минимальное и максимальное значения через `Math.min` / `Math.max`.

```js
'use strict';

/* Твоё решение: */

const rolls = [
  randomInteger(1, 6),
  randomInteger(1, 6),
  randomInteger(1, 6),
];

/* Выведи rolls, минимум и максимум: */
```

<details>
<summary>Подсказка и решение</summary>

```js
'use strict';

/*
  Формула с (max + 1 - min) и Math.floor даёт каждому целому числу
  равный интервал шириной 1 (Math.round урезал бы шансы крайних чисел вдвое)
*/
const randomInteger = (min, max) => Math.floor(min + Math.random() * (max + 1 - min));

const rolls = [
  randomInteger(1, 6),
  randomInteger(1, 6),
  randomInteger(1, 6),
];

/* Разворачиваем массив спредом ...rolls, иначе Math.min / Math.max вернут NaN */
console.log(rolls);
console.log('Минимум:', Math.min(...rolls));
console.log('Максимум:', Math.max(...rolls));
```

</details>
