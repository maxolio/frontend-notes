# Урок 39. Валидация форм: свойство validity и компонент FormsValidation

Суть урока: Нативные правила задают в HTML (required, minlength, maxlength, pattern, title), стандартные тултипы отключают атрибутом novalidate и проверяют поля в JS через field.validity (объект ValidityState) на событиях blur (с capture: true), change и submit.

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
