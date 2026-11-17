# Урок 37. Формы в JS: доступ к полям, чтение/запись и атрибут form

Суть урока: Доступ к формам и полям берут через document.forms и form.elements (по name), внешние поля привязывают к форме атрибутом form="id", а значения читают через .value (input, textarea, select, radio), .checked (checkbox) и .selectedOptions.

## 1. Навигация: document.forms, form.elements и доступ по name (00:49–03:57)

[+] document.forms — живая HTMLCollection всех форм на странице. У самой формы свойство elements хранит живую коллекцию всех её полей (input, textarea, select, fieldset, button), куда можно обращаться по атрибуту name.

```js
const formElement = document.forms.regForm; /* форма по её id / name (или [0]) */

/* Два одинаковых способа получить поле по атрибуту name="login": */
const loginInput1 = formElement.elements.login;
const loginInput2 = formElement.login; /* короткая запись без .elements */

/* Для радиокнопок с одним name="gender" вернёт коллекцию RadioNodeList: */
const genderRadios = formElement.gender;

/* Совет: form.elements.login надёжнее короткого form.login (после смены .name */
/* старое имя исчезает из elements, но остаётся в form). Не называйте поля */
/* name="submit" или "reset" — иначе перетрёте методы formElement.submit() / reset()! */
/* <fieldset> тоже имеет своё .elements, а fieldset.disabled = true отключит всё внутри */
formElement.reset();  /* сбросит все поля к исходным значениям из HTML */
formElement.submit(); /* отправит форму сразу, НЕ вызывая JS-событие submit! */
/* readonly — запрет правки, но фокус работает и поле уходит при отправке; */
/* disabled — нет ни фокуса, ни клика, и поле вообще НЕ попадает в отправку! */
```

## 2. Поле за пределами формы: свойство и атрибут form (03:58–06:32)

[+] У каждого поля есть свойство field.form со ссылкой на его форму (или null). Если по дизайну элемент лежит в HTML за пределами тега `<form>`, просто укажите ему атрибут form="idФормы" — он сразу попадёт в form.elements и уйдёт при отправке!

```html
<!-- В HTML <select> стоит отдельно, но привязан к форме id="regForm": -->
<form id="regForm">...</form>
<select name="city" form="regForm">...</select>

const citySelect = document.querySelector('[name="city"]');
console.log(citySelect.form); /* теперь ссылается на <form id="regForm">! */
```

## 3. Поля ввода: `<input>` и `<textarea>` (06:33–08:16)

[!] Несмотря на то, что в HTML у `<textarea>` текст лежит между тегами, в JS у обоих полей читают и меняют ТОЛЬКО свойство .value (не textContent и не innerHTML!).

```js
const aboutTextarea = formElement.about;
aboutTextarea.value = 'Новое описание';
console.log(aboutTextarea.value);       /* "Новое описание" — верно */
console.log(aboutTextarea.textContent); /* ОШИБКА: старый текст из HTML-разметки! */

/* Запись из JS не запускает события input/change — они только от действий юзера! */
/* HTML-атрибут value (input.defaultValue / defaultChecked) хранит стартовое значение: */
console.log(loginInput1.getAttribute('value')); /* старт из HTML (к нему вернёт reset) */
```

## 4. Радиокнопки (type="radio") и чекбоксы (type="checkbox") (08:17–14:24)

[!] В HTML всегда задавайте радиокнопкам value="..." (иначе вернётся слово "on"). А состояние чекбокса проверяют ТОЛЬКО через .checked (его value всегда "on", даже если галочка не стоит!).

```js
/* Радиокнопки (через RadioNodeList по общему name="gender"): */
console.log(formElement.gender.value); /* значение выбранной кнопки (или "") */
formElement.gender.value = 'мужской';  /* программно переключит нужную радиокнопку */
/* Если указать несуществующее value — ничего не изменится; либо radios[0].checked = true */

/* Чекбокс (например, согласие с правилами name="agreement"): */
const agreementCheckbox = formElement.agreement;
console.log(agreementCheckbox.value);   /* ОПАСНО: "on", даже когда НЕ отмечен! */
console.log(agreementCheckbox.checked); /* ПРАВИЛЬНО: true или false */
agreementCheckbox.checked = true;       /* поставить галку (НЕ вызовет событие change!) */
```

## 5. Выпадающий список `<select>` и `<select multiple>` (14:25–19:22)

[+] У обычного `<select>` браузер по умолчанию выбирает первый `<option>`. Менять и читать выбор удобнее через select.value. А при атрибуте multiple обычный .value покажет только 1-й пункт — нужно брать коллекцию select.selectedOptions.

```js
const citySelect = formElement.city;
console.log(citySelect.value); /* текущее значение; в начале — первый <option> */
citySelect.value = 'Питер';    /* меняет выбор (несуществующий сбросит в '') */

/* Альтернатива через options и индекс: */
console.log(citySelect.options[citySelect.selectedIndex].value);

/* Множественный выбор (<select multiple>): читаем все через selectedOptions: */
const selectedCities = [...citySelect.selectedOptions].map((opt) => opt.value).join(", ");

/* Быстро создать новый пункт <option> без createElement: new Option(text, value, ...) */
citySelect.append(new Option('Казань', 'kazan', true, true)); /* defaultSelected, selected */
```

## 3 главные ловушки урока (чек-лист для повторения)

1. Проверять галочку чекбокса через checkbox.value (вернёт "on" даже если снята!) вместо checkbox.checked, или не задать value радиокнопкам в HTML.

2. Читать значение `<textarea>` через .textContent / .innerHTML вместо .value — получите исходный текст разметки вместо введённого.

3. В `<select multiple>` пытаться прочитать все пункты через select.value (покажет только первый) вместо [...select.selectedOptions], либо записать туда несуществующий вариант (сбросит выбор в пустоту).
