# Урок 40. Запросы fetch: клиент-сервер, статусы, GET/POST, JSON Server и Network

Суть урока: Функция fetch(url, options) отправляет сетевой запрос и возвращает Promise; статус проверяют через response.ok / response.status, тело читают через return response.json(), а для POST, заголовков и кук передают method, body, headers и credentials.

## 1. Клиент-сервер, API, первый fetch и статусы ответа (00:30–06:32)

[+] API — набор правил общения фронтенда (клиента) с бэкендом (URL-адресами сервера). В обучении используют бесплатный REST API jsonplaceholder. Коды ответа делятся по диапазонам: 200–226 (успех: 200 OK, 201 Created), 4xx (ошибка клиента, напр. 404), 5xx (внутренняя ошибка сервера, напр. 500).

```js
fetch('https://jsonplaceholder.typicode.com/todos/1')
  .then((response) => {
    /* response — объект Response со свойствами ok (true/false) и status (200, 404...) */
    /* Тело (.json/.text/.blob) читают 1 раз! Для 2 раз нужен response.clone() до чтения; */
    /* зато ok, status и response.headers.get('Content-Type') доступны сколько угодно. */
    /* При 204 No Content (часто на DELETE/PUT) тело пустое — .json() вызовет ошибку: */
    if (response.status === 204) return null;
    return response.json(); /* тоже возвращает Promise, поэтому обязателен return! */
  })
  .then((json) => console.log(json)); /* готовые данные: { userId, id, title, completed } */
```

## 2. Динамический GET по форме и обработка 404 через !response.ok (06:33–13:12)

[!] Блок .catch() ловит только обрыв сети, но НЕ ловит ответы 404 или 500 — сервер ответил, поэтому Promise считается выполненным (ok: false). Чтобы передать ошибку в .catch(), внутри первого .then проверяем !response.ok и бросаем throw new Error(...).

```js
loadTodoFormElement.addEventListener('submit', (event) => {
  event.preventDefault();
  /* submitBtn.disabled = true; — блокируем повторный клик, пока идёт запрос */

  fetch(`https://jsonplaceholder.typicode.com/todos/${todoIdInputElement.value}`)
    .then((response) => {
      if (!response.ok) {
        const errMsg = response.status === 404
          ? 'Задача по указанному идентификатору не найдена'
          : 'Что-то пошло не так :(';
        throw new Error(errMsg); /* прерывает цепочку и сразу прыгает в .catch() */
      }
      return response.json();
    })
    .then(({ id, title, completed }) => {
      resultElement.innerHTML = `<input type="checkbox" ${completed ? "checked" : ""}>`
        + `<span>${title}</span>`;
    })
    .catch((error) => {
      resultElement.innerHTML = error.message;
    })
    .finally(() => {
      /* всегда сработает и при успехе, и при ошибке — здесь снимают disabled с кнопки */
    });
});
```

## 3. Локальный json-server и отправка данных через POST (13:13–23:54)

[+] Для практики поднимают локальный mock-сервер json-server с файлом db.json5 (формат допускает ключи без кавычек и висячие запятые): команда запуска npx json-server db.json5. Основные методы запросов: GET (по умолчанию), POST, PUT, PATCH, DELETE.

```js
createPostFormElement.addEventListener('submit', (event) => {
  event.preventDefault();
  const formData = new FormData(createPostFormElement);
  const formDataObject = Object.fromEntries(formData); /* имена полей в HTML = db.json5 */

  fetch('http://localhost:3000/posts', {
    method: 'POST', /* в 2-м аргументе fetch задаём метод и тело запроса */
    headers: { 'Content-Type': 'application/json' }, /* реальному бэкенду обязателен! */
    body: JSON.stringify({ ...formDataObject, views: 0 }),
  })
    .then((response) => response.json()) /* в ответ вернётся созданный пост со статусом 201 */
    .then((json) => console.log(json));
});
```

## 4. GET-параметры в URL, заголовки headers и куки credentials (23:55–30:47)

[+] Параметры фильтрации в GET передают прямо в URL после ? по схеме ключ=значение через & (в json-server: _gt — больше, _gte — больше или равно). В 2-м аргументе fetch также задают headers (тип данных, токены) и credentials (отправка cookies).

```js
/* GET с query-параметром фильтрации (views >= значения из инпута): */
fetch(`http://localhost:3000/posts?views_gte=${postViewsInputElement.value}`)
  .then((response) => response.json())
  .then((posts) => {
    resultElement.innerHTML = posts
      .map(({ title, views }) => `<p>${title}, просмотров: ${views}</p>`)
      .join('');
  });

/* Безопасно собирать параметры через URLSearchParams (сам экранирует кириллицу и &): */
/* const params = new URLSearchParams({ views_gte: postViewsInputElement.value }); */
/* fetch(`http://localhost:3000/posts?${params}`) */

/* Настройки headers, credentials ('same-origin' по умолчанию, 'include' для др. домена, */
/* 'omit' — запретить) и signal для отмены запроса через AbortController: */
/* headers: { 'Content-Type': 'application/json; charset=UTF-8', 'X-Auth-Token': '...' } */
const controller = new AbortController(); /* controller.abort() -> ошибка AbortError */
/* fetch(url, { headers: {...}, credentials: 'include', signal: controller.signal }) */
```

## 5. Анализ запросов во вкладке DevTools -> Network (30:48–37:17)

[+] Вместо console.log запросы удобно отлаживать в DevTools -> Network:

• Фильтр Fetch/XHR показывает только JS-запросы (успешные — белые, ошибки — красные); колонка Initiator ведёт прямо на строку кода с fetch, а Waterfall рисует таймлайн.
• Клик по запросу открывает вкладки: Headers (URL, Status, Request/Response Headers), Payload (тело POST или GET-параметры), Response / Preview (сырой и структурированный JSON) и Timing (ожидание и загрузка).

## 3 главные ловушки урока (чек-лист для повторения)

1. Ждать, что .catch() поймает статус 404 или 500 — fetch считает их успешным ответом, поэтому в первом .then обязательно проверять if (!response.ok) throw new Error(...).

2. Забыть return перед response.json() (следующий .then получит undefined) или передать в body обычный объект вместо JSON.stringify(...) при отправке JSON.

3. Считать, что fetch отправляет cookies на чужой домен/порт — по умолчанию стоит credentials: "same-origin", поэтому для кросс-доменных кук нужен credentials: "include".
