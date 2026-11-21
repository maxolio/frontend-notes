# Урок 40. Запросы fetch: клиент-сервер, статусы, GET/POST, JSON Server и Network

Суть урока:

- **Запрос и ответ:** `fetch(url, options)` отправляет сетевой запрос и возвращает `Promise`; статус проверяют через `response.ok` / `response.status`, тело читают через `return response.json()`.
- **Настройки:** для POST, заголовков и кук передают `method`, `body`, `headers` и `credentials`.

## 1. Клиент-сервер, API, первый fetch и статусы ответа (00:30–06:32)

[+] API — набор правил общения фронтенда (клиента) с бэкендом (URL-адресами сервера). В обучении используют бесплатный REST API jsonplaceholder. Коды ответа делятся по диапазонам: 200–226 (успех: 200 OK, 201 Created), 4xx (ошибка клиента, напр. 404), 5xx (внутренняя ошибка сервера, напр. 500).

```js
fetch('https://jsonplaceholder.typicode.com/todos/1')
  .then((response) => {
    /*
      response — объект Response: ok (true/false), status (200, 404...).
      Тело (.json/.text/.blob) читают 1 раз (для 2 — response.clone());
      ok, status и response.headers.get(...) доступны сколько угодно.
      При 204 No Content тело пустое — .json() вызовет ошибку:
    */
    if (response.status === 204) return null;
    /* Тоже возвращает Promise, поэтому обязателен return! */
    return response.json();
  })
  /* Готовые данные: { userId, id, title, completed }: */
  .then((json) => console.log(json));
```

## 2. Динамический GET по форме и обработка 404 через !response.ok (06:33–13:12)

[!] Блок .catch() ловит только обрыв сети, но НЕ ловит ответы 404 или 500 — сервер ответил, поэтому Promise считается выполненным (ok: false). Чтобы передать ошибку в .catch(), внутри первого .then проверяем !response.ok и бросаем throw new Error(...).

```js
loadTodoFormElement.addEventListener('submit', (event) => {
  event.preventDefault();
  /* submitBtn.disabled = true; — блокируем повторный клик на время запроса */

  const url =
    `https://jsonplaceholder.typicode.com/todos/${todoIdInputElement.value}`;

  fetch(url)
    .then((response) => {
      if (!response.ok) {
        const errMsg = response.status === 404
          ? 'Задача по указанному идентификатору не найдена'
          : 'Что-то пошло не так :(';
        /* Прерывает цепочку и сразу прыгает в .catch(): */
        throw new Error(errMsg);
      }
      return response.json();
    })
    .then(({ id, title, completed }) => {
      const checkedAttr = completed ? 'checked' : '';
      resultElement.innerHTML =
        `<input type="checkbox" ${checkedAttr}><span>${title}</span>`;
    })
    .catch((error) => {
      resultElement.innerHTML = error.message;
    })
    .finally(() => {
      /* Сработает и при успехе, и при ошибке — здесь снимают disabled */
    });
});
```

## 3. Локальный json-server и отправка данных через POST (13:13–23:54)

[+] Для практики поднимают локальный mock-сервер json-server с файлом db.json5 (формат допускает ключи без кавычек и висячие запятые): команда запуска npx json-server db.json5. Основные методы запросов: GET (по умолчанию), POST, PUT, PATCH, DELETE.

```js
createPostFormElement.addEventListener('submit', (event) => {
  event.preventDefault();
  const formData = new FormData(createPostFormElement);
  /* Имена полей в HTML должны совпадать с ключами в db.json5: */
  const formDataObject = Object.fromEntries(formData);

  fetch('http://localhost:3000/posts', {
    method: 'POST', /* в 2-м аргументе задаём метод и тело запроса */
    /* Реальному бэкенду заголовок Content-Type обязателен: */
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...formDataObject, views: 0 }),
  })
    /* В ответ вернётся созданный пост со статусом 201: */
    .then((response) => response.json())
    .then((json) => console.log(json));
});
```

## 4. GET-параметры в URL, заголовки headers и куки credentials (23:55–30:47)

[+] Параметры фильтрации в GET передают прямо в URL после ? по схеме ключ=значение через & (в json-server: _gt — больше, _gte — больше или равно). В 2-м аргументе fetch также задают headers (тип данных, токены) и credentials (отправка cookies).

```js
/* GET с query-параметром фильтрации (views >= значения из инпута): */
const minViews = postViewsInputElement.value;
fetch(`http://localhost:3000/posts?views_gte=${minViews}`)
  .then((response) => response.json())
  .then((posts) => {
    resultElement.innerHTML = posts
      .map(({ title, views }) => `<p>${title}, просмотров: ${views}</p>`)
      .join('');
  });

/* Безопасно собирать параметры через URLSearchParams (экранирует сам): */
/* const params = new URLSearchParams({ views_gte: minViews }); */
/* fetch(`http://localhost:3000/posts?${params}`); */

/*
  Настройки headers, credentials ('same-origin' по умолчанию,
  'include' для другого домена, 'omit' — запретить) и signal для отмены:
  headers: { 'Content-Type': 'application/json', 'X-Auth-Token': '...' }
*/
const controller = new AbortController(); /* abort() -> AbortError */
/* fetch(url, { headers, credentials: 'include', signal }) */
```

## 5. Анализ запросов во вкладке DevTools -> Network (30:48–37:17)

[+] Вместо console.log запросы удобно отлаживать в DevTools -> Network:

• Фильтр Fetch/XHR показывает только JS-запросы (успешные — белые, ошибки — красные); колонка Initiator ведёт прямо на строку кода с fetch, а Waterfall рисует таймлайн.
• Клик по запросу открывает вкладки: Headers (URL, Status, Request/Response Headers), Payload (тело POST или GET-параметры), Response / Preview (сырой и структурированный JSON) и Timing (ожидание и загрузка).

## 3 главные ловушки урока (чек-лист для повторения)

1. Ждать, что .catch() поймает статус 404 или 500 — fetch считает их успешным ответом, поэтому в первом .then обязательно проверять if (!response.ok) throw new Error(...).

2. Забыть return перед response.json() (следующий .then получит undefined) или передать в body обычный объект вместо JSON.stringify(...) при отправке JSON.

3. Считать, что fetch отправляет cookies на чужой домен/порт — по умолчанию стоит credentials: "same-origin", поэтому для кросс-доменных кук нужен credentials: "include".

## Вопросы для закрепления

**1. Почему при статусе `404` блок `.catch()` ниже не сработает, а во втором `.then()` окажется `undefined`?**

```js
fetch('https://example.com/missing-page')
  .then((response) => {
    response.json();
  })
  .then((data) => console.log(data))
  .catch((err) => console.log('Ошибка:', err.message));
```

<details>
<summary>Показать ответ</summary>

1. `fetch()` отклоняет промис только при **сетевом сбое** (нет интернета, упал DNS). HTTP-ошибки `404` и `500` считаются ответом сервера (`response.ok === false`), и промис остаётся выполненным — поэтому в первом `.then` обязательно проверяют `if (!response.ok) throw new Error(response.status)`.
2. Перед `response.json()` забыли **`return`**: метод возвращает `Promise`, и без возврата следующий `.then` сразу получает `undefined`, не дожидаясь JSON.

</details>

**2. Почему нельзя вызвать `await response.text()` сразу после `await response.json()`, и что случится при `.json()` на ответе со статусом `204`?**

<details>
<summary>Показать ответ</summary>

1. Тело ответа (`Response`) — это поток, который разрешено прочитать **только 1 раз**: второй вызов `.text()` или `.json()` сразу выбросит `TypeError` (`body stream already read`). Для чтения в двух видах заранее делают копию через `response.clone()` (при этом `ok`, `status` и `headers` можно читать сколько угодно раз).
2. Статус `204 No Content` означает пустое тело без JSON — вызов `response.json()` упадёт с `SyntaxError`, поэтому перед чтением проверяют `if (response.status === 204) return null;`.

</details>

**3. Зачем при отправке JSON методом `POST` передавать и заголовок `'Content-Type': 'application/json'`, и `JSON.stringify(data)`, и почему куки не уходят на другой порт `localhost:3000`?**

<details>
<summary>Показать ответ</summary>

1. Без `JSON.stringify` обычный объект в `body` превратится в бесполезную строку `"[object Object]"`, а без заголовка `'Content-Type': 'application/json'` сервер примет тело за простой текст и не распарсит JSON.
2. По умолчанию у `fetch` включено правило `credentials: 'same-origin'` — cookies отправляются только на **совпадающий** домен и порт. Для кросс-доменных или кросс-портовых запросов указывают `credentials: 'include'`.

</details>

## Задачи

**Задача 1. Универсальная обёртка `fetchJson(url, options)` с проверкой `ok`, `204` и таймаутом `AbortController`**

Чтобы не дублировать проверку `response.ok`, обработку пустого `204` и отмену зависших запросов, вынеси их в единую обёртку. Напиши `async function fetchJson(url, options = {})`:

1. Создай `const controller = new AbortController()` и поставь `setTimeout`, чтобы запрос отменялся через `5000` мс (передай `{ ...options, signal: controller.signal }` в `fetch`).
2. В блоке `try`: если `!response.ok`, выброси `new Error(...)` со статусом ответа; если `response.status === 204` — верни `null`, иначе верни `await response.json()`.
3. В блоке `finally` обязательно очисти таймер через `clearTimeout`.

```js
'use strict';

/* Твоё решение: */
async function fetchJson(url, options = {}) {
  /* ... */
}

fetchJson('https://jsonplaceholder.typicode.com/todos/1')
  .then((data) => console.log(data))
  .catch((err) => console.log('Сбой запроса:', err.message));
```

<details>
<summary>Подсказка и решение</summary>

```js
'use strict';

async function fetchJson(url, options = {}) {
  const controller = new AbortController();
  /* Если сервер не ответит за 5 секунд — abort() прервёт fetch */
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    /* Переводим HTTP-ошибки (404, 500) в исключение для catch */
    if (!response.ok) {
      throw new Error(`HTTP ошибка: ${response.status}`);
    }

    /* При статусе 204 тело ответа пустое — не парсим JSON */
    if (response.status === 204) return null;

    return await response.json();
  } finally {
    /* Очищаем таймер при любом исходе, чтобы он не утекал */
    clearTimeout(timeoutId);
  }
}

fetchJson('https://jsonplaceholder.typicode.com/todos/1')
  .then((data) => console.log(data))
  .catch((err) => console.log('Сбой запроса:', err.message));
```

</details>

**Задача 2. Фильтрация `GET` через `URLSearchParams` и `POST` из формы**

Нужно загружать отфильтрованные посты и создавать новые на локальном `http://localhost:3000/posts`. Напиши две асинхронные функции:

1. `loadFilteredPosts(authorName, minViews)` — формирует query-строку через `new URLSearchParams({ author: authorName, views_gte: minViews })`, делает `GET`-запрос с проверкой `!response.ok` и возвращает массив постов из `.json()`.
2. `createPostFromForm(formElement)` — собирает данные через `new FormData(formElement)` + `Object.fromEntries`, добавляет `views: 0` и отправляет `POST` с заголовком `'Content-Type': 'application/json'` и телом `JSON.stringify(...)`, возвращая созданный объект.

```js
'use strict';

/* Твоё решение: */
async function loadFilteredPosts(authorName, minViews) {
  /* ... */
}

async function createPostFromForm(formElement) {
  /* ... */
}
```

<details>
<summary>Подсказка и решение</summary>

```js
'use strict';

const POSTS_URL = 'http://localhost:3000/posts';

async function loadFilteredPosts(authorName, minViews) {
  /* URLSearchParams сам безопасно кодирует кириллицу и пробелы */
  const params = new URLSearchParams({
    author: authorName,
    views_gte: minViews,
  });

  const response = await fetch(`${POSTS_URL}?${params}`);
  if (!response.ok) {
    throw new Error(`Ошибка загрузки постов: ${response.status}`);
  }

  return await response.json();
}

async function createPostFromForm(formElement) {
  const formDataObject = Object.fromEntries(new FormData(formElement));

  const response = await fetch(POSTS_URL, {
    method: 'POST',
    /* Заголовок нужен, чтобы сервер понял, что в теле приходит JSON */
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...formDataObject, views: 0 }),
  });

  if (!response.ok) {
    throw new Error(`Ошибка создания поста: ${response.status}`);
  }

  return await response.json();
}
```

</details>

**Задача 3. Параллельная загрузка профилей GitHub `getUsers(names)` с `null` при ошибке**

Нужно загрузить сразу несколько профилей GitHub так, чтобы один несуществующий логин не уронил всю пачку. Напиши `async function getUsers(names)`:

1. Запусти все запросы к `https://api.github.com/users/<name>` **одновременно** через `Promise.all` и `names.map(...)`.
2. Если конкретный логин вернул статус не `ok` (например, `404`) или произошёл обрыв сети — верни для него `null`, не ломая остальные запросы.

Проверка: для `['iliakan', 'remy', 'no-such-user-999999']` вернётся массив из 3 элементов `[{ ... }, { ... }, null]`.

```js
'use strict';

/* Твоё решение: */
async function getUsers(names) {
  /* ... */
}

getUsers(['iliakan', 'remy', 'no-such-user-999999'])
  .then((users) => console.log(users));
```

<details>
<summary>Подсказка и решение</summary>

```js
'use strict';

async function getUsers(names) {
  /*
    Запускаем все запросы параллельно через .map(), оборачивая каждый
    в try...catch, чтобы сбой или 404 одного не уронил весь Promise.all
  */
  const requests = names.map(async (name) => {
    try {
      const response = await fetch(`https://api.github.com/users/${name}`);
      if (!response.ok) return null;

      return await response.json();
    } catch {
      /* Сетевой сбой для отдельного пользователя превращаем в null */
      return null;
    }
  });

  return await Promise.all(requests);
}

getUsers(['iliakan', 'remy', 'no-such-user-999999'])
  .then((users) => console.log(users));
```

</details>
