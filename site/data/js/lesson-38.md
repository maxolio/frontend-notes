# Урок 38. Формы в JS: событие submit и сбор данных через FormData

Суть урока:

- **Перехват отправки:** форму перехватывают на событии `submit` с помощью `event.preventDefault()`.
- **Сбор данных:** `new FormData(formElement)` собирает все поля одной строкой (читается через `forEach` или `Object.fromEntries(formData)`).

## 1. Событие submit и отмена стандартной отправки (01:08–02:23)

[+] По умолчанию отправка формы перезагружает страницу (браузер шлёт запрос на адрес из атрибута action методом из атрибута method — GET или POST). Событие submit срабатывает как при клике по кнопке отправки (`<button>` без type="button" — это submit!), так и по нажатию Enter в любом `<input>` (при этом браузер сам генерирует click по кнопке). Чтобы собрать данные в JS, отменяем стандартное поведение браузера.

```js
const formElement = document.forms.regForm;

formElement.addEventListener('submit', (event) => {
  /* Отменяем перезагрузку страницы при отправке формы: */
  event.preventDefault();
  /* Дальше здесь собираем данные и отправляем на сервер через JS */
});
```

## 2. Ручной обход formElement.elements и его проблемы (02:24–07:21)

[!] Если просто перебирать formElement.elements циклом for..of, приходится вручную фильтровать пустые элементы, чекбоксы, радиокнопки, select multiple и файлы.

```js
const formData = {};

for (const element of formElement.elements) {
  /* 1. У <fieldset> и <button> нет name — без проверки появится "" */
  if (!element.name) continue;

  /* 2. У checkbox свойство .value всегда "on", даже без галочки! */
  if (element.type === 'checkbox') {
    formData[element.name] = element.checked; /* берём true или false */
    continue;
  }

  /* 3. Радиокнопок несколько — невыбранные перезапишут ключ! */
  if (element.type === 'radio' && !element.checked) continue;

  formData[element.name] = element.value;
}
```

## 3. Сбор данных через new FormData и чтение значений (07:22–10:13)

[+] Класс FormData сам собирает значения всех полей формы (включая select и file) без ручных проверок. Внутри он похож на коллекцию Map, поэтому console.log(formData) в консоли выглядит пустым — пары ключ/значение смотрят через цикл, forEach или Object.

```js
formElement.addEventListener('submit', (event) => {
  event.preventDefault();

  /* Передаём DOM-элемент формы — FormData соберёт поля по name: */
  const formData = new FormData(formElement);
  /* В консоли выглядит как {}, но данные внутри есть: */
  console.log(formData);

  /* Способ 1 — forEach (ВНИМАНИЕ: 1-й аргумент value, 2-й name!): */
  formData.forEach((value, name) => {
    console.log(`${name}: ${value}`);
  });

  /* Способ 2 — перебрать пары через цикл for..of: */
  for (const [name, value] of formData) {
    console.log(name, value);
  }

  /* Способ 3 (для отладки) — превратить в обычный JS-объект: */
  console.log(Object.fromEntries(formData));
  /*
    На сервер шлём сам formData! Если у ключа несколько значений,
    Object.fromEntries оставит лишь последнее.
    FormData пропускает поля без name, disabled и снятые checkbox/radio
  */

  /*
    Пустая коллекция: new FormData(); для отправки через fetch:
    fetch('/api', { method: 'POST', body: formData }) (без Content-Type)
    Если бэкенд ждёт JSON: JSON.stringify(Object.fromEntries(formData))
  */
});
```

## 4. Методы FormData: append, set, get, getAll, has, delete (10:14–11:15)

[+] Готовую коллекцию FormData можно дополнять своими данными, перезаписывать ключи, проверять наличие полей или удалять лишние записи перед отправкой на сервер.

```js
/* append(name, value[, filename]) — ДОБАВЛЯЕТ (не затирает старое): */
formData.append('tag', 'js');
formData.append('tag', 'dom'); /* у ключа 'tag' теперь два значения */

/* set(name, value) — ЗАМЕНЯЕТ все старые записи по этому ключу: */
formData.set('tag', 'forms');

/* get(name) — 1-е значение (или null), getAll(name) — массив всех: */
console.log(formData.get('tag'));    /* 'forms' */
console.log(formData.getAll('tag')); /* ['forms'] */

/* has(name) — проверить наличие записи (true или false): */
console.log(formData.has('tag')); /* true */

/* delete(name) — удалить все значения по этому имени: */
formData.delete('tag');
console.log(formData.has('tag')); /* false */

/* Все значения внутри FormData — строки (или File): */
formData.append('age', 25);
console.log(typeof formData.get('age')); /* 'string' */
/* Пустой <input type="file"> даст File с size === 0 и name: "" */
```

## 3 главные ловушки урока (чек-лист для повторения)

1. Забыть event.preventDefault() внутри обработчика submit — браузер перезагрузит страницу по атрибуту action, и JS не успеет обработать или отправить данные.

2. Увидеть пустой объект {} в console.log(formData) и решить, что поля не собрались: проверять содержимое нужно через Object.fromEntries(formData) или formData.forEach.

3. Перепутать порядок аргументов в formData.forEach((value, name) => ...) — как и в Map, первым параметром всегда приходит значение (value), а вторым имя поля (name).

## Вопросы для закрепления

**1. Почему `console.log(formData)` показывает `{}`, какие поля `FormData` вообще не соберёт, и что окажется в `a` и `b` внутри `forEach`?**

```js
const formData = new FormData(formElement);
console.log(formData);

formData.forEach((a, b) => console.log(a, b));
```

<details>
<summary>Показать ответ</summary>

1. `FormData` хранит пары внутри скрытой структуры (похожей на `Map`), поэтому обычный `console.log(formData)` выглядит пустым — данные смотрят через `Object.fromEntries(formData)`, `for..of` или `forEach`.
2. `FormData` пропускает: поля без атрибута `name`, поля с `disabled` и **неотмеченные** `checkbox` и `radio`.
3. В `formData.forEach((value, name) => ...)` первым параметром (`a`) идёт **значение поля**, а вторым (`b`) — **его `name`**.

</details>

**2. Что потеряет `Object.fromEntries(formData)` при выборе нескольких чекбоксов `interests`, и чем `append` отличается от `set`?**

```html
<input type="checkbox" name="interests" value="js" checked>
<input type="checkbox" name="interests" value="css" checked>
```

<details>
<summary>Показать ответ</summary>

1. Если у нескольких полей (или у `<select multiple>`) одинаковое имя `interests`, то `Object.fromEntries(formData)` оставит только последнее значение (`{ interests: 'css' }`). Все значения сразу получают массивом через `formData.getAll('interests')` -> `['js', 'css']`.
2. Метод `append(name, value)` **дописывает** ещё одно значение к уже имеющимся под этим ключом, а `set(name, value)` **стирает** все старые значения ключа и записывает одно новое.

</details>

**3. Почему перехватывать отправку нужно через `submit` на `<form>`, а не `click` на кнопке, и какого типа будет значение после `formData.append('age', 25)`?**

<details>
<summary>Показать ответ</summary>

1. Форма часто отправляется клавишей `Enter` в поле ввода, и событие `submit` на `<form>` ловит **все** способы отправки (и клик, и `Enter`), позволяя отменить перезагрузку через `event.preventDefault()`. На кнопках, которые НЕ должны отправлять форму, ставят `type="button"`.
2. Все примитивные значения внутри `FormData` автоматически превращаются в **строки** — `typeof formData.get('age')` вернёт `'string'` (кроме файлов `File`).

</details>

## Задачи

**Задача 1. Перехват `submit` и подготовка `FormData` (`get`, `set`, `delete`, `append`)**

Перед отправкой формы обратной связи нужно очистить пробелы, убрать лишнее поле и добавить время отправки. Напиши функцию `initFeedbackForm()` для `document.forms.feedback`:

1. Повесь обработчик `'submit'` и отмени стандартную отправку через `event.preventDefault()`.
2. Создай `const formData = new FormData(formElement)`.
3. Если обрезанное поле `'message'` пустое — выведи `'Введите сообщение'` и выйди (`return`).
4. Удали секретное поле `'confirmPassword'` через `.delete()`, перезапиши `'message'` обрезанным через `.trim()` текстом через `.set()`, добавь поле `'sentAt'` со строкой `new Date().toISOString()` через `.append()` и выведи `Object.fromEntries(formData)`.

```html
<form name="feedback">
  <input name="message" type="text">
  <input name="confirmPassword" type="password">
  <button type="submit">Отправить</button>
</form>
```

```js
'use strict';

/* Твоё решение: */
function initFeedbackForm() {
  /* ... */
}

initFeedbackForm();
```

<details>
<summary>Подсказка и решение</summary>

```js
'use strict';

function initFeedbackForm() {
  const formElement = document.forms.feedback;
  if (!formElement) return;

  formElement.addEventListener('submit', (event) => {
    /* Обязательно отменяем перезагрузку страницы при отправке формы */
    event.preventDefault();

    const formData = new FormData(formElement);
    const trimmedMessage = (formData.get('message') ?? '').trim();

    if (!trimmedMessage) {
      console.log('Введите сообщение');
      return;
    }

    /*
      delete — убирает ненужное серверу поле подтверждения,
      set — перезаписывает message очищенной строкой,
      append — добавляет служебную метку времени
    */
    formData.delete('confirmPassword');
    formData.set('message', trimmedMessage);
    formData.append('sentAt', new Date().toISOString());

    console.log(Object.fromEntries(formData));
  });
}

initFeedbackForm();
```

</details>

**Задача 2. Сериализация формы в JSON без потери множественных тегов (`getAll`)**

Если у чекбоксов одинаковое имя `name="tags"`, обычный `Object.fromEntries(formData)` сохранит только последний выбранный тег. Напиши функцию `serializeOrderForm(formElement)`:

1. Собери `formData = new FormData(formElement)`.
2. Получи базовый объект `payload = Object.fromEntries(formData)`.
3. Замени `payload.tags` на полный массив всех выбранных значений из `formData.getAll('tags')` и верни JSON-строку (`JSON.stringify(payload)`).

```html
<form name="order">
  <input name="title" value="Ноутбук">
  <input type="checkbox" name="tags" value="urgent" checked>
  <input type="checkbox" name="tags" value="gift" checked>
  <button type="submit">Оформить</button>
</form>
```

```js
'use strict';

/* Твоё решение: */
function serializeOrderForm(formElement) {
  /* ... */
}

const orderFormElement = document.forms.order;
orderFormElement?.addEventListener('submit', (event) => {
  event.preventDefault();
  console.log(serializeOrderForm(orderFormElement));
  /* '{"title":"Ноутбук","tags":["urgent","gift"]}' */
});
```

<details>
<summary>Подсказка и решение</summary>

```js
'use strict';

function serializeOrderForm(formElement) {
  if (!formElement) return '{}';

  const formData = new FormData(formElement);

  /* Object.fromEntries заберёт title, но потеряет дублирующиеся tags */
  const payload = Object.fromEntries(formData);

  /* getAll вернёт массив ВСЕХ значений 'tags' (или [], если пусто) */
  payload.tags = formData.getAll('tags');

  return JSON.stringify(payload);
}

const orderFormElement = document.forms.order;
orderFormElement?.addEventListener('submit', (event) => {
  event.preventDefault();
  console.log(serializeOrderForm(orderFormElement));
});
```

</details>

**Задача 3. Ручной сбор `formElement.elements` с сохранением `false` у чекбоксов**

`FormData` полностью пропускает снятые чекбоксы, но иногда серверу нужно явное `{ subscribe: false }`. Напиши функцию `collectFormWithBooleans(formElement)`, которая обходит `formElement.elements`:

1. Пропускай элементы без `name` (`!element.name`) и отключённые (`element.disabled`).
2. Для `element.type === 'checkbox'` записывай булево `element.checked`.
3. Для `element.type === 'radio'` пропускай неотмеченные кнопки (`!element.checked`).
4. Для остальных полей записывай `element.value`.

```html
<form name="profile">
  <input name="login" value="alex">
  <input type="checkbox" name="subscribe">
  <input type="radio" name="plan" value="free">
  <input type="radio" name="plan" value="pro" checked>
  <button type="submit">Сохранить</button>
</form>
```

```js
'use strict';

/* Твоё решение: */
function collectFormWithBooleans(formElement) {
  /* ... */
}

const profileFormElement = document.forms.profile;
console.log(collectFormWithBooleans(profileFormElement));
/* { login: 'alex', subscribe: false, plan: 'pro' } */
```

<details>
<summary>Подсказка и решение</summary>

```js
'use strict';

function collectFormWithBooleans(formElement) {
  if (!formElement) return {};

  const result = {};

  for (const element of formElement.elements) {
    /* Отсекаем кнопки/fieldset без name и отключённые поля (disabled) */
    if (!element.name || element.disabled) continue;

    /* Чекбокс пишем как true/false, иначе возьмётся .value === 'on' */
    if (element.type === 'checkbox') {
      result[element.name] = element.checked;
      continue;
    }

    /* Пропускаем невыбранные радиокнопки, чтобы не затёрли выбранную */
    if (element.type === 'radio' && !element.checked) continue;

    result[element.name] = element.value;
  }

  return result;
}

const profileFormElement = document.forms.profile;
console.log(collectFormWithBooleans(profileFormElement));
```

</details>
