# Урок 10. Объекты (Часть 1): свойства, методы, delete, in и for..in

Суть урока: Объект { key: value } хранит данные под строковыми ключами; читают свойства через точку или [...], содержимое const-объекта можно менять и удалять через delete, наличие проверяют оператором in, а ключи перебирают циклом for..in.

## 1. Создание объекта, доступ к свойствам и методы (00:23–04:14)

[+] Ключ объекта — всегда строка (если в имени пробел или дефис, нужны кавычки и доступ через ["..."]). Функции внутри объекта называются методами. Обращение к несуществующему ключу возвращает undefined без ошибки.

```js
const user = {
  name: 'Александр',
  age: 28,
  'registration date': '01.01.2024', /* имя с пробелом — обязательно в кавычках */
  sayHi: () => console.log('Привет'), /* метод объекта (висячая запятая допустима) */
};

console.log(user.name);                  /* "Александр" */
console.log(user['registration date']);  /* доступ через [] из-за пробела */
user.sayHi();                            /* вызов метода */
console.log(user.missingProp);           /* undefined */
console.log(user.address?.street);       /* ?. защитит от TypeError, если address нет */
```

## 2. Добавление, изменение, удаление delete и const-объект (04:15–07:03)

[!] const защищает лишь саму переменную от перезаписи (=), но не содержимое объекта: свойства внутри можно добавлять, менять и удалять оператором delete.

```js
const profile = {};
profile.name = 'Александр';        /* добавили свойство */
profile['is developer'] = true;    /* добавили свойство с пробелом */
profile.name = 'Максим';           /* изменили существующее */

delete profile.name;               /* удалили свойство (несуществующее ошибки не даст) */
delete profile['is developer'];
/* profile = {}; -> ОШИБКА: Assignment to constant variable (саму переменную менять нельзя) */
```

## 3. Короткая запись, вычисляемые свойства [key] и имена ключей (07:04–10:42)

[+] Если имя ключа и переменной совпадают — пишут { name, age }. В ключах объекта можно брать зарезервированные слова (let, return), а числа становятся строками. Имя свойства из переменной берётся в квадратные скобки [propName].

```js
const name = 'Александр', age = 28;
const shortUser = { name, age }; /* короткая запись вместо { name: name, age: age } */

const propName = 'city';
const propValue = 'Москва';
const obj = { [propName]: propValue }; /* вычисляемое имя -> { city: "Москва" } */
/* Без [] получилось бы буквальное имя ключа "propName"! */
/* Ключ __proto__ особый: obj.__proto__ = 5 не станет числом 5 (проигнорируется!). */
```

## 4. Оператор in, перебор for..in и порядок свойств (10:43–15:16)

[+] Оператор "key" in obj надёжнее сравнения с undefined (если в самом свойстве лежит undefined). В цикле for..in перебираются ключи; причём целочисленные ключи всегда идут первыми по возрастанию, а остальные — в порядке добавления.

```js
const testObj = { status: undefined };
console.log('status' in testObj);        /* true — ключ реально есть в объекте! */
console.log(testObj.status !== undefined); /* false — обманет, если значение undefined */
console.log('toString' in testObj);      /* true! видит и методы прототипа объекта */
console.log(Object.hasOwn(testObj, 'toString')); /* false — проверяет ТОЛЬКО свои ключи */

const nums = { 2: 'второй', 1: 'первый', 3: 'третий', name: 'Алекс' };
for (const key in nums) {
  /* ВНИМАНИЕ: значение берут через nums[key], а НЕ nums.key! */
  console.log(key, nums[key]); /* порядок: "1", "2", "3", "name" */
}
/* Трюк порядка: ключи "+49", "+41" нецелочисленные и сохранят порядок добавления! */
```

## 3 главные ловушки урока (чек-лист для повторения)

1. В цикле for (const key in obj) писать obj.key вместо obj[key] — JS будет искать свойство с буквальным именем "key" и вернёт undefined.

2. Забыть квадратные скобки при вычисляемом ключе { [propName]: val } или проверять наличие свойства через !== undefined вместо оператора in.

3. Ждать исходного порядка для числовых ключей (ключи 2, 1, 3 всегда отсортируются по возрастанию "1", "2", "3" впереди всех строковых ключей).

## Вопросы для закрепления

**1. Что выведет этот цикл `for..in` и в каком порядке пойдут ключи?**

```js
const data = { 10: 'десять', 2: 'два', name: 'Алекс' };

for (const key in data) {
  console.log(key, data.key);
}
```

<details>
<summary>Показать ответ</summary>

Выведется `2 undefined`, `10 undefined`, `name undefined`.
1. Запись `data.key` ищет в объекте свойство с буквальным именем `'key'`, а не использует значение переменной `key` — для чтения по переменной нужны скобки `data[key]`.
2. Целочисленные ключи (`'2'`, `'10'`) всегда перебираются первыми по возрастанию числа, а обычные строковые (`'name'`) — после них в порядке добавления.

</details>

**2. Какая строка с объектом `const` вызовет ошибку, и под каким ключом сохранится `'admin'` в объекте `box`?**

```js
const field = 'role';
const box = { field: 'admin' };

box.field = 'editor';
box = { role: 'admin' };
```

<details>
<summary>Показать ответ</summary>

1. В `box` создастся буквальный ключ **`'field'`**, а не `'role'`: чтобы имя свойства взялось из переменной, нужны квадратные скобки — `{ [field]: 'admin' }`.
2. Изменение свойства `box.field = 'editor'` сработает без ошибок, а строка `box = { ... }` вызовет **`TypeError: Assignment to constant variable`** — `const` запрещает переназначать саму переменную, но разрешает менять и удалять свойства внутри объекта.

</details>

**3. Почему проверка `obj.status !== undefined` может соврать и чем `'toString' in obj` отличается от `Object.hasOwn(obj, 'toString')`?**

<details>
<summary>Показать ответ</summary>

Если свойство создано со значением `undefined` (`{ status: undefined }`), то `obj.status !== undefined` вернёт `false`, хотя ключ в объекте есть — оператор `'status' in obj` в этом случае честно вернёт `true`. Разница с `Object.hasOwn` в том, что `in` видит ещё и унаследованные свойства прототипа (`'toString' in obj` -> `true`), а `Object.hasOwn(obj, 'toString')` проверяет **только собственные** ключи объекта (`false`).

</details>

## Задачи

**Задача 1. Создание объекта, вычисляемый ключ `[...]` и удаление `delete`**

Создай через `const` объект `profile` со свойствами: `name` со значением `'Александр'`, ключ с пробелом `'favorite color'` со значением `'синий'` и вычисляемый ключ из переменной `dynamicKey` со значением `'Москва'`. Затем поменяй `name` на `'Максим'`, удали `'favorite color'` через `delete` и выведи в консоль результат проверки `'city' in profile` и сам объект.

```js
'use strict';

const dynamicKey = 'city';

/* Твоё решение: */
```

<details>
<summary>Подсказка и решение</summary>

```js
'use strict';

const dynamicKey = 'city';

const profile = {
  name: 'Александр',
  /* Ключ с пробелом обязательно берём в кавычки */
  'favorite color': 'синий',
  /* Квадратные скобки берут имя ключа из значения переменной dynamicKey ('city') */
  [dynamicKey]: 'Москва',
};

/* const не запрещает изменять и удалять свойства внутри самого объекта */
profile.name = 'Максим';
delete profile['favorite color'];

/* Оператор in проверяет, существует ли свойство 'city' в profile */
console.log('city' in profile); /* true */
console.log(profile);           /* { name: 'Максим', city: 'Москва' } */
```

</details>

**Задача 2. Проверка объекта на пустоту `isEmpty(obj)`**

Напиши функцию `isEmpty(obj)`, которая возвращает `true`, если у объекта нет свойств, и `false`, если в нём есть хотя бы одно свойство (даже со значением `undefined`). Используй цикл `for..in`.

```js
'use strict';

/* Твоё решение: */

const emptyBox = {};
const draftBox = { title: undefined };

console.log(isEmpty(emptyBox)); /* true */
console.log(isEmpty(draftBox)); /* false */
```

<details>
<summary>Подсказка и решение</summary>

```js
'use strict';

function isEmpty(obj) {
  /*
    Если цикл for..in зашёл хотя бы на 1 шаг, значит в объекте есть ключ:
    немедленно делаем ранний выход и возвращаем false
  */
  for (const key in obj) {
    return false;
  }

  /* Доходим сюда, только если цикл ни разу не выполнился — объект пуст */
  return true;
}

const emptyBox = {};
const draftBox = { title: undefined };

console.log(isEmpty(emptyBox)); /* true */
console.log(isEmpty(draftBox)); /* false (свойство есть, пусть и со значением undefined) */
```

</details>

**Задача 3. Сумма и удвоение только числовых свойств (`for..in` и `typeof`)**

Исправь функцию `sumNumeric(obj)`: сейчас она ошибочно читает `obj.key` вместо `obj[key]` и пытается прибавлять строковые поля вроде `title`. Затем допиши функцию `multiplyNumeric(obj)`, которая умножает на `2` только числовые свойства объекта (строки не трогает).

```js
'use strict';

const menu = {
  width: 200,
  height: 300,
  title: 'Меню сайта',
};

/* Твоё решение: */
function sumNumeric(obj) {
  let total = 0;
  for (const key in obj) {
    total += obj.key;
  }
  return total;
}

console.log(sumNumeric(menu)); /* должно быть: 500 */
```

<details>
<summary>Подсказка и решение</summary>

```js
'use strict';

const menu = {
  width: 200,
  height: 300,
  title: 'Меню сайта',
};

function sumNumeric(obj) {
  let total = 0;

  for (const key in obj) {
    /* Берём значение по ключу-переменной через скобки obj[key] */
    const value = obj[key];

    /* Прибавляем только настоящие числа, чтобы строка не склеила сумму */
    if (typeof value === 'number' && !Number.isNaN(value)) {
      total += value;
    }
  }

  return total;
}

function multiplyNumeric(obj) {
  for (const key in obj) {
    /* Меняем свойство напрямую в переданном объекте, если оно числовое */
    if (typeof obj[key] === 'number' && !Number.isNaN(obj[key])) {
      obj[key] *= 2;
    }
  }
}

console.log(sumNumeric(menu)); /* 500 */
multiplyNumeric(menu);
console.log(sumNumeric(menu)); /* 1000 */
console.log(menu.title);       /* 'Меню сайта' — строка не изменилась */
```

</details>
