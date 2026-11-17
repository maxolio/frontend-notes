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

## Вопросы для закрепления

**1. Что выведется в консоль в каждой из трёх строк (классическая ловушка шаблонной строки)?**

```js
const name = 'Илья';

console.log(`Привет, ${1}`);
console.log(`Привет, ${'name'}`);
console.log(`Привет, ${name}`);
```

<details>
<summary>Показать ответ</summary>

1. `'Привет, 1'` — число `1` вычисляется внутри `${...}` и преобразуется в строку.
2. `'Привет, name'` — внутри `${...}` записан строковый литерал `'name'` в кавычках, поэтому движок подставляет сам текст `name`, а не переменную.
3. `'Привет, Илья'` — здесь уже указано имя переменной без кавычек, поэтому подставляется её значение.

</details>

**2. Что вернёт `typeof` в этих трёх строках и почему последний результат часто путает новичков?**

```js
console.log(typeof null);
console.log(typeof ('текст' / 2));
console.log(typeof 100 + '5');
```

<details>
<summary>Показать ответ</summary>

1. `'object'` — исторический баг JS: сам `null` является примитивом, но `typeof null` всегда возвращает `'object'`.
2. `'number'` — `'текст' / 2` даёт `NaN`, а `NaN` в языке относится к числовому типу `number`.
3. `'number5'` — оператор `typeof` имеет более высокий приоритет, чем `+`. Сначала вычисляется `typeof 100` (`'number'`), а затем к строке `'number'` приклеивается `'5'`. Чтобы проверить тип результата сложения, нужны скобки: `typeof (100 + '5')`.

</details>

**3. Почему `Number(null)` и `Number(undefined)` дают разные результаты, а `Boolean('0')` возвращает `true`?**

<details>
<summary>Показать ответ</summary>

При явном приведении к числу `null` превращается в `0`, а `undefined` — в `NaN` (при этом пустая строка или строка из одних пробелов `'   '` тоже даёт `0`). Логическое `Boolean('0')` возвращает `true`, потому что `'0'` — непустая строка: к `false` приводятся ровно 8 Falsy-значений (`false`, `0`, `-0`, `0n`, `""`, `null`, `undefined`, `NaN`), а любая строка даже с одним символом вроде `'0'` или пробела `' '` даёт `true`.

</details>

## Задачи

**Задача 1. Подсчёт суммы и шаблонная строка**

Из формы пришли две строковые цены `firstPrice` и `secondPrice`. Исправь расчёт так, чтобы вместо склейки строк числа честно сложились, и выведи в консоль через обратные кавычки строку `Итого: 3100 руб.`, а отдельной строкой — тип переменной `total`.

```js
'use strict';

const firstPrice = '1200';
const secondPrice = '350';
const count = 2;

/* Твоё решение: */
const total = (firstPrice + secondPrice) * count;
console.log('Итого: ' + total + ' руб.');
```

<details>
<summary>Подсказка и решение</summary>

```js
'use strict';

const firstPrice = '1200';
const secondPrice = '350';
const count = 2;

/*
  Оператор + со строкой склеивает их ('1200350'), а не складывает.
  Приводим обе строки к числу явно через Number(), чтобы получить 1550 * 2 = 3100
*/
const total = (Number(firstPrice) + Number(secondPrice)) * count;

/*
  Обратные кавычки поддерживают интерполяцию ${...} — значение total
  автоматически подставится в строку без громоздкой склейки через +
*/
console.log(`Итого: ${total} руб.`);
console.log(typeof total); /* выведет: "number" */
```

</details>

**Задача 2. Почини `BigInt`, сложение и проверку на `NaN`**

Сейчас этот код падает при сложении большого числа, склеивает строку вместо математики и неправильно проверяет `NaN`. Исправь три выражения после комментария так, чтобы в консоль вывелись `10000000000000005n`, `50` и `true`.

```js
'use strict';

const rawInput = '42';
const brokenResult = 'abc' / 2;

/* Твоё решение: */
const totalBig = 10_000_000_000_000_000n + 5;
const sum = rawInput + 8;
const isBroken = brokenResult === NaN;

console.log(totalBig);
console.log(sum);
console.log(isBroken);
```

<details>
<summary>Подсказка и решение</summary>

```js
'use strict';

const rawInput = '42';
const brokenResult = 'abc' / 2;

/*
  BigInt нельзя смешивать с обычным number (будет TypeError):
  суффикс n обязателен у обоих слагаемых
*/
const totalBig = 10_000_000_000_000_000n + 5n;

/*
  Явно переводим '42' в число через Number(), чтобы + выполнил
  математическое сложение, а не склейку в строку '428'
*/
const sum = Number(rawInput) + 8;

/*
  NaN никогда не равен сам себе (NaN === NaN даёт false),
  поэтому единственная надёжная проверка — Number.isNaN()
*/
const isBroken = Number.isNaN(brokenResult);

console.log(totalBig); /* 10000000000000005n */
console.log(sum);      /* 50 */
console.log(isBroken); /* true */
```

</details>

**Задача 3. Явное приведение и Falsy-ловушки**

Приведи входные данные к нужному типу через `Number()` и `Boolean()`, чтобы увидеть разницу между пробельной строкой числа, `null`, `undefined` и непустой строкой `'0'`. Замени `null` в заготовках на правильные вызовы и выведи значения.

```js
'use strict';

const rawAge = '  24  ';
const rawFlag = '0';
const userDiscount = null;
let notSet;

/* Твоё решение: */
const age = null;
const discountFromNull = null;
const discountFromUndefined = null;
const flagBool = null;

console.log(age, typeof age);
console.log(discountFromNull, discountFromUndefined);
console.log(flagBool, typeof flagBool);
```

<details>
<summary>Подсказка и решение</summary>

```js
'use strict';

const rawAge = '  24  ';
const rawFlag = '0';
const userDiscount = null;
let notSet;

/*
  Number() автоматически обрезает пробелы по краям строки,
  поэтому '  24  ' корректно превратится в число 24
*/
const age = Number(rawAge);

/*
  Важная разница: при приведении к числу null даёт 0,
  а неинициализированный undefined превращается в NaN
*/
const discountFromNull = Number(userDiscount);
const discountFromUndefined = Number(notSet);

/*
  Строка '0' — непустая (в ней есть символ), поэтому Boolean('0')
  вернёт true, в отличие от числа 0 или пустой строки ''
*/
const flagBool = Boolean(rawFlag);

console.log(age, typeof age);                       /* 24 "number" */
console.log(discountFromNull, discountFromUndefined); /* 0 NaN */
console.log(flagBool, typeof flagBool);             /* true "boolean" */
```

</details>
