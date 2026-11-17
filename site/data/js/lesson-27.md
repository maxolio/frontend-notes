# Урок 27. Свойства и атрибуты DOM-элементов, value, data-*

Суть урока: Стандартные HTML-атрибуты читают и меняют через свойства DOM-объекта (например, input.value), нестандартные — через методы *Attribute(), а data-* атрибуты доступны через dataset и умеют передавать готовый JSON-конфиг из HTML.

## 1. Стандартные HTML-атрибуты как свойства DOM-объекта (00:19–03:18)

[+] У каждого DOM-элемента есть только те стандартные свойства, которые валидны для его тега (action есть у `<form>`, checked — у `<input>`). Они работают как геттеры/сеттеры и сразу обновляют HTML в DevTools -> Elements.

```js
const formElement = document.querySelector('form');
const inputElement = document.querySelector('input');

console.log(formElement.action);   /* геттер: вернёт полный URL (домен + "/login") */
formElement.action = '/new-login'; /* сеттер: сразу обновит атрибут action в DOM */
console.log(inputElement.checked); /* true/false для чекбокса (у form этого нет) */

/* Атрибуты через дефис в JS пишутся в camelCase: */
formElement.ariaLabel = 'Форма входа'; /* в HTML будет aria-label="Форма входа" */

/* Типы и особые имена DOM-свойств (в отличие от строковых HTML-атрибутов): */
inputElement.checked;  /* boolean (true/false), а getAttribute("checked") -> "" */
formElement.style;     /* объект CSSStyleDeclaration, а не строка стилей */
linkElement.href;      /* полный URL, а getAttribute("href") -> "#top" как в HTML */
formElement.className; /* вместо "class" (class и for — зарезервированы в JS!) */
labelElement.htmlFor;  /* вместо "for" */
```

## 2. Нестандартные атрибуты: get/set/remove/hasAttribute (03:19–06:40, 09:45)

[!] Кастомные атрибуты (например, qty или data-value) НЕ превращаются в свойства объекта (elem.qty === undefined). Для работы с ними нужны 4 метода (значения атрибутов в HTML всегда хранятся как строки!).

```js
console.log(formElement.getAttribute('qty'));       /* читает значение как строку */
formElement.setAttribute('data-value', '10');       /* ставит (число 10 тоже -> '10') */
formElement.hasAttribute('data-value');             /* true / false — есть ли атрибут */
formElement.removeAttribute('qty');                 /* полностью удаляет атрибут */

/* ОШИБКА: setAttribute("qty", "") НЕ удаляет атрибут, а оставляет пустую строку! */
/* Коллекция formElement.attributes показывает все атрибуты, но только для чтения */
/* Регистр: getAttribute("QTY") найдёт qty (HTML не различает регистр атрибутов),
   а DOM-свойства в JS строго чувствительны к регистру (elem.id работает, ID — нет) */
```

## 3. Синхронизация и односторонняя ловушка с value (06:41–09:45)

[!] Большинство стандартных атрибутов синхронизируются в обе стороны. Но атрибут value у `<input>` — исключение: при изменении свойства input.value сам HTML-атрибут в разметке НЕ меняется!

```js
/* <input id="login"> (атрибут value в HTML изначально не задан) */
inputElement.value = 'Admin';                  /* меняет текст в поле на экране */
console.log(inputElement.value);               /* 'Admin' — всегда актуально */
console.log(inputElement.getAttribute('value')); /* null! В HTML атрибут не появился */

inputElement.setAttribute('value', 'Guest');   /* меняет и атрибут, и свойство, */
/* НО если пользователь уже вводил текст, setAttribute не обновит поле на экране! */

/* Правило: для value и всех стандартных атрибутов используй свойства (elem.value) */
```

[+] Зачем так устроено: HTML-атрибут value (как и checked у чекбокса) специально хранит исходное значение по умолчанию — именно к нему форма откатывается при нажатии кнопки сброса (`<button type="reset">`), а input.value — текущее значение.

```js
/* Ловушка boolean-атрибутов (disabled, hidden, required): */
btn.setAttribute('disabled', 'false'); /* ОШИБКА: кнопка ВСЁ РАВНО заблокирована! */
btn.disabled = false;                  /* ПРАВИЛЬНО: разблокирует и уберёт атрибут */
```

## 4. Атрибуты data-*, свойство dataset и передача JSON (10:03–13:20)

[+] Все атрибуты вида data-* автоматически собираются в объект elem.dataset (префикс data- отрезается, а дефисы переходят в camelCase). Также в data-* можно передать готовый объект настроек в формате JSON.

```js
<!-- В HTML: внешние кавычки ОДИНАРНЫЕ, внутри валидный JSON с двойными кавычками -->
<div data-js-slider='{ "autoplay": true, "speed": 500 }'></div>

const sliderElement = document.querySelector('[data-js-slider]');

/* Способ 1: через dataset (без "data-", в camelCase) — подходит для чтения и записи */
console.log(sliderElement.dataset.jsSlider);
delete sliderElement.dataset.jsSlider; /* удаление data-* атрибута через dataset */

/* Способ 2: getAttribute + безопасный JSON.parse (защита от пустого атрибута) */
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
