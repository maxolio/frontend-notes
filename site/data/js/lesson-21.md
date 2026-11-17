# Урок 21. Обработка ошибок в JS: try, catch, finally и throw

Суть урока: try...catch ловит ошибки времени выполнения и не даёт скрипту упасть целиком; throw new Error() создаёт свою ошибку вручную, а finally выполняется всегда.

## 1. Конструкция try...catch: перехват ошибок (00:22 – 03:04)

```js
/* Без try...catch любая ошибка обрушит скрипт и код после неё не выполнится.
   В try пишем опасный код; в catch (error) — что делать, если возникла ошибка: */
console.log('Начало кода');

try {
  const names = undefined;
  names.forEach((n) => console.log(n)); // Здесь возникнет TypeError!
  console.log('Эта строка НЕ выполнится'); // При ошибке try сразу прерывается!
} catch (error) { // Параметр (error) опционален — если детали не нужны, можно просто catch {}
  console.log('Возникла ошибка:', error);
}

console.log('Конец кода'); // Выполнится в ЛЮБОМ случае — скрипт не упал!
```

## 2. Что try...catch НЕ ловит: синтаксис и асинхронный код (03:05 – 04:43)

```js
/* 1. ОШИБКИ ПАРСИНГА (SyntaxError в самом JS-коде):
   Если в файле есть невалидный JS (например, сломанная скобка), движок не сможет даже
   прочитать файл до запуска — весь скрипт не выполнится, try...catch не спасёт! */

/* 2. АСИНХРОННЫЙ КОД (например, setTimeout):
   Снаружи НЕ поймает, т.к. к срабатыванию таймера через 3 сек try...catch уже завершится: */
// try { setTimeout(() => noSuchFn(), 3000); } catch (e) {}  <- НЕ СРАБОТАЕТ!

/* ПРАВИЛЬНО — поместить try...catch ВНУТРЬ колбэка асинхронной функции: */
setTimeout(() => {
  try {
    noSuchFn();
  } catch (error) {
    console.log('Поймали ошибку внутри таймера!');
  }
}, 3000);
```

## 3. Объект ошибки error: свойства name, message и stack (04:44 – 06:02)

```js
try {
  JSON.parse('{ "age": 28, }'); // Ошибка JSON (висячая запятая)
} catch (error) {
  /* error — это объект с 3 главными свойствами: */
  console.log(error.name);    // Имя/тип ошибки: 'SyntaxError' (или TypeError, ReferenceError)
  console.log(error.message); // Пояснение: причина ошибки текстом
  console.log(error.stack);   // Стек вызовов: файл, строка, колонка и цепочка вызовов
}
```

## 4. Свои ошибки через throw и классы Error (06:03 – 09:47)

```js
/* Бывают ситуации, когда синтаксически всё чисто, но данных нет (логическая ошибка).
   Оператор throw ('бросить') вручную перебрасывает выполнение в catch: */
const userJson = '{ "age": 28 }'; // С сервера пришло без обязательного поля name!

try {
  const user = JSON.parse(userJson);
  if (!user.name) {
    /* Можно throw 'строка', но ПРАВИЛЬНО бросать экземпляр класса Error (или TypeError,
       SyntaxError, RangeError) — тогда у ошибки будут все 3 поля: name, message, stack! */
    throw new Error('Имя пользователя не заполнено');
  }
} catch (error) {
  console.log(error.name, error.message); // 'Error' 'Имя пользователя не заполнено'
}

/* Свой класс ошибки + Проброс неизвестной ошибки (Rethrowing): */
class ValidationError extends Error {
  constructor(message) { super(message); this.name = 'ValidationError'; }
}
try {
  throw new ValidationError('Неверный email');
} catch (err) {
  if (err instanceof ValidationError) { console.log(err.message); }
  else { throw err; } // Чужую/неизвестную ошибку (напр. опечатку) пробрасываем дальше!
}
```

## 5. Блок finally — выполняется при любом раскладе (09:48 – 10:30)

```js
try {
  console.log('Пробуем выполнить код...');
} catch (error) {
  console.log('Обработали ошибку:', error.message);
} finally {
  /* Опциональный блок: выполнится ВСЕГДА самым последним (даже перед return внутри try!).
     Можно писать и try...finally (без catch), если ошибку ловить не нужно, а уборку — надо. */
  console.log('Блок finally выполнился');
}

/* Глобальный перехват всех непойманных ошибок в браузере (для логов на сервер): */
window.onerror = (message, url, line, col, error) => console.log('Глобально:', message);
```

## 6. Смысл отлова ошибок: когда нужен, когда вреден и как всплывает

• Зачем нужен: это подушка безопасности, чтобы из-за сбоя (например, сервер прислал битый JSON) сайт не умер намертво, а показал понятное сообщение и продолжил работать.

• Когда применять: всегда на границе с «внешним миром» — fetch (сеть), JSON.parse, localStorage, доступ к камере/буферу обмена.

• Когда НЕЛЬЗЯ: не прячь в try...catch свои же ошибки в логике (опечатки, undefined) и не пиши пустой catch {} — свои баги чинят через if, ?. и ??.

• Всплытие по функциям: если funcA() вызвала funcB(), а ошибка упала внутри funcB(), она сама поднимется вверх к ближайшему try...catch вокруг funcA().

## 3 главные ловушки урока (чек-лист для повторения)

1. Оборачивать в try...catch сам setTimeout снаружи — ошибка внутри таймера возникнет позже, когда try...catch уже закончил работу (ставь try...catch внутри колбэка).

2. Ожидание, что try продолжится после ошибки или спасёт от опечатки — после ошибки внутри try строки ниже не выполнятся, а синтаксический брак не даст файлу даже запуститься.

3. Бросать строку throw "текст" вместо throw new Error("текст") — без new Error(...) в catch не будет свойств name, message и стека вызовов stack.

## Вопросы для закрепления

**1. В каком порядке сработают инструкции при вызове `test()` и чем `finally` лучше обычного кода после `try...catch`?**

```js
function test() {
  try {
    return 'Результат из try';
  } finally {
    console.log('Сработал finally');
  }
  console.log('Код после блока');
}
```

<details>
<summary>Показать ответ</summary>

Сначала выведется **`'Сработал finally'`**, и только потом функция вернёт **`'Результат из try'`**, а строка `'Код после блока'` вообще никогда не выполнится. Блок `finally` гарантированно запускается **даже перед выходом по `return`** и даже если из `catch` ошибку пробросили дальше наверх через `throw` — тогда как код после `try...catch` при `return` или `throw` не сработает.

</details>

**2. Почему `try...catch` не поймает ошибку ни в таймере `setTimeout`, ни при сломанном синтаксисе в файле?**

```js
/* Случай 1: */
try {
  setTimeout(() => { unknownFn(); }, 100);
} catch (err) {
  console.log('Поймали:', err.message);
}

/* Случай 2: const x = {{{; (сломанный JS-код) */
```

<details>
<summary>Показать ответ</summary>

1. **В таймере:** `try...catch` работает синхронно — он ставит таймер и сразу заканчивается, пока функция внутри ещё не запускалась. Через 100 мс колбэк сработает уже без защиты (ловить надо, поставив `try...catch` **внутрь** стрелки `setTimeout`).
2. **В синтаксисе:** если в файле есть ошибка парсинга (`SyntaxError`), движок не сможет даже прочитать код до запуска — ни одна строка скрипта, включая сам `try...catch`, не выполнится.

</details>

**3. Почему плохо бросать ошибку строкой (`throw 'Ошибка'`) и писать пустой блок `catch {}`?**

<details>
<summary>Показать ответ</summary>

При `throw 'Ошибка'` в `catch (err)` попадёт обычная строка без `err.name` и без стека вызовов `err.stack` — потом почти невозможно найти, где именно упал код (поэтому бросают `new Error(...)` или свои подклассы). А пустой `catch {}` молча прячет даже случайные баги программиста вроде опечаток (`ReferenceError`), превращая их в незаметные поломки — чужие ошибки нужно пробрасывать дальше через `throw err`.

</details>

## Задачи

**Задача 1. Безопасный парсер `safeParseJson` и перехват ошибки внутри таймера**

Напиши функцию `safeParseJson(jsonString, fallback = null)`, которая в `try...catch` парсит строку через `JSON.parse`: при успехе возвращает данные, при ошибке выводит `err.name` и `err.message` в консоль и возвращает `fallback`. Ниже также исправь таймер `setTimeout`, чтобы ошибка `'Ошибка внутри таймера'` реально перехватывалась.

```js
'use strict';

/* Твоё решение: напиши safeParseJson и перенеси try/catch внутрь таймера */

try {
  setTimeout(() => {
    throw new Error('Ошибка внутри таймера');
  }, 50);
} catch (err) {
  console.log('Поймано снаружи:', err.message);
}

console.log(safeParseJson('{"ok":true}'));    /* { ok: true } */
console.log(safeParseJson('{bad json}', {})); /* {} + сообщение об ошибке */
```

<details>
<summary>Подсказка и решение</summary>

```js
'use strict';

function safeParseJson(jsonString, fallback = null) {
  try {
    /* На границе с внешними данными JSON.parse всегда оборачиваем в try...catch */
    return JSON.parse(jsonString);
  } catch (err) {
    console.log(`Ошибка JSON (${err.name}): ${err.message}`);
    return fallback;
  }
}

/*
  try...catch обязан находиться ВНУТРИ асинхронного колбэка setTimeout,
  чтобы быть активным в момент его запуска через 50 мс
*/
setTimeout(() => {
  try {
    throw new Error('Ошибка внутри таймера');
  } catch (err) {
    console.log('Поймано внутри таймера:', err.message);
  }
}, 50);

console.log(safeParseJson('{"ok":true}'));    /* { ok: true } */
console.log(safeParseJson('{bad json}', {})); /* {} */
```

</details>

**Задача 2. Свой класс `FormatError extends SyntaxError` и гарантия `finally`**

Создай класс ошибки `FormatError`, унаследованный от `SyntaxError` (в конструкторе вызови `super(message)` и задай `this.name = 'FormatError'`). Затем напиши функцию `parsePrice(raw)` с блоком `try...catch...finally`: если строка `raw` не начинается со знака `'$'`, выброси `new FormatError('Цена должна начинаться с $')`; иначе извлеки число после `'$'` и верни его (при `NaN` или `<= 0` выброси `new Error('Некорректное число')`). В `catch` выведи ошибку и верни `null`, а в `finally` всегда печатай `'Проверка цены завершена'`.

```js
'use strict';

/* Твоё решение: */

const errSample = new FormatError('тест');
console.log(errSample instanceof FormatError); /* true */
console.log(errSample instanceof SyntaxError); /* true */

console.log(parsePrice('$120')); /* лог из finally -> 120 */
console.log(parsePrice('120'));  /* лог ошибки, лог finally -> null */
```

<details>
<summary>Подсказка и решение</summary>

```js
'use strict';

class FormatError extends SyntaxError {
  constructor(message) {
    /* super(message) передаёт текст в SyntaxError/Error и формирует stack */
    super(message);
    this.name = 'FormatError';
  }
}

function parsePrice(raw) {
  try {
    if (typeof raw !== 'string' || !raw.startsWith('$')) {
      throw new FormatError('Цена должна начинаться с $');
    }

    const num = Number(raw.slice(1));
    if (!Number.isFinite(num) || num <= 0) {
      throw new Error('Некорректное число');
    }

    /* return сработает только ПОСЛЕ выполнения блока finally */
    return num;
  } catch (err) {
    console.log(`${err.name}: ${err.message}`);
    return null;
  } finally {
    console.log('Проверка цены завершена');
  }
}

const errSample = new FormatError('тест');
console.log(errSample instanceof FormatError); /* true */
console.log(errSample instanceof SyntaxError); /* true */

console.log(parsePrice('$120')); /* 'Проверка цены завершена' -> 120 */
console.log(parsePrice('120'));  /* 'FormatError: ...' -> 'Проверка...' -> null */
```

</details>

**Задача 3. Фильтрация и проброс неизвестной ошибки (`Rethrowing`)**

Реализуй функцию `readUserAge(json, simulateBug = false)`:
1) Внутри `try` распарси JSON и проверь, что `user.age` — число (иначе выброси `new ValidationError('Некорректный возраст')`); при `simulateBug === true` вызови несуществующую функцию `noSuchFn()` для имитации бага в коде.
2) В `catch (err)` обработай только ожидаемые ошибки данных (`err instanceof ValidationError || err instanceof SyntaxError`) — выведи сообщение и верни `null`. **Любую другую ошибку** пробрось дальше через `throw err` и поймай её во внешнем `try...catch`.

```js
'use strict';

class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
  }
}

/* Твоё решение: */
function readUserAge(json, simulateBug = false) {
  /* ... */
}

console.log(readUserAge('{"age": 25}'));   /* 25 */
console.log(readUserAge('{"name": "A"}')); /* 'Ошибка данных...' -> null */

/* Проверка проброса неизвестной ошибки во внешний try...catch: */
```

<details>
<summary>Подсказка и решение</summary>

```js
'use strict';

class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
  }
}

function readUserAge(json, simulateBug = false) {
  try {
    if (simulateBug) noSuchFn(); /* вызовет ReferenceError (баг кода, не данных) */

    const user = JSON.parse(json);
    if (typeof user.age !== 'number' || Number.isNaN(user.age)) {
      throw new ValidationError('Поле age должно быть числом');
    }

    return user.age;
  } catch (err) {
    /* Ловим ТОЛЬКО знакомые ошибки входных данных и битый JSON */
    if (err instanceof ValidationError || err instanceof SyntaxError) {
      console.log(`Ошибка данных (${err.name}): ${err.message}`);
      return null;
    }

    /* Чужую/неизвестную ошибку не прячем — пробрасываем наверх через throw */
    throw err;
  }
}

console.log(readUserAge('{"age": 25}'));   /* 25 */
console.log(readUserAge('{"name": "A"}')); /* Ошибка данных -> null */

try {
  /* Ошибка изнутри readUserAge пролетит через её catch во внешний перехватчик */
  readUserAge('{"age": 25}', true);
} catch (err) {
  console.log(`Критическая ошибка программы (${err.name}): ${err.message}`);
}
```

</details>
