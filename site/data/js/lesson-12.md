# Урок 12. Ключевое слово this в объектах и функциях, чейнинг методов

Суть урока:

- **Контекст `this`:** зависит от способа вызова (обычно это объект слева от точки).
- **Обычные vs стрелочные:** обычный и сокращённый методы берут `this` объекта, а стрелочная функция своего `this` не имеет (берёт внешний).
- **Чейнинг:** `return this` в методах позволяет выстраивать цепочки вызовов.

## 1. Контекст this глобально, в объекте и вложенных объектах (00:22–02:41)

[+] В браузере вне объекта (без use strict) this ссылается на window. В методе объекта this — сам объект перед точкой: для вложенного address.fn() это именно address.

```js
/* Глобально -> Window; а в обычной функции с 'use strict' -> undefined! */
console.log(this);

const user = {
  name: 'Александр',
  logThis() { console.log(this, this.name); }, /* this === user */
  address: {
    city: 'Москва',
    logInnerThis() { console.log(this); }, /* this === user.address! */
  },
};
user.logThis();              /* { name: "Александр", ... }, "Александр" */
user.address.logInnerThis(); /* { city: "Москва", ... } */
```

## 2. Стрелочные функции и динамический this (02:42–06:25)

[!] У стрелочной функции нет своего this — она берёт внешний контекст (в методе объекта даст Window!). Обычная же функция вычисляет this в момент вызова: кто слева от точки, тот и this.

```js
const arrowObj = {
  name: 'Alex',
  logThis: () => console.log(this), /* ВНИМАНИЕ: Window вместо arrowObj! */
};

function logInfo() { console.log(this.name); }
const user1 = { name: 'Миша', logName: logInfo };
const user2 = { name: 'Вася', logName: logInfo };

logInfo();       /* '' (window.name по умолчанию пустой) */
user1.logName(); /* 'Миша' — слева от точки user1 */
user2.logName(); /* 'Вася' — слева от точки user2 */

/*
  Зато ВНУТРИ обычного метода стрелка спасает this в колбэках:
  setTimeout(() => this.logName(), 1000); -> this из родительского метода!
*/

/* Потеря контекста и явная привязка (call / apply / bind): */
const detached = user1.logName;      /* detached() потеряет this! */
logInfo.call(user1);                 /* сразу с this = user1 (арг. через ,) */
logInfo.apply(user1, []);            /* сразу с this = user1 (массивом) */
const boundFn = user1.logName.bind(user1); /* копия с привязанным this */
```

## 3. Практика: calculator и цепочка вызовов ladder (06:26–14:11)

[+] Методы могут динамически добавлять поля в this (this.a = ...), а если каждый метод завершать return this;, то вызовы можно выстраивать в одну цепочку (chaining).

```js
const calculator = {
  read() {
    this.a = Number(prompt('Первое число:', 0));
    this.b = Number(prompt('Второе число:', 0));
  },
  sum() { return this.a + this.b; },
  mul() { return this.a * this.b; },
};

const ladder = {
  step: 0,
  up()       { this.step++; return this; }, /* возвращает сам ladder */
  down()     { this.step--; return this; },
  showStep() { console.log(`Ступенька: ${this.step}`); return this; },
};
/* Ступенька: 1 (без return this следующий вызов в цепочке упал бы!) */
ladder.up().up().down().showStep();
```

## 3 главные ловушки урока (чек-лист для повторения)

1. Писать метод объекта через стрелку () => this.name — у стрелки нет своего this, и она уйдёт наружу в window (правильно: method() {} или function() {}).

2. Ждать во вложенном методе user.address.log() доступ к user через this — контекст всегда равен объекту непосредственно перед точкой (address).

3. Вызывать методы цепочкой ladder.up().down() без return this; — по умолчанию метод вернёт undefined, и следующий вызов через точку упадёт с TypeError.

## Вопросы для закрепления

**1. Что случится при запуске этого кода в строгом режиме и почему `user.ref.name` не выведет `'Иван'`?**

```js
'use strict';

function makeUser() {
  return {
    name: 'Иван',
    ref: this,
  };
}

const user = makeUser();
console.log(user.ref.name);
```

<details>
<summary>Показать ответ</summary>

Код упадёт с **`TypeError: Cannot read properties of undefined (reading 'name')`**. Значение `this` определяется **в момент вызова функции**, а не там, где записан объект. Так как `makeUser()` вызвали просто как функцию без объекта слева от точки, внутри неё в `'use strict'` `this === undefined` — именно `undefined` записался в `ref`. Чтобы `ref` указывал на `user`, его нужно сделать методом: `ref() { return this; }` (и вызывать `user.ref().name`).

</details>

**2. Что выведут оба вызова и почему ни один из них не вернёт `'Алекс'`?**

```js
'use strict';

const user = {
  name: 'Алекс',
  sayHi: () => console.log(this?.name),
  profile: {
    level: 5,
    showOwner() {
      console.log(this.name);
    },
  },
};

user.sayHi();
user.profile.showOwner();
```

<details>
<summary>Показать ответ</summary>

Оба вызова выведут **`undefined`**.
1. `sayHi` объявлен стрелочной функцией — у стрелки нет своего `this`, она берёт внешний контекст файла (в модулях это `undefined`, где нет `name`).
2. `showOwner` — обычный метод, но вызван на вложенном объекте `profile`: для него слева от точки стоит именно **`user.profile`**, а в нём есть `level`, но нет `name`.

</details>

**3. Почему оторванный метод `const fn = user.logName; fn();` теряет контекст и чем `bind` отличается от `call` / `apply`?**

<details>
<summary>Показать ответ</summary>

При присваивании `const fn = user.logName` копируется только ссылка на саму функцию, а связь с объектом `user` теряется — при вызове `fn()` без точки `this` становится `undefined` (в строгом режиме). Методы `call(obj, a, b)` и `apply(obj, [a, b])` вызывают функцию **сразу** с нужным `this` (разница лишь в передаче аргументов: через запятую или массивом), а `bind(obj)` функцию **не запускает**, а возвращает новую функцию с навсегда привязанным `this`.

</details>

## Задачи

**Задача 1. Почини метод-стрелку и потерю контекста через `bind`**

Сейчас `account.logBalance` написан стрелкой и не видит `this.balance`, а переменная `show` теряет контекст при отрыве от объекта. Исправь код:

1. Замени стрелочный метод на обычный сокращённый метод `logBalance() {}`.
2. При сохранении в `show` привяжи контекст `account` через `.bind(account)`.

Проверка: оба вызова `account.logBalance()` и `show()` должны вывести `'Елена: 1500 руб.'`.

```js
'use strict';

const account = {
  owner: 'Елена',
  balance: 1500,
  /* Твоё решение: исправь метод logBalance */
  logBalance: () => {
    console.log(`${this.owner}: ${this.balance} руб.`);
  },
};

/* Твоё решение: сохрани метод с жёстко привязанным контекстом */
const show = account.logBalance;

account.logBalance(); /* Елена: 1500 руб. */
show();               /* Елена: 1500 руб. */
```

<details>
<summary>Подсказка и решение</summary>

```js
'use strict';

const account = {
  owner: 'Елена',
  balance: 1500,
  /*
    Заменили стрелку на обычный сокращённый метод: теперь при вызове
    account.logBalance() его this автоматически ссылается на account
  */
  logBalance() {
    console.log(`${this.owner}: ${this.balance} руб.`);
  },
};

/*
  .bind(account) НЕ вызывает функцию сразу, а создаёт новую обёртку,
  внутри которой this навсегда зафиксирован на объекте account
*/
const show = account.logBalance.bind(account);

account.logBalance(); /* Елена: 1500 руб. */
show();               /* Елена: 1500 руб. */
```

</details>

**Задача 2. Одна функция для разных объектов (`call` и `apply`)**

Напиши общую функцию `formatBadge(prefix, suffix)` и вызови её для двух разных объектов без записи внутрь них:

1. Объяви обычную функцию `formatBadge(prefix, suffix)` (не стрелку), возвращающую `` `${prefix} ${this.name} (${this.role})${suffix}` ``.
2. Вызови её для `dev` через `.call(...)` с аргументами `'[DEV]'` и `'!'`.
3. Вызови её для `designer` через `.apply(...)` с массивом `['[UX]', '.']`.

Проверка: в консоль должны вывестись `'[DEV] Иван (Frontend)!'` и `'[UX] Мария (UI/UX).'`.

```js
'use strict';

const dev = { name: 'Иван', role: 'Frontend' };
const designer = { name: 'Мария', role: 'UI/UX' };

/* Твоё решение: */
```

<details>
<summary>Подсказка и решение</summary>

```js
'use strict';

const dev = { name: 'Иван', role: 'Frontend' };
const designer = { name: 'Мария', role: 'UI/UX' };

/*
  Используем function (а не стрелку), потому что call и apply могут подменить
  this только у обычной функции (стрелка игнорирует переданный контекст)
*/
function formatBadge(prefix, suffix) {
  return `${prefix} ${this.name} (${this.role})${suffix}`;
}

/* call передаёт контекст первым аргументом, а параметры — через запятую */
console.log(formatBadge.call(dev, '[DEV]', '!')); /* [DEV] Иван (Frontend)! */

/* apply работает так же, но принимает параметры функции единым массивом */
console.log(formatBadge.apply(designer, ['[UX]', '.'])); /* [UX] Мария ... */
```

</details>

**Задача 3. Бонусный кошелёк с цепочкой вызовов (`return this`)**

Создай объект `wallet` со свойством `points: 0` и тремя методами, поддерживающими чейнинг (`return this`):

1. `add(amount)` — прибавляет `amount` к `this.points` и возвращает `this`.
2. `spend(amount)` — вычитает `amount`, если `this.points >= amount`, иначе печатает `'Недостаточно баллов'`; в любом исходе возвращает `this`.
3. `log()` — печатает `` `Баланс: ${this.points}` `` и возвращает `this`.

Проверка: первая цепочка выведет `'Баланс: 120'`, вторая — `'Недостаточно баллов'` и `'Баланс: 120'`.

```js
'use strict';

/* Твоё решение: */

wallet.add(100).spend(30).add(50).log(); /* Баланс: 120 */
wallet.spend(200).log(); /* Недостаточно баллов, затем Баланс: 120 */
```

<details>
<summary>Подсказка и решение</summary>

```js
'use strict';

const wallet = {
  points: 0,

  add(amount) {
    this.points += amount;
    /* Возвращаем сам объект wallet, чтобы вызывать следующий метод */
    return this;
  },

  spend(amount) {
    if (this.points >= amount) {
      this.points -= amount;
    } else {
      console.log('Недостаточно баллов');
    }
    /*
      return this обязан быть в любом исходе (даже если баллов не хватило),
      иначе следующий метод в цепочке .log() упадёт на undefined
    */
    return this;
  },

  log() {
    console.log(`Баланс: ${this.points}`);
    return this;
  },
};

wallet.add(100).spend(30).add(50).log(); /* Баланс: 120 */
wallet.spend(200).log(); /* Недостаточно баллов -> Баланс: 120 */
```

</details>
