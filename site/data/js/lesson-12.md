# Урок 12. Ключевое слово this в объектах и функциях, чейнинг методов

Суть урока: Значение this зависит от способа вызова (объект слева от точки); обычный и сокращённый методы берут контекст этого объекта, стрелочная функция своего this не имеет (берёт внешний), а return this в методах открывает цепочку вызовов (chaining).

## 1. Контекст this глобально, в объекте и вложенных объектах (00:22–02:41)

[+] В браузере вне объекта (без use strict) this ссылается на window. В методе объекта this — сам объект перед точкой: для вложенного address.fn() это именно address.

```js
console.log(this); /* глобально -> Window; а в обычной функции с "use strict" -> undefined! */

const user = {
  name: 'Александр',
  logThis() { console.log(this, this.name); }, /* this === user */
  address: {
    city: 'Москва',
    logInnerThis() { console.log(this); },     /* this === user.address (не user!) */
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

/* Зато ВНУТРИ обычного метода стрелка спасает this в колбэках (forEach / setTimeout): */
/* setTimeout(() => this.logName(), 1000); -> this берётся из родительского метода! */

/* Потеря контекста и явная привязка (call / apply / bind): */
const detached = user1.logName; /* оторвали от user1: detached() потеряет this! */
logInfo.call(user1);            /* вызывает СРАЗУ с this = user1 (аргументы через ,) */
logInfo.apply(user1, []);       /* вызывает СРАЗУ с this = user1 (аргументы массивом) */
const boundFn = user1.logName.bind(user1); /* НЕ вызывает — возвращает копию с this */
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
  up()       { this.step++; return this; }, /* return this возвращает сам ladder */
  down()     { this.step--; return this; },
  showStep() { console.log(`Ступенька: ${this.step}`); return this; },
};
ladder.up().up().down().showStep(); /* Ступенька: 1 (без return this упало бы!) */
```

## 3 главные ловушки урока (чек-лист для повторения)

1. Писать метод объекта через стрелку () => this.name — у стрелки нет своего this, и она уйдёт наружу в window (правильно: method() {} или function() {}).

2. Ждать во вложенном методе user.address.log() доступ к user через this — контекст всегда равен объекту непосредственно перед точкой (address).

3. Вызывать методы цепочкой ladder.up().down() без return this; — по умолчанию метод вернёт undefined, и следующий вызов через точку упадёт с TypeError.
