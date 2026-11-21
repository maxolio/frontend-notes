# Урок 18. Формат данных JSON: stringify, parse и ограничения

Суть урока:

- **Назначение JSON:** текстовый формат для передачи данных между JS и сервером.
- **Преобразование:** `JSON.stringify()` превращает объект в строку, а `JSON.parse()` собирает строку обратно в объект.

## 1. Что такое JSON и 3 строгих правила синтаксиса (00:24)

```js
/*
  JSON (JavaScript Object Notation) — текстовый стандарт данных.
  Пример валидного .json файла (внутри действуют 3 жёстких правила):
*/
{
  "name": "Александр",
  "age": 28,
  "isDeveloper": true,
  "car": null,
  "skills": ["HTML", "CSS", "JS"]
}
/*
  1) Разрешены: строки, числа, true/false, null, массивы и объекты.
     НЕЛЬЗЯ: undefined, функции (методы) и комментарии!
  2) Имена свойств (ключи) и ВСЕ строки — строго в двойных кавычках "...".
  3) Запрещены висячие запятые после последнего свойства или элемента!
*/
```

## 2. Зачем нужен JSON и почему нельзя использовать toString() (01:35 – 02:05)

```js
const user = { name: 'Александр', age: 28 };
/*
  Живой JS-объект нельзя отправить по сети — данные передаются СТРОКОЙ.
  Обычный метод user.toString() стирает все свойства объекта:
*/
user.toString(); /* '[object Object]' (данные потеряны!) */
/* Чтобы не писать свой переводчик руками, используют JSON. */
```

## 3. Методы JSON.stringify и JSON.parse (03:23 – 03:53)

```js
/* Глобальный объект JSON (4 заглавные буквы) имеет два главных метода: */

/* 1. JSON.stringify(obj) — переводит объект/массив в JSON-строку: */
const jsonString = JSON.stringify(user);
/* '{"name":"Александр","age":28}' — эту строку можно слать на сервер */

/* 2. JSON.parse(str) — разбирает валидную JSON-строку в JS-объект: */
const parsedUser = JSON.parse(jsonString);
/* { name: 'Александр', age: 28 } — можно читать parsedUser.name */
```

## 4. Ошибки при парсинге JSON.parse (04:15)

```js
/*
  JSON.parse() упадёт с SyntaxError при любом нарушении правил JSON:
  JSON.parse("{ name: 'Саша' }"); -> ключ без "..." и одинарные кавычки
  JSON.parse('{"age": 28,}');     -> лишняя висячая запятая в конце!
  (Перехват таких ошибок через try/catch разберём в Уроке 21.)
*/
```

## 5. Ограничения JSON.stringify: что пропадает при конвертации (05:06)

```js
const fullUser = {
  name: 'Александр',
  car: undefined,                /* свойство с undefined */
  [Symbol('id')]: 1,             /* ключи и значения Symbol пропускаются */
  sayHi() { console.log('Hi'); } /* метод (функция) */
};

/* JSON.stringify МОЛЧА пропускает функции, undefined и Symbol: */
const raw = JSON.stringify(fullUser); /* '{"name":"Александр"}' */
const back = JSON.parse(raw);         /* { name: 'Александр' } */
/* Особенности с массивами, коллекциями и особыми числами: */
JSON.stringify([1, undefined, NaN]);  /* '[1,null,null]' */
JSON.stringify(new Set([1, 2]));      /* '{}' (Map и Set -> пустой {}) */
/* Чтобы сохранить Map/Set -> Object.fromEntries(map) или [...set]. */
/* Циклическая ссылка или BigInt (10n) -> сразу TypeError! */
```

## 6. Массивы, примитивы в JSON и старый трюк копирования (05:42)

```js
/*
  Валидный JSON может быть массивом [...] или одиночным примитивом:
  списки товаров/пользователей с сервера почти всегда приходят массивом:
*/
const usersJson = '[{"name":"Саша","age":28},{"name":"Макс","age":25}]';
const usersList = JSON.parse(usersJson); /* Готовый массив объектов JS! */
usersList[1].name;                       /* 'Макс' */
JSON.parse('123');                       /* 123 (примитив — тоже JSON) */

/*
  Старый способ глубокого копирования (до появления structuredClone):
  const deepCopy = JSON.parse(JSON.stringify(obj));
  Но он ломает Date (делает строкой), выкидывает методы и обнуляет Map/Set!
*/
```

## 7. Форматирование (space), фильтрация (replacer), toJSON и reviver

```js
const account = { name: 'Саша', age: 28, password: '123', date: new Date() };
/*
  1. Аргументы JSON.stringify(value, replacer, space):
     - replacer (массив полей или функция) — выбирает нужные ключи;
     - space (обычно 2) — добавляет переносы и отступы для читаемости:
*/
const pretty = JSON.stringify(account, ['name', 'age'], 2);

/*
  2. Метод toJSON(): у Date он встроен, поэтому дата становится строкой.
     При JSON.parse она строкой и останется — вернуть Date поможет reviver:
*/
const jsonWithDate = JSON.stringify(account);
const restored = JSON.parse(jsonWithDate, (key, value) => {
  return key === 'date' ? new Date(value) : value;
});
restored.date instanceof Date; /* true (снова полноценный объект Date!) */
```

## 8. Где JSON используется на практике (3 главных случая)

```js
/*
  1. Общение с сервером (API): отправка (stringify) и чтение (parse).
  2. localStorage хранит лишь строки (без JSON выйдет '[object Object]'):
*/
localStorage.setItem('cart', JSON.stringify([{ id: 1, qty: 2 }]));
const savedCart = JSON.parse(localStorage.getItem('cart'));
/* 3. Файлы настроек (package.json): единый формат для разных языков. */
```

## 3 главные ловушки урока (чек-лист для повторения)

1. Нарушение синтаксиса внутри JSON-строки — одинарные кавычки, ключи без кавычек или запятая после последнего элемента сразу роняют JSON.parse() с SyntaxError.

2. Тихая потеря методов и undefined — JSON.stringify() молча выбрасывает функции и свойства с undefined; после обратного JSON.parse() они не восстановятся.

3. Не путать JSON и JS-объект — JSON.stringify() даёт обычную строку (нельзя прочитать userJson.name без предварительного JSON.parse()).

## Вопросы для закрепления

**1. Что вернёт `JSON.stringify` в первых двух строках и почему упадёт третья?**

```js
console.log(JSON.stringify({ name: 'Алекс', age: undefined, sayHi() {} }));
console.log(JSON.stringify([10, undefined, NaN]));
console.log(JSON.stringify({ tags: new Set(['js']), id: 10n }));
```

<details>
<summary>Показать ответ</summary>

1. Первая строка выведет **`'{"name":"Алекс"}'`** — в объектах `JSON.stringify` молча выбрасывает свойства со значением `undefined`, методы (функции) и `Symbol`.
2. Вторая строка выведет **`'[10,null,null]'`** — в массиве нельзя пропустить индекс, поэтому `undefined` и `NaN` заменяются на `null`.
3. Третья строка упадёт с **`TypeError`** из-за `BigInt` (`10n` в JSON не сериализуется), а сам `Set` без предварительного разворота в массив `[...set]` превратился бы в пустой `'{}'`.

</details>

**2. Какие 3 синтаксические ошибки JSON не дадут сработать `JSON.parse(badJson)` и почему после `JSON.stringify(user)` запись `userJson.name` вернёт `undefined`?**

```js
const badJson = "{ name: 'Алекс', 'age': 28, }";
```

<details>
<summary>Показать ответ</summary>

`JSON.parse` выбросит `SyntaxError` сразу по трём причинам:
1. Ключ `name` написан без кавычек (все ключи обязаны быть в `"..."`).
2. Строка `'Алекс'` и ключ `'age'` взяты в одинарные кавычки `'` вместо двойных `"`.
3. После последнего поля `28,` стоит лишняя висячая запятая.

А `userJson.name` даёт `undefined`, потому что `JSON.stringify` возвращает **обычную строку**, а не объект — для чтения свойств строку нужно сначала разобрать обратно через `JSON.parse(userJson)`.

</details>

**3. Почему копирование через `JSON.parse(JSON.stringify(order))` ломает объекты `Date` и как вернуть настоящую дату обратно?**

<details>
<summary>Показать ответ</summary>

У `Date` есть встроенный метод `toJSON()`, поэтому при `JSON.stringify` дата превращается в обычную ISO-строку (например, `"2026-05-20T18:00:00.000Z"`). Обратный `JSON.parse` сам по себе строки обратно в даты не переводит, оставляя их строками. Чтобы вернуть полноценный `Date`, передают второй аргумент `reviver(key, value)` — либо используют современный `structuredClone()`.

</details>

## Задачи

**Задача 1. Фильтрация пароля и красивое форматирование JSON (`replacer` и `space`)**

Сериализуй объект `account` в JSON без секретного поля `password`:

1. Вызови `JSON.stringify(account, ['id', 'login', 'email'], 2)`, чтобы оставить только публичные поля и задать отступ `2` пробела.
2. Распарси полученную строку `prettyJson` в объект `publicProfile` через `JSON.parse(...)`.

Проверка: `publicProfile.password` должен быть `undefined`.

```js
'use strict';

const account = {
  id: 42,
  login: 'alex_dev',
  password: 'superSecretPassword123',
  email: 'alex@example.com',
  greet() { console.log('Привет'); },
};

/* Твоё решение: */

console.log(prettyJson);
console.log(publicProfile.password); /* undefined */
```

<details>
<summary>Подсказка и решение</summary>

```js
'use strict';

const account = {
  id: 42,
  login: 'alex_dev',
  password: 'superSecretPassword123',
  email: 'alex@example.com',
  greet() { console.log('Привет'); },
};

/*
  2-й аргумент ['id', 'login', 'email'] разрешает только эти ключи
  (password и greet не попадут); 3-й аргумент 2 задаёт отступ в 2 пробела
*/
const prettyJson = JSON.stringify(account, ['id', 'login', 'email'], 2);

/* Превращаем валидную JSON-строку обратно в живой объект JS */
const publicProfile = JSON.parse(prettyJson);

console.log(prettyJson);
console.log(publicProfile.password); /* undefined — поле отфильтровано */
```

</details>

**Задача 2. Сохранение `Set` и восстановление `Date` через `reviver`**

Проведи объект `event` через `JSON.stringify` и `JSON.parse` без потери типов:

1. Не изменяя исходный объект `event`, подготовь копию `preparedEvent`, где `Set` в поле `tags` преобразован в массив через `[...event.tags]`.
2. Переведи `preparedEvent` в строку через `JSON.stringify` и разбери обратно через `JSON.parse(json, reviver)`, вернув полю `date` объект `new Date(value)`, а полю `tags` — `new Set(value)`.

Проверка: все три `console.log` ниже должны вывести `true`.

```js
'use strict';

const event = {
  title: 'JS Meetup',
  date: new Date('2026-05-20T18:00:00Z'),
  tags: new Set(['js', 'frontend', 'json']),
};

/* Твоё решение: */

/* instanceof проверяет, принадлежит ли объект классу (разберём в Уроке 19) */
console.log(restored.date instanceof Date); /* true */
console.log(restored.tags instanceof Set);  /* true */
console.log(restored.tags.has('json'));     /* true */
```

<details>
<summary>Подсказка и решение</summary>

```js
'use strict';

const event = {
  title: 'JS Meetup',
  date: new Date('2026-05-20T18:00:00Z'),
  tags: new Set(['js', 'frontend', 'json']),
};

/*
  Создаём копию со спредом и заменяем Set на массив, чтобы JSON.stringify
  сохранил элементы тегов вместо пустого '{}'
*/
const preparedEvent = { ...event, tags: [...event.tags] };
const json = JSON.stringify(preparedEvent);

/*
  reviver вызывается для каждой пары ключ-значение при разборе JSON
  и позволяет превратить строку даты и массив обратно в Date и Set
*/
const restored = JSON.parse(json, (key, value) => {
  if (key === 'date') return new Date(value);
  if (key === 'tags') return new Set(value);
  return value;
});

/* instanceof проверяет, создан ли объект этим конструктором (Урок 19) */
console.log(restored.date instanceof Date); /* true */
console.log(restored.tags instanceof Set);  /* true */
console.log(restored.tags.has('json'));     /* true */
```

</details>

**Задача 3. Исключение циклических ссылок через функцию `replacer`**

Объекты `room` и `meetup` ссылаются друг на друга (`meetup.self = meetup`), поэтому обычный `JSON.stringify(meetup)` падает с `TypeError`. Почини сериализацию:

1. Передай вторым аргументом в `JSON.stringify` функцию `replacer(key, value)`.
2. Возвращай `undefined` для любых вложенных ссылок на `meetup`, но обязательно проверяй `key !== ''`, чтобы на первом шаге не отбросить сам корневой объект.

Проверка: в консоль должна вывестись валидная JSON-строка без `occupiedBy` и `self`.

```js
'use strict';

const room = { number: 23 };
const meetup = {
  title: 'Конференция',
  participants: ['Иван', 'Анна'],
  place: room,
};

room.occupiedBy = meetup;
meetup.self = meetup;

/* Твоё решение: */
const json = JSON.stringify(meetup);

console.log(json);
/* '{"title":"Конференция","participants":[...],"place":{"number":23}}' */
```

<details>
<summary>Подсказка и решение</summary>

```js
'use strict';

const room = { number: 23 };
const meetup = {
  title: 'Конференция',
  participants: ['Иван', 'Анна'],
  place: room,
};

room.occupiedBy = meetup;
meetup.self = meetup;

/*
  replacer(key, value): если вернуть undefined, свойство пропустится.
  Проверка key !== '' обязательна: на 1-м вызове ключ равен '' (корень),
  и без неё replacer отбросил бы весь объект целиком!
*/
const json = JSON.stringify(meetup, (key, value) => {
  return key !== '' && value === meetup ? undefined : value;
});

console.log(json);
/* '{"title":"Конференция","participants":[...],"place":{"number":23}}' */
```

</details>
