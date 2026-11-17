# Урок 22. Асинхронный JS: Event Loop, колбэки, Promise, async / await

Суть урока: Асинхронность позволяет запускать долгие задачи (таймеры, запросы на сервер) без заморозки остального кода; вместо вложенных колбэков (Callback Hell) используют Promise и синтаксис async / await.

## 1. Синхронный и асинхронный код (00:24–03:26)

[+] Движок V8 выполняет код в одном потоке (последовательно сверху вниз). Если задача занимает много времени синхронно, программа «зависает» до её завершения.

```js
/* Синхронный код: каждая строка ждёт завершения предыдущей */
console.log('Сообщение 1');
console.log('Сообщение 2');
console.log('Сообщение 3');

/* Асинхронная обёртка wait через setTimeout: основной код не блокируется */
const wait = (ms, callback) => {
  setTimeout(callback, ms);
};

console.log('Сообщение 1');
wait(5000, () => console.log('Сообщение 2')); /* выполнится через 5 секунд */
console.log('Сообщение 3');                  /* выведется сразу после 1 */

/* Вывод в консоли: "Сообщение 1" -> "Сообщение 3" -> (через 5 сек) "Сообщение 2" */
```

## 2. Событийный цикл (Event Loop) и очередь задач (03:29–05:40)

[+] Механизм событийного цикла позволяет JavaScript с одним потоком выполнения обрабатывать асинхронные операции: долгая задача уходит из основного потока, а её колбэк попадает в очередь задач и ждёт, пока основной поток освободится.

```js
console.log('Начало программы');

/* setTimeout регистрирует таймер вне основного потока и не тормозит код ниже */
setTimeout(() => {
  console.log('Асинхронная задача выполнена');
}, 2000);

console.log('Конец программы');

/* Порядок: 1) "Начало программы", 2) "Конец программы" — основной поток пуст,
   3) через 2 сек колбэк из очереди задач попадает в поток -> "Асинхронная задача..." */
```

[!] В Event Loop есть две разные очереди: микрозадачи (.then/.catch/.finally, код после await) и макрозадачи (setTimeout, клики). После синхронного кода движок сначала полностью очищает очередь микрозадач и только потом берёт 1 макрозадачу.

```js
console.log('1. Синхронный старт');
setTimeout(() => console.log('4. Макрозадача (таймер 0 мс)'), 0);
Promise.resolve().then(() => console.log('3. Микрозадача (Promise)'));
console.log('2. Синхронный финиш');

/* Итог: 1 -> 2 -> 3 (микрозадача обгоняет таймер!) -> 4 (макрозадача) */
```

## 3. Колбэки и «ад колбэков» — Callback Hell (05:43–09:57)

[!] Когда асинхронные запросы зависят друг от друга (данные второго запроса приходят из результата первого), вложенные колбэки быстро растут вправо и превращаются в нечитаемую «пирамиду» — Callback Hell.

```js
const makeRequest = (url, onSuccess) => { /* имитация запроса на сервер */ };
const sellerId = 154;

/* Задача: продавец -> его первый товар -> первый отзыв -> имя автора отзыва */
makeRequest(`/api/sellers/${sellerId}`, (seller) => {
  const firstProductId = seller.productIds[0];

  makeRequest(`/api/products/${firstProductId}`, (product) => {
    const firstReviewId = product.reviewsIds[0];

    makeRequest(`/api/reviews/${firstReviewId}`, (review) => {
      const authorName = review.author.name;
      console.log(authorName);
    });
  });
});
```

## 4. Промисы (Promise): 3 состояния, then, catch, finally (09:58–15:59)

[+] Promise — специальный объект-обёртка для асинхронного кода. У него всегда одно из 3 состояний, и перейти из pending в итог можно только 1 раз:

- pending (ожидание): исходное состояние в момент создания промиса;
- fulfilled (выполнено успешно): вызывается переданный колбэк fulfill / resolve;
- rejected (выполнено с ошибкой): вызывается переданный колбэк reject.

```js
/* В конструктор Promise передаётся функция-исполнитель с двумя колбэками */
const promise = new Promise((fulfill, reject) => {
  console.log('Начало, состояние pending...');

  setTimeout(() => {
    if (Math.random() > 0.5) {
      fulfill('Ура, состояние fulfilled!'); /* переводит промис в успех */
    } else {
      reject('Увы, состояние rejected!');   /* переводит промис в ошибку */
    }
  }, 3000);
});

/* Обработка результата: then (успех), catch (ошибка), finally (в любом случае) */
promise
  .then((successData) => {
    console.log('Успех:', successData);
  })
  .catch((errorData) => {
    console.log('Ошибка:', errorData);
  })
  .finally(() => {
    console.log('Выполняется всегда: и при успехе, и при ошибке');
  });

/* Альтернатива (менее наглядная): 2 аргумента в then — (onFulfilled, onRejected) */
promise.then(
  (successData) => console.log(successData),
  (errorData) => console.log(errorData)
);
```

[!] Вокруг функции-исполнителя new Promise(...) и внутри .then() работает невидимый try..catch: обычный throw сразу переводит промис в rejected. Но на отложенный throw внутри setTimeout он не действует — там нужен именно вызов reject(...).

```js
/* Синхронный throw ловится автоматически, как reject */
new Promise(() => {
  throw new Error('Синхронный сбой');
}).catch((err) => console.log(err.message)); /* "Синхронный сбой" */

/* ОШИБКА: throw внутри setTimeout вылетит мимо .catch в глобальную ошибку! */
new Promise((fulfill, reject) => {
  setTimeout(() => {
    reject(new Error('Правильный способ для таймера')); /* вместо throw */
  }, 500);
}).catch((err) => console.log(err.message));

/* Если у отклонённого промиса нет .catch(), в браузере сработает unhandledrejection */
```

## 5. Избавляемся от Callback Hell цепочкой .then().catch() (16:00–17:11)

[+] Если makeRequest возвращает Promise, вместо вложенной пирамиды пишем плоскую цепочку вызовов .then() с одним общим .catch() для отлова ошибок на любом шаге.

```js
const makeRequest = (url) => new Promise((fulfill) => {
  fulfill('результат с сервера');
});

makeRequest(`/api/sellers/${sellerId}`)
  .then((seller) => {
    const firstProductId = seller.productIds[0];
    return makeRequest(`/api/products/${firstProductId}`); /* возвращаем новый Promise */
  })
  .then((product) => {
    const firstReviewId = product.reviewsIds[0];
    return makeRequest(`/api/reviews/${firstReviewId}`);
  })
  .then((review) => {
    console.log(review.author.name);
  })
  .catch((error) => {
    console.log(error); /* поймает ошибку любого из запросов выше */
  });
```

[!] Подвох цепочки: каждый .then() возвращает новый промис. Если внутри .then() забыть слово return перед следующим промисом, цепочка разорвётся.

```js
makeRequest(`/api/sellers/${sellerId}`)
  .then((seller) => {
    makeRequest(`/api/products/${seller.productIds[0]}`); /* ЗАБЫЛИ return! */
  })
  .then((product) => {
    console.log(product); /* выведет undefined, не дожидаясь загрузки товара */
  });
```

## 6. async / await, top-level await и try / catch (17:12–23:50)

[+] Ключевое слово async перед функцией гарантирует, что она всегда вернёт Promise (даже если внутри return обычного значения). Оператор await ждёт завершения промиса и сразу достаёт из него результат.

```js
/* Обычное объявление и стрелочная функция (async пишется перед круглыми скобками) */
async function getSomething() {
  return 'Привет!'; /* JS автоматически обернёт строку в fulfilled Promise */
}
const getAsyncArrow = async () => {
  return new Promise((fulfill) => setTimeout(() => fulfill('Привет!'), 3000));
};

/* Не забываем скобки вызова getSomething(), иначе получим ошибку отсутствия .then */
getSomething().then((value) => console.log(value));

/* await без async снаружи даст SyntaxError (кроме <script type="module">) */
async function run() {
  console.log('Начало');
  const result = await getAsyncArrow(); /* ждёт 3 сек и достаёт строку, а не Promise */
  console.log(result);                  /* выведет "Привет!" только после ожидания */
  console.log('Конец');
}
run();
```

[+] Переписываем пример с маркетплейсом на async / await: код выглядит как обычный синхронный, а ошибки ловятся через try / catch.

```js
async function showFirstReviewAuthor(sellerId) {
  try {
    const seller = await makeRequest(`/api/sellers/${sellerId}`);
    const firstProductId = seller.productIds[0];

    const product = await makeRequest(`/api/products/${firstProductId}`);
    const firstReviewId = product.reviewsIds[0];

    const review = await makeRequest(`/api/reviews/${firstReviewId}`);
    console.log(review.author.name);
  } catch (error) {
    console.log(error);
  }
}
```

[!] Что делает await под капотом: он НЕ замораживает весь JavaScript и браузер. На паузу ставится только тело самой async-функции — внешний код сразу идёт дальше, а строки после await попадут в очередь микрозадач, когда промис завершится.

```js
async function testAwait() {
  console.log('2. Внутри функции до await'); /* выполнится синхронно */
  await Promise.resolve();                  /* пауза функции, хвост -> в микрозадачи */
  console.log('4. После await');             /* продолжение из очереди микрозадач */
}

console.log('1. До вызова');
testAwait();
console.log('3. Код снаружи не ждёт!');
/* Вывод строго: 1 -> 2 -> 3 -> 4 */
```

## 7. Параллельный запуск: Promise.all, Promise.allSettled, Promise.race

[+] Если запросы не зависят друг от друга, писать await подряд невыгодно — запросы будут ждать друг друга. Статические методы Promise запускают их одновременно:

```js
/* Promise.all: ждёт ВСЕ промисы. Если упадёт хотя бы один — весь all уйдёт в catch */
const [user, orders] = await Promise.all([
  makeRequest('/api/user'),
  makeRequest('/api/orders'),
]);

/* Promise.allSettled: ждёт ВСЕ, НЕ падает при ошибке, даёт статус каждого */
const results = await Promise.allSettled([
  Promise.resolve('ОК'),
  Promise.reject('Сбой'),
]);
/* results[0] -> { status: "fulfilled", value: "ОК" }
   results[1] -> { status: "rejected", reason: "Сбой" } */

/* Promise.race: возвращает результат (или ошибку) того, кто финишировал ПЕРВЫМ */
const fastest = await Promise.race([makeRequest('/mirror1'), makeRequest('/mirror2')]);
```

## 8. Связка с практикой: готовые промисы (fetch), циклы и шпаргалка выбора

[+] В реальной работе new Promise пишут редко — в 95% случаев ты получаешь уже готовый Promise от браузера или библиотеки (например, fetch). Конструктор new Promise нужен, чтобы обернуть старый callback-API (вроде setTimeout) под удобный await.

```js
/* Ручной new Promise нужен для обёртки колбэков ("промисификация" таймера) */
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/* Готовый Promise от браузера (fetch): await распаковывает ответ и JSON */
async function loadPost(id) {
  await delay(500); /* пауза на полсекунды без блокировки интерфейса */
  const response = await fetch(`https://example.com/posts/${id}`);
  const data = await response.json(); /* response.json() тоже возвращает Promise */
  return data;
}
```

[!] Частый баг в циклах: forEach НЕ ждёт await — он запускает все колбэки сразу и уходит дальше. Для ожидания в цикле бери for..of (по очереди) или Promise.all + map.

```js
const ids = [1, 2, 3];

/* НЕПРАВИЛЬНО: forEach игнорирует async/await и не ждёт завершения запросов */
ids.forEach(async (id) => { await loadPost(id); });

/* ПРАВИЛЬНО (строго по очереди, один за другим): */
for (const id of ids) { await loadPost(id); }

/* ПРАВИЛЬНО (все 3 одновременно и ждём общий результат): */
const posts = await Promise.all(ids.map((id) => loadPost(id)));
```

[+] Короткая шпаргалка выбора инструмента:
- Пауза / отложенный код -> setTimeout или delay(ms) через new Promise.
- Запросы зависят друг от друга -> async / await + try / catch.
- Запросы независимы и важен каждый -> await Promise.all([...]).
- Запросы независимы, но сбой одного не должен ломать всё -> Promise.allSettled([...]).

## 3 главные ловушки урока (чек-лист для повторения)

1. Забыть await перед асинхронной функцией: в переменную запишется объект Promise {`<pending>`}, а не сами данные.

2. Использовать await в обычном `<script>` вне async-функции: движок выдаст SyntaxError (верхнеуровневый await работает только в `<script type="module">`).

3. Поставить await без try / catch или вызвать async-функцию без скобок (): отклонённый промис выбросит необработанное исключение, а без () у функции нет .then.
