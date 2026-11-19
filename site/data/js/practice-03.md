# Практика 3. Задачи на таймеры, try/catch, Promise и модули (уроки 20–23)

Суть практики: тренируем асинхронный JavaScript и обработку ошибок — `setTimeout` + `Promise`, параллельный `Promise.all`, `try/catch/finally` и понимание порядка выполнения Event Loop.

---

## Задача 1. Промисификация задержки `delay(ms)`

Напиши функцию `delay(ms)`, которая возвращает `Promise` и переводит его в состояние `fulfilled` через `ms` миллисекунд. Используй её в `async`-функции `runSteps()`.

```js
function delay(ms) {
  // Твой код
}

async function runSteps() {
  console.log('Шаг 1');
  await delay(500);
  console.log('Шаг 2 (через 500 мс)');
}

runSteps();
```

<details>
<summary>Показать решение и разбор</summary>

```js
function delay(ms) {
  /* Передаём resolve напрямую в setTimeout — через ms промис завершится */
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function runSteps() {
  console.log('Шаг 1');
  await delay(500);
  console.log('Шаг 2 (через 500 мс)');
}
```

</details>

---

## Задача 2. Параллельная загрузка данных через `Promise.all` (не последовательно!)

Есть две асинхронные функции `loadProfile()` (200 мс) и `loadPosts()` (300 мс). Напиши функцию `loadDashboard()`, которая загружает оба набора данных **параллельно** (за ~300 мс, а не 500 мс) и возвращает `{ profile, posts }`.

```js
const loadProfile = () => new Promise((res) => setTimeout(() => res({ name: 'Анна' }), 200));
const loadPosts = () => new Promise((res) => setTimeout(() => res(['Пост 1', 'Пост 2']), 300));

async function loadDashboard() {
  // Твой код
}

loadDashboard().then(console.log);
```

<details>
<summary>Показать решение и разбор</summary>

```js
async function loadDashboard() {
  /* Два await подряд ждали бы 200 + 300 = 500 мс.
     Promise.all запускает оба запроса одновременно и ждёт самый долгий (300 мс) */
  const [profile, posts] = await Promise.all([
    loadProfile(),
    loadPosts(),
  ]);

  return { profile, posts };
}
```

</details>

---

## Задача 3. Валидация с кастомной ошибкой `throw` и `finally`

Напиши функцию `withdraw(balance, amount)`:
1. Если `amount <= 0` — выбрасывает `Error('Сумма должна быть больше нуля')`.
2. Если `amount > balance` — выбрасывает `Error('Недостаточно средств')`.
3. Иначе возвращает новый баланс `balance - amount`.
Оберни вызов в `try / catch / finally`, чтобы в `finally` всегда выводилось `'Операция завершена'`.

```js
function withdraw(balance, amount) {
  // Твой код
}

// Проверь вызов withdraw(1000, 1500) внутри try/catch/finally
```

<details>
<summary>Показать решение и разбор</summary>

```js
function withdraw(balance, amount) {
  if (amount <= 0) {
    throw new Error('Сумма должна быть больше нуля');
  }
  if (amount > balance) {
    throw new Error('Недостаточно средств');
  }
  return balance - amount;
}

try {
  const nextBalance = withdraw(1000, 1500);
  console.log('Остаток:', nextBalance);
} catch (error) {
  /* Ловим выброшенную ошибку и читаем понятное сообщение */
  console.error('Ошибка:', error.message);
} finally {
  /* Блок finally выполняется всегда — и при успехе, и при ошибке */
  console.log('Операция завершена');
}
```

</details>

---

## Задача 4. Таймаут для долгого запроса (`Promise.race`)

Напиши функцию `withTimeout(promise, ms)`, которая возвращает результат `promise`, если он успел выполниться быстрее `ms` миллисекунд, иначе отклоняет промис с ошибкой `'Время ожидания истекло'`.

```js
function withTimeout(promise, ms) {
  // Твой код
}

const slowTask = new Promise((res) => setTimeout(() => res('Готово'), 1000));
withTimeout(slowTask, 300).catch((err) => console.log(err.message));
// 'Время ожидания истекло'
```

<details>
<summary>Показать решение и разбор</summary>

```js
function withTimeout(promise, ms) {
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Время ожидания истекло')), ms);
  });

  /* Promise.race завершится тем промисом, который сработает первым */
  return Promise.race([promise, timeoutPromise]);
}
```

</details>

---

## Задача 5. Загадка на Event Loop (в каком порядке выведется в консоль?)

Не запуская код, определи точный порядок цифр в консоли.

```js
console.log('1');

setTimeout(() => console.log('2'), 0);

Promise.resolve().then(() => console.log('3'));

console.log('4');
```

<details>
<summary>Показать решение и разбор</summary>

```text
Порядок вывода: 1 -> 4 -> 3 -> 2
```

1. `'1'` и `'4'` — синхронный код в Call Stack, выполняется сразу сверху вниз.
2. `'3'` — `.then(...)` попадает в очередь **микрозадач** (*Microtasks*), которая полностью очищается сразу после синхронного кода.
3. `'2'` — `setTimeout(..., 0)` попадает в очередь **макрозадач** (*Macrotasks*) и запускается уже после всех микрозадач.

</details>
