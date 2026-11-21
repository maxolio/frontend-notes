# Урок 11. Объекты (Часть 2): ссылки, копирование, ?. и деструктуризация

Суть урока:

- **Ссылки и копирование:** объекты хранятся по ссылке (`{} === {}` даёт `false`); поверхностно их копируют через `{ ...obj }` или `Object.assign()`.
- **Безопасный доступ:** от падения на вложенных свойствах спасает связка `?.` + `??`.
- **Деструктуризация:** нужные поля извлекают в переменные, а остаток собирают в `...rest` в конце.

## 1. Ссылочный тип и рекурсивное сравнение объектов (00:24–08:50)

[!] Переменная хранит не сам объект, а ссылку на место в памяти. Сравнение {} === {} всегда false, а const b = a копирует лишь ссылку. Чтобы сравнить содержимое вглубь, проверяют число ключей (Object.keys) и рекурсивно обходят вложенные объекты.

```js
console.log({} === {}); /* false — два разных участка памяти */
const obj1 = { name: "Alex" }; const obj2 = obj1; /* одна ссылка! */

const areObjectsEqual = (object1, object2) => {
  const keys1 = Object.keys(object1);
  const keys2 = Object.keys(object2);
  if (keys1.length !== keys2.length) return false;

  for (const key in object1) {
    const value1 = object1[key];
    const value2 = object2[key];
    const areObjects = value1 !== null && value2 !== null
      && typeof value1 === 'object' && typeof value2 === 'object';
    if (areObjects) {
      /* Важно: не прерываем на 1-м true, выходим только при false! */
      if (!areObjectsEqual(value1, value2)) return false;
      continue;
    }
    if (value1 !== value2) return false;
  }
  return true;
};
```

## 2. Копирование, объединение и опциональная цепочка ?. (08:51–19:05)

[+] Поверхностную копию и слияние делают через Object.assign({}, ...) или спред { ...obj1, ...obj2 } (одинаковые поля перезапишет последний). Вложенные объекты при этом НЕ клонируются! Оператор ?. в связке с ?? защищает от падения на undefined/null.

```js
const a = { name: 'Alex', addr: { city: 'Москва' } };
const b = { age: 28 };
const copy = { ...a };                  /* поверхностно (addr общий!) */
const merged = Object.assign({}, a, b); /* или { ...a, ...b }; дубли правый */
const deepCopy = structuredClone(a);    /* глубокий клон (без функций) */

/* Безопасное чтение вложенных данных без TypeError: */
const dateTo = guest.orderInfo?.stayDates?.to ?? 'Не указана';
```

## 3. Деструктуризация, переименование, дефолт и ...rest (19:06–29:10)

[+] Деструктуризация извлекает нужные свойства в переменные (удобно и в параметрах функции, когда аргументов больше 2–3). Если нужно переименование И значение по умолчанию — сначала : новоеИмя, потом = дефолт. Остаточный ...rest всегда последний!

```js
const user = { name: 'Alex', age: 28, company: 'VK', role: 'Front' };

/* Переименование (name -> userName), дефолт и остаток в ...otherInfo: */
const { name: userName, city: userCity = 'Не указано', ...otherInfo } = user;
/* otherInfo -> { company: 'VK', role: 'Front' }; ...rest всегда последний */

/*
  Деструктуризация в параметрах (= {} защитит от вызова без аргумента).
  Вложенная: const { addr: { city } = {} } = a; (создаст только city)
*/
const logAddress = ({ city, street, house = 1 } = {}) =>
  console.log(city, street, house);
logAddress({ street: 'Пушкина', city: 'Москва', house: 10 });
```

## 3 главные ловушки урока (чек-лист для повторения)

1. Написать const copy = obj и менять свойства в copy — так вы скопировали ссылку, и исходный obj тоже изменится.

2. Ждать от { ...obj } или Object.assign({}, obj) глубокого копирования — вложенные объекты и массивы остаются общими ссылками.

3. Перепутать порядок в { city: userCity = "Нет" } (сначала двоеточие, затем =) или поставить ...rest не в самый конец (ошибка Rest element must be last element).

## Вопросы для закрепления

**1. Что выведут оба `console.log` и почему поменяется исходный объект `user`?**

```js
const user = {
  name: 'Алекс',
  settings: { theme: 'dark' },
};

const copy = { ...user };
copy.name = 'Иван';
copy.settings.theme = 'light';

console.log(user.name, user.settings.theme);
console.log(user === copy, user.settings === copy.settings);
```

<details>
<summary>Показать ответ</summary>

Выведется `'Алекс' 'light'` и `false true`. Спред `{ ...user }` (как и `Object.assign`) делает лишь **поверхностную копию**: корневой объект новый (`user === copy` -> `false`), поэтому замена `copy.name` не задела оригинал. Но вложенный объект `settings` скопировался **по ссылке** (`user.settings === copy.settings` -> `true`), из-за чего смена `theme` изменила оба объекта. Для глубокой копии используют `structuredClone(user)` (если внутри нет функций).

</details>

**2. Что выведут эти две строки и какая ошибка случится, если убрать оператор `?.`?**

```js
const user = { name: 'Ольга', profile: null };

console.log(user.profile?.age ?? 18);
console.log(user.profile?.age);
```

<details>
<summary>Показать ответ</summary>

Первая строка выведет **`18`**, а вторая — **`undefined`**. Без `?.` выражение `user.profile.age` мгновенно упало бы с **`TypeError`**, потому что нельзя читать свойства у `null` и `undefined`. Опциональная цепочка `?.` останавливает чтение при встрече `null` и спокойно отдаёт `undefined`, а оператор `??` заменяет этот `undefined` на `18`.

</details>

**3. Что произойдёт при вызове `printUser()` без аргументов и какой вариант ниже вызовет `SyntaxError`?**

```js
const printUser = ({ name: userName = 'Гость' }) => console.log(userName);

/* Вариант А: const { ...rest, role } = user; */
/* Вариант Б: const { name: userName = 'Нет', ...rest } = user; */
```

<details>
<summary>Показать ответ</summary>

1. Вызов `printUser()` упадёт с **`TypeError`**, так как движок попытается деструктурировать `undefined` — от этого спасает дефолт `= {}` у самого параметра: `({ name: userName = 'Гость' } = {})`.
2. **Вариант А** сразу вызовет **`SyntaxError`**: остаточный объект `...rest` обязан стоять строго последним элементом. А при одновременном переименовании и дефолте (как в Варианте Б) всегда сначала идёт `: новоеИмя`, и только потом `= значениеПоУмолчанию`.

</details>

## Задачи

**Задача 1. Глубокое клонирование `structuredClone` и слияние через `{ ... }`**

Потренируй разницу между глубоким копированием и слиянием объектов:

1. Создай независимую глубокую копию `defaultConfig` в `clonedConfig` через `structuredClone` и поменяй `clonedConfig.limits.maxItems = 50` (оригинал должен остаться `10`).
2. Объедини `defaultConfig` и `userOverrides` в новый объект `finalConfig` через спред `{ ... }`, чтобы поля пользователя перезаписали базовые.

Проверка: в консоли должны появиться `10`, `50` и `'dark' true`.

```js
'use strict';

const defaultConfig = {
  theme: 'light',
  lang: 'ru',
  limits: { maxItems: 10 },
};
const userOverrides = { theme: 'dark', notifications: true };

/* Твоё решение: */

console.log(defaultConfig.limits.maxItems); /* должно остаться: 10 */
console.log(clonedConfig.limits.maxItems);  /* 50 */
console.log(finalConfig.theme, finalConfig.notifications); /* 'dark' true */
```

<details>
<summary>Подсказка и решение</summary>

```js
'use strict';

const defaultConfig = {
  theme: 'light',
  lang: 'ru',
  limits: { maxItems: 10 },
};
const userOverrides = { theme: 'dark', notifications: true };

/*
  structuredClone создаёт глубокую копию со всеми вложенными объектами —
  изменение clonedConfig.limits не затронет defaultConfig.limits
*/
const clonedConfig = structuredClone(defaultConfig);
clonedConfig.limits.maxItems = 50;

/*
  Спред { ... } копирует свойства поверхностно по порядку:
  совпадающий ключ theme из userOverrides перезапишет theme из defaultConfig
*/
const finalConfig = { ...defaultConfig, ...userOverrides };

console.log(defaultConfig.limits.maxItems);                /* 10 */
console.log(clonedConfig.limits.maxItems);                 /* 50 */
console.log(finalConfig.theme, finalConfig.notifications); /* 'dark' true */
```

</details>

**Задача 2. Деструктуризация параметров и опциональная цепочка `?.`**

Напиши стрелочную функцию `formatCity`, которая безопасно форматирует город доставки из заказа:

1. В параметрах деструктурируй `customerName` с переименованием в `clientName` и значением по умолчанию `'Аноним'`, а также свойство `shipping`.
2. Добавь `= {}` к объекту параметров, чтобы вызов `formatCity()` без аргументов не падал.
3. Внутри достань город через `shipping?.address?.city ?? 'Самовывоз'` и верни строку вида `'Иван: Москва'`.

Проверка: `formatCity(order1)` -> `'Иван: Москва'`, `formatCity(order2)` -> `'Анна: Самовывоз'`, `formatCity()` -> `'Аноним: Самовывоз'`.

```js
'use strict';

/* Твоё решение: */

const order1 = {
  customerName: 'Иван',
  shipping: { address: { city: 'Москва' } },
};
const order2 = { customerName: 'Анна', shipping: null };

console.log(formatCity(order1)); /* Иван: Москва */
console.log(formatCity(order2)); /* Анна: Самовывоз */
console.log(formatCity());       /* Аноним: Самовывоз */
```

<details>
<summary>Подсказка и решение</summary>

```js
'use strict';

/*
  = {} защищает от вызова formatCity() без аргумента;
  customerName переименовали в clientName и задали дефолт 'Аноним'
*/
const formatCity = (
  { customerName: clientName = 'Аноним', shipping } = {}
) => {
  /*
    Опциональная цепочка ?. спасает от TypeError при null/undefined,
    а ?? подставляет 'Самовывоз', если в итоге получился undefined или null
  */
  const city = shipping?.address?.city ?? 'Самовывоз';
  return `${clientName}: ${city}`;
};

const order1 = {
  customerName: 'Иван',
  shipping: { address: { city: 'Москва' } },
};
const order2 = { customerName: 'Анна', shipping: null };

console.log(formatCity(order1)); /* Иван: Москва */
console.log(formatCity(order2)); /* Анна: Самовывоз */
console.log(formatCity());       /* Аноним: Самовывоз */
```

</details>

**Задача 3. Рекурсивное сравнение вложенных объектов `areObjectsEqual`**

Напиши функцию `areObjectsEqual(obj1, obj2)`, которая глубоко сравнивает два объекта по содержимому:

1. Если `obj1 === obj2`, сразу верни `true`; если хотя бы один из аргументов не является не-`null` объектом (`!obj1 || !obj2 || typeof obj1 !== 'object' || typeof obj2 !== 'object'`), верни `false`.
2. Сверь количество ключей через `Object.keys(obj).length` (подсказка: `Object.keys(obj)` возвращает список собственных ключей объекта, у которого есть свойство `.length`).
3. Перебери ключи в `for..in`, проверь наличие ключа во втором объекте через `in`, а если оба значения — вложенные объекты, сравни их рекурсивным вызовом `areObjectsEqual`.

Проверка: `areObjectsEqual(a, b)` -> `true`, `areObjectsEqual(a, c)` -> `false`, `areObjectsEqual(a, null)` -> `false`.

```js
'use strict';

const a = { name: 'Алекс', meta: { level: 2, active: true } };
const b = { name: 'Алекс', meta: { level: 2, active: true } };
const c = { name: 'Алекс', meta: { level: 3, active: true } };

/* Твоё решение: */

console.log(areObjectsEqual(a, b));    /* true */
console.log(areObjectsEqual(a, c));    /* false */
console.log(areObjectsEqual(a, null)); /* false */
```

<details>
<summary>Подсказка и решение</summary>

```js
'use strict';

const a = { name: 'Алекс', meta: { level: 2, active: true } };
const b = { name: 'Алекс', meta: { level: 2, active: true } };
const c = { name: 'Алекс', meta: { level: 3, active: true } };

const areObjectsEqual = (obj1, obj2) => {
  /* Если ссылки ведут на один и тот же объект — сразу true */
  if (obj1 === obj2) return true;

  /* Защита от null и примитивов (иначе Object.keys(null) даст TypeError) */
  if (
    !obj1 || !obj2 ||
    typeof obj1 !== 'object' || typeof obj2 !== 'object'
  ) {
    return false;
  }

  /* Быстрая проверка: при разном количестве ключей объекты точно не равны */
  if (Object.keys(obj1).length !== Object.keys(obj2).length) return false;

  for (const key in obj1) {
    /* Защита от случая { x: undefined } против { y: undefined } */
    if (!(key in obj2)) return false;

    const val1 = obj1[key];
    const val2 = obj2[key];

    /* typeof null тоже 'object', поэтому обязательно проверяем !== null */
    const areBothObjects =
      val1 !== null && val2 !== null &&
      typeof val1 === 'object' && typeof val2 === 'object';

    if (areBothObjects) {
      /* Если вложенные объекты не равны — false; при true идём дальше */
      if (!areObjectsEqual(val1, val2)) return false;
      continue;
    }

    if (val1 !== val2) return false;
  }

  return true;
};

console.log(areObjectsEqual(a, b));    /* true */
console.log(areObjectsEqual(a, c));    /* false */
console.log(areObjectsEqual(a, null)); /* false */
```

</details>
