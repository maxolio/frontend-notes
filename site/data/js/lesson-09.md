# Урок 09. Виды функций, стрелочные функции, колбэки и именование

Суть урока:

- **3 вида функций:** `Function Declaration` (всплывает и перезаписывается), `Function Expression` (в переменной) и `Arrow Function` (короткая, без `arguments` и своего `this`).
- **Использование:** функции передают без `()` как колбэки, возвращают из других функций и называют с глагола.

## 1. Виды функций: Declaration, Expression и стрелочные (00:17–07:05)

[+] Function Declaration всплывает наверх области видимости (можно вызывать раньше, но дубликат имени молча перезапишет первую функцию). Expression и стрелки нельзя вызвать до объявления; у стрелок нет arguments и своего this (берётся из внешнего кода).

```js
/* 1) Function Declaration — всплывает (hoisting), есть arguments и this: */
console.log(sum(2, 3)); /* 5 — работает даже ДО строки объявления! */
function sum(a, b) { return a + b; }
/* В 'use strict' Function Declaration внутри блока if видна только в нём! */

/* 2) Function Expression — в const, до строки недоступна (TDZ): */
const logHello = function() { console.log('Привет'); };
/* NFE (с внутренним именем self, видимым только внутри функции): */
const fn = function self() { return self; };

/* 3) Arrow Function (стрелка) — в 1 строку без {} делает неявный return: */
const multiply = (a, b) => a * b; /* короткий возврат a * b */
const double = x => x * 2;        /* 1 параметр можно без скобок (x) */
const makeObj = id => ({ id });   /* возврат объекта в 1 строку: ({ ... }) */
```

## 2. Функция как значение, колбэки и возврат функции (07:06–11:48)

[!] Имя функции без () возвращает саму функцию (её можно скопировать в другую переменную или передать аргументом — это колбэк). Ставить () при передаче колбэка нельзя: иначе он выполнится сразу и передаст внутрь undefined.

```js
const logMessage = (actionBefore, actionAfter) => {
  actionBefore();
  console.log('Привет');
  actionAfter();
};
/* Передаём функции без немедленного вызова: */
logMessage(() => console.log('before'), () => console.log('after'));
/* ОШИБКА: logMessage(console.log('before'), ...) -> is not a function! */

/* Функция может возвращать другую функцию: */
const validate = (hasAccess) => hasAccess
  ? () => console.log('Доступ разрешён')
  : () => console.log('Доступ запрещён');
const showStatus = validate(true); /* сохранили вернувшуюся функцию */
showStatus();                      /* "Доступ разрешён" */
```

## 3. Как правильно называть функции и принцип 1 действия (11:49–14:21)

[+] Функции нужны не только для повтора кода, но и для простого чтения (спрятать пачку инструкций под именем showMenu). Имя — почти всегда глагол + существительное: get..., set..., create..., update..., delete..., show..., hide..., check..., calc....

```js
/* Правило «1 функция = 1 сценарий» (без скрытых побочных эффектов): */
const getPi = () => 3.14; /* только возвращает число, не вызывает alert() */
```

## 3 главные ловушки урока (чек-лист для повторения)

1. Вызывать Function Expression или стрелочную функцию до строки объявления — они не поднимаются готовыми как Function Declaration (будет ошибка TDZ).

2. Передать колбэк со скобками () внутри аргументов — функция сработает мгновенно, а вместо колбэка внутрь попадёт undefined (ошибка is not a function).

3. Ждать объект arguments внутри стрелочной функции (у стрелок его нет) или смешивать несколько несвязанных действий внутри одной функции.

## Вопросы для закрепления

**1. Какой из двух вызовов сработает, а какой упадёт с ошибкой и почему?**

```js
'use strict';

console.log(add(2, 3));
console.log(mult(2, 3));

function add(a, b) {
  return a + b;
}

const mult = (a, b) => a * b;
```

<details>
<summary>Показать ответ</summary>

`add(2, 3)` спокойно выведет **`5`**, а `mult(2, 3)` упадёт с **`ReferenceError: Cannot access 'mult' before initialization`**. `Function Declaration` (`function add`) полностью всплывает (hoisting) и доступна ещё до строки объявления, а `const mult = ...` — переменная со стрелочной функцией (или `Function Expression`), которая до своей строки находится во временной мёртвой зоне (TDZ).

</details>

**2. Почему этот код сразу выведет `'Проверка...'`, а потом сломается с `TypeError: onSuccess is not a function`?**

```js
const runAction = (onSuccess) => {
  console.log('Запуск');
  onSuccess();
};

const logOk = () => console.log('Проверка...');
runAction(logOk());
```

<details>
<summary>Показать ответ</summary>

При передаче колбэка поставили лишние скобки `logOk()`. Из-за них `logOk` **вызвалась сразу** до запуска `runAction`, вывела `'Проверка...'` и вернула `undefined` — именно `undefined` попало в `onSuccess`. Когда внутри попытались выполнить `onSuccess()`, возникла ошибка. Правильно передавать ссылку на функцию без скобок: `runAction(logOk)`.

</details>

**3. Почему стрелочная функция `const double = (x) => { x * 2 };` возвращает `undefined`, а для возврата объекта `id => ({ id })` нужны круглые скобки?**

<details>
<summary>Показать ответ</summary>

Фигурные скобки `{ ... }` в стрелочной функции означают **тело функции из нескольких строк** — без явного слова `return` такая функция всегда возвращает `undefined`. Неявный возврат работает только без `{ ... }` (`x => x * 2`). Поэтому при возврате объекта в одну строку его оборачивают в круглые скобки `({ id })`, чтобы движок не принял `{` за начало обычного тела функции.

</details>

## Задачи

**Задача 1. Перепиши `Function Expression` на стрелочные функции**

Сделай код ниже лаконичнее с помощью стрелочных функций:

1. Перепиши `getStatus` на однострочную стрелочную функцию без `{}` и без явного `return`.
2. Замени оба анонимных колбэка `function () { ... }` в вызове `ask(...)` на стрелочные функции.

```js
'use strict';

function ask(question, yes, no) {
  if (confirm(question)) yes();
  else no();
}

/* Твоё решение: */
const getStatus = function (isOk) {
  return isOk ? 'Согласие получено' : 'Операция отменена';
};

ask(
  'Вы согласны с правилами?',
  function () { console.log(getStatus(true)); },
  function () { console.log(getStatus(false)); }
);
```

<details>
<summary>Подсказка и решение</summary>

```js
'use strict';

function ask(question, yes, no) {
  if (confirm(question)) yes();
  else no();
}

/*
  Стрелка в одну строку без {} автоматически делает return результата
  тернарного оператора; для одного параметра (isOk) скобки можно не ставить
*/
const getStatus = isOk => isOk ? 'Согласие получено' : 'Операция отменена';

/*
  Передаём стрелочные колбэки без вызовов (): ask сам запустит нужный
  вариант в зависимости от ответа пользователя в confirm
*/
ask(
  'Вы согласны с правилами?',
  () => console.log(getStatus(true)),
  () => console.log(getStatus(false))
);
```

</details>

**Задача 2. Почини колбэки и неявный возврат в стрелочной функции**

Сейчас код падает с `TypeError` при вызове `processPayment`, а бонус возвращает `undefined`. Исправь две ошибки:

1. В `calcBonus` убери лишние фигурные скобки `{ ... }` (или добавь `return`), чтобы функция возвращала `sum * 0.1`.
2. В вызове `processPayment` передай колбэки `onSuccess` и `onError` по имени без круглых скобок `()`.

Проверка: в консоль должны вывестись `'Оплата прошла!'` и `'Бонус: 120'`.

```js
'use strict';

/* Твоё решение: */
const calcBonus = (sum) => { sum * 0.1 };

const onSuccess = () => console.log('Оплата прошла!');
const onError = () => console.log('Ошибка суммы!');

const processPayment = (amount, successFn, errorFn) => {
  if (amount > 0) {
    successFn();
    console.log(`Бонус: ${calcBonus(amount)}`);
  } else {
    errorFn();
  }
};

processPayment(1200, onSuccess(), onError());
```

<details>
<summary>Подсказка и решение</summary>

```js
'use strict';

/*
  Убрали фигурные скобки { ... }: без них стрелочная функция сразу
  неявно возвращает результат sum * 0.1 вместо undefined
*/
const calcBonus = (sum) => sum * 0.1;

const onSuccess = () => console.log('Оплата прошла!');
const onError = () => console.log('Ошибка суммы!');

const processPayment = (amount, successFn, errorFn) => {
  if (amount > 0) {
    successFn();
    console.log(`Бонус: ${calcBonus(amount)}`);
  } else {
    errorFn();
  }
};

/*
  Передаём функции-колбэки по имени БЕЗ круглых скобок (),
  иначе они сработают заранее и передадут внутрь undefined
*/
processPayment(1200, onSuccess, onError);
```

</details>

**Задача 3. Функция возвращает функцию + правило «1 функция = 1 действие»**

Напиши стрелочную функцию-фабрику `createGreeting(isAdmin)`:

1. Функция не должна вызывать `console.log` сама — она должна вернуть другую стрелочную функцию без параметров.
2. Если `isAdmin` истинно, возвращённая функция отдаёт `'Панель администратора открыта'`, иначе — `'Личный кабинет пользователя'`.

Проверка: `getAdminGreeting()` -> `'Панель администратора открыта'`, `getUserGreeting()` -> `'Личный кабинет пользователя'`.

```js
'use strict';

/* Твоё решение: */

const getAdminGreeting = createGreeting(true);
const getUserGreeting = createGreeting(false);

console.log(getAdminGreeting()); /* Панель администратора открыта */
console.log(getUserGreeting());  /* Личный кабинет пользователя */
```

<details>
<summary>Подсказка и решение</summary>

```js
'use strict';

/*
  createGreeting по флагу isAdmin возвращает одну из двух стрелочных функций.
  Возвращённые функции лишь отдают строку, не смешивая логику с console.log
*/
const createGreeting = (isAdmin) => isAdmin
  ? () => 'Панель администратора открыта'
  : () => 'Личный кабинет пользователя';

/* Вызов createGreeting возвращает готовую функцию — сохраняем её в const */
const getAdminGreeting = createGreeting(true);
const getUserGreeting = createGreeting(false);

/* Теперь вызываем сохранённые функции и сами выводим полученные строки */
console.log(getAdminGreeting()); /* Панель администратора открыта */
console.log(getUserGreeting());  /* Личный кабинет пользователя */
```

</details>
