# Урок 19. Классы в JavaScript: constructor, get/set, #, static, extends и super

Суть урока:

- **Шаблон (чертёж):** `class` описывает структуру и методы будущих однотипных объектов.
- **Экземпляры:** создаются через `new` для удобной организации модулей (слайдеры, модалки, валидаторы).

## 1. Синтаксис class, constructor, свойства, методы и экземпляры (00:56 – 06:42)

```js
/* Имя класса — с заглавной. Запятые между полями и методами НЕ ставят! */
class Student {
  /* 1. Поля в теле класса (без let/const), если значение общее для всех: */
  planet = 'Земля';
  region; /* Без присвоения будет undefined */

  /* 2. constructor запускается автоматически при каждом new Student(...): */
  constructor(name, age) {
    /* this указывает на конкретный создаваемый экземпляр: */
    this.name = name;
    this.age = age;
  }

  /* 3. Методы класса (пишутся без слова function): */
  logAge() {
    /* Внутри методов к свойствам экземпляра обращаемся через this: */
    console.log(this.age); /* Просто age даст ReferenceError! */
  }

  /*
    4. Потеря this в колбэках (таймер/клик): обычный метод потеряет this.
       Стрелка в теле класса намертво привязывает this к экземпляру:
  */
  logAgeBound = () => console.log(this.age);
}

/*
  Под капотом: typeof Student === 'function'; класс в TDZ, без new нельзя,
  а внутри класса всегда автоматически включён строгий режим 'use strict'.
*/
const firstStudent = new Student('Вася', 20);
const secondStudent = new Student('Петя', 22);
firstStudent.logAge(); /* 20 | secondStudent.name -> 'Петя' */
```

## 2. Геттеры/сеттеры (get / set) и приватность: _ против # (06:43 – 13:57)

```js
/*
  get перехватывает чтение, set — запись. Данные хранят в приватном поле:
  - '_' (_city) — старое соглашение (снаружи всё ещё доступно);
  - '#' (#city) — жёсткая приватность: доступ снаружи даёт SyntaxError!
*/
class Profile {
  #city = null; /* Приватное поле # ОБЯЗАТЕЛЬНО объявить в классе заранее */

  constructor(city) {
    this.city = city;         /* Вызовет сеттер set city() */
    this.#someSecretAction(); /* Вызвать приватный метод внутри можно */
  }

  set city(value) { /* Срабатывает при записи: profile.city = 'москва' */
    const firstLetter = value[0].toUpperCase();
    const restLetters = value.slice(1).toLowerCase();
    this.#city = `${firstLetter}${restLetters}`; /* 'Москва' */
  }

  get city() { /* Срабатывает при чтении profile.city (БЕЗ скобок ()!) */
    return `г. ${this.#city}`;
  }

  #someSecretAction() { /* Скрытый внутренний метод */ }
}
const p = new Profile('москва');
p.city; /* 'г. Москва' | p.#city снаружи -> SyntaxError! */
/* #поля и #методы скрыты даже от наследников (доступ лишь в Profile). */
```

## 3. Статические свойства и методы — static (13:58 – 15:18)

```js
class Helper {
  static country = 'Россия';
  static logInfo() {
    /* В static-методе нет this экземпляра (this.name -> undefined)! */
    console.log('Общий метод класса без привязки к экземпляру');
  }
}
/* К static обращаются через ИмяКласса, а НЕ через new Helper(): */
Helper.country;   /* 'Россия' (static также наследуются через extends!) */
Helper.logInfo(); /* Работает | (new Helper()).logInfo() -> TypeError */
```

## 4. Наследование (extends), переопределение методов и super (15:19 – 21:11)

```js
class Person {
  constructor(name, age) { this.name = name; this.age = age; }
  eat()   { console.log(`${this.name} кушает`); }
  sleep() { console.log(`${this.name} спит`); }
}

/* extends наследует свойства и методы родителя Person: */
class Developer extends Person {
  /* В constructor наследника ПЕРВОЙ строкой ОБЯЗАТЕЛЕН super(...)! */
  constructor(name, age, experience) {
    super(name, age); /* Без него обращение к this выдаст ReferenceError! */
    this.experience = experience;
  }

  writeCode() { console.log(`${this.name} пишет код`); } /* Новый метод */
  sleep()     { console.log('Не спит, кодит!'); }        /* Переопределение */

  eat() { /* Расширение родительского метода без копирования кода: */
    super.eat(); /* Вызывает eat() из Person */
    console.log('...и смотрит уроки по JS');
  }
}
const dev = new Developer('Саша', 28, 5);
dev.eat(); /* 'Саша кушает' -> '...и смотрит уроки по JS' */
/* instanceof проверяет принадлежность классу и любому его родителю: */
dev instanceof Developer; /* true | dev instanceof Person -> тоже true! */
```

## 5. Практика во фронтенде: классы для структуры и запуск без переменной (21:12)

```js
/*
  Во фронтенде классы часто используют для порядка в UI-модулях
  (FormValidation, Modals, Gallery — каждый отвечает за свой блок):
*/
class Modals {
  constructor() { /* Находит модалки и вешает события при старте */ }
  static closeAllModals() { /* Закрывает все открытые модалки */ }
}
new Modals();            /* Иногда экземпляр даже не сохраняют в const */
Modals.closeAllModals(); /* Вспомогательное действие через static-метод */
```

## 6. Когда методу в классе нужна стрелка `=>`, а когда нет

**Правило:** стрелка `=>` в классе нужна **всегда, когда ты отдаёшь метод «на сторону» без `()`** и внутри него используется **`this`**.

4 главных случая на практике:
1. **Слушатели событий (`addEventListener`):** `this.buttonElement.addEventListener('click', this.onButtonClick)`
2. **Наблюдатели браузера (`ResizeObserver`, `IntersectionObserver`):** `new ResizeObserver(this.onResize)`
3. **Таймеры (`setTimeout`, `setInterval`):** `setTimeout(this.hideNotification, 3000)`
4. **Коллбэки внутри методов (`forEach`, `map`, `.then`):** `items.forEach((item) => this.render(item))`

**Когда стрелка НЕ нужна:** когда метод вызывается **напрямую через точку** (`this.init()`, `this.bindEvents()`, `this.expand()`).

```js
class HeaderScroll {
  constructor(buttonElement) {
    this.buttonElement = buttonElement;
    this.bindEvents(); /* Прямой вызов через точку — стрелка НЕ нужна */
  }

  /* Обычный метод (лежит 1 раз в prototype — экономит память): */
  bindEvents() {
    /* Отдаём onButtonClick БЕЗ (), поэтому ему нужна стрелка => */
    this.buttonElement.addEventListener('click', this.onButtonClick);
    new ResizeObserver(this.onResize).observe(document.body);
  }

  /* Стрелка привязывает this к экземпляру + удобно для removeEventListener */
  onButtonClick = () => {
    this.expand(); /* Внутри стрелки this — наш экземпляр HeaderScroll */
  };

  onResize = () => {
    setTimeout(this.syncWidth, 100); /* Передаём без () -> стрелка! */
  };

  syncWidth = () => { /* ... */ };

  expand() { /* Вызывается как this.expand() — обычный метод */ }
}
```

[!] **Почему не пишут все методы стрелками:** обычный метод создаётся в памяти **один раз** (в `Class.prototype`) для всех экземпляров, а поле со стрелкой `=>` создаёт новую функцию заново для каждого `new ...()`. Используй стрелку только там, где метод передаётся как коллбэк без `()`.

## 3 главные ловушки урока (чек-лист для повторения)

1. Забыть super(...) в constructor наследника — в классе с extends нельзя писать this.field до вызова super(...), сразу упадёт ошибка.

2. Путать static с методами экземпляра и забывать # в теле — static вызывают только на ИмяКласса.метод(), а #поле нужно обязательно объявить в классе заранее.

3. Бесконечная рекурсия в сеттере и отсутствие this. — если в set city(v) написать this.city = v вместо this.#city = v, сеттер зациклится; а без this внутри метода свойства не видны.

## Итог: как представлять и зачем нужны (очень кратко)

• Образ: class — чертёж/форма, new Class() — готовый независимый объект с данными и методами.

• Как работает new: 1) создаёт {} со связью методов -> 2) запускает constructor с this -> 3) возвращает объект.

• Зачем нужны: порядок в коде (модули UI), наследование без дублей (extends + super) и защита данных (#, get/set).

## Вопросы для закрепления

**1. Какие две ошибки возникнут в этом коде и почему наследник `User` не сможет прочитать `#id`?**

```js
class Base {
  #id = 1;
}

class User extends Base {
  constructor(name) {
    this.name = name;
    super();
  }
  showId() {
    return this.#id;
  }
}
```

<details>
<summary>Показать ответ</summary>

1. В `constructor` дочернего класса сначала обязан вызываться **`super()`**, и лишь после него можно обращаться к `this.name = name` — иначе при `new User(...)` выпадет `ReferenceError`.
2. Приватное поле `#id` видно **только внутри самого класса `Base`** (`SyntaxError` при попытке обращения из `User`). Для доступа к данным из наследников в родителе оставляют публичный геттер или метод.

</details>

**2. Почему `new Item(100)` упадёт с переполнением стека (`RangeError`), а вызов `item.getTax()` выдаст `TypeError`?**

```js
class Item {
  #price = 0;
  constructor(price) { this.price = price; }
  set price(val) { this.price = val; }
  static getTax() { return 0.2; }
}

const item = new Item(100);
```

<details>
<summary>Показать ответ</summary>

1. Внутри сеттера `set price(val)` написано `this.price = val;` — присваивание снова вызывает этот же сеттер, и код уходит в **бесконечную рекурсию**. Внутри сеттера данные нужно записывать в приватное поле: `this.#price = val;`.
2. `static getTax()` — статический метод: он принадлежит самому классу **`Item`**, а не его экземпляру `item`. Вызывать его нужно через `Item.getTax()`.

</details>

**3. Почему класс нельзя вызвать как обычную функцию без `new` и зачем писать метод стрелкой `onClick = () => ...` внутри класса?**

<details>
<summary>Показать ответ</summary>

1. Класс JS создан специально для `new`: обычный вызов `User()` сразу выдаст `TypeError`, сами классы не всплывают до своей строки (находятся в TDZ), а внутри них всегда активен строгий режим `'use strict'`.
2. Если передать обычный метод класса как колбэк (например, в обработчик клика или таймер), он потеряет `this` (`undefined`). А стрелочное свойство в теле класса `onClick = () => this...` при создании экземпляра намертво привязывает `this` к этому объекту.

</details>

## Задачи

**Задача 1. Класс `BankAccount` с приватным полем `#balance` и `get / set`**

Создай класс `BankAccount` с защищённым балансом:

1. Объяви приватное поле `#balance = 0`, а в `constructor(owner, initialBalance = 0)` сохрани `this.owner` и запиши сумму через сеттер `this.balance = initialBalance`.
2. Добавь `set balance(value)`: принимает только конечное число (`Number.isFinite(value)`) `>= 0` (не `NaN` и не `Infinity`), иначе печатает `'Некорректная сумма'` и не меняет `#balance`.
3. Добавь `get balance()` (возвращает `#balance`) и `deposit(amount)` (если `amount > 0`, делает `this.balance += amount`).

Проверка: после `acc.deposit(500)` и `acc.balance = -200` в консоли появятся `'Некорректная сумма'` и `1500`.

```js
'use strict';

/* Твоё решение: */

const acc = new BankAccount('Алиса', 1000);
acc.deposit(500);
acc.balance = -200;       /* выведет: 'Некорректная сумма' */
console.log(acc.balance); /* 1500 */
```

<details>
<summary>Подсказка и решение</summary>

```js
'use strict';

class BankAccount {
  /* Приватное поле #balance объявляется в теле класса заранее */
  #balance = 0;

  constructor(owner, initialBalance = 0) {
    this.owner = owner;
    /* Запись в this.balance прогонит сумму через проверку в set */
    this.balance = initialBalance;
  }

  set balance(value) {
    /* Number.isFinite отсекает не-числа, NaN и Infinity / -Infinity */
    if (!Number.isFinite(value) || value < 0) {
      console.log('Некорректная сумма');
      return;
    }
    /* Пишем строго в #balance, а не в this.balance (иначе рекурсия!) */
    this.#balance = value;
  }

  get balance() {
    return this.#balance;
  }

  deposit(amount) {
    if (amount > 0) {
      /* Сработает get balance(), затем запись через set balance() */
      this.balance += amount;
    }
  }
}

const acc = new BankAccount('Алиса', 1000);
acc.deposit(500);
acc.balance = -200;       /* 'Некорректная сумма' */
console.log(acc.balance); /* 1500 */
```

</details>

**Задача 2. Почини потерю `this` в колбэке и добавь `static` в `Counter`**

Сейчас `runTwice(counter.inc)` падает из-за потери `this`. Доработай класс `Counter`:

1. Перепиши `inc` на стрелочное свойство в теле класса (`inc = () => ...`), чтобы `this` не терялся при передаче колбэком.
2. Добавь статическое свойство `static MAX = 10` и статический метод `static isAllowed(value)`, возвращающий `value <= Counter.MAX`.

Проверка: `counter.count` -> `2`, `Counter.isAllowed(5)` -> `true`, `Counter.isAllowed(15)` -> `false`.

```js
'use strict';

function runTwice(callback) {
  callback();
  callback();
}

/* Твоё решение: */
class Counter {
  count = 0;

  inc() {
    this.count++;
  }
}

const counter = new Counter();
runTwice(counter.inc);

console.log(counter.count);         /* должно быть: 2 */
console.log(Counter.isAllowed(5));  /* true */
console.log(Counter.isAllowed(15)); /* false */
```

<details>
<summary>Подсказка и решение</summary>

```js
'use strict';

function runTwice(callback) {
  callback();
  callback();
}

class Counter {
  /* Статические члены принадлежат самому классу Counter */
  static MAX = 10;

  static isAllowed(value) {
    return value <= Counter.MAX;
  }

  count = 0;

  /*
    Стрелочное поле при создании объекта навсегда привязывает this
    к конкретному counter — при вызове без точки контекст не теряется
  */
  inc = () => {
    this.count++;
  };
}

const counter = new Counter();
runTwice(counter.inc);

console.log(counter.count);         /* 2 */
console.log(Counter.isAllowed(5));  /* true */
console.log(Counter.isAllowed(15)); /* false */
```

</details>

**Задача 3. Наследование `extends`, `super(...)` и расширение метода `format()`**

Построй иерархию классов уведомлений:

1. Создай класс `Notification(title)` с методом `format()`, возвращающим шаблонную строку `[Уведомление] ${this.title}`.
2. Создай наследника `EmailNotification extends Notification(title, email)`: первой строкой вызови `super(title)` до записи `this.email = email`.
3. Расширь метод `format()` через `super.format()`, чтобы он возвращал шаблонную строку `[Уведомление] ${this.title} -> ${this.email}`.

Проверка: `notice.format()` -> `'[Уведомление] Заказ оплачен -> user@mail.ru'`, оба `instanceof` -> `true`.

```js
'use strict';

/* Твоё решение: */

const notice = new EmailNotification('Заказ оплачен', 'user@mail.ru');

/* '[Уведомление] Заказ оплачен -> user@mail.ru' */
console.log(notice.format());
console.log(notice instanceof EmailNotification); /* true */
console.log(notice instanceof Notification);      /* true */
```

<details>
<summary>Подсказка и решение</summary>

```js
'use strict';

class Notification {
  constructor(title) {
    this.title = title;
  }

  format() {
    return `[Уведомление] ${this.title}`;
  }
}

class EmailNotification extends Notification {
  constructor(title, email) {
    /* Первой строкой обязаны вызвать конструктор родителя до любого this */
    super(title);
    this.email = email;
  }

  format() {
    /* Переиспользуем базовый вывод через super.format() без дублирования */
    return `${super.format()} -> ${this.email}`;
  }
}

const notice = new EmailNotification('Заказ оплачен', 'user@mail.ru');

/* '[Уведомление] Заказ оплачен -> user@mail.ru' */
console.log(notice.format());
console.log(notice instanceof EmailNotification); /* true */
console.log(notice instanceof Notification);      /* true */
```

</details>
