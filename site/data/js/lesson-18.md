# Урок 18. Формат данных JSON: stringify, parse и ограничения

Суть урока:

- **Назначение JSON:** текстовый формат для передачи данных между JS и сервером.
- **Преобразование:** `JSON.stringify()` превращает объект в строку, а `JSON.parse()` собирает строку обратно в объект.

## 1. Что такое JSON и 3 строгих правила синтаксиса (00:24)

```js
/* JSON (JavaScript Object Notation) — текстовый стандарт данных в виде JS-объекта.
   Пример валидного .json файла (внутри действуют 3 жёстких правила): */
{
  "name": "Александр",
  "age": 28,
  "isDeveloper": true,
  "car": null,
  "skills": ["HTML", "CSS", "JS"]
}
/* 1) Разрешённые значения: строки, числа, true/false, null, массивы и объекты.
      НЕЛЬЗЯ: undefined, функции (методы) и комментарии!
   2) Имена свойств (ключи) и ВСЕ строки — СТРОГО в двойных кавычках (не '...' и не ``).
   3) Запрещены висячие запятые (trailing comma) после последнего свойства или элемента! */
```

## 2. Зачем нужен JSON и почему нельзя использовать toString() (01:35 – 02:05)

```js
const user = { name: 'Александр', age: 28 };
/* Живой JS-объект из памяти нельзя отправить на сервер — в сети данные передаются СТРОКОЙ.
   Обычный метод user.toString() бесполезен — он стирает все свойства объекта: */
user.toString(); // '[object Object]' (данные потеряны!)
/* Писать свой рекурсивный переводчик через Object.entries сложно — для этого есть JSON. */
```

## 3. Методы JSON.stringify и JSON.parse (03:23 – 03:53)

```js
/* Глобальный объект JSON (все 4 буквы заглавные) имеет два главных метода: */

/* 1. JSON.stringify(obj) — переводит JS-объект или массив в валидную JSON-строку: */
const jsonString = JSON.stringify(user);
// '{"name":"Александр","age":28}' (эту строку уже можно отправлять на сервер)

/* 2. JSON.parse(str) — обратная операция: разбирает валидную JSON-строку в JS-объект: */
const parsedUser = JSON.parse(jsonString);
// { name: 'Александр', age: 28 } — живой объект, можно читать parsedUser.name
```

## 4. Ошибки при парсинге JSON.parse (04:15)

```js
/* JSON.parse() упадёт с SyntaxError, если в строке нарушено хоть одно правило JSON: */
// JSON.parse("{ name: 'Саша' }");  // Ошибка: ключ без двойных кавычек + '...' вместо "..."
// JSON.parse('{"age": 28,}');     // Ошибка: лишняя висячая запятая в конце!
/* (Как перехватывать такие ошибки через try/catch, разберём позже в Блоке 4.) */
```

## 5. Ограничения JSON.stringify: что пропадает при конвертации (05:06)

```js
const fullUser = {
  name: 'Александр',
  car: undefined,                // Свойство со значением undefined
  [Symbol('id')]: 1,             // Ключи и значения типа Symbol тоже пропускаются
  sayHi() { console.log('Hi'); } // Метод (функция)
};

/* JSON.stringify МОЛЧА пропускает функции, свойства с undefined и ключи/значения Symbol: */
const raw = JSON.stringify(fullUser); // '{"name":"Александр"}'
const back = JSON.parse(raw);         // { name: 'Александр' } — всё лишнее исчезло навсегда!
/* Особенности с массивами, коллекциями и особыми числами: */
JSON.stringify([1, undefined, NaN]);  // '[1,null,null]' (в массиве заменяет на null!)
JSON.stringify(new Set([1, 2]));      // '{}' (Map и Set превращает в пустой объект!)
/* Чтобы сохранить Map/Set -> сначала Object.fromEntries(map) или [...set]. */
/* Циклическая ссылка (объект ссылается на себя) или BigInt (10n) -> сразу TypeError! */
```

## 6. Массивы, примитивы в JSON и старый трюк копирования (05:42)

```js
/* Валидный JSON НЕ обязан начинаться с {...} — это может быть сразу массив [...] или примитив:
   списки пользователей/товаров с сервера почти всегда приходят массивом объектов: */
const usersJson = '[{"name":"Саша","age":28},{"name":"Макс","age":25}]';
const usersList = JSON.parse(usersJson); // Готовый массив объектов JS!
usersList[1].name;                       // 'Макс'
JSON.parse('123');                       // 123 (одиночное число/строка/true — тоже JSON)

/* Старый способ глубокого копирования (встречается в проектах до появления structuredClone):
   const deepCopy = JSON.parse(JSON.stringify(obj));
   Но он ломает Date (делает строкой), выкидывает методы/undefined и обнуляет Map/Set! */
```

## 7. Форматирование (space), фильтрация (replacer), toJSON и reviver

```js
const account = { name: 'Саша', age: 28, password: '123', date: new Date() };
/* 1. Аргументы JSON.stringify(value, replacer, space):
   - replacer (массив полей или функция) — выбирает, какие ключи включить (скрыть пароль);
   - space (число пробелов, обычно 2) — добавляет переносы и отступы для красивого вывода: */
const pretty = JSON.stringify(account, ['name', 'age'], 2); // Только name и age с отступом 2

/* 2. Метод toJSON(): если он есть у объекта (как у Date), stringify вызовет его сам:
   Date превращается в ISO-строку, а при обратном JSON.parse остаётся ОБЫЧНОЙ строкой!
   Чтобы вернуть обратно объект Date, передай 2-м аргументом reviver(key, value): */
const jsonWithDate = JSON.stringify(account);
const restored = JSON.parse(jsonWithDate, (key, value) => {
  return key === 'date' ? new Date(value) : value;
});
restored.date instanceof Date; // true (снова полноценный объект даты!)
```

## 8. Где JSON используется на практике (3 главных случая)

```js
/* 1. Общение с сервером (API): отправка формы (stringify) и чтение списка товаров (parse).
   2. Хранилище браузера (localStorage хранит лишь строки — без JSON будет '[object Object]'): */
localStorage.setItem('cart', JSON.stringify([{ id: 1, qty: 2 }])); // Сохранили строкой
const savedCart = JSON.parse(localStorage.getItem('cart'));          // Достали обратно массивом
/* 3. Файлы настроек проектов (например, package.json): единый формат для разных языков. */
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

Преобразуй объект `account` в аккуратную JSON-строку с отступом `2` пробела, включив только публичные поля (`id`, `login`, `email`) с помощью массива-фильтра `replacer` (чтобы `password` не попал в строку). Затем сразу распарси полученную строку в объект `publicProfile` и проверь, что пароля в нём нет.

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
  2-й аргумент ['id', 'login', 'email'] разрешает сериализовать только эти ключи
  (password и метод greet не попадут в итог); 3-й аргумент 2 задаёт отступ в 2 пробела
*/
const prettyJson = JSON.stringify(account, ['id', 'login', 'email'], 2);

/* Превращаем валидную JSON-строку обратно в живой объект JS */
const publicProfile = JSON.parse(prettyJson);

console.log(prettyJson);
console.log(publicProfile.password); /* undefined — секретное поле отфильтровано */
```

</details>

**Задача 2. Сохранение `Set` и восстановление `Date` через `reviver`**

Проведи объект `event` через `JSON.stringify` и `JSON.parse` без потери типов:
1) Не изменяя исходный объект `event`, подготовь копию для JSON так, чтобы `Set` в поле `tags` не потерялся как `{}` (преобразуй его в массив через `[...]`).
2) При разборе JSON-строки через `JSON.parse` передай вторым аргументом функцию `reviver(key, value)`, которая вернёт полю `date` объект `new Date(value)`, а полю `tags` — коллекцию `new Set(value)`.

```js
'use strict';

const event = {
  title: 'JS Meetup',
  date: new Date('2026-05-20T18:00:00Z'),
  tags: new Set(['js', 'frontend', 'json']),
};

/* Твоё решение: */

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

console.log(restored.date instanceof Date); /* true */
console.log(restored.tags instanceof Set);  /* true */
console.log(restored.tags.has('json'));     /* true */
```

</details>

**Задача 3. Исключение циклических ссылок через функцию `replacer`**

Объекты `room` и `meetup` ссылаются друг на друга (плюс `meetup.self = meetup`), поэтому обычный `JSON.stringify(meetup)` падает с `TypeError`. Передай вторым аргументом в `JSON.stringify` функцию `replacer(key, value)`, которая отбрасывает (возвращает `undefined`) любые вложенные ссылки на `meetup` (учти, что на самом первом шаге для корневого объекта `key` равен пустой строке `''`).

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
/* '{"title":"Конференция","participants":["Иван","Анна"],"place":{"number":23}}' */
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
  Функция replacer(key, value): если вернуть undefined, свойство пропустится.
  Проверка key !== '' обязательна: на 1-м вызове ключ равен '' (это сам корень meetup),
  и без этой проверки replacer отбросил бы весь объект целиком!
*/
const json = JSON.stringify(meetup, (key, value) => {
  return key !== '' && value === meetup ? undefined : value;
});

console.log(json);
/* '{"title":"Конференция","participants":["Иван","Анна"],"place":{"number":23}}' */
```

</details>
