# Урок 17. Перебор объектов (keys/values/entries) и коллекции Map, Set

Суть урока:

- **Массивы из объекта:** `Object.keys`, `Object.values` и `Object.entries` переводят объект в массив для удобной обработки.
- **Коллекции `Map` и `Set`:** `Map` — словарь с ключами любого типа, а `Set` — коллекция только уникальных значений.

## 1. Перебор объекта: for..in, Object.keys, Object.values, Object.entries (00:26 – 01:37)

```js
const user = { name: 'Александр', age: 28, city: 'Москва' };
/* Классический for..in перебирает имена ключей (значение — user[key]): */
for (const key in user) { console.log(key, user[key]); }

/* Чтобы работать с объектом методами массивов, получаем массивы: */
Object.keys(user);    /* ['name', 'age', 'city'] — ключи */
Object.values(user);  /* ['Александр', 28, 'Москва'] — значения */
Object.entries(user); /* [['name', 'Александр'], ['age', 28], ...] */

/* Перебор пар через forEach + деструктуризация [key, value]: */
Object.entries(user).forEach(([key, value]) => console.log(key, value));
/* Все 3 метода возвращают массивы и игнорируют скрытые ключи Symbol. */
```

## 2. Трансформация объекта и обратная сборка — Object.fromEntries (02:42)

```js
/* Object.fromEntries собирает массив пар [ключ, значение] обратно в объект */
const entries = Object.entries(user);
const formattedEntries = entries.map(
  ([key, val]) => [key.toUpperCase(), `--${val}--`]
);
const formattedUser = Object.fromEntries(formattedEntries);
/* { NAME: '--Александр--', AGE: '--28--', CITY: '--Москва--' } */
```

## 3. Коллекция Map: зачем нужна и базовые методы (03:51 – 06:55)

```js
/*
  В обычном {} все ключи становятся строками ({ 1: 'a', '1': 'b' } -> 'b').
  В Map ключом может быть ЛЮБОЙ тип (1 !== '1', boolean, даже объект!).
*/
const data = new Map([
  [1, 'Один как число'], /* пары можно передать массивом массивов */
  ['1', 'Один как строка'],
]);

/* Основные операции с Map (через [] напрямую к Map НЕ обращаются!): */
data.set('name', undefined); /* добавляет или перезаписывает пару */
data.get(1);                 /* 'Один как число' | get('1') -> строка */
data.has('name');            /* true — есть ли КЛЮЧ (даже при undefined!) */
data.size;                   /* 3 — СВОЙСТВО (без скобок ()!) */
data.delete('name');         /* удаляет пару | clear() — чистит весь Map */

/* Объект в роли ключа + цепочка вызовов + NaN === NaN: */
const john = { name: 'John' };
data.set(john, 123).set(NaN, 'не число'); /* set возвращает сам Map */
data.get(john); /* 123 (по ссылке) | data.get(NaN) -> 'не число' */
```

## 4. Перебор Map и преобразование Object <-> Map (07:11 – 08:30)

```js
/*
  keys(), values(), entries() возвращают итераторы (НЕ массивы!).
  Перебираем через for..of (или делаем массив через [...data.keys()]):
*/
for (const key of data.keys()) { console.log(key); }
for (const val of data.values()) { console.log(val); }
for (const [key, val] of data.entries()) { console.log(key, val); }

/* ВАЖНО: в data.forEach порядок параметров ИНОЙ — сначала VALUE, потом KEY */
data.forEach((value, key, map) => console.log(key, value));

/* Преобразование Object <-> Map: */
const mapFromObj = new Map(Object.entries(user)); /* Объект -> Map */
const objFromMap = Object.fromEntries(data);      /* Map -> Объект */
/* Подвох: в объекте ключи 1 и '1' сольются в '1' (выживет последний!). */
```

## 5. Коллекция Set: уникальные значения, методы и перебор (09:05 – 10:41)

```js
/*
  Set хранит только уникальные ЗНАЧЕНИЯ (без ключей) в порядке вставки.
  Дубликаты при создании или добавлении через add() молча игнорируются!
*/
const set = new Set([1, 2, 2, 3, 3, 3]); /* Set(3) { 1, 2, 3 } */
/* Главный приём — очистить массив от дублей одной строкой: */
const unique = [...new Set([1, 2, 2, 3])]; /* [1, 2, 3] */

/* Методы и свойства Set (как у Map, только вместо set() -> add()): */
set.add(4).add(5); /* добавляет значения цепочкой (дубли игнорируются) */
set.has(2);        /* true — проверяет наличие значения */
set.delete(2);     /* удаляет значение | set.clear() — чистит Set */
set.size;          /* свойство (без скобок ()!) — число элементов */

/* Перебор Set (for..of и forEach): */
for (const val of set) { console.log(val); }
set.forEach((val, val2, setRef) => console.log(val));
/*
  Для совместимости с Map: keys() и values() дают значения,
  а entries() возвращает пары из двух одинаковых значений [val, val]!
*/
```

## 3 главные ловушки урока (чек-лист для повторения)

1. Порядок параметров в map.forEach — первым аргументом идёт value, вторым key (не перепутай с [key, value] из entries!).

2. map.size — свойство, а не метод, и Map не читается через [] — пиши map.size без скобок (), а значения бери строго через map.get(key).

3. Object.fromEntries(map) теряет нестроковые ключи — если в Map были и число 1, и строка "1", в объекте останется только последний из них.

## Вопросы для закрепления

**1. Что выведется в консоль и почему при сборке объекта из `map` пропадёт один из ключей?**

```js
const map = new Map();
map.set(1, 'число').set('1', 'строка');
map.set({ id: 1 }, 'пользователь');

console.log(map.size, map.get({ id: 1 }));
console.log(Object.fromEntries(map));
```

<details>
<summary>Показать ответ</summary>

Первая строка выведет **`3`** и **`undefined`**.
1. В `Map` число `1` и строка `'1'` — разные ключи, поэтому в коллекции хранятся все 3 пары. Но объект-ключ ищется строго по **ссылке**, а `{ id: 1 }` внутри `map.get(...)` — это новый объект с другим адресом в памяти, поэтому возвращается `undefined`.
2. При вызове `Object.fromEntries(map)` обычный объект превращает все ключи в строки: `1` и `'1'` сливаются, и остаётся только последняя запись `'1': 'строка'` (а ключ-объект станет `'[object Object]'`).

</details>

**2. Что выведет этот код и какие две ошибки допущены при работе с `Map`?**

```js
const map = new Map([['role', 'admin']]);
map['level'] = 5;

map.forEach((a, b) => console.log(a, b));
console.log(map.size, map.get('level'));
```

<details>
<summary>Показать ответ</summary>

В `forEach` выведется **`'admin' 'role'`**, а ниже — **`1` и `undefined`**.
1. В методе `map.forEach((value, key) => ...)` первым аргументом идёт **значение**, а вторым **ключ** (обратный порядок по сравнению с `Object.entries`).
2. Запись `map['level'] = 5` создала обычное свойство на JS-объекте, не добавив запись в саму коллекцию `Map` — поэтому `map.size` (это свойство без `()`) остался равен `1`, а `map.get('level')` вернул `undefined`. Для `Map` всегда используют `.set()` и `.get()`.

</details>

**3. Почему у `map.values().sort()` возникнет ошибка `TypeError`, а `map.values().length` вернёт `undefined`? Чему равен `uniqueSet.size`?**

```js
const uniqueSet = new Set(['А', 'Б', 'А', { x: 1 }, { x: 1 }]);
console.log(uniqueSet.size);
```

<details>
<summary>Показать ответ</summary>

1. Методы `keys()`, `values()` и `entries()` у `Map` и `Set` возвращают **итераторы, а не массивы**: у итератора нет свойства `.length` (`undefined`) и нет методов массива вроде `.sort()`, `.includes()` или `.join()` (`TypeError`). Сначала итератор преобразуют в массив: `[...map.values()]`.
2. `uniqueSet.size` выведет **`4`**: дубль строки `'А'` отбросился, а два литерала `{ x: 1 }` имеют разные ссылки в памяти и считаются разными элементами.

</details>

## Задачи

**Задача 1. Трансформация объекта через `Object.entries` и `Object.fromEntries`**

Напиши функцию `doublePrices(pricesObj)`, которая возвращает новый объект с удвоенными ценами, не меняя исходный:

1. Разбери объект `pricesObj` в массив пар через `Object.entries(...)`.
2. Удвой каждую цену через `.map(([product, price]) => [product, price * 2])`.
3. Собери пары обратно в новый объект через `Object.fromEntries(...)`.

Проверка: `doublePrices(prices)` -> `{ apple: 200, banana: 120, coffee: 500 }`, при этом `prices.apple` остаётся `100`.

```js
'use strict';

const prices = {
  apple: 100,
  banana: 60,
  coffee: 250,
};

/* Твоё решение: */

console.log(doublePrices(prices)); /* { apple: 200, banana: 120, ... } */
console.log(prices.apple);         /* 100 (оригинал не тронут) */
```

<details>
<summary>Подсказка и решение</summary>

```js
'use strict';

const prices = {
  apple: 100,
  banana: 60,
  coffee: 250,
};

function doublePrices(pricesObj) {
  /*
    1. Object.entries превращает объект в массив пар [['apple', 100], ...]
    2. map перебирает пары и возвращает новые пары с удвоенной ценой
    3. Object.fromEntries собирает обработанные пары обратно в новый объект
  */
  return Object.fromEntries(
    Object.entries(pricesObj).map(([product, price]) => [product, price * 2])
  );
}

console.log(doublePrices(prices)); /* { apple: 200, banana: 120, ... } */
console.log(prices.apple);         /* 100 */
```

</details>

**Задача 2. Удаление дублей через `Set` и подсчёт частоты слов через `Map`**

Напиши две функции для работы с коллекциями `Set` и `Map`:

1. `getUniqueTags(tags)` — возвращает новый массив только уникальных значений через `Set` и спред `[...]`.
2. `countWords(words)` — принимает массив строк и возвращает `Map`, где ключ — слово, а значение — количество вхождений (`(map.get(word) ?? 0) + 1`).

Проверка: `unique` -> `['js', 'css', 'html', 'react']`, `freqMap.get('js')` -> `2`, `freqMap.size` -> `4`.

```js
'use strict';

const tags = ['js', 'css', 'js', 'html', 'css', 'react'];

/* Твоё решение: */

const unique = getUniqueTags(tags);
const freqMap = countWords(tags);

console.log(unique);               /* ['js', 'css', 'html', 'react'] */
console.log(freqMap.get('js'));    /* 2 */
console.log(freqMap.get('react')); /* 1 */
console.log(freqMap.size);         /* 4 */
```

<details>
<summary>Подсказка и решение</summary>

```js
'use strict';

const tags = ['js', 'css', 'js', 'html', 'css', 'react'];

/* Оборачиваем массив в Set (уберёт дубли) и разворачиваем обратно в [] */
const getUniqueTags = (list) => [...new Set(list)];

function countWords(words) {
  const map = new Map();

  for (const word of words) {
    /* Если слова ещё нет, get вернёт undefined — подставляем 0 через ?? */
    const currentCount = map.get(word) ?? 0;
    map.set(word, currentCount + 1);
  }

  return map;
}

const unique = getUniqueTags(tags);
const freqMap = countWords(tags);

console.log(unique);               /* ['js', 'css', 'html', 'react'] */
console.log(freqMap.get('js'));    /* 2 */
console.log(freqMap.get('react')); /* 1 */
console.log(freqMap.size);         /* 4 */
```

</details>

**Задача 3. Очистка от анаграмм `aclean(words)` через `Map`**

Анаграммы — это слова из одних и тех же букв в разном порядке (`'nap'` и `'PAN'`). Напиши функцию `aclean(words)`, оставляющую по одному слову из каждой группы:

1. Для каждого слова сделай общий ключ: переведи в нижний регистр, разбей на буквы, отсортируй и склей обратно.
2. Сохраняй пары `map.set(sortedKey, word)` в коллекцию `Map`.
3. Верни массив значений через `[...map.values()]`.

Проверка: `aclean(words)` -> `['PAN', 'hectares', 'era']`.

```js
'use strict';

const words = [
  'nap', 'teachers', 'cheaters', 'PAN', 'ear', 'era', 'hectares',
];

/* Твоё решение: */

console.log(aclean(words)); /* ['PAN', 'hectares', 'era'] */
```

<details>
<summary>Подсказка и решение</summary>

```js
'use strict';

const words = [
  'nap', 'teachers', 'cheaters', 'PAN', 'ear', 'era', 'hectares',
];

function aclean(arr) {
  const map = new Map();

  for (const word of arr) {
    /*
      Делаем общий ключ для анаграмм: нижний регистр -> буквы ->
      сортировка по алфавиту -> склейка обратно ('PAN' -> 'anp')
    */
    const sortedKey = word.toLowerCase().split('').sort().join('');

    /*
      Если sortedKey уже есть в Map, новое слово перезапишет старое —
      в итоге под каждым ключом останется ровно 1 слово из группы
    */
    map.set(sortedKey, word);
  }

  /* Превращаем итератор значений Map в обычный массив через спред [...] */
  return [...map.values()];
}

console.log(aclean(words)); /* ['PAN', 'hectares', 'era'] */
```

</details>
