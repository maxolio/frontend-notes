# Урок 03. Типы данных, typeof, интерполяция строк и преобразование типов

Суть урока: В JS 8 типов данных (string, number, bigint, boolean, symbol, null, undefined и object); для подстановки в строки используют бэктики ${...}, тип узнают через typeof (typeof null === "object" — баг языка), а типы приводят через String(), Number(), Boolean().

## 1. Строки (string) и интерполяция в обратных кавычках (00:39–02:04)

[+] Одинарные ('...') и двойные ("...") кавычки равны, но переносы строк в них запрещены. Обратные кавычки (бэктики `...`) умеют и многострочность, и интерполяцию ${...} — вставку переменных и любых выражений внутрь строки.

```js
const greeting = 'Привет';
const name = 'Александр';
const message = `${greeting}, ${name}!`; /* интерполяция вместо склейки через + */
const a = 5, b = 10;
console.log(`Сумма a и b равна ${a + b}`); /* Сумма a и b равна 15 */
```

## 2. Числа (Number), NaN, Infinity и сверхбольшие BigInt (02:05–04:45)

[+] Тип number хранит целые и дробные числа. Безопасная точность — примерно до ±9 квадриллионов; для больших целых есть BigInt (суффикс n, смешивать с number нельзя). Разряды удобно разделять нижним подчёркиванием _ (на вычисления не влияет).

```js
console.log('текст' / 2); /* NaN (typeof NaN === 'number'!), заразен в операциях */
console.log(NaN === NaN); /* false! NaN не равен сам себе -> проверяют Number.isNaN() */
console.log(1 / 0);       /* Infinity; а -1 / 0 -> -Infinity */
console.log(0.1 + 0.2);   /* 0.30000000000000004 (дробная память IEEE 754) */

const bigNum = 9007199254740991n + 2n; /* BigInt: суффикс n обязателен у обоих чисел! */
const price = 1_000_000; /* подчёркивание _ для удобного чтения разрядов */
```

## 3. boolean, null, undefined, object и оператор typeof (04:46–08:28)

[+] Все типы кроме object — примитивы. null ставит сам разработчик («пока пусто»), а undefined значит «значение не присвоено» (вручную лучше ставить null). Оператор typeof возвращает тип в виде строки.

```js
const isChild = 11 < 18; /* boolean: true или false */
let userData = null;     /* null — намеренная пустота (например, до ответа сервера) */
let notAssigned;         /* undefined — переменная объявлена без значения */

console.log(typeof 100);       /* "number" */
console.log(typeof 100n);      /* "bigint" */
console.log(typeof undefined); /* "undefined" */
console.log(typeof null);      /* "object" — исторический БАГ языка JS! */
console.log(typeof [1, 2]);    /* "object" — массивы тоже объекты */
console.log(typeof alert);     /* "function" — спец. удобство typeof (на деле object) */
```

## 4. Неявное и явное преобразование типов (08:29–13:32)

[!] Оператор + со строкой склеивает в строку, а -, *, / пытаются превратить строки в числа — смешивать типы неявно считается плохой практикой. Надёжнее приводить явно через глобальные функции String(), Number() и Boolean().

```js
console.log(111 + '222');  /* '111222' (string) — при + число стало строкой */
console.log('16' / '8');   /* 2 (number) — деление превратило строки в числа */

console.log(String(11));   /* "11"; любой объект -> "[object Object]" */
console.log(Number('10')); /* 10; строка с буквой '10px' -> NaN */
console.log(Number('   '));/* 0! пробелы по краям обрезаются (пустая строка -> 0) */
console.log(Number(true), Number(false));      /* 1 и 0 */
console.log(Number(null), Number(undefined));  /* ВНИМАНИЕ: 0 и NaN! */

/* Все 8 Falsy-значений: false, 0, -0, 0n, "", null, undefined, NaN (иначе -> true) */
console.log(Boolean('0'), Boolean(' ')); /* true! непустая строка всегда true */
console.log(Boolean(0), Boolean(''));    /* false */
```

## 3 главные ловушки урока (чек-лист для повторения)

1. Думать, что typeof null вернёт "null" — всегда возвращает "object" (официальный баг JS); и не забывать скобки, проверяя выражение: typeof (1 + "2").

2. Ждать от Boolean("0") или Boolean(" ") значения false — любая строка даже с одним пробелом даёт true (false даёт только пустая строка "").

3. Путать Number(null) (даёт 0) и Number(undefined) (даёт NaN), а также складывать BigInt (10n) с обычным числом (5) без суффикса n.
