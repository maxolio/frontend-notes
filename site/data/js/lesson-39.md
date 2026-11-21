# Урок 39. Валидация форм: свойство validity и компонент FormsValidation

Суть урока:

- **HTML-правила:** ограничения задают атрибутами (`required`, `minlength`, `maxlength`, `pattern`, `title`), а нативные тултипы отключают через `novalidate`.
- **Проверка в JS:** состояние поля читают через `field.validity` (`ValidityState`) на событиях `blur` (`capture: true`), `change` и `submit`.

## 1. Нативная валидация HTML и разметка под кастомные ошибки (00:36–06:35)

[+] Браузер умеет проверять поля по HTML-атрибутам и CSS-псевдоклассам :user-valid / :user-invalid, но стандартные тултипы нельзя стилизовать. Поэтому на `<form>` ставят novalidate, а правила из HTML читают в JS и связывают поля с `<span>` ошибок для a11y.

```html
<!-- novalidate отключает браузерные тултипы; data-js-form — метка для JS: -->
<form id="regForm" novalidate data-js-form>
  <p class="field">
    <input id="login" name="login" required minlength="3" maxlength="12"
           aria-errormessage="login-errors" /> <!-- связь для скринридера -->
    <!-- Для пароля задают pattern="..." (регулярка) и title="Пояснение формата" -->
    <span class="field__errors" id="login-errors" data-js-form-field-errors></span>
  </p>
</form>
```

## 2. Класс FormsValidation: поля класса и перехват blur (06:41–12:03, 14:15–22:25)

[!] Событие blur (уход фокуса с поля), как и событие invalid при нативной проверке, НЕ всплывает вверх по DOM-дереву, поэтому на document его перехватывают на фазе погружения через третий аргумент { capture: true }.

```js
class FormsValidation {
  selectors = {
    form: '[data-js-form]',
    fieldErrors: '[data-js-form-field-errors]',
  };

  /* Ключи совпадают со свойствами ValidityState; функции получают DOM-элемент поля: */
  errorMessages = {
    valueMissing: () => 'Пожалуйста, заполните это поле',
    patternMismatch: ({ title }) => title || 'Данные не соответствуют формату',
    /* В HTML атрибут minlength/maxlength, а в JS-свойстве — camelCase minLength/maxLength! */
    tooShort: ({ minLength }) => `Слишком короткое значение, минимум символов — ${minLength}`,
    tooLong: ({ maxLength }) => `Слишком длинное значение, максимум символов — ${maxLength}`,
  };

  constructor() {
    this.bindEvents();
  }

  bindEvents() {
    document.addEventListener('blur', (event) => this.onBlur(event), { capture: true });
    document.addEventListener('change', (event) => this.onChange(event));
    document.addEventListener('submit', (event) => this.onSubmit(event));
  }

  onBlur({ target }) {
    const isFormField = target.closest(this.selectors.form);
    const isRequired = target.required;
    if (isFormField && isRequired) this.validateField(target);
  }
```

## 3. Свойство field.validity (ValidityState) и вывод ошибок (12:04–28:35)

[+] Свойство fieldControlElement.validity хранит объект ValidityState, где каждому типу ошибки соответствует true/false. На основании флагов собираем массив сообщений, выводим их в `<span>` через innerHTML и обновляем ariaInvalid для доступности.

```js
  validateField(fieldControlElement) {
    const errors = fieldControlElement.validity; /* объект ValidityState с true/false */
    const errorMessages = [];

    Object.entries(this.errorMessages).forEach(([errorType, getErrorMessage]) => {
      if (errors[errorType]) {
        errorMessages.push(getErrorMessage(fieldControlElement));
      }
    });

    this.manageErrors(fieldControlElement, errorMessages);
    const isValid = errorMessages.length === 0;
    fieldControlElement.ariaInvalid = !isValid; /* подсказка для скринридеров */
    return isValid;
  }

  manageErrors(fieldControlElement, errorMessages) {
    const fieldErrorsElement = fieldControlElement.parentElement
      .querySelector(this.selectors.fieldErrors);
    /* Хрупко при лишних обёртках — надёжнее искать через closest или aria-errormessage! */
    /* Если массив пустой, map + join("") дадут "" и очистят старые ошибки: */
    /* Важно: если в текст попадёт ввод юзера/сервера, вместо innerHTML берите textContent! */
    fieldErrorsElement.innerHTML = errorMessages
      .map((message) => `<span class="field__error">${message}</span>`)
      .join('');
  }

  /* Другие флаги в validity: valid (итог true/false), typeMismatch (email/url), */
  /* rangeUnderflow / rangeOverflow (min/max), stepMismatch (step) и customError. */
  /* Своя ошибка (делает valid=false): input.setCustomValidity('Запрещённый логин'); */
  /* СБРОСИТЬ её обязательно пустой строкой, иначе поле не пройдёт валидацию: */
  /* input.setCustomValidity(''); */
```

## 4. Событие change (radio/checkbox) и проверка при submit (28:36–41:41)

[+] У радиокнопок и чекбоксов клик меняет состояние без ухода фокуса (blur не сработает), поэтому их проверяют по change. При submit обходим все required-поля, запрещаем отправку при ошибках и переводим фокус на первое невалидное поле.

```js
  onChange({ target }) {
    const isRequired = target.required;
    const isToggleType = ['radio', 'checkbox'].includes(target.type);
    if (isToggleType && isRequired) this.validateField(target);
  }

  onSubmit(event) {
    const isFormElement = event.target.matches(this.selectors.form);
    if (!isFormElement) return;

    const requiredControlElements = [...event.target.elements]
      .filter(({ required }) => required);
    let isFormValid = true;
    let firstInvalidFieldControl = null;

    requiredControlElements.forEach((element) => {
      const isFieldValid = this.validateField(element);
      if (!isFieldValid) {
        isFormValid = false;
        if (!firstInvalidFieldControl) firstInvalidFieldControl = element;
      }
    });

    if (!isFormValid) {
      event.preventDefault(); /* останавливаем отправку формы */
      firstInvalidFieldControl.focus(); /* удобный UX: фокус в 1-е поле с ошибкой */
    }
  }
}

new FormsValidation(); /* автозапуск компонента валидации */

/* Нативные методы любой формы/поля (работают даже без своего класса): */
/* form.checkValidity()  -> "тихо" вернёт true/false без показа тултипов */
/* form.reportValidity() -> проверит И покажет системный тултип на 1-й ошибке */
/* Строка из одних пробелов "   " проходит required! Лечится .trim() или pattern=".*\S.*" */
/* Для лучшего UX поля с уже показанной ошибкой допроверяют сразу на событии input. */
```

## 3 главные ловушки урока (чек-лист для повторения)

1. Повесить document.addEventListener("blur", ...) без { capture: true } — событие blur не всплывает, поэтому обработчик вообще не сработает при уходе фокуса.

2. Перепутать HTML-атрибуты minlength/maxlength с DOM-свойствами minLength/maxLength (в JS camelCase!) или забыть обновлять ariaInvalid при включённом novalidate.

3. Забыть событие change для radio и checkbox — после клика фокус остаётся на элементе, поэтому blur не сработает и ошибка не исчезнет до ухода с поля.

## Вопросы для закрепления

**1. Зачем на `document.addEventListener('blur', ...)` передают `{ capture: true }`, и почему для `radio` и `checkbox` нужен отдельный слушатель `change`?**

<details>
<summary>Показать ответ</summary>

1. Событие `blur` **не всплывает** вверх к `document`, поэтому без перехвата на фазе погружения (`{ capture: true }`) делегированный обработчик на `document` вообще не сработает.
2. После клика на чекбокс или радиокнопку фокус остаётся на элементе (событие `blur` не происходит). Без события `change` текст ошибки не исчезнет сразу в момент выбора.

</details>

**2. Почему после `input.setCustomValidity('Занят')` поле продолжает падать даже после исправления текста, и пропустит ли `required` строку `'   '`?**

<details>
<summary>Показать ответ</summary>

1. Ручная ошибка из `setCustomValidity` не сбрасывается сама при вводе — она держит флаг `validity.customError === true` и `valid === false`, пока вы явно не сбросите её пустой строкой: **`input.setCustomValidity('')`**.
2. Да, нативный атрибут `required` проверяет лишь длину: строка из трёх пробелов `'   '` считается заполненной. Поэтому пробелы отсекают в JS через `.trim()` или в HTML с помощью `pattern=".*\S.*"`.

</details>

**3. Чем отличаются `form.checkValidity()` и `form.reportValidity()`, и почему свойство `input.minlength` в JS вернёт `undefined`?**

<details>
<summary>Показать ответ</summary>

1. `form.checkValidity()` тихо возвращает `true`/`false` без показа системных подсказок, а `form.reportValidity()` дополнительно показывает браузерный тултип на первом поле с ошибкой.
2. HTML-атрибуты пишутся строчными (`minlength`, `maxlength`), а соответствующие свойства DOM-объекта в JS — в **`camelCase`**: `input.minLength` и `input.maxLength`.

</details>

## Задачи

**Задача 1. Валидация поля по `ValidityState` и поиск ошибки через `aria-errormessage`**

Напиши функцию `validateField(fieldElement)`:
1) Проверь флаги объекта `fieldElement.validity` по словарю сообщений (`valueMissing`, `typeMismatch`, `tooShort` с `minLength`, `patternMismatch` с `title`).
2) Найди блок вывода ошибки **не через `parentElement`**, а по ID из атрибута `aria-errormessage` (через `document.getElementById`).
3) Выведи собранные ошибки через `.textContent` (объединив через `', '`), обнови `fieldElement.ariaInvalid = !isValid` и верни `isValid` (`boolean`).

```js
'use strict';

/*
  HTML поля:
  <div class="field">
    <div class="field__control-wrap">
      <input type="email" required minlength="5" aria-errormessage="email-err" />
    </div>
    <span id="email-err" class="field__error"></span>
  </div>
*/

/* Твоё решение: */
function validateField(fieldElement) {
  /* ... */
}

const emailInputElement = document.querySelector('input[type="email"]');
console.log(validateField(emailInputElement));
```

<details>
<summary>Подсказка и решение</summary>

```js
'use strict';

const ERROR_MESSAGES = {
  valueMissing: () => 'Пожалуйста, заполните это поле',
  typeMismatch: () => 'Введите корректный формат (например, email)',
  /* В JS-свойстве пишем camelCase minLength, хотя в HTML было minlength */
  tooShort: ({ minLength }) => `Минимум символов — ${minLength}`,
  patternMismatch: ({ title }) => title || 'Данные не соответствуют формату',
};

function validateField(fieldElement) {
  if (!fieldElement) return false;

  const { validity } = fieldElement;
  const messages = [];

  Object.entries(ERROR_MESSAGES).forEach(([errorKey, getMessage]) => {
    if (validity[errorKey]) {
      messages.push(getMessage(fieldElement));
    }
  });

  /* Поиск по ID из aria-errormessage работает при любой глубине HTML-обёрток */
  const errorId = fieldElement.getAttribute('aria-errormessage');
  const errorElement = errorId ? document.getElementById(errorId) : null;
  if (errorElement) {
    errorElement.textContent = messages.join(', ');
  }

  const isValid = messages.length === 0;
  fieldElement.ariaInvalid = !isValid;
  return isValid;
}

const emailInputElement = document.querySelector('input[type="email"]');
console.log(validateField(emailInputElement));
```

</details>

**Задача 2. Защита от одних пробелов и сверка паролей через `setCustomValidity`**

Напиши функцию `initPasswordConfirmValidation(passwordElement, confirmElement)`:
1) На событии `'input'` у `passwordElement`: если в поле введены только пробелы (`value.length > 0 && value.trim() === ''`), поставь ошибку `'Пароль не может состоять из одних пробелов'` через `.setCustomValidity(...)`; иначе обязательно сбрось пустой строкой `''`.
2) На событии `'input'` **обоих** полей пересчитывай совпадение: если `confirmElement.value !== passwordElement.value`, ставь на `confirmElement` ошибку `'Пароли не совпадают'`, иначе сбрасывай `''`. Выводи `confirmElement.validity.valid` в консоль.

```js
'use strict';

/* Твоё решение: */
function initPasswordConfirmValidation(passwordElement, confirmElement) {
  /* ... */
}

const passwordInput = document.querySelector('[data-js-password]');
const confirmInput = document.querySelector('[data-js-password-confirm]');
initPasswordConfirmValidation(passwordInput, confirmInput);
```

<details>
<summary>Подсказка и решение</summary>

```js
'use strict';

function initPasswordConfirmValidation(passwordElement, confirmElement) {
  if (!passwordElement || !confirmElement) return;

  const validateMatch = () => {
    const isMatch = confirmElement.value === passwordElement.value;
    /*
      Обязательно сбрасываем customError пустой строкой '' при совпадении,
      иначе поле навсегда останется невалидным (validity.valid === false)
    */
    confirmElement.setCustomValidity(isMatch ? '' : 'Пароли не совпадают');
    console.log('Подтверждение валидно:', confirmElement.validity.valid);
  };

  passwordElement.addEventListener('input', () => {
    const val = passwordElement.value;
    const isOnlySpaces = val.length > 0 && val.trim() === '';

    passwordElement.setCustomValidity(
      isOnlySpaces ? 'Пароль не может состоять из одних пробелов' : ''
    );
    /* Перепроверяем совпадение даже если пользователь правит первый пароль */
    validateMatch();
  });

  confirmElement.addEventListener('input', validateMatch);
}

const passwordInput = document.querySelector('[data-js-password]');
const confirmInput = document.querySelector('[data-js-password-confirm]');
initPasswordConfirmValidation(passwordInput, confirmInput);
```

</details>

**Задача 3. Проверка формы при `submit`, `noValidate` и автофокус на первую ошибку**

Напиши функцию `initSubmitValidation(formElement)`:
1) Программно отключи стандартные тултипы (`formElement.noValidate = true`).
2) При событии `'submit'`: перебери все поля формы с атрибутом `name`, проверь каждое через `.checkValidity()`, переключи класс `'is-invalid'` (`classList.toggle('is-invalid', !isValid)`) и запомни первое невалидное поле.
3) Если форма невалидна — отмени отправку (`event.preventDefault()`) и поставь фокус (`.focus()`) в первое поле с ошибкой; если всё валидно — выведи `'Форма готова к отправке'`.

```js
'use strict';

/*
  HTML формы:
  <form data-js-signup>
    <input name="login" required minlength="3">
    <input name="email" type="email" required>
    <button type="submit">Создать аккаунт</button>
  </form>
*/

/* Твоё решение: */
function initSubmitValidation(formElement) {
  /* ... */
}

const signupFormElement = document.querySelector('[data-js-signup]');
initSubmitValidation(signupFormElement);
```

<details>
<summary>Подсказка и решение</summary>

```js
'use strict';

function initSubmitValidation(formElement) {
  if (!formElement) return;

  /* Отключаем системные тултипы браузера, сохраняя работу API checkValidity() */
  formElement.noValidate = true;

  formElement.addEventListener('submit', (event) => {
    let firstInvalidElement = null;

    for (const element of formElement.elements) {
      if (!element.name) continue;

      /* checkValidity() тихо проверяет все HTML-ограничения и customError */
      const isFieldValid = element.checkValidity();
      element.classList.toggle('is-invalid', !isFieldValid);

      if (!isFieldValid && !firstInvalidElement) {
        firstInvalidElement = element;
      }
    }

    if (firstInvalidElement) {
      /* Блокируем отправку и переводим курсор в первое проблемное поле */
      event.preventDefault();
      firstInvalidElement.focus();
      return;
    }

    console.log('Форма готова к отправке');
  });
}

const signupFormElement = document.querySelector('[data-js-signup]');
initSubmitValidation(signupFormElement);
```

</details>
