# Урок 09. Виды функций, стрелочные функции, колбэки и именование

Суть урока:

- **3 вида функций:** `Function Declaration` (всплывает и может быть тихо перезаписана дубликатом), `Function Expression` (в переменной) и `Arrow Function` (короткая запись, неявный `return`, без своих `arguments` и `this`).
- **Функция как значение:** имя без `()` позволяет скопировать функцию, передать её колбэком или вернуть из другой функции.
- **Чистое именование:** имя почти всегда начинается с глагола (`get`, `calc`, `show`, `check`), а сама функция делает 1 понятное действие.

## 1. Виды функций: Declaration, Expression и стрелочные (00:17–07:05)

[+] `Function Declaration` всплывает наверх области видимости (можно вызвать до объявления, но повторное имя тихо перезапишет первую функцию). `Function Expression` и стрелочные функции в `const` / `let` нельзя вызвать до их строки (`ReferenceError` из-за TDZ), зато `const` защищает от дубликата имени.

На вырост: у стрелочных функций нет собственных `arguments` и `this` — они берут их из внешней функции (подробнее про `this` разберём в уроках про объекты).

| Характеристика | `Function Declaration` | `Function Expression` | `Arrow Function` |
| :--- | :--- | :--- | :--- |
| Вызов до объявления | Да (всплывает) | Нет (`ReferenceError`) | Нет (`ReferenceError`) |
| Защита от дубликата | Нет (перезапишет) | Да (`const` -> `SyntaxError`) | Да (`const` -> `SyntaxError`) |
| Неявный `return` | Нет | Нет | Да (без `{}`) |
| Свои `arguments` / `this` | Да | Да | Нет (берёт снаружи) |

```js
'use strict';

/* 1. Function Declaration — всплывает; дубликат тихо перезапишет её */
console.log(sum(2, 3)); /* 5 — работает ещё до строки объявления */
function sum(a, b) {
  return a + b;
}
/* В 'use strict' функция внутри блока if видна только внутри него */

/* 2. Function Expression — в const, до своей строки недоступна (TDZ) */
const logHello = function () {
  console.log('Привет');
};

/* Именованное выражение (NFE): имя self видно только внутри функции */
const getSelf = function self() {
  return self;
};

/* 3. Arrow Function — короткая запись и неявный return без {} */
const multiply = (a, b) => a * b; /* 2+ параметра — скобки нужны */
const double = x => x * 2;        /* 1 параметр — можно без скобок */
const sayHi = () => 'Привет';     /* 0 параметров — пустые () нужны */

/* Многострочная стрелка с {} требует явного return */
const calcTotal = (price, qty) => {
  const total = price * qty;
  return total;
};

/* На вырост (объекты): возврат объекта в 1 строку оборачивают в () */
const makeUser = (id) => ({ id: id });
```

## 2. Функция как значение, колбэки и возврат функции (07:06–11:48)

[!] Имя функции без `()` — это ссылка на саму функцию (её можно скопировать в другую переменную, вернуть из функции или передать аргументом — это **колбэк**). Ставить `()` при передаче колбэка нельзя: функция выполнится сразу, а внутрь уйдёт её результат (часто `undefined`).

```js
'use strict';

/* 1. Копирование функции как значения (без скобок ()) */
const showHi = () => console.log('Привет');
const greet = showHi;
greet(); /* 'Привет' */

/* 2. Передача колбэков без немедленного вызова */
const logMessage = (actionBefore, actionAfter) => {
  actionBefore();
  console.log('Основное действие');
  actionAfter();
};

const onBefore = () => console.log('До');
const onAfter = () => console.log('После');

logMessage(onBefore, onAfter); /* передаём ссылки на функции */
logMessage(() => console.log('1'), () => console.log('2'));

/* ОШИБКА: onBefore() сработает сразу и передаст внутрь undefined */
/* logMessage(onBefore(), onAfter()); -> TypeError: is not a function */

/* 3. Функция может вернуть другую функцию */
const validate = (hasAccess) => hasAccess
  ? () => console.log('Доступ разрешён')
  : () => console.log('Доступ запрещён');

const showStatus = validate(true); /* сохранили вернувшуюся функцию */
showStatus();                      /* 'Доступ разрешён' */
```

## 3. Как правильно называть функции и принцип 1 действия (11:49–14:21)

[+] Функции нужны не только против повтора кода, но и для простого чтения: пачка шагов прячется под говорящим именем `showMenu`. Имя почти всегда строится как **глагол + существительное**.

| Префикс | Когда использовать | Примеры |
| :--- | :--- | :--- |
| `get...` / `set...` | Получить или задать значение | `getAge`, `setTheme` |
| `calc...` | Вычислить и вернуть результат | `calcTotal`, `calcBonus` |
| `check...` / `is...` / `has...` | Проверить условие (`true` / `false`) | `checkAccess`, `isAdult` |
| `show...` / `hide...` | Показать или скрыть что-то | `showMenu`, `hideModal` |
| `create...` / `update...` / `delete...` | Создать, обновить или удалить | `createUser`, `deleteItem` |

```js
'use strict';

/* Плохо: имя обещает расчёт, но внутри скрыт побочный эффект (alert) */
const getDiscount = (sum) => {
  alert('Скидка применена!');
  return sum * 0.1;
};

/* Хорошо: каждая функция делает ровно 1 понятное действие */
const calcDiscount = (sum) => sum * 0.1;
const showNotice = (text) => console.log(text);
```

## 3 главные ловушки урока (чек-лист для повторения)

1. Вызывать `Function Expression` или стрелочную функцию до строки объявления — они хранятся в `const` / `let` и находятся во временной мёртвой зоне (TDZ), поэтому вызов упадёт с `ReferenceError`.

2. Передать колбэк со скобками `()` — функция сработает мгновенно при передаче, а вместо колбэка внутрь попадёт `undefined` (ошибка `TypeError: ... is not a function`).

3. Поставить `{ ... }` в однострочной стрелке без `return` (вернётся `undefined`), забыть круглые скобки вокруг объекта `({ ... })` или искать внутри стрелки собственный объект `arguments`.

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

`add(2, 3)` спокойно выведет **`5`**, а `mult(2, 3)` упадёт с **`ReferenceError: Cannot access 'mult' before initialization`**. `Function Declaration` (`function add`) полностью всплывает и доступна ещё до строки объявления, а `const mult = ...` — переменная со стрелочной функцией, которая до своей строки находится во временной мёртвой зоне (TDZ).

</details>

**2. Почему этот код сразу выведет `'Проверка...'`, а потом сломается с `TypeError: onSuccess is not a function`?**

```js
'use strict';

const runAction = (onSuccess) => {
  console.log('Запуск');
  onSuccess();
};

const logOk = () => console.log('Проверка...');
runAction(logOk());
```

<details>
<summary>Показать ответ</summary>

При передаче колбэка поставили лишние скобки `logOk()`. Из-за них `logOk` **вызвалась сразу** до запуска `runAction`, вывела `'Проверка...'` и вернула `undefined` — именно `undefined` попало в `onSuccess`. Когда внутри попытались выполнить `onSuccess()`, возникла `TypeError`. Правильно передавать ссылку без скобок: `runAction(logOk)`.

</details>

**3. Почему стрелочная функция `const double = (x) => { x * 2 };` возвращает `undefined`, а для возврата объекта (на вырост: `id => ({ id: id })`) нужны круглые скобки?**

<details>
<summary>Показать ответ</summary>

Фигурные скобки `{ ... }` после `=>` означают **тело функции** — без явного `return` такая функция всегда возвращает `undefined`. Неявный возврат работает только без `{ ... }` (`x => x * 2`). Поэтому при возврате объекта в одну строку его оборачивают в круглые скобки `({ id: id })`, чтобы движок не принял `{` за начало обычного тела функции.

</details>

## Задачи

**Задача 1. Перепиши `Function Expression` на стрелочные функции**

Сделай код ниже лаконичнее с помощью стрелочных функций:

1. Перепиши `getStatus` на короткую стрелочную функцию без `{}` и без явного `return`.
2. Замени оба анонимных колбэка `function () { ... }` в вызове `ask(...)` на стрелочные функции.

Проверка: при нажатии «ОК» в `confirm` в консоль выводится `'Согласие получено'`, при «Отмена» — `'Операция отменена'`.

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
  Стрелка без {} автоматически делает return результата;
  для одного параметра скобки (isOk) можно опустить
*/
const getStatus = isOk =>
  isOk ? 'Согласие получено' : 'Операция отменена';

/*
  Передаём стрелочные колбэки без вызовов ():
  ask сама запустит нужный вариант после ответа в confirm
*/
ask(
  'Вы согласны с правилами?',
  () => console.log(getStatus(true)),
  () => console.log(getStatus(false))
);
```

</details>

**Задача 2. Почини колбэки и неявный возврат в стрелочной функции**

Сейчас код заранее вызывает оба колбэка и падает с `TypeError`, а после их починки `calcBonus` выводит `undefined`. Исправь две ошибки:

1. В `calcBonus` убери лишние фигурные скобки `{ ... }` (или добавь `return`), чтобы функция возвращала `sum * 0.1`.
2. В вызове `processPayment` передай колбэки `onSuccess` и `onError` по имени без круглых скобок `()`.

Проверка: в консоль выводятся `'Оплата прошла!'` и `'Бонус: 120'`.

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
  Убрали фигурные скобки {}: без них стрелочная функция
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
  Передаём колбэки по имени без скобок (), иначе они
  сработают заранее и передадут внутрь undefined
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
  По флагу isAdmin возвращаем одну из двух стрелочных функций.
  Внутренние функции лишь отдают строку, не вызывая console.log
*/
const createGreeting = (isAdmin) => isAdmin
  ? () => 'Панель администратора открыта'
  : () => 'Личный кабинет пользователя';

/* Сохраняем возвращённые функции в переменные */
const getAdminGreeting = createGreeting(true);
const getUserGreeting = createGreeting(false);

/* Вызываем сохранённые функции и выводим результат */
console.log(getAdminGreeting()); /* Панель администратора открыта */
console.log(getUserGreeting());  /* Личный кабинет пользователя */
```

</details>
