# Урок 18. Формат данных JSON: stringify, parse и ограничения

Суть урока: JSON — это текстовый формат для передачи данных между JS и сервером; JSON.stringify() превращает объект в строку, а JSON.parse() собирает строку обратно в объект.

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
