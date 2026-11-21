# Практика 1. Задачи по основам, функциям, объектам и строкам (уроки 01–14)

<details>
<summary>📦 1. База, типы и условия (уроки 01–06)</summary>

<details>
<summary>🟢 Лёгкие задачи</summary>

*Задачи скоро добавим.*

</details>

<details>
<summary>🟡 Средние задачи</summary>

*Задачи скоро добавим.*

</details>

</details>

<details>
<summary>📦 2. Циклы и функции (уроки 07–09)</summary>

<details>
<summary>🟢 Лёгкие задачи</summary>

<details>
<summary>🧩 Задача 1. Сумма чисел от 1 до n</summary>

**Темы для повторения:** Урок 07 (цикл `for`), Урок 08 (функции, параметры, `return`), Урок 05 (`||` vs `&&`).  
**Сложность:** 🟢 Лёгкая

### Что нужно сделать
Напиши функцию `sumUpTo(n)`, которая с помощью цикла `for` складывает все целые числа от `1` до `n` включительно и возвращает сумму.
- Если в `n` передали не целое число, не число или число меньше `1` (например, `0`, `-3`, `'abc'`), функция должна вернуть `0`.

### Шаблон для копирования
```js
'use strict';

function sumUpTo(n) {
  /* Твоё решение: */
}

console.log(sumUpTo(5));     // Должно вывести: 15 (1 + 2 + 3 + 4 + 5)
console.log(sumUpTo(1));     // Должно вывести: 1
console.log(sumUpTo(0));     // Должно вывести: 0
console.log(sumUpTo('abc')); // Должно вывести: 0
```

<details>
<summary>Раскрыть решение</summary>

### Вариант 1 (защита входа через `||` + цикл `for`)
```js
'use strict';

function sumUpTo(n) {
  /* Отсекаем плохие значения через ИЛИ (||): достаточно хотя бы одного условия:
     1. typeof n !== 'number' — не число
     2. !Number.isInteger(n) — дробное или NaN
     3. n < 1 — ноль или отрицательное */
  if (typeof n !== 'number' || !Number.isInteger(n) || n < 1) {
    return 0;
  }

  let sum = 0;

  /* Проходим по всем числам от 1 до n включительно и накапливаем сумму */
  for (let i = 1; i <= n; i++) {
    sum += i;
  }

  return sum;
}

/* Пояснение ловушки && vs ||:
   Нельзя писать if (typeof n !== 'number' && n <= 0 && Number.isInteger(n)):
   значение не может быть НЕ числом и целым числом одновременно — такое условие
   никогда не сработает. Для отсеивания ошибок на входе всегда используют ||. */
```

### Вариант 2 (математическая формула без цикла)
```js
'use strict';

function sumUpTo(n) {
  if (typeof n !== 'number' || !Number.isInteger(n) || n < 1) {
    return 0;
  }

  /* Формула арифметической прогрессии от 1 до n работает мгновенно при любом n */
  return (n * (n + 1)) / 2;
}
```

</details>

</details>

<details>
<summary>🧩 Задача 2. Сколько чётных чисел от 1 до n</summary>

**Темы для повторения:** Урок 07 (цикл `for`), Урок 08 (функции, параметры, `return`), Урок 04 (остаток от деления `%`).  
**Сложность:** 🟢 Лёгкая

### Что нужно сделать
Напиши функцию `countEven(n)`, которая с помощью цикла `for` проходит от `1` до `n` включительно и **считает, сколько среди них чётных чисел** (делятся на 2 без остатка).
- Если `n` не число, дробное или меньше `1` — функция должна вернуть `0`.

### Шаблон для копирования
```js
'use strict';

function countEven(n) {
  /* Твоё решение: */
}

console.log(countEven(6));   // Должно вывести: 3 (это 2, 4, 6)
console.log(countEven(1));   // Должно вывести: 0
console.log(countEven(-4));  // Должно вывести: 0
```

<details>
<summary>Раскрыть решение</summary>

### Вариант 1 (классический цикл `for` со счётчиком)
```js
'use strict';

function countEven(n) {
  /* Отсекаем не числа, дробные, NaN и числа меньше 1 */
  if (typeof n !== 'number' || !Number.isInteger(n) || n < 1) {
    return 0;
  }

  /* Используем обычный счётчик вместо массива: экономит память и проще читается */
  let count = 0;

  for (let i = 1; i <= n; i++) {
    /* Оператор % возвращает остаток от деления; у чётных чисел он всегда 0 */
    if (i % 2 === 0) {
      count += 1;
    }
  }

  /* Возвращаем именно число, чтобы результат можно было использовать в расчётах */
  return count;
}
```

### Вариант 2 (цикл `for` с шагом `+2`, без `if` внутри)
```js
'use strict';

function countEven(n) {
  if (typeof n !== 'number' || !Number.isInteger(n) || n < 1) {
    return 0;
  }

  let count = 0;

  /* Начинаем сразу с первого чётного числа (2) и прыгаем через одно (i += 2) */
  for (let i = 2; i <= n; i += 2) {
    count += 1;
  }

  return count;
}
```

</details>

</details>

</details>

<details>
<summary>🟡 Средние задачи</summary>

*Задачи скоро добавим.*

</details>

</details>

<details>
<summary>📦 3. Объекты и this (уроки 10–12)</summary>

<details>
<summary>🟢 Лёгкие задачи</summary>

*Задачи скоро добавим.*

</details>

<details>
<summary>🟡 Средние задачи</summary>

*Задачи скоро добавим.*

</details>

</details>

<details>
<summary>📦 4. Числа и строки (уроки 13–14)</summary>

<details>
<summary>🟢 Лёгкие задачи</summary>

*Задачи скоро добавим.*

</details>

<details>
<summary>🟡 Средние задачи</summary>

<details>
<summary>🧩 Задача 1. Проверка комментария на пробелы и запрещённые символы</summary>

### Что нужно сделать
Представь, что ты проверяешь комментарий пользователя перед публикацией. Напиши функцию `analyzeText(text, forbiddenChar = '!')`, которая:

1. **Защищается от пустоты:** если в `text` передали `null` или `undefined` (комментария нет), считает, что там пустая строка `''`.
2. **Считает статистику по символам** (проходит по строке циклом `for` от первого символа до последнего):
   - сколько раз встретился пробел `' '`;
   - сколько раз встретился запрещённый символ `forbiddenChar` (большие и маленькие буквы считаем одинаковыми, например `'А'` и `'а'` — это один и тот же символ).
3. **Возвращает результат** в виде объекта с тремя полями:
   - `length` — общая длина строки,
   - `spaces` — количество пробелов,
   - `forbiddenCount` — сколько раз встретился запрещённый символ.

### Шаблон для копирования
```js
'use strict';

function analyzeText(text, forbiddenChar = '!') {
  /* Твоё решение: */
}

console.log(analyzeText('Привет, Мир! Как дела?!', '!'));
/* Должно вернуть: { length: 23, spaces: 3, forbiddenCount: 2 } */

console.log(analyzeText(null, 'а'));
/* Должно вернуть: { length: 0, spaces: 0, forbiddenCount: 0 } */
```

<details>
<summary>Раскрыть решение</summary>

### Вариант 1 (классический цикл `for`)
```js
'use strict';

function analyzeText(text, forbiddenChar = '!') {
  /* Оператор ?? заменяет только null и undefined на '', не трогая другие значения */
  const textResult = text ?? '';
  const textLength = textResult.length;

  /* Выносим приведение к нижнему регистру до цикла, чтобы не делать его на каждом шаге */
  const targetChar = forbiddenChar.toLowerCase();

  let spaces = 0;
  let forbiddenCount = 0;

  /* Цикл for проходит по индексам строки от 0 до последнего символа */
  for (let i = 0; i < textResult.length; i++) {
    const char = textResult[i];

    if (char === ' ') {
      spaces += 1;
    }

    /* Сравниваем текущий символ тоже в нижнем регистре, чтобы 'А' и 'а' совпадали */
    if (char.toLowerCase() === targetChar) {
      forbiddenCount += 1;
    }
  }

  /* Сокращённая запись свойств: spaces: spaces и forbiddenCount: forbiddenCount */
  return { length: textLength, spaces, forbiddenCount };
}

/* Пояснение:
   1. text ?? '' страхует от ошибки при чтении .length у null/undefined.
   2. Оба сравниваемых символа (char и forbiddenChar) приводятся к lowerCase,
      иначе заглавная буква в тексте не совпала бы с маленькой в forbiddenChar. */
```

### Вариант 2 (через цикл `for..of` и единый нижний регистр)
```js
'use strict';

function analyzeText(text, forbiddenChar = '!') {
  /* Сразу приводим всю строку и искомый символ к нижнему регистру один раз */
  const normalized = (text ?? '').toLowerCase();
  const target = forbiddenChar.toLowerCase();

  let spaces = 0;
  let forbiddenCount = 0;

  /* for..of сразу даёт каждый символ строки без индекса i */
  for (const char of normalized) {
    if (char === ' ') {
      spaces += 1;
    } else if (char === target) {
      forbiddenCount += 1;
    }
  }

  return {
    length: normalized.length,
    spaces,
    forbiddenCount,
  };
}

/* Пояснение:
   1. Выражение (text ?? '').toLowerCase() сразу безопасно готовит строку.
   2. else if логично разделяет ветки: если символ — пробел (и target не пробел),
      второе условие проверять уже не нужно.
   3. Цикл for..of читается короче, когда индекс i внутри тела не используется. */
```

</details>

</details>

</details>

</details>

<details>
<summary>📦 5. Тяжёлые комплексные задачи (все темы 01–14)</summary>

<details>
<summary>🧩 Задача 1. Корзина с цепочкой вызовов и защитой this</summary>

**Темы для повторения:** Урок 08–09 (стрелочные функции), Урок 10–11 (объекты и методы), Урок 12 (`this`, потеря контекста и `.bind()`).

### Что нужно сделать
У нас есть объект корзины `cart` со свойством `total: 0` и функция `runLater(fn)`, которая имитирует отложенный вызов (например, запуск колбэка при клике на кнопку).

Допиши объект `cart` и вызов `runLater` так, чтобы:
1. Метод `add(price)` прибавлял `price` к `this.total` и возвращал `this` — это позволит вызывать методы цепочкой (`cart.add(100).add(50)`).
2. Метод `printTotal()` выводил в консоль строку: `Итого: <сумма>` (с двумя знаками после запятой через `.toFixed(2)`).
3. Вызов `runLater(...)` запускал `cart.printTotal()` **без потери контекста** `this`, чтобы в консоли вывелось `Итого: 150.00`, а не ошибка `undefined`.

### Шаблон для копирования
```js
'use strict';

const cart = {
  total: 0,

  /* 1. Допиши метод add(price) с поддержкой цепочки вызовов (return this) */

  /* 2. Допиши метод printTotal(), который выводит: "Итого: 150.00" */
};

function runLater(fn) {
  fn();
}

/* Проверка цепочки вызовов: */
cart.add(100).add(50);

/* 3. Передай cart.printTotal в runLater так, чтобы this не потерялся: */
runLater(/* твой код здесь */);
```

<details>
<summary>Раскрыть решение</summary>

### Вариант 1 (стрелочная функция-обёртка)
```js
'use strict';

const cart = {
  total: 0,

  add(price) {
    /* Прибавляем цену к текущему объекту через this */
    this.total += price;

    /* Возвращаем сам объект cart, чтобы следующий .add() вызвался уже у него */
    return this;
  },

  printTotal() {
    /* .toFixed(2) форматирует число с 2 знаками после запятой (150 -> "150.00") */
    console.log(`Итого: ${this.total.toFixed(2)}`);
  },
};

function runLater(fn) {
  fn();
}

cart.add(100).add(50);

/* Передаём внутрь runLater анонимную стрелочную функцию-обёртку.
   Когда runLater вызовет fn(), запустится тело стрелки, где есть точка:
   cart.printTotal(), поэтому this внутри printTotal указывает на cart. */
runLater(() => cart.printTotal());

/* Пояснение:
   1. Нельзя передавать просто runLater(cart.printTotal): в этом случае передаётся
      «голая» ссылка на функцию без объекта перед точкой, и при вызове fn()
      внутри runLater значение this становится undefined (в строгом режиме).
   2. Цепочка cart.add(100).add(50) работает только потому, что каждый вызов
      add() возвращает this (сам объект cart). */
```

### Вариант 2 (жёсткая привязка через `.bind()`)
```js
'use strict';

const cart = {
  total: 0,

  add(price) {
    this.total += price;
    return this;
  },

  printTotal() {
    console.log(`Итого: ${this.total.toFixed(2)}`);
  },
};

function runLater(fn) {
  fn();
}

cart.add(100).add(50);

/* .bind(cart) НЕ вызывает метод сразу, а создаёт его новую копию,
   у которой контекст this навсегда привязан к объекту cart. */
runLater(cart.printTotal.bind(cart));

/* Пояснение:
   1. В отличие от Варианта 1, здесь нет лишней функции-обёртки: мы сразу
      передаём готовую функцию с зафиксированным контекстом.
   2. Даже если внутри runLater её вызовут просто как fn() без точки,
      движок подставит в качестве this привязанный объект cart. */
```

### Пошаговый разбор: почему не работает и почему работают оба варианта

Представь, что `cart` — это **человек**, а `printTotal` — **инструкция на листочке** («посмотреть в свой кошелёк и назвать сумму»).

#### 1. Почему НЕ работает `runLater(cart.printTotal)`

1. **Шаг 1. Передача в `runLater` без скобок**
   Движок достаёт из `cart` голую функцию и кладёт её в параметр `fn`. Связь с `cart` обрывается — листочек с инструкцией отдали без подписи, чей это кошелёк:
   ```js
   runLater(cart.printTotal);
   // Внутри параметра fn сейчас лежит просто:
   const fn = function printTotal() {
     console.log(`Итого: ${this.total.toFixed(2)}`);
   };
   ```
2. **Шаг 2. Запуск `fn()` внутри `runLater`**
   Движок смотрит влево от `()` — перед `fn` нет объекта с точкой, поэтому в `'use strict'` ставится `this = undefined`:
   ```js
   function runLater(fn) {
     fn(); // точки слева нет -> this = undefined
   }
   ```
3. **Шаг 3. Падение при чтении `this.total`**
   ```js
   console.log(`Итого: ${undefined.total.toFixed(2)}`);
   // TypeError: Cannot read properties of undefined (reading 'total')
   ```

#### 2. Почему работает Вариант 1: `runLater(() => cart.printTotal())`

1. **Шаг 1. Передача стрелки-обёртки в `runLater`**
   В `fn` попадает новая стрелочная функция. Внутри неё `cart.printTotal()` пока не вызывается, а просто ждёт:
   ```js
   runLater(() => cart.printTotal());
   // Внутри параметра fn сейчас лежит обёртка:
   const fn = () => cart.printTotal();
   ```
2. **Шаг 2. Запуск `fn()` внутри `runLater`**
   Вызов `fn()` запускает тело стрелочной функции:
   ```js
   function runLater(fn) {
     fn(); // запускает () => cart.printTotal()
   }
   ```
3. **Шаг 3. Выполнение `cart.printTotal()` внутри стрелки**
   Здесь слева от `printTotal()` **есть объект `cart` и точка**, поэтому `this` равен `cart`:
   ```js
   cart.printTotal(); // слева есть cart. -> this = cart
   ```
4. **Шаг 4. Вывод результата**
   ```js
   console.log(`Итого: ${cart.total.toFixed(2)}`); // "Итого: 150.00"
   ```

#### 3. Почему работает Вариант 2: `runLater(cart.printTotal.bind(cart))`

1. **Шаг 1. Создание привязанной копии через `.bind(cart)`**
   `.bind(cart)` не запускает функцию, а возвращает её копию, где `this` навсегда приклеен к `cart`:
   ```js
   runLater(cart.printTotal.bind(cart));
   // Внутри параметра fn лежит копия с жёстким контекстом:
   const fn = function boundPrintTotal() {
     // внутри this всегда === cart
     console.log(`Итого: ${cart.total.toFixed(2)}`);
   };
   ```
2. **Шаг 2. Запуск `fn()` внутри `runLater`**
   Даже при вызове без точки движок видит привязку от `.bind(cart)` и подставляет `this = cart`:
   ```js
   function runLater(fn) {
     fn(); // точки нет, но срабатывает привязка .bind(cart) -> this = cart
   }
   ```
3. **Шаг 3. Вывод результата**
   ```js
   console.log(`Итого: ${cart.total.toFixed(2)}`); // "Итого: 150.00"
   ```

</details>

</details>

<details>
<summary>🧩 Задача 2. Бонус игрока и «одолженная» функция (.call())</summary>

**Темы для повторения:** Урок 10–11 (объекты и методы), Урок 12 (`this` во вложенных функциях, стрелочные функции и `.call()` / `.apply()`).

### Что нужно сделать
У нас есть два игрока (`player1` и `player2`). У `player1` есть метод `addBonus(points)`, но внутри него спрятана ловушка: обычная функция `applyBonus()` теряет `this`.

Допиши код так, чтобы:
1. Вложенная функция внутри `player1.addBonus(points)` не теряла `this` и увеличивала `this.score` на `points * 2`.
2. Отдельная функция `showInfo(prefix)` выводила в консоль строку: `<prefix>: <имя игрока> — <счёт> очков`.
3. Вызов `showInfo` сработал через `.call(...)` сначала для `player1` (с префиксом `'Игрок 1'`), а затем для `player2` (с префиксом `'Игрок 2'`).

### Шаблон для копирования
```js
'use strict';

const player1 = {
  name: 'Алекс',
  score: 100,

  addBonus(points) {
    /* 1. Почини эту функцию так, чтобы this не терялся: */
    function applyBonus() {
      this.score += points * 2;
    }

    applyBonus();
  },
};

const player2 = {
  name: 'Мария',
  score: 250,
};

/* 2. Допиши функцию showInfo(prefix): */
function showInfo(prefix) {
  /* Твой код здесь */
}

player1.addBonus(25); // должно стать score = 150

/* 3. Вызови showInfo через .call() для player1 и player2: */
```

<details>
<summary>Раскрыть решение</summary>

### Вариант 1 (стрелочная функция внутри метода + `.call()`)
```js
'use strict';

const player1 = {
  name: 'Алекс',
  score: 100,

  addBonus(points) {
    /* У стрелки нет собственного this — она берёт this у метода addBonus,
       а addBonus вызвали через player1.addBonus(25), поэтому this === player1. */
    const applyBonus = () => {
      this.score += points * 2;
    };

    applyBonus();
  },
};

const player2 = {
  name: 'Мария',
  score: 250,
};

/* Обычная function (не стрелка!), чтобы контекст this можно было подменять через .call() */
function showInfo(prefix) {
  console.log(`${prefix}: ${this.name} — ${this.score} очков`);
}

player1.addBonus(25);

/* Первый аргумент .call() задаёт this, следующие аргументы идут в параметры функции */
showInfo.call(player1, 'Игрок 1'); // Игрок 1: Алекс — 150 очков
showInfo.call(player2, 'Игрок 2'); // Игрок 2: Мария — 250 очков

/* Пояснение:
   1. Если бы showInfo была стрелочной функцией, .call(player1, ...) не смог бы
      подменить ей this — стрелка навсегда запоминает внешний контекст.
   2. Метод addBonus не имеет return, поэтому console.log(player1.addBonus(25))
      выведет undefined — результат проверяют через player1.score или showInfo. */
```

### Вариант 2 (обычная функция с `.bind(this)` + `.apply()`)
```js
'use strict';

const player1 = {
  name: 'Алекс',
  score: 100,

  addBonus(points) {
    /* Создаём обычную функцию и сразу привязываем к ней this внешнего метода addBonus */
    const applyBonus = function () {
      this.score += points * 2;
    }.bind(this);

    applyBonus();
  },
};

const player2 = {
  name: 'Мария',
  score: 250,
};

function showInfo(prefix) {
  console.log(`${prefix}: ${this.name} — ${this.score} очков`);
}

player1.addBonus(25);

/* .apply() делает то же самое, что и .call(), но аргументы передаёт массивом */
showInfo.apply(player1, ['Игрок 1']); // Игрок 1: Алекс — 150 очков
showInfo.apply(player2, ['Игрок 2']); // Игрок 2: Мария — 250 очков

/* Пояснение:
   1. .bind(this) фиксирует контекст player1 для вложенной функции ещё до её вызова.
   2. Разница .call(obj, a, b) и .apply(obj, [a, b]) только в способе передачи аргументов. */
```

### Пошаговый разбор: почему внутри метода теряется `this` и как работает `.call()`

#### 1. Почему `function applyBonus()` внутри метода падает
1. **Шаг 1. Вызов `player1.addBonus(25)`**
   Перед точкой стоит `player1`, поэтому внутри `addBonus` значение `this === player1`.
2. **Шаг 2. Вызов `applyBonus()` внутри `addBonus`**
   Обычная функция `applyBonus()` вызывается **без точки слева**:
   ```js
   applyBonus(); // слева нет объекта -> в 'use strict' this = undefined
   ```
   Обычные функции **не наследуют** `this` от внешней функции — они всегда получают его заново в момент вызова.
3. **Шаг 3. Падение при `this.score += ...`**
   Движок пытается прочитать `undefined.score` и падает с `TypeError`.

#### 2. Почему стрелка `const applyBonus = () => ...` спасает
1. **Шаг 1. Создание стрелки внутри `addBonus`**
   У стрелочной функции нет собственного `this`, поэтому она смотрит на `this` внешней функции `addBonus` (а там `this === player1`).
2. **Шаг 2. Вызов `applyBonus()`**
   ```js
   applyBonus(); // внутри стрелки this всё равно равен player1
   ```
   `player1.score` увеличивается на `25 * 2 = 50` и становится `150`.

#### 3. Как работает `showInfo.call(player1, 'Игрок 1')`
1. **Шаг 1. Временная подмена `this`**
   `.call(player1, 'Игрок 1')` берёт функцию `showInfo`, на один вызов подставляет внутрь `this = player1` и передаёт `'Игрок 1'` в параметр `prefix`.
2. **Шаг 2. Выполнение тела `showInfo`**
   ```js
   console.log(`${'Игрок 1'}: ${player1.name} — ${player1.score} очков`);
   // Игрок 1: Алекс — 150 очков
   ```

#### 4. Все 4 способа привязать отдельную функцию к объекту

```js
'use strict';

const player1 = { name: 'Алекс', score: 150 };

function showInfo(prefix) {
  console.log(`${prefix}: ${this.name} — ${this.score} очков`);
}

/* 1. .call() — вызывает функцию СРАЗУ, аргументы через запятую */
showInfo.call(player1, 'Игрок 1');

/* 2. .apply() — вызывает функцию СРАЗУ, аргументы массивом */
showInfo.apply(player1, ['Игрок 1']);

/* 3. .bind() — НЕ вызывает сразу, а возвращает новую функцию с приклеенным this */
const showPlayer1 = showInfo.bind(player1);
showPlayer1('Игрок 1');

/* 4. Положить функцию в свойство объекта и вызвать через точку */
player1.show = showInfo;
player1.show('Игрок 1');
```

*Важно:* все 4 способа работают только с обычной `function showInfo`. Стрелочная функция игнорирует `.call`, `.apply`, `.bind` и вызов через точку.

</details>

</details>

</details>

