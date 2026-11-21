# Урок 37. Формы в JS: доступ к полям, чтение/запись и атрибут form

Суть урока:

- **Доступ к формам:** формы и поля берут через `document.forms` и `form.elements` (по `name`); внешние поля привязывают атрибутом `form="id"`.
- **Чтение значений:** используют `.value` (`input`, `textarea`, `select`, `radio`), `.checked` (`checkbox`) и `.selectedOptions`.

## 1. Навигация: document.forms, form.elements и доступ по name (00:49–03:57)

[+] document.forms — живая HTMLCollection всех форм на странице. У самой формы свойство elements хранит живую коллекцию всех её полей (input, textarea, select, fieldset, button), куда можно обращаться по атрибуту name.

```js
/* Форма по её id / name (или document.forms[0]): */
const formElement = document.forms.regForm;

/* Два одинаковых способа получить поле по атрибуту name="login": */
const loginInput1 = formElement.elements.login;
const loginInput2 = formElement.login; /* короткая запись без .elements */

/* Для радиокнопок с одним name="gender" вернёт RadioNodeList: */
const genderRadios = formElement.gender;

/*
  Совет: form.elements.login надёжнее form.login (после смены .name
  старое имя исчезает из elements, но остаётся в form).
  Не называйте поля name="submit" или "reset" — перетрёте методы!
*/
/* <fieldset> имеет свой .elements; fieldset.disabled = true отключит всё */
formElement.reset();  /* сбросит поля к исходным значениям из HTML */
/* Отправит форму сразу, НЕ вызывая JS-событие submit: */
formElement.submit();
/* readonly — запрет правки, фокус есть, поле уходит при отправке; */
/* disabled — нет фокуса/клика, и поле НЕ попадает в отправку */
```

## 2. Поле за пределами формы: свойство и атрибут form (03:58–06:32)

[+] У каждого поля есть свойство field.form со ссылкой на его форму (или null). Если по дизайну элемент лежит в HTML за пределами тега `<form>`, просто укажите ему атрибут form="idФормы" — он сразу попадёт в form.elements и уйдёт при отправке!

```html
<!-- В HTML <select> стоит отдельно, но привязан к id="regForm": -->
<form id="regForm">...</form>
<select name="city" form="regForm">...</select>
```

```js
const citySelect = document.querySelector('[name="city"]');
console.log(citySelect.form); /* теперь ссылается на <form id="regForm"> */
```

## 3. Поля ввода: `<input>` и `<textarea>` (06:33–08:16)

[!] Несмотря на то, что в HTML у `<textarea>` текст лежит между тегами, в JS у обоих полей читают и меняют ТОЛЬКО свойство .value (не textContent и не innerHTML!).

```js
const aboutTextarea = formElement.about;
aboutTextarea.value = 'Новое описание';
console.log(aboutTextarea.value); /* "Новое описание" — верно */
/* ОШИБКА: textContent хранит старый текст из HTML-разметки! */
console.log(aboutTextarea.textContent);

/* Запись из JS не запускает input/change — они только от юзера! */
/* Атрибут value (defaultValue / defaultChecked) хранит старт из HTML: */
console.log(loginInput1.getAttribute('value'));
```

## 4. Радиокнопки (type="radio") и чекбоксы (type="checkbox") (08:17–14:24)

[!] В HTML всегда задавайте радиокнопкам value="..." (иначе вернётся слово "on"). А состояние чекбокса проверяют ТОЛЬКО через .checked (его value всегда "on", даже если галочка не стоит!).

```js
/* Радиокнопки (через RadioNodeList по общему name="gender"): */
/* Значение выбранной кнопки (или ""): */
console.log(formElement.gender.value);
/* Программно переключит нужную радиокнопку: */
formElement.gender.value = 'мужской';
/* Несуществующее value ничего не изменит; либо radios[0].checked = true */

/* Чекбокс (например, согласие с правилами name="agreement"): */
const agreementCheckbox = formElement.agreement;
/* ОПАСНО: вернёт "on", даже когда НЕ отмечен! */
console.log(agreementCheckbox.value);
/* ПРАВИЛЬНО: true или false */
console.log(agreementCheckbox.checked);
/* Поставить галку из JS (НЕ вызовет событие change!): */
agreementCheckbox.checked = true;
```

## 5. Выпадающий список `<select>` и `<select multiple>` (14:25–19:22)

[+] У обычного `<select>` браузер по умолчанию выбирает первый `<option>`. Менять и читать выбор удобнее через select.value. А при атрибуте multiple обычный .value покажет только 1-й пункт — нужно брать коллекцию select.selectedOptions.

```js
const citySelect = formElement.city;
/* Текущее значение; в начале — первый <option>: */
console.log(citySelect.value);
/* Меняет выбор (несуществующий сбросит в ''): */
citySelect.value = 'Питер';

/* Альтернатива через options и индекс: */
console.log(citySelect.options[citySelect.selectedIndex].value);

/* Множественный выбор (<select multiple>): читаем selectedOptions: */
const selectedCities = [...citySelect.selectedOptions]
  .map((opt) => opt.value)
  .join(', ');

/* Создать <option> без createElement: new Option(text, val, def, sel) */
citySelect.append(new Option('Казань', 'kazan', true, true));
```

## 3 главные ловушки урока (чек-лист для повторения)

1. Проверять галочку чекбокса через checkbox.value (вернёт "on" даже если снята!) вместо checkbox.checked, или не задать value радиокнопкам в HTML.

2. Читать значение `<textarea>` через .textContent / .innerHTML вместо .value — получите исходный текст разметки вместо введённого.

3. В `<select multiple>` пытаться прочитать все пункты через select.value (покажет только первый) вместо [...select.selectedOptions], либо записать туда несуществующий вариант (сбросит выбор в пустоту).

## Вопросы для закрепления

**1. Что выведется в консоль в первых двух строках и почему сломается вызов `formElement.submit()`?**

```html
<form name="orderForm">
  <input type="checkbox" name="agree">
  <textarea name="comment">Начало</textarea>
  <button name="submit">Отправить</button>
</form>
```

```js
const formElement = document.forms.orderForm;
formElement.elements.comment.value = 'Новый текст';

console.log(formElement.elements.agree.value);
console.log(formElement.elements.comment.textContent);
formElement.submit();
```

<details>
<summary>Показать ответ</summary>

Выведется **`'on'`** и **`'Начало'`**, а строка `formElement.submit()` упадёт с **`TypeError: formElement.submit is not a function`**.
1. У чекбокса `.value` по умолчанию всегда `'on'`, даже когда галочка снята — проверять нужно строго `.checked` (`true`/`false`).
2. У `<textarea>` актуальное содержимое читают и меняют только через `.value`, а `.textContent` хранит старый текст разметки.
3. Кнопка с `name="submit"` перетёрла одноимённый метод отправки формы `formElement.submit()` — не называйте поля и кнопки `submit` или `reset`.

</details>

**2. Почему `select.value` не подходит для `<select multiple>`, и что случится при записи `select.value = 'несуществующий'`?**

<details>
<summary>Показать ответ</summary>

1. У `<select multiple>` свойство `select.value` всегда возвращает лишь **первый** выбранный пункт. Все выбранные элементы берут через `[...select.selectedOptions]`.
2. Если записать в `select.value` значение, которого нет среди `<option>`, выбор сбросится и `select.value` станет пустой строкой `""`. Создать новую опцию (и при желании сразу выбрать её) удобно одной строкой: `new Option('Текст', 'val', true, true)`.

</details>

**3. Чем отличаются атрибуты `readonly` и `disabled`, и почему `form.elements.city` надёжнее короткого обращения `form.city`?**

<details>
<summary>Показать ответ</summary>

1. Поле с `readonly` нельзя редактировать, но в него можно поставить фокус и его значение **отправляется** на сервер с формой. Поле с `disabled` не принимает фокус/клики и **полностью исключается из отправки** (как и вся группа при `fieldset.disabled = true`).
2. При смене `field.name = 'town'` свойство `form.elements` корректно удаляет старое имя `city`, а короткая запись `form.city` продолжает хранить ссылку на переименованное поле (и может конфликтовать со свойствами самой формы).

</details>

## Задачи

**Задача 1. Доступ через `document.forms`, `elements` и внешнее поле с атрибутом `form`**

По дизайну список городов лежит снаружи тега `<form>`, но его значение должно попадать в форму. Выполни два шага:

1. В HTML-разметке привяжи внешний `<select name="city">` к форме `id="orderForm"` через HTML-атрибут, чтобы он попал в `elements`.
2. В функции `readOrderForm()` получи форму через `document.forms.orderForm` и через `formElement.elements` верни объект с полями: `comment` (текст `<textarea>`), `delivery` (значение выбранной радиокнопки), `isAgreed` (`boolean` чекбокса) и `city` (выбранный город).

```html
<!-- 1. В HTML привяжи <select> к форме id="orderForm": -->
<!-- Твоё решение: -->
<form id="orderForm">
  <textarea name="comment"></textarea>
  <input type="radio" name="delivery" value="courier" checked>
  <input type="radio" name="delivery" value="pickup">
  <input type="checkbox" name="agree">
</form>
<select name="city">
  <option value="msk">Москва</option>
  <option value="spb">Питер</option>
</select>
```

```js
/* 2. JS: */
'use strict';

/* Твоё решение: */
function readOrderForm() {
  /* ... */
}

console.log(readOrderForm());
```

<details>
<summary>Подсказка и решение</summary>

```html
<form id="orderForm">
  <textarea name="comment"></textarea>
  <input type="radio" name="delivery" value="courier" checked>
  <input type="radio" name="delivery" value="pickup">
  <input type="checkbox" name="agree">
</form>
<!-- Атрибут form="orderForm" связывает внешний select с формой по id -->
<select name="city" form="orderForm">
  <option value="msk">Москва</option>
  <option value="spb">Питер</option>
</select>
```

```js
'use strict';

function readOrderForm() {
  const formElement = document.forms.orderForm;
  if (!formElement) return null;

  /* Используем formElement.elements вместо прямого formElement.<name> */
  const { comment, delivery, agree, city } = formElement.elements;

  return {
    /* У <textarea> актуальный текст всегда в .value: */
    comment: comment.value,
    /* RadioNodeList сам отдаст value выбранной радиокнопки: */
    delivery: delivery.value,
    /* У чекбокса статус галки только в .checked: */
    isAgreed: agree.checked,
    /* Благодаря form="orderForm" внешний select доступен здесь: */
    city: city.value,
  };
}

console.log(readOrderForm());
```

</details>

**Задача 2. Управление `<select multiple>` и создание пунктов через `new Option`**

Нужно добавлять навыки в список с множественным выбором без дублей и считывать все выбранные варианты. Напиши две функции для `<select multiple name="skills">`:

1. `addSkillOption(selectElement, text, value, isSelected = false)` — проверь через `[...selectElement.options].some(...)`, что опции с таким `value` ещё нет, создай её конструктором `new Option(text, value, isSelected, isSelected)` и вставь в конец списка.
2. `getSelectedSkills(selectElement)` — верни массив значений (`value`) всех выбранных сейчас вариантов с помощью `selectElement.selectedOptions`.

```js
'use strict';

/* Твоё решение: */
function addSkillOption(selectElement, text, value, isSelected = false) {
  /* ... */
}

function getSelectedSkills(selectElement) {
  /* ... */
}

const skillsSelectElement = document.forms[0]?.elements.skills;
addSkillOption(skillsSelectElement, 'TypeScript', 'ts', true);
console.log(getSelectedSkills(skillsSelectElement));
```

<details>
<summary>Подсказка и решение</summary>

```js
'use strict';

function addSkillOption(selectElement, text, value, isSelected = false) {
  if (!selectElement) return;

  /* Защита от дублей: перебираем существующие <option> через options */
  const exists = [...selectElement.options].some(
    (opt) => opt.value === value
  );
  if (exists) return;

  /*
    new Option(text, value, defaultSelected, selected) создаёт <option>;
    3-й и 4-й аргументы помечают пункт выбранным в HTML и в состоянии
  */
  const optionElement = new Option(text, value, isSelected, isSelected);
  selectElement.append(optionElement);
}

function getSelectedSkills(selectElement) {
  if (!selectElement) return [];

  /* В multiple-селекте select.value даст лишь 1-й пункт — берём массив */
  return [...selectElement.selectedOptions].map((opt) => opt.value);
}

const skillsSelectElement = document.forms[0]?.elements.skills;
addSkillOption(skillsSelectElement, 'TypeScript', 'ts', true);
console.log(getSelectedSkills(skillsSelectElement));
```

</details>

**Задача 3. Живой депозитный калькулятор на событиях формы**

Нужно пересчитывать итог по вкладу мгновенно при изменении любого поля формы. Напиши функцию `initDepositCalculator()` для `document.forms.calculator`:

1. Подпишись на делегированное событие `'input'` на всей форме (чтобы реагировать на ввод денег, смену срока в `<select>` и переключение чекбокса `isVip`).
2. Вычисляй ставку: `14%` (`0.14`) если `isVip.checked`, иначе `10%` (`0.1`). Итог считай по формуле `Math.round(initial * (1 + rate) ** (months / 12))` (если сумма `<= 0` или `NaN` — выводи `'0'`).
3. Выводи результат в элемент `[data-js-result]` через `.textContent`, и сразу вызови расчёт 1 раз при инициализации.

```html
<form name="calculator">
  <input name="money" type="number" value="10000">
  <select name="months">
    <option value="12" selected>1 год</option>
    <option value="24">2 года</option>
  </select>
  <input name="isVip" type="checkbox">
</form>
<div data-js-result></div>
```

```js
'use strict';

/* Твоё решение: */
function initDepositCalculator() {
  /* ... */
}

initDepositCalculator();
```

<details>
<summary>Подсказка и решение</summary>

```js
'use strict';

function initDepositCalculator() {
  const formElement = document.forms.calculator;
  const resultElement = document.querySelector('[data-js-result]');
  if (!formElement || !resultElement) return;

  const { money, months, isVip } = formElement.elements;

  const updateCalculation = () => {
    const initial = Number(money.value);
    const periodMonths = Number(months.value);

    if (!Number.isFinite(initial) || initial <= 0) {
      resultElement.textContent = '0';
      return;
    }

    const rate = isVip.checked ? 0.14 : 0.1;
    const total = Math.round(initial * (1 + rate) ** (periodMonths / 12));
    resultElement.textContent = String(total);
  };

  /* input всплывает от <input>, <select> и checkbox до самой формы */
  formElement.addEventListener('input', updateCalculation);

  /* Первый расчёт сразу при открытии по стартовым значениям HTML */
  updateCalculation();
}

initDepositCalculator();
```

</details>
