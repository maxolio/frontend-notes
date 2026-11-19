# Урок 19. Классы в JavaScript: constructor, get/set, #, static, extends и super

Суть урока: класс — это шаблон (чертёж) для создания однотипных объектов (экземпляров) через new и удобной организации кода (слайдеры, модалки, валидаторы).

## 1. Синтаксис class, constructor, свойства, методы и экземпляры (00:56 – 06:42)

```js
/* Имя класса пишется с ЗАГЛАВНОЙ буквы. Внутри класса запятые между полями/методами НЕ ставят! */
class Student {
  /* 1. Свойства в теле класса (без let/const!): если значение известно заранее для всех: */
  planet = 'Земля';
  region; // Без присвоения будет undefined

  /* 2. constructor — запускается АВТОМАТИЧЕСКИ при каждом вызове new Student(...): */
  constructor(name, age) {
    /* this указывает на конкретный создаваемый экземпляр (firstStudent или secondStudent): */
    this.name = name;
    this.age = age;
  }

  /* 3. Методы класса (пишутся без слова function): */
  logAge() {
    /* Внутри методов к свойствам экземпляра ОБЯЗАТЕЛЬНО обращаемся через this: */
    console.log(this.age); // Просто age даст ошибку: age is not defined!
  }

  /* 4. Потеря this в колбэках (setTimeout/клик): обычный метод потеряет this (undefined!).
     Стрелка в теле класса НАМЕРТВО привязывает this к экземпляру: */
  logAgeBound = () => console.log(this.age);
}

/* Под капотом: typeof Student === 'function'; класс не всплывает (TDZ), без new не вызвать,
   а внутри класса ВСЕГДА автоматически включён строгий режим ('use strict'). */
const firstStudent = new Student('Вася', 20);
const secondStudent = new Student('Петя', 22);
firstStudent.logAge(); // 20  |  secondStudent.name -> 'Петя'
```

## 2. Геттеры/сеттеры (get / set) и приватность: _ против # (06:43 – 13:57)

```js
/* Геттер (get) перехватывает чтение, сеттер (set) — запись, чтобы добавить свою логику.
   Внутри класса данные хранят в приватном поле, а снаружи работают через имя геттера/сеттера.
   - Префикс '_' (_city) — просто старое соглашение ('не трогай снаружи', но доступ открыт).
   - Префикс '#' (#city) — ЖЁСТКАЯ приватность: JS запретит доступ снаружи (выбросит ошибку)! */
class Profile {
  #city = null; // Приватное поле с # ОБЯЗАТЕЛЬНО объявить в теле класса заранее!

  constructor(city) {
    this.city = city;        // Вызовет сеттер set city()
    this.#someSecretAction(); // Вызвать приватный метод # внутри класса — можно
  }

  set city(value) { // Срабатывает при присвоении: profile.city = 'москва'
    const firstLetter = value[0].toUpperCase();
    const restLetters = value.slice(1).toLowerCase();
    this.#city = `${firstLetter}${restLetters}`; // 'Москва'
  }

  get city() {      // Срабатывает при чтении: profile.city (вызывается БЕЗ скобок ()!)
    return `г. ${this.#city}`;
  }

  #someSecretAction() { /* Скрытый внутренний метод */ }
}
const p = new Profile('москва');
p.city; // 'г. Москва'  |  p.#city или p.#someSecretAction() снаружи -> SyntaxError!
/* Важно: #поля и #методы скрыты даже от дочерних классов-наследников (доступ лишь в Profile). */
```

## 3. Статические свойства и методы — static (13:58 – 15:18)

```js
class Helper {
  static country = 'Россия';
  static logInfo() {
    /* Внутри static-метода НЕЛЬЗЯ использовать this экземпляра (this.name/this.age -> ошибка)! */
    console.log('Общий метод класса, без привязки к конкретному экземпляру');
  }
}
/* К static обращаются НАПРЯМУЮ через ИмяКласса, а НЕ через экземпляр (new Helper()): */
Helper.country;   // 'Россия' (static-свойства и методы также наследуются через extends!)
Helper.logInfo(); // Работает  |  (new Helper()).logInfo() -> TypeError (не функция!)
```

## 4. Наследование (extends), переопределение методов и super (15:19 – 21:11)

```js
class Person {
  constructor(name, age) { this.name = name; this.age = age; }
  eat()   { console.log(`${this.name} кушает`); }
  sleep() { console.log(`${this.name} спит`); }
}

/* extends наследует ВСЕ свойства и методы родителя Person (можно строить цепочки A -> B -> C): */
class Developer extends Person {
  /* Если переопределяем constructor у наследника — ПЕРВОЙ строкой ОБЯЗАТЕЛЕН super(...)! */
  constructor(name, age, experience) {
    super(name, age); // Вызывает constructor родителя Person (БЕЗ него this выдаст ошибку!)
    this.experience = experience;
  }

  writeCode() { console.log(`${this.name} пишет код`); } // Новый метод (у Person его нет)
  sleep()     { console.log('Не спит, кодит!'); }         // Полное переопределение sleep()

  eat() { // Расширение родительского метода без копирования его кода:
    super.eat(); // Вызывает eat() из Person
    console.log('...и смотрит уроки по JS');
  }
}
const dev = new Developer('Саша', 28, 5);
dev.eat(); // 'Саша кушает' -> '...и смотрит уроки по JS'
/* Оператор instanceof проверяет, принадлежит ли объект классу (и любому его родителю!): */
dev instanceof Developer; // true  |  dev instanceof Person -> тоже true!
```

## 5. Практика во фронтенде: классы для структуры и запуск без переменной (21:12)

```js
/* Во фронтенде классы используют не только как 'штамповку' объектов, но и для порядка в коде
   (FormValidation, Modals, Gallery — каждый компонент отвечает за свой блок интерфейса): */
class Modals {
  constructor() { /* Автоматически находит модалки и вешает события при старте страницы */ }
  static closeAllModals() { /* Закрывает все открытые модалки */ }
}
new Modals();            // Иногда экземпляр даже не сохраняют в переменную — нужен лишь запуск!
Modals.closeAllModals(); // А вспомогательные действия вызывают напрямую через static-метод
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

  /* Стрелка намертво привязывает this к экземпляру + удобно для removeEventListener: */
  onButtonClick = () => {
    this.expand(); /* Внутри стрелки this — наш экземпляр HeaderScroll */
  };

  onResize = () => {
    setTimeout(this.syncWidth, 100); /* В setTimeout тоже передаём без () -> стрелка! */
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

Создай класс `BankAccount` с приватным полем `#balance = 0`. В `constructor(owner, initialBalance = 0)` сохрани `this.owner` и запиши начальную сумму через сеттер `this.balance = initialBalance`. Добавь:
- `set balance(value)`: принимает только число `>= 0` (и не `NaN`), иначе печатает `'Некорректная сумма'` и не меняет `#balance`.
- `get balance()`: возвращает `#balance`.
- `deposit(amount)`: если `amount > 0`, увеличивает `this.balance += amount`.

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
  /* Приватное поле #balance обязательно объявляется в теле класса заранее */
  #balance = 0;

  constructor(owner, initialBalance = 0) {
    this.owner = owner;
    /* Запись в this.balance сразу прогонит начальную сумму через проверку в set */
    this.balance = initialBalance;
  }

  set balance(value) {
    if (typeof value !== 'number' || Number.isNaN(value) || value < 0) {
      console.log('Некорректная сумма');
      return;
    }
    /* Пишем строго в приватное #balance, а не в this.balance (иначе рекурсия!) */
    this.#balance = value;
  }

  get balance() {
    return this.#balance;
  }

  deposit(amount) {
    if (amount > 0) {
      /* Сначала сработает get balance(), затем сумма запишется через set balance() */
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

Сейчас `runTwice(counter.inc)` падает из-за потери `this`. Перепиши `inc` на стрелочное свойство в теле класса (чтобы `this` не терялся при передаче функции как колбэка), а также добавь в `Counter` статическое свойство `static MAX = 10` и статический метод `static isAllowed(value)`, возвращающий `value <= Counter.MAX`.

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
  /* Статические члены принадлежат самому классу Counter, а не экземплярам */
  static MAX = 10;

  static isAllowed(value) {
    return value <= Counter.MAX;
  }

  count = 0;

  /*
    Стрелочное поле класса при создании объекта навсегда привязывает this
    к конкретному counter — при вызове без точки (callback()) контекст не теряется
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

Создай класс `Notification(title)` с методом `format()`, возвращающим строку `` `[Уведомление] ${this.title}` ``. Затем создай наследника `EmailNotification extends Notification(title, email)`: вызови `super(title)` до записи `this.email = email` и расширь `format()` через `super.format()`, чтобы он возвращал `` `[Уведомление] ${this.title} -> ${this.email}` ``.

```js
'use strict';

/* Твоё решение: */

const notice = new EmailNotification('Заказ оплачен', 'user@mail.ru');

console.log(notice.format());                     /* [Уведомление] Заказ оплачен -> user@mail.ru */
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
    /* Переиспользуем базовый вывод через super.format() без дублирования кода */
    return `${super.format()} -> ${this.email}`;
  }
}

const notice = new EmailNotification('Заказ оплачен', 'user@mail.ru');

console.log(notice.format());                     /* [Уведомление] Заказ оплачен -> user@mail.ru */
console.log(notice instanceof EmailNotification); /* true */
console.log(notice instanceof Notification);      /* true */
```

</details>
