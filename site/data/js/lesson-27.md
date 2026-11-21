# Урок 27. Свойства и атрибуты DOM-элементов, value, data-*

Суть урока:

- **Стандартные и нестандартные:** стандартные атрибуты читают через свойства DOM-объекта (`input.value`), нестандартные — через методы `*Attribute()`.
- **`data-*` и `dataset`:** кастомные `data-*` атрибуты доступны через `elem.dataset` и умеют передавать готовый JSON-конфиг из HTML.

## 1. Стандартные HTML-атрибуты как свойства DOM-объекта (00:19–03:18)

[+] У каждого DOM-элемента есть только те стандартные свойства, которые валидны для его тега (action есть у `<form>`, checked — у `<input>`). Они работают как геттеры/сеттеры и сразу обновляют HTML в DevTools -> Elements.

```js
const formElement = document.querySelector('form');
const inputElement = document.querySelector('input');

console.log(formElement.action);   /* геттер: полный URL (домен + /login) */
formElement.action = '/new-login'; /* сеттер: сразу обновит HTML-атрибут */
console.log(inputElement.checked); /* true/false для чекбокса */

/* Атрибуты через дефис в JS пишутся в camelCase: */
formElement.ariaLabel = 'Форма входа'; /* в HTML: aria-label="Форма входа" */

/* Типы и особые имена DOM-свойств (vs строковые HTML-атрибуты): */
inputElement.checked;  /* boolean, а getAttribute('checked') -> '' */
formElement.style;     /* объект CSSStyleDeclaration, а не строка */
linkElement.href;      /* полный URL, а getAttribute('href') -> '#top' */
formElement.className; /* вместо 'class' (зарезервировано в JS!) */
labelElement.htmlFor;  /* вместо 'for' */
```

## 2. Нестандартные атрибуты: get/set/remove/hasAttribute (03:19–06:40, 09:45)

[!] Кастомные атрибуты (например, qty или data-value) НЕ превращаются в свойства объекта (elem.qty === undefined). Для работы с ними нужны 4 метода (значения атрибутов в HTML всегда хранятся как строки!).

```js
console.log(formElement.getAttribute('qty')); /* читает как строку */
formElement.setAttribute('data-value', '10'); /* ставит (10 -> '10') */
formElement.hasAttribute('data-value');       /* true / false */
formElement.removeAttribute('qty');           /* полностью удаляет */

/*
  ОШИБКА: setAttribute('qty', '') НЕ удаляет атрибут, а оставляет ''!
  Коллекция formElement.attributes показывает все атрибуты (только чтение).
  getAttribute('QTY') найдёт qty (HTML без регистра), а DOM-свойства
  в JS строго чувствительны к регистру (elem.id работает, elem.ID — нет).
*/
```

## 3. Синхронизация и односторонняя ловушка с value (06:41–09:45)

[!] Большинство стандартных атрибутов синхронизируются в обе стороны. Но атрибут value у `<input>` — исключение: при изменении свойства input.value сам HTML-атрибут в разметке НЕ меняется!

```js
/* <input id="login"> (атрибут value в HTML изначально не задан) */
inputElement.value = 'Admin';                  /* меняет текст на экране */
console.log(inputElement.value);               /* 'Admin' — актуально */
console.log(inputElement.getAttribute('value')); /* null! В HTML его нет */

/*
  inputElement.setAttribute('value', 'Guest') меняет атрибут и свойство,
  НО если пользователь уже вводил текст, экран он не обновит!
  Правило: для value и стандартных атрибутов используй свойства (elem.value).
*/
```

[+] Зачем так устроено: HTML-атрибут value (как и checked у чекбокса) специально хранит исходное значение по умолчанию — именно к нему форма откатывается при нажатии кнопки сброса (`<button type="reset">`), а input.value — текущее значение.

```js
/* Ловушка boolean-атрибутов (disabled, hidden, required): */
btn.setAttribute('disabled', 'false'); /* ОШИБКА: всё равно disabled! */
btn.disabled = false;                  /* ПРАВИЛЬНО: уберёт атрибут */
```

## 4. Атрибуты data-*, свойство dataset и передача JSON (10:03–13:20)

[+] Все атрибуты вида data-* автоматически собираются в объект elem.dataset (префикс data- отрезается, а дефисы переходят в camelCase). Также в data-* можно передать готовый объект настроек в формате JSON.

```html
<!-- Внешние кавычки ОДИНАРНЫЕ, внутри валидный JSON с двойными -->
<div data-js-slider='{ "autoplay": true, "speed": 500 }'></div>
```

```js
const sliderElement = document.querySelector('[data-js-slider]');

/* Способ 1: dataset (без "data-", в camelCase) — чтение и запись */
console.log(sliderElement.dataset.jsSlider);
delete sliderElement.dataset.jsSlider; /* удаление data-* атрибута */

/* Способ 2: getAttribute + JSON.parse (с защитой от пустой строки) */
const rawConfig = sliderElement.getAttribute('data-js-slider');
const config = rawConfig ? JSON.parse(rawConfig) : {};
```

## 5. Шпаргалка выбора: свойство, dataset или *Attribute

- Стандартные поля и флаги (value, checked, disabled, href) -> DOM-свойство.
- Свои данные и селекторы компонентов (data-*) -> dataset (или getAttribute).
- Редкие нестандартные атрибуты и точечное удаление -> *Attribute.

## 3 главные ловушки урока (чек-лист для повторения)

1. Читать текст поля через input.getAttribute("value") вместо input.value — получите старое значение из разметки (или null), а не то, что ввели.

2. Пытаться удалить атрибут через setAttribute("attr", "") вместо removeAttribute("attr") или менять кастомный атрибут через elem.customAttr = ...

3. Забыть, что getAttribute и dataset всегда отдают строки: объект из HTML нужно распарсить через JSON.parse(...), а в HTML обернуть атрибут в одинарные кавычки.

## Вопросы для закрепления

**1. Что выведется в консоль и разблокируется ли кнопка `sendBtn` после выполнения этого кода?**

```html
<input id="login" value="Старый">
<button id="sendBtn" disabled>Отправить</button>
```

```js
const inputElement = document.getElementById('login');
const btnElement = document.getElementById('sendBtn');

inputElement.value = 'Новый';
btnElement.setAttribute('disabled', 'false');

console.log(inputElement.getAttribute('value'));
console.log(btnElement.disabled);
```

<details>
<summary>Показать ответ</summary>

Выведется **`'Старый'`** и **`true`** (кнопка **останется заблокированной**).
1. У `<input>` свойство `value` синхронизируется односторонне: запись `inputElement.value = 'Новый'` меняет текст на экране, но HTML-атрибут `value` продолжает хранить исходное значение `'Старый'` для сброса формы.
2. Атрибут `disabled` блокирует кнопку самим своим наличием (даже если там строка `'false'`). Чтобы разблокировать её, меняют булево свойство `btnElement.disabled = false;` (или вызывают `removeAttribute('disabled')`).

</details>

**2. В чём отличие `link.href` от `link.getAttribute('href')` для `<a href="/catalog">`, и почему в JS используют `className` и `htmlFor`?**

<details>
<summary>Показать ответ</summary>

1. `link.getAttribute('href')` вернёт буквальную строку из HTML (`'/catalog'`), а DOM-свойство `link.href` всегда возвращает **полный абсолютный URL** вместе с доменом (`'https://site.ru/catalog'`).
2. Имена `class` и `for` — зарезервированные ключевые слова самого JS (для классов и циклов), поэтому в DOM-свойствах их заменили на `className` и `htmlFor`.

</details>

**3. Под каким именем атрибут `data-user-role="admin"` попадёт в `elem.dataset`, и какого типа значение вернёт `elem.dataset.userCount` для `data-user-count="5"`?**

<details>
<summary>Показать ответ</summary>

В `dataset` префикс `data-` отбрасывается, а дефисы преобразуются в `camelCase` — читать нужно через **`elem.dataset.userRole`**. Все значения и из `dataset`, и из `getAttribute` всегда приходят **строками** (поэтому `'5'` нужно переводить через `Number(...)`, а JSON-настройки — через `JSON.parse(...)`).

</details>

## Задачи

**Задача 1. Почини чтение `value`, снятие `disabled` и удаление атрибута**

В коде ниже допущены три типичные ошибки работы с атрибутами. Исправь их:

1. Прочитай актуальное значение поля `nameInputElement` через DOM-свойство `.value`, а не через `getAttribute('value')`.
2. Разблокируй кнопку присвоением `submitButtonElement.disabled = false` вместо `setAttribute('disabled', 'false')`.
3. Полностью удали `data-loading` через `.removeAttribute('data-loading')` вместо записи пустой строки.

Проверка: в консоль должны вывестись `'Иван'`, `false` и `false`.

```html
<input data-js-name value="">
<button data-js-submit disabled data-loading="true">Отправить</button>
```

```js
'use strict';

const nameInputElement = document.querySelector('[data-js-name]');
const submitButtonElement = document.querySelector('[data-js-submit]');

nameInputElement.value = 'Иван';

/* Твоё решение: */
const currentName = nameInputElement.getAttribute('value');

if (currentName && currentName.trim() !== '') {
  submitButtonElement.setAttribute('disabled', 'false');
  submitButtonElement.setAttribute('data-loading', '');
}

console.log(currentName);                                      /* 'Иван' */
console.log(submitButtonElement.disabled);                     /* false */
console.log(submitButtonElement.hasAttribute('data-loading')); /* false */
```

<details>
<summary>Подсказка и решение</summary>

```js
'use strict';

const nameInputElement = document.querySelector('[data-js-name]');
const submitButtonElement = document.querySelector('[data-js-submit]');

nameInputElement.value = 'Иван';

/* Актуальное введённое значение поля читают только через свойство .value */
const currentName = nameInputElement.value;

if (currentName.trim() !== '') {
  /* Логический атрибут отключают присвоением false (он уберётся из HTML) */
  submitButtonElement.disabled = false;
  /* Полностью удаляем кастомный атрибут через removeAttribute */
  submitButtonElement.removeAttribute('data-loading');
}

console.log(currentName);                                      /* 'Иван' */
console.log(submitButtonElement.disabled);                     /* false */
console.log(submitButtonElement.hasAttribute('data-loading')); /* false */
```

</details>

**Задача 2. Поиск внешних ссылок через `getAttribute('href')`**

Напиши функцию `getExternalLinks(rootElement)`, возвращающую массив только внешних адресов:

1. Если `!rootElement`, верни пустой массив `[]`.
2. Найди все ссылки `<a>` внутри `rootElement` и прочитай сырой атрибут через `getAttribute('href')` (чтобы относительные ссылки вроде `'/about'` не превратились в полный URL).
3. Собери только адреса, которые содержат `'://'` и не начинаются с `'https://mysite.ru'`.

Проверка: для разметки ниже вернётся `['https://google.com']`.

```html
<nav data-js-menu>
  <a href="/about">О нас</a>
  <a href="https://mysite.ru/contacts">Контакты</a>
  <a href="https://google.com">Поиск</a>
</nav>
```

```js
'use strict';

/* Твоё решение: */
function getExternalLinks(rootElement) {
  /* ... */
}

const menuElement = document.querySelector('[data-js-menu]');
console.log(getExternalLinks(menuElement)); /* ['https://google.com'] */
```

<details>
<summary>Подсказка и решение</summary>

```js
'use strict';

function getExternalLinks(rootElement) {
  if (!rootElement) return [];

  const linkElements = rootElement.querySelectorAll('a');
  const externalUrls = [];

  linkElements.forEach((linkElement) => {
    /*
      Берём сырой атрибут через getAttribute('href'), потому что свойство
      linkElement.href доклеило бы текущий домен к относительному '/about'
    */
    const href = linkElement.getAttribute('href');
    if (!href) return;

    if (href.includes('://') && !href.startsWith('https://mysite.ru')) {
      externalUrls.push(href);
    }
  });

  return externalUrls;
}

const menuElement = document.querySelector('[data-js-menu]');
console.log(getExternalLinks(menuElement)); /* ['https://google.com'] */
```

</details>

**Задача 3. JSON-конфиг из `data-js-config` и запись в `dataset`**

Напиши функцию `initWidgetConfig(widgetElement)` для чтения настроек компонента из HTML:

1. Если `!widgetElement`, верни `null`.
2. Прочитай JSON-строку из `widgetElement.dataset.jsConfig` и распарси её в `try...catch` (если атрибут пуст или JSON битый — верни `{ speed: 300, autoplay: false }`).
3. Запиши `data-initialized="true"` через `widgetElement.dataset.initialized = 'true'` и верни объект конфигурации.

```html
<div data-js-config='{ "speed": 500, "autoplay": true }'></div>
```

```js
'use strict';

/* Твоё решение: */
function initWidgetConfig(widgetElement) {
  /* ... */
}

const widgetElement = document.querySelector('[data-js-config]');
console.log(initWidgetConfig(widgetElement));
```

<details>
<summary>Подсказка и решение</summary>

```js
'use strict';

function initWidgetConfig(widgetElement) {
  if (!widgetElement) return null;

  const fallbackConfig = { speed: 300, autoplay: false };
  /* Атрибут data-js-config в dataset доступен в camelCase как jsConfig */
  const rawConfig = widgetElement.dataset.jsConfig;
  let config = fallbackConfig;

  if (rawConfig) {
    try {
      /* dataset всегда хранит строку — разбираем её через JSON.parse */
      config = JSON.parse(rawConfig);
    } catch (err) {
      console.log('Битый JSON в data-js-config:', err.message);
    }
  }

  /* Запись в dataset.initialized создаст атрибут data-initialized="true" */
  widgetElement.dataset.initialized = 'true';
  return config;
}

const widgetElement = document.querySelector('[data-js-config]');
console.log(initWidgetConfig(widgetElement));
```

</details>
