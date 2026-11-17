# Урок 26. Поиск элементов в DOM: getElement* и querySelector*

Суть урока: В 99% задач элементы ищут по любому CSS-селектору через querySelector (один элемент) и querySelectorAll (все элементы), вверх к предку шагают через closest, а в реальной разметке JS-элементы лучше помечать атрибутами data-js-*.

## 1. Поиск по id: document.getElementById и ловушка глобального id (01:08–03:13)

[+] Если у тега задан уникальный id, к нему быстро обращаются через document.getElementById (работает только у document, а не у вложенных элементов).

```js
const buttonElement = document.getElementById('myButton');
/* Найдёт первый элемент с таким id; если не найден — вернёт null */

/* АНТИПАТТЕРН: браузер создаёт глобальную переменную с именем id (если без дефиса) */
console.log(myButton); /* сработает, но сломается при id='my-button' или своей myButton */
```

## 2. Универсальный поиск: querySelector и querySelectorAll (03:14–07:30, 08:48)

[+] Оба метода принимают любой CSS-селектор и вызываются как у document, так и у любого уже найденного элемента (чтобы сузить область поиска).

```js
/* querySelector — возвращает ПЕРВЫЙ подходящий элемент (или null) */
const btnElement = document.querySelector('button');
const byId = document.querySelector('#myButton');
const byClass = document.querySelector('.my-button');

/* querySelectorAll — возвращает ВСЕ подходящие элементы в виде NodeList */
const listItemElements = document.querySelectorAll('.list-item');
listItemElements.forEach((el) => console.log(el)); /* у NodeList есть forEach! */

/* Сужение контекста (ищем не по всей странице, а только внутри wrapperElement) */
const wrapperElement = document.querySelector('#wrapper');
const listElement = wrapperElement.querySelector('.list');

/* Несколько селекторов за раз — одной строкой через запятую */
const mixedElements = document.querySelectorAll('.box-1, .box-3');

/* Псевдоклассы тоже работают; querySelector быстрее querySelectorAll[0] (стоп на 1-м) */
const activeField = document.querySelector(':focus'); /* кто в фокусе прямо сейчас */
```

## 3. Поиск предка и проверка: closest, matches, contains (07:31–08:47)

[+] Если querySelector ищет сверху вниз (внутрь), то closest ищет снизу вверх — начиная с САМОГО элемента и выше по родителям (или вернёт null).

```js
const thirdBoxElement = document.querySelector('.box-3');
const firstBoxElement = thirdBoxElement.closest('.box-1'); /* поднимется до .box-1 */
thirdBoxElement.closest('.box-3'); /* вернёт сам thirdBoxElement, т.к. он подходит */

/* Похожие полезные проверки (возвращают true / false): */
thirdBoxElement.matches('.box-3:hover'); /* подходит ли САМ элемент под CSS-селектор */
firstBoxElement.contains(thirdBoxElement); /* лежит ли thirdBoxElement внутри firstBox */
```

## 4. Живые getElementsBy* против статического querySelectorAll (09:12–11:15)

[!] Старые методы getElementsBy* сейчас почти не используют, но у них есть важная особенность — они возвращают живую HTMLCollection, которая сама подтягивает новые элементы при изменении DOM.

```js
const formElements = document.getElementsByTagName('form');    /* по тегу */
const groupElements = document.getElementsByClassName('group'); /* по классу */
const inputElements = document.getElementsByName('email');      /* по атрибуту name */

/* Статический аналог через querySelectorAll с селектором атрибута name: */
const staticInputs = document.querySelectorAll('[name="email"]');

/* Живая HTMLCollection сама обновится после добавления нового тега в DOM, */
/* но для forEach её надо перевести в массив: [...formElements].forEach(...) */
/* Статический NodeList от querySelectorAll НЕ меняется при правках DOM */
```

## 5. Нейминг переменных и разделение CSS / JS через data-js-* (11:16–15:30)

[+] Правило именования: не сокращайте слова (linkElement вместо link) и всегда добавляйте суффикс Element (для 1 элемента) или Elements (для коллекции).

[+] Правило выбора селектора: class — только для CSS-стилей, id — должен быть уникальным. Чтобы изменение стилей не ломало скрипты, для JS в HTML добавляют специальные атрибуты с префиксом data-js-*.

```js
<!-- В HTML отделяем стилизацию (class) от логики (data-js-*) -->
<div class="slider" data-js-slider>
  <ul class="slider__list" data-js-slider-list>
    <li class="slider__item" data-js-slider-slide>Слайд 1</li>
  </ul>
</div>

/* В JS ищем через квадратные скобки (селектор по атрибуту): */
const sliderElement = document.querySelector('[data-js-slider]');
const sliderSlideElements = sliderElement.querySelectorAll('[data-js-slider-slide]');
```

## 6. Защита от null, проверка пустого NodeList и шпаргалка выбора

[!] Ловушка проверки: querySelector при неудаче вернёт null, а querySelectorAll — пустой объект NodeList [], который в if (...) всё равно считается true! Поэтому наличие элементов проверяют через .length, а от падения на null спасает ранний выход.

```js
const sliderElement = document.querySelector('[data-js-slider]');
if (!sliderElement) return; /* защита: если блока нет на странице, не упадём ниже */

/* Или через опциональную цепочку (?.) при поиске внутри найденного блока: */
const slides = sliderElement?.querySelectorAll('[data-js-slider-slide]');

/* ВАЖНО: пустой NodeList [] в if (slides) даст true! Проверяем длину .length: */
if (!slides.length) {
  console.log('Слайды не найдены');
}
```

[+] Шпаргалка выбора метода поиска:
- Нужен 1 элемент (или первый подходящий) -> querySelector (либо getElementById).
- Нужен список всех подходящих элементов -> querySelectorAll.
- Нужно найти родителя вверх от кликнутой кнопки -> closest.
- Нужна самообновляемая коллекция при правках DOM -> getElementsBy* / elem.children.

## 3 главные ловушки урока (чек-лист для повторения)

1. Перепутать querySelector (один элемент или null) и querySelectorAll (всегда возвращает список NodeList — даже пустой список правдив в условии if!).

2. Ждать, что переменная от querySelectorAll сама обновится после добавления тегов в DOM (она статическая), либо вызывать .forEach() прямо на живой HTMLCollection от getElementsBy* без [...coll].

3. Искать элементы напрямую по глобальной переменной от id или привязывать JS к CSS-классам стилей вместо отдельных data-js-* атрибутов.

## Вопросы для закрепления

**1. Почему `if (cards)` сработает даже на пустой странице, а `modal.querySelector('.close')` может обрушить скрипт?**

```js
const cards = document.querySelectorAll('.card');
if (cards) {
  console.log('Карточки найдены!');
}

const modal = document.querySelector('.modal');
const closeBtn = modal.querySelector('.close');
```

<details>
<summary>Показать ответ</summary>

1. Метод `querySelectorAll` всегда возвращает объект `NodeList`, даже если ничего не нашёл (`length === 0`). Внутри `if (...)` любой объект приводится к `true`, поэтому наличие элементов всегда проверяют по длине: `if (cards.length > 0)`.
2. Метод `querySelector` при неудаче возвращает **`null`**. Вызов `.querySelector('.close')` на `null` сразу выбросит `TypeError` — поэтому сначала делают ранний выход `if (!modal) return;` или ставят `modal?.querySelector('.close')`.

</details>

**2. Чем `querySelectorAll('.item')` отличается от `getElementsByClassName('item')`, и почему нельзя полагаться на глобальное имя от `id="saveBtn"`?**

<details>
<summary>Показать ответ</summary>

1. `querySelectorAll` возвращает **статичный `NodeList`**: он не обновится при добавлении новых тегов в DOM, но у него сразу есть метод `.forEach()`. А `getElementsByClassName` отдаёт **живую `HTMLCollection`**, которая сама подтягивает новые теги, но требует `[...coll]` перед `.forEach()`.
2. Обращение к `saveBtn` напрямую без `document.getElementById('saveBtn')` — хрупкий антипаттерн: если в `id` появится дефис (`save-btn`) или в коде объявят переменную `saveBtn`, ссылка на элемент сломается.

</details>

**3. Что вернёт `itemElement.closest('.item')` при вызове на самом элементе `.item`, и чем отличаются `matches` и `contains`?**

<details>
<summary>Показать ответ</summary>

1. Метод `closest(selector)` начинает проверку **с самого элемента**, а затем шагает вверх по родителям — поэтому на самом `.item` он сразу вернёт **`itemElement`** (а если предок не найден, вернёт `null`).
2. `elem.matches(selector)` возвращает `true`/`false` — подходит ли сам элемент под селектор, а `parent.contains(child)` проверяет, находится ли `child` внутри `parent` (включая самого `parent`).

</details>

## Задачи

**Задача 1. Безопасный поиск по `data-js-*` внутри контекста**

Напиши функцию `inspectOrderForm()`:
1) Найди на странице форму по атрибуту `[data-js-order-form]` в переменную `orderFormElement` (если не найдена — сразу верни `null`).
2) Не делая повторный поиск по всему `document`, найди **внутри `orderFormElement`** все поля по `[data-js-field]` в `fieldElements`.
3) Верни объект `{ form: orderFormElement, fieldsCount: fieldElements.length }`.

```js
'use strict';

/*
  Ожидаемый HTML на странице:
  <form class="form" data-js-order-form>
    <input class="form__input" data-js-field>
    <input class="form__input" data-js-field>
  </form>
*/

/* Твоё решение: */
function inspectOrderForm() {
  /* ... */
}

console.log(inspectOrderForm());
```

<details>
<summary>Подсказка и решение</summary>

```js
'use strict';

function inspectOrderForm() {
  /* Ищем по data-js-* атрибуту, чтобы смена CSS-классов не сломала JS */
  const orderFormElement = document.querySelector('[data-js-order-form]');

  /* Ранний выход при null: защищаемся от TypeError при поиске внутри формы */
  if (!orderFormElement) return null;

  /* Сужаем область поиска: ищем поля только внутри уже найденной формы */
  const fieldElements = orderFormElement.querySelectorAll('[data-js-field]');

  return {
    form: orderFormElement,
    fieldsCount: fieldElements.length,
  };
}

console.log(inspectOrderForm());
```

</details>

**Задача 2. Поиск родителя вверх (`closest`) и проверки `matches` / `contains`**

Напиши функцию `getCardMeta(actionButtonElement)`:
1) Если `actionButtonElement` пустой (`null`/`undefined`) — верни `null`.
2) С помощью `.closest('[data-js-card]')` найди родительскую карточку `cardElement` (если карточки вокруг кнопки нет — тоже верни `null`).
3) С помощью `.matches('[data-js-primary]')` проверь, главная ли это кнопка (`isPrimary`), а через `cardElement.contains(...)` убедись, что кнопка лежит внутри карточки (`isInsideCard`), и верни `{ cardElement, isPrimary, isInsideCard }`.

```js
'use strict';

/*
  Ожидаемый HTML на странице:
  <article class="card" data-js-card>
    <button type="button" data-js-action data-js-primary>Купить</button>
  </article>
*/

/* Твоё решение: */
function getCardMeta(actionButtonElement) {
  /* ... */
}

const btnElement = document.querySelector('[data-js-action]');
console.log(getCardMeta(btnElement));
```

<details>
<summary>Подсказка и решение</summary>

```js
'use strict';

function getCardMeta(actionButtonElement) {
  if (!actionButtonElement) return null;

  /* closest шагает от самой кнопки вверх по родителям до первого совпадения */
  const cardElement = actionButtonElement.closest('[data-js-card]');
  if (!cardElement) return null;

  /* matches проверяет, подходит ли сама кнопка под селектор [data-js-primary] */
  const isPrimary = actionButtonElement.matches('[data-js-primary]');

  /* contains проверяет, является ли кнопка потомком найденной карточки */
  const isInsideCard = cardElement.contains(actionButtonElement);

  return { cardElement, isPrimary, isInsideCard };
}

const btnElement = document.querySelector('[data-js-action]');
console.log(getCardMeta(btnElement));
```

</details>

**Задача 3. Живая коллекция `getElementsByTagName` против статического `querySelectorAll`**

Напиши функцию `compareLiveAndStatic(listElement)`:
1) Если `!listElement`, верни `null`.
2) Получи пункты списка `<li>` внутри `listElement` двумя способами: в `liveItemElements` через `listElement.getElementsByTagName('li')` и в `staticItemElements` через `listElement.querySelectorAll('li')`.
3) Создай новый тег `<li>` (`document.createElement('li')`) и добавь его в конец `listElement` через `.append(...)`.
4) Верни объект с итоговыми длинами обеих коллекций (`liveCount` и `staticCount`), чтобы увидеть разницу после мутации DOM.

```js
'use strict';

/* Твоё решение: */
function compareLiveAndStatic(listElement) {
  /* ... */
}

const listElement = document.querySelector('ul');
console.log(compareLiveAndStatic(listElement));
/* Если в <ul> было 2 <li>, вернёт: { liveCount: 3, staticCount: 2 } */
```

<details>
<summary>Подсказка и решение</summary>

```js
'use strict';

function compareLiveAndStatic(listElement) {
  if (!listElement) return null;

  /* Живая HTMLCollection — автоматически пересчитается при добавлении нового <li> */
  const liveItemElements = listElement.getElementsByTagName('li');

  /* Статический NodeList — навсегда сохранит снимок на момент поиска */
  const staticItemElements = listElement.querySelectorAll('li');

  /* Добавляем новый <li> в DOM уже ПОСЛЕ обоих поисков */
  const newItemElement = document.createElement('li');
  listElement.append(newItemElement);

  /* Перебор живой коллекции через forEach возможен только после разворота в массив */
  [...liveItemElements].forEach((el) => console.log(el));

  return {
    liveCount: liveItemElements.length,     /* увеличилось на 1 */
    staticCount: staticItemElements.length, /* осталось прежним */
  };
}

const listElement = document.querySelector('ul');
console.log(compareLiveAndStatic(listElement));
```

</details>
