# Практика 2. Задачи на массивы, Map/Set, JSON и классы (уроки 15–19)

Суть практики: закрепляем работу со структурами данных и ООП — методы массивов (`map`, `filter`, `reduce`), уникализацию через `Set`, группировку через `Map`, сериализацию `JSON` и классы со стрелочными обработчиками.

---

## Задача 1. Сводка заказов по категориям (`filter`, `reduce`)

Дан массив заказов. Напиши функцию `getPaidSummary(orders)`, которая:
1. Оставляет только оплаченные заказы (`status === 'paid'`).
2. Считает общую сумму выручки и возвращает объект `{ count, total }`.

```js
const orders = [
  { id: 1, total: 1200, status: 'paid' },
  { id: 2, total: 800, status: 'pending' },
  { id: 3, total: 2500, status: 'paid' },
  { id: 4, total: 400, status: 'canceled' },
];

function getPaidSummary(orders) {
  // Твой код
}

console.log(getPaidSummary(orders)); // { count: 2, total: 3700 }
```

<details>
<summary>Показать решение и разбор</summary>

```js
function getPaidSummary(orders) {
  /* Сначала отбираем только оплаченные заказы без мутации исходного массива */
  const paidOrders = orders.filter((order) => order.status === 'paid');

  /* reduce накапливает итоговую сумму с начального значения 0 */
  const total = paidOrders.reduce((sum, order) => sum + order.total, 0);

  return {
    count: paidOrders.length,
    total,
  };
}
```

</details>

---

## Задача 2. Уникальные теги без дублей и в алфавитном порядке (`Set`, `flatMap`, `sort`)

У каждого поста есть массив тегов (иногда с разным регистром и повторами). Напиши функцию `getUniqueTags(posts)`, которая вернёт отсортированный массив уникальных тегов в нижнем регистре.

```js
const posts = [
  { title: 'JS', tags: ['JS', 'Frontend', 'React'] },
  { title: 'CSS', tags: ['css', 'frontend', 'HTML'] },
];

function getUniqueTags(posts) {
  // Твой код
}

console.log(getUniqueTags(posts));
// ['css', 'frontend', 'html', 'js', 'react']
```

<details>
<summary>Показать решение и разбор</summary>

```js
function getUniqueTags(posts) {
  /* flatMap разворачивает вложенные массивы тегов в один плоский список */
  const normalized = posts.flatMap((post) =>
    post.tags.map((tag) => tag.toLowerCase().trim())
  );

  /* Set автоматически удаляет дубликаты, а [...] превращает его обратно в массив */
  return [...new Set(normalized)].sort((a, b) => a.localeCompare(b));
}
```

</details>

---

## Задача 3. Подсчёт частоты слов через `Map`

Напиши функцию `countWords(words)`, которая принимает массив строк и возвращает `Map`, где ключ — слово, а значение — сколько раз оно встретилось.

```js
const words = ['js', 'html', 'js', 'css', 'html', 'js'];

function countWords(words) {
  // Твой код
}

const stats = countWords(words);
console.log(stats.get('js'));   // 3
console.log(stats.get('html')); // 2
```

<details>
<summary>Показать решение и разбор</summary>

```js
function countWords(words) {
  const counts = new Map();

  for (const word of words) {
    /* Если слова ещё нет в Map, берём 0 через ?? и увеличиваем на 1 */
    const prev = counts.get(word) ?? 0;
    counts.set(word, prev + 1);
  }

  return counts;
}
```

</details>

---

## Задача 4. Безопасный парсинг `JSON` с фоллбэком

Напиши функцию `safeParseJson(raw, fallback = null)`, которая пробует распарсить строку JSON. Если строка битая или пустая — не падает с ошибкой, а возвращает `fallback`.

```js
console.log(safeParseJson('{"ok":true}'));      // { ok: true }
console.log(safeParseJson('{broken json', {})); // {}
console.log(safeParseJson('', []));             // []
```

<details>
<summary>Показать решение и разбор</summary>

```js
function safeParseJson(raw, fallback = null) {
  if (!raw) return fallback;

  /* JSON.parse бросает SyntaxError на невалидной строке — ловим через try/catch */
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}
```

</details>

---

## Задача 5. Класс `Cart` с приватным полем `#items`, геттером и стрелочным методом

Реализуй класс `Cart`:
- приватное поле `#items = []`;
- метод `add(name, price)` добавляет товар `{ name, price }`;
- геттер `total` считает общую сумму товаров в корзине;
- стрелочный метод `logTotal = () => ...` выводит текущую сумму (чтобы его можно было передать в `setTimeout(cart.logTotal, 500)` без потери `this`).

```js
class Cart {
  // Твой код
}

const cart = new Cart();
cart.add('Книга', 500).add('Мышь', 1500);
console.log(cart.total); // 2000
setTimeout(cart.logTotal, 100); // Выведет: Итого: 2000
```

<details>
<summary>Показать решение и разбор</summary>

```js
class Cart {
  #items = [];

  add(name, price) {
    this.#items.push({ name, price });
    return this;
  }

  /* Геттер читается как свойство cart.total без скобок () */
  get total() {
    return this.#items.reduce((sum, item) => sum + item.price, 0);
  }

  /* Стрелка фиксирует this на экземпляре Cart при передаче в setTimeout */
  logTotal = () => {
    console.log(`Итого: ${this.total}`);
  };
}
```

</details>
