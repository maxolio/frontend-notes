# Урок 16. Деструктуризация и продвинутые методы массивов

Суть урока:

- **Методы с колбэками:** вместо ручных циклов `for` массивы перебирают, ищут, фильтруют и преобразуют встроенными методами.
- **Мутация:** почти все методы НЕ меняют исходный массив — исключения вроде `sort` и `reverse`.

## 1. Деструктуризация массива (00:27)

```js
const data = ['Александр', 28];
/* В массивах ПОРЯДОК КРАЙНЕ ВАЖЕН (привязка идёт по индексу)! */
const [name, age] = data; /* name = 'Александр', age = 28 */
/* Если поменять местами [age, name] = data, то age станет 'Александр'! */
const [, second] = ['А', 'Б', 'В'];      /* Пропуск -> second = 'Б' */
const [first, ...rest] = ['А', 'Б', 'В']; /* rest = ['Б', 'В'] */
const [role = 'Гость'] = [];             /* Дефолт только при undefined */
```

## 2. Перебор массива — метод forEach (01:33)

```js
const letters = ['А', 'Б', 'В'];
/*
  Альтернатива обычному for. Колбэк получает 3 параметра В СТРОГОМ ПОРЯДКЕ:
  (текущийЭлемент, индекс, самМассив). Все 3 опциональны (имена любые).
*/
letters.forEach((letter, index, array) => {
  console.log(letter, index, array); /* 'А' 0 [...], 'Б' 1 [...], ... */
});
/* forEach всегда возвращает undefined; break/return его НЕ прерывают! */
```

## 3. Поиск индекса примитива — indexOf и lastIndexOf (04:36)

```js
const prices = [100, 200, 444, 500, 444];
/* Используют строгое ===. Возвращают ИНДЕКС совпадения или -1 (нет). */
prices.indexOf(444);        /* 2 | prices.indexOf(999) -> -1 */
prices.indexOf(444, 3);     /* 4 (начать поиск вправо с индекса 3) */
/* lastIndexOf ищет то же самое, но С КОНЦА (справа налево): */
prices.lastIndexOf(444);    /* 4 */
prices.lastIndexOf(444, 3); /* 2 (начать с индекса 3 и идти ВЛЕВО) */
/* Минус: НЕ ищут объекты (сравнивают ссылки -> -1) и не находят NaN! */
```

## 4. Поиск индекса объекта по условию — findIndex и findLastIndex (06:57)

```js
const users = [
  { name: 'Александр', age: 28, city: 'Москва' },
  { name: 'Василий',   age: 30, city: 'Казань' },
  { name: 'Василий',   age: 40, city: 'Москва' },
];
/*
  Колбэк получает (element, index, array). На первом return true
  перебор останавливается и возвращается ИНДЕКС (если нет -> -1).
*/
const firstIdx = users.findIndex((user) => user.name === 'Василий'); /* 1 */
const lastIdx = users.findLastIndex((user) => user.name === 'Василий');
/* lastIdx === 2 (ищет с конца). Можно и с деструктуризацией: ({ name }) */
```

## 5. Проверка наличия и соответствия — includes, some, every (09:54 – 11:50)

```js
/* includes(item, fromIndex) -> true/false для примитивов (находит NaN): */
prices.includes(500);    /* true */
prices.includes(500, 4); /* false (ищем с 4-го индекса вправо) */
/* Для объектов includes вернёт false (разные ссылки)! Нужен some: */

/* some -> true, если ХОТЯ БЫ ОДИН прошёл проверку (до 1-го true): */
const hasVasiliy = users.some((user) => user.name === 'Василий'); /* true */

/* every -> true, если ВСЕ прошли проверку (до 1-го false): */
const allAdults = users.every((user) => user.age >= 18); /* true */
```

## 6. Получение элемента и фильтрация — find и filter (12:24 – 12:41)

```js
/* find -> САМ ПЕРВЫЙ найденный элемент целиком (или undefined): */
const foundUser = users.find((user) => user.name === 'Василий');

/* filter -> НОВЫЙ МАССИВ со ВСЕМИ подходящими (если нет -> пустой []): */
const filtered = users.filter(
  ({ city, age }) => city === 'Москва' || age < 35
);
/* Если никто не прошёл условие -> filter вернёт [] (НЕ undefined!). */
```

## 7. Преобразование каждого элемента — map (14:28)

```js
/* Возвращает НОВЫЙ массив той же длины из значений, вернувшихся из return: */
const formatted = users.map((user) => `${user.name}, ${user.age} лет`);
/* ['Александр, 28 лет', 'Василий, 30 лет', 'Василий, 40 лет'] */

/*
  ЛОВУШКА: map НЕ мутирует исходный массив! Без сохранения результата
  в переменную (или перезаписи let) операция выполнится впустую!
*/
```

## 8. Перебор с накоплением — reduce и reduceRight (16:58 – 22:48)

```js
/*
  Заменяет цикл с переменной-копилкой. Аргументы: (callback, init).
  В колбэке 4 параметра: (accumulator, element, index, array).
  На 1-м шаге sum = init (0), далее sum = return прошлого шага!
*/
const agesSum = users.reduce((sum, { age }) => sum + age, 0); /* 98 */
const avgAge  = agesSum / users.length;                       /* ~32.6 */

/*
  ЛОВУШКА: без 2-го аргумента (0) в sum попадёт объект users[0],
  и выйдет '[object Object]3040'! А на [] вообще TypeError!
*/

/* reduceRight работает так же, но идёт СПРАВА НАЛЕВО (с конца): */
const reversedAges = users.reduceRight(
  (acc, u) => acc + u.age + ' ',
  ''
); /* '40 30 28 ' */
```

## 9. Переворачивание и сортировка — reverse и sort [МУТИРУЮТ] (23:36 – 24:52)

```js
/*
  ВНИМАНИЕ: reverse() и sort() МЕНЯЮТ исходный массив!
  Чтобы сохранить оригинал, перед вызовом делай копию через [...arr]:
*/
const reversed = [...users].reverse(); /* users остался прежним */

/* ЛОВУШКА sort(): по умолчанию сортирует ВСЕ элементы как СТРОКИ: */
[8, 4, 500].sort(); /* [4, 500, 8] — т.к. строка '500' < '8' ('5' < '8') */

/* Для чисел передавай компаратор (a, b): < 0 (a раньше), > 0 (b раньше): */
const nums = [8, 4, 500];
[...nums].sort((a, b) => a - b); /* [4, 8, 500] (по возрастанию) */
[...nums].sort((a, b) => b - a); /* [500, 8, 4] (по убыванию) */
/*
  Для русских строк с 'ё': [...names].sort((a, b) => a.localeCompare(b)).
  Современные не мутирующие аналоги: arr.toReversed() и arr.toSorted(...).
*/
```

## 10. Изменение середины (splice), уплотнение (flat) и карта мутабельности

```js
/* 1. splice(start, deleteCount, ...items) [МУТИРУЕТ]: */
const tech = ['HTML', 'CSS', 'PHP'];
/* С индекса 2 удалили 1 ('PHP') и вставили 'JS', 'TS': */
const removed = tech.splice(2, 1, 'JS', 'TS');
/* tech -> ['HTML', 'CSS', 'JS', 'TS'] | removed -> ['PHP'] */
/*
  НЕ пиши delete tech[1] — останется пустая дыра (<empty>),
  а tech.length не уменьшится! Используй именно splice().
*/

/* 2. flat(depth) [НЕ МУТИРУЕТ] — выпрямляет вложенные массивы: */
[1, [2, [3, 4]]].flat(1);        /* [1, 2, [3, 4]] (по умолчанию 1) */
[1, [2, [3, 4]]].flat(Infinity); /* [1, 2, 3, 4] (любая глубина) */

/*
  3. Быстрая памятка (МУТИРУЕТ vs НЕ МУТИРУЕТ):
  [!] МЕНЯЮТ оригинал: push, pop, shift, unshift, splice, sort, reverse
  [+] НЕ меняют: slice, concat, flat, map, filter, reduce, toSorted
*/
```

## 3 главные ловушки урока (чек-лист для повторения)

1. Забыть сохранить результат map/filter или забыть 0 в reduce — map/filter без присвоения работают впустую, а reduce без начального значения ломается на объектах и падает на [].

2. Искать объекты через indexOf / includes — они сравнивают ссылки и вернут -1/false; для объектов используй find / findIndex / some.

3. Вызывать sort() без (a, b) => a - b и забывать про мутацию — числа отсортируются как строки (500 перед 8), а sort/reverse испортят исходный массив без [...arr].

## Вопросы для закрепления

**1. Что выведет этот код и почему не сработали ни сортировка чисел, ни досрочная остановка через `return`?**

```js
const nums = [10, 2, 5];
const sorted = nums.sort();

nums.forEach((n) => {
  if (n === 5) return;
  console.log(n);
});

console.log(sorted, nums === sorted);
```

<details>
<summary>Показать ответ</summary>

Выведется `10`, `2`, а затем `[10, 2, 5]` и `true`.
1. Метод `sort()` без функции сравнения сортирует всё как **строки** (`'10' < '2'`), а ещё **мутирует исходный массив** и возвращает ссылку на него же (`nums === sorted`). Для чисел без изменения оригинала пишут `[...nums].sort((a, b) => a - b)`.
2. Внутри `forEach` инструкция `return` пропускает лишь один шаг (как `continue`), а прервать `forEach` досрочно нельзя — для этого используют `for..of`, `some` или `find`.

</details>

**2. Что вернёт `reduce` без второго аргумента на массиве объектов и на пустом массиве `[]`?**

```js
const users = [{ age: 20 }, { age: 30 }];
const badSum = (arr) => arr.reduce((acc, user) => acc + user.age);

console.log(badSum(users));
```

<details>
<summary>Показать ответ</summary>

На `users` вернётся строка **`'[object Object]30'`**, а на пустом массиве `[]` — **`TypeError: Reduce of empty array with no initial value`**. Без второго аргумента в `acc` на первом шаге попадает сам объект `{ age: 20 }`, а при сложении `+ 30` он превращается в `'[object Object]'`. В `reduce` всегда передают начальное значение: `arr.reduce((acc, u) => acc + u.age, 0)`.

</details>

**3. Почему `[{ id: 1 }].includes({ id: 1 })` вернёт `false`, а удалять элемент из массива через `delete arr[1]` — плохая практика?**

<details>
<summary>Показать ответ</summary>

`includes` и `indexOf` сравнивают объекты по **ссылке** (`===`), а два отдельных литерала `{ id: 1 }` лежат по разным адресам в памяти — для поиска объектов используют `find`, `findIndex` или `some`. А `delete arr[1]` не сдвигает соседние элементы и не уменьшает `length`, оставляя в массиве пустую дыру (`empty`) — для честного удаления из середины применяют `arr.splice(1, 1)`.

</details>

## Задачи

**Задача 1. Преобразуй `kebab-case` в `camelCase` (`camelize`)**

Напиши функцию `camelize(str)` через цепочку методов `.split`, `.map`, `.join`:

1. Разбей строку по дефису `-` через `.split('-')`.
2. В `.map((word, index) => ...)`: пустые фрагменты (как ведущий `-` в `'-webkit-transition'`) возвращай как `''`, первое слово (`index === 0`) оставляй в нижнем регистре, а у остальных поднимай первую букву.
3. Склей слова обратно в строку через `.join('')`.

Проверка: `'background-color'` -> `'backgroundColor'`, `'-webkit-transition'` -> `'WebkitTransition'`.

```js
'use strict';

/* Твоё решение: */

console.log(camelize('background-color'));   /* 'backgroundColor' */
console.log(camelize('list-style-image'));   /* 'listStyleImage' */
console.log(camelize('-webkit-transition')); /* 'WebkitTransition' */
```

<details>
<summary>Подсказка и решение</summary>

```js
'use strict';

function camelize(str) {
  return str
    .split('-') /* режем строку на массив слов по разделителю '-' */
    .map((word, index) => {
      /* Защита от пустых фрагментов вроде ведущего '-' */
      if (!word) return '';

      /* Первое слово оставляем как есть, у остальных поднимаем 1-ю букву */
      return index === 0
        ? word.toLowerCase()
        : word[0].toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(''); /* склеиваем обработанные слова обратно в одну строку */
}

console.log(camelize('background-color'));   /* 'backgroundColor' */
console.log(camelize('list-style-image'));   /* 'listStyleImage' */
console.log(camelize('-webkit-transition')); /* 'WebkitTransition' */
```

</details>

**Задача 2. Фильтрация, сортировка без мутации и деструктуризация массива**

Обработай список `users`, не меняя исходный массив:

1. Отфильтруй только активных пользователей (`isActive === true`), отсортируй их по возрасту по возрастанию и забери только массив их имён в `activeNames`.
2. С помощью деструктуризации массива сохрани первое имя в константу `youngestActive`.

Проверка: `activeNames` -> `['Мария', 'Алина', 'Иван']`, `youngestActive` -> `'Мария'`, `users[0].name` остаётся `'Иван'`.

```js
'use strict';

const users = [
  { name: 'Иван',  age: 32, isActive: true },
  { name: 'Мария', age: 22, isActive: true },
  { name: 'Олег',  age: 19, isActive: false },
  { name: 'Алина', age: 27, isActive: true },
];

/* Твоё решение: */

console.log(activeNames);    /* ['Мария', 'Алина', 'Иван'] */
console.log(youngestActive); /* 'Мария' */
console.log(users[0].name);  /* 'Иван' (исходный массив не изменён!) */
```

<details>
<summary>Подсказка и решение</summary>

```js
'use strict';

const users = [
  { name: 'Иван',  age: 32, isActive: true },
  { name: 'Мария', age: 22, isActive: true },
  { name: 'Олег',  age: 19, isActive: false },
  { name: 'Алина', age: 27, isActive: true },
];

/*
  filter создаёт НОВЫЙ массив, поэтому следующий за ним sort(...)
  сортирует уже отфильтрованную копию и не мутирует исходный users.
  Затем map достаёт только свойство name из каждого объекта
*/
const activeNames = users
  .filter(({ isActive }) => isActive)
  .sort((a, b) => a.age - b.age)
  .map(({ name }) => name);

/* Деструктуризация массива берёт первый элемент (индекс 0) */
const [youngestActive] = activeNames;

console.log(activeNames);    /* ['Мария', 'Алина', 'Иван'] */
console.log(youngestActive); /* 'Мария' */
console.log(users[0].name);  /* 'Иван' */
```

</details>

**Задача 3. Средний возраст и группировка по `id` через `reduce`**

Напиши две функции с помощью `.reduce`:

1. `getAverageAge(list)` — считает средний возраст пользователей (для пустого массива должна возвращать `0`, а не `NaN`).
2. `groupById(list)` — собирает из массива пользователей объект-словарь, где ключом выступает `user.id`, а значением — сам объект пользователя.

Проверка: `getAverageAge(users)` -> `30`, `getAverageAge([])` -> `0`, `groupById(users).u2.name` -> `'Лена'`.

```js
'use strict';

const users = [
  { id: 'u1', name: 'Алекс', age: 20 },
  { id: 'u2', name: 'Лена',  age: 30 },
  { id: 'u3', name: 'Дима',  age: 40 },
];

/* Твоё решение: */

console.log(getAverageAge(users)); /* 30 */
console.log(getAverageAge([]));    /* 0 */
console.log(groupById(users).u2);  /* { id: 'u2', name: 'Лена', age: 30 } */
```

<details>
<summary>Подсказка и решение</summary>

```js
'use strict';

const users = [
  { id: 'u1', name: 'Алекс', age: 20 },
  { id: 'u2', name: 'Лена',  age: 30 },
  { id: 'u3', name: 'Дима',  age: 40 },
];

function getAverageAge(list) {
  /* Защита от деления 0 / 0 = NaN на пустом массиве */
  if (list.length === 0) return 0;

  /* Начальное значение 0 обязательно, чтобы сумма начиналась с числа */
  const totalAge = list.reduce((sum, { age }) => sum + age, 0);
  return totalAge / list.length;
}

function groupById(list) {
  /* Начальное значение {} — пустой словарь, который постепенно наполняется */
  return list.reduce((acc, user) => {
    acc[user.id] = user;
    /* Обязательно возвращаем acc, иначе на следующем шаге будет undefined */
    return acc;
  }, {});
}

console.log(getAverageAge(users)); /* 30 */
console.log(getAverageAge([]));    /* 0 */
console.log(groupById(users).u2);  /* { id: 'u2', name: 'Лена', age: 30 } */
```

</details>
