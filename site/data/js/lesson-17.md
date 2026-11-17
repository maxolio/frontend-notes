# Урок 17. Перебор объектов (keys/values/entries) и коллекции Map, Set

Суть урока: Object.keys/values/entries превращают объект в массив для удобной обработки методами массивов; Map — продвинутый словарь с ключами любого типа; Set — коллекция только уникальных значений.

## 1. Перебор объекта: for..in, Object.keys, Object.values, Object.entries (00:26 – 01:37)

```js
const user = { name: 'Александр', age: 28, city: 'Москва' };
/* Классический for..in перебирает имена ключей (значение получаем через user[key]): */
for (const key in user) { console.log(key, user[key]); }

/* Чтобы работать с объектом методами массивов (forEach, map, filter), получаем массивы: */
Object.keys(user);    // ['name', 'age', 'city']        — массив ключей (строк)
Object.values(user);  // ['Александр', 28, 'Москва']    — массив значений
Object.entries(user); // [['name','Александр'], ['age',28], ['city','Москва']] — массив пар

/* Перебор пар через forEach + деструктуризация [key, value] из [0] и [1] индексов: */
Object.entries(user).forEach(([key, value]) => console.log(key, value));
/* Все 3 метода возвращают НАСТОЯЩИЕ массивы и игнорируют скрытые ключи типа Symbol. */
```

## 2. Трансформация объекта и обратная сборка — Object.fromEntries (02:42)

```js
/* Object.fromEntries делает обратное: превращает массив пар [ключ, значение] в объект. */
const entries = Object.entries(user);
const formattedEntries = entries.map(([key, val]) => [key.toUpperCase(), `--${val}--`]);
const formattedUser = Object.fromEntries(formattedEntries);
// { NAME: '--Александр--', AGE: '--28--', CITY: '--Москва--' }
```

## 3. Коллекция Map: зачем нужна и базовые методы (03:51 – 06:55)

```js
/* В обычном объекте {} все ключи становятся строками ({ 1: 'a', '1': 'b' } -> останется 'b').
   В Map ключом может быть ЛЮБОЙ тип (число 1 !== строка '1', boolean, даже целый объект!). */
const data = new Map([
  [1, 'Один как число'],     // Начальные пары можно передать массивом массивов (как entries)
  ['1', 'Один как строка'],
]);

/* Основные операции с Map (через [] напрямую к Map НЕ обращаются!): */
data.set('name', undefined); // Добавляет или перезаписывает пару (ключ, значение)
data.get(1);                 // 'Один как число' | data.get('1') -> 'Один как строка'
data.has('name');            // true — проверяет наличие САМОГО КЛЮЧА (даже если там undefined!)
data.size;                   // 3 — СВОЙСТВО (без скобок ()!), количество пар в коллекции
data.delete('name');         // Удаляет пару по ключу  |  data.clear() — полностью очищает Map

/* Объект в роли ключа + цепочка вызовов + сохранение порядка вставки + NaN: */
const john = { name: 'John' };
data.set(john, 123).set(NaN, 'не число'); // set возвращает сам Map -> можно писать цепочкой!
data.get(john); // 123 (ищет по ссылке на объект) | data.get(NaN) -> 'не число' (NaN === NaN!)
```

## 4. Перебор Map и преобразование Object <-> Map (07:11 – 08:30)

```js
/* Методы keys(), values(), entries() возвращают перебираемые объекты (итераторы, НЕ массивы!).
   Перебираем через for..of (или делаем массив через [...data.keys()]): */
for (const key of data.keys()) { console.log(key); }
for (const val of data.values()) { console.log(val); }
for (const [key, val] of data.entries()) { console.log(key, val); } // Или сразу: of data

/* ВАЖНО: в собственном data.forEach порядок параметров ИНОЙ, чем у массива и entries: */
data.forEach((value, key, map) => console.log(key, value)); // Сначала VALUE, потом KEY!

/* Преобразование Object <-> Map: */
const mapFromObj = new Map(Object.entries(user)); // Объект -> Map
const objFromMap = Object.fromEntries(data);      // Map -> Объект
/* Подвох: объект не хранит разные типы ключей (1 и '1' сольются, выживет последний!). */
```

## 5. Коллекция Set: уникальные значения, методы и перебор (09:05 – 10:41)

```js
/* Set хранит только ЗНАЧЕНИЯ (без ключей) в единственном экземпляре и в порядке вставки.
   Дубликаты при передаче массива или добавлении через add() молча игнорируются! */
const set = new Set([1, 2, 2, 3, 3, 3]); // Set(3) { 1, 2, 3 }
/* Главный приём на практике — очистить массив от дублей обратно в массив одной строкой: */
const unique = [...new Set([1, 2, 2, 3])]; // [1, 2, 3] (или Array.from(new Set(...)))

/* Методы и свойства Set (всё как у Map, только вместо set() -> add()): */
set.add(4).add(5); // Добавляет значения (тоже работает цепочкой, дубли игнорируются)
set.has(2);       // true — проверяет наличие значения
set.delete(2);    // Удаляет значение  |  set.clear() — полностью очищает Set
set.size;         // Свойство (без скобок ()!) — количество элементов

/* Перебор Set (for..of и forEach): */
for (const val of set) { console.log(val); }
set.forEach((val, val2, setRef) => console.log(val));
/* Особенность для совместимости с Map: keys() и values() дают одно и то же (значения),
   а entries() на каждом шаге возвращает массив из двух одинаковых значений [val, val]! */
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

**3. Почему у `map.values().filter(...)` возникнет ошибка `TypeError`, и чему равен `uniqueSet.size`?**

```js
const uniqueSet = new Set(['А', 'Б', 'А', { x: 1 }, { x: 1 }]);
console.log(uniqueSet.size);
```

<details>
<summary>Показать ответ</summary>

1. Методы `keys()`, `values()` и `entries()` у `Map` и `Set` возвращают **итераторы, а не массивы**, поэтому методы массивов вроде `.filter` или `.map` у них напрямую вызывать нельзя (`TypeError`). Сначала их преобразуют в массив: `[...map.values()]`.
2. `uniqueSet.size` выведет **`4`**: дубль строки `'А'` отбросился, а два литерала `{ x: 1 }` имеют разные ссылки в памяти и считаются разными элементами.

</details>

## Задачи

**Задача 1. Трансформация объекта через `Object.entries` и `Object.fromEntries`**

Напиши функцию `doublePrices(pricesObj)`, которая не мутирует исходный объект, а возвращает новый объект с теми же ключами, где каждая цена умножена на `2`. Используй связку `Object.entries`, `.map` (с деструктуризацией `[key, value]`) и `Object.fromEntries`.

```js
'use strict';

const prices = {
  apple: 100,
  banana: 60,
  coffee: 250,
};

/* Твоё решение: */

console.log(doublePrices(prices)); /* { apple: 200, banana: 120, coffee: 500 } */
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

console.log(doublePrices(prices)); /* { apple: 200, banana: 120, coffee: 500 } */
console.log(prices.apple);         /* 100 */
```

</details>

**Задача 2. Удаление дублей через `Set` и подсчёт частоты слов через `Map`**

Напиши две функции:
1) `getUniqueTags(tags)` — возвращает новый массив только уникальных значений (через `Set` и спред `[...]`).
2) `countWords(words)` — принимает массив строк и возвращает коллекцию `Map`, где ключ — слово, а значение — сколько раз оно встретилось (удобно читать текущее число через `(map.get(word) ?? 0) + 1`).

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

/* Оборачиваем массив в Set (удалит дубли) и спредом разворачиваем обратно в массив */
const getUniqueTags = (list) => [...new Set(list)];

function countWords(words) {
  const map = new Map();

  for (const word of words) {
    /* Если слова ещё нет, get вернёт undefined — подставляем 0 через ?? и прибавляем 1 */
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

Анаграммы — это слова из одних и тех же букв в разном порядке (`'nap'` и `'PAN'`, `'ear'` и `'era'`). Напиши функцию `aclean(words)`, которая оставляет в массиве ровно по одному слову из каждой группы анаграмм: приведи каждое слово к единому «ключу» из отсортированных букв в нижнем регистре, сохрани в `Map` и верни массив значений (`[...map.values()]`).

```js
'use strict';

const words = ['nap', 'teachers', 'cheaters', 'PAN', 'ear', 'era', 'hectares'];

/* Твоё решение: */

console.log(aclean(words)); /* ['PAN', 'hectares', 'era'] */
```

<details>
<summary>Подсказка и решение</summary>

```js
'use strict';

const words = ['nap', 'teachers', 'cheaters', 'PAN', 'ear', 'era', 'hectares'];

function aclean(arr) {
  const map = new Map();

  for (const word of arr) {
    /*
      Делаем общий ключ для всех анаграмм: переводим в нижний регистр,
      делим на буквы, сортируем по алфавиту и склеиваем обратно ('PAN' -> 'anp')
    */
    const sortedKey = word.toLowerCase().split('').sort().join('');

    /*
      Если такой sortedKey уже есть в Map, новое слово перезапишет старое —
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
