# Урок 35. События клавиатуры, ввода и буфера обмена

Суть урока:

- **Клавиатура:** `keydown`/`keyup` служат для горячих клавиш (по `event.code`, не зависящему от раскладки).
- **Ввод и буфер:** живой ввод ловят через `input`, финальное значение после потери фокуса — через `change`, буфер обмена — через `cut`/`copy`/`paste`.

## 1. Клавиатура: keydown, keyup, key vs code и модификаторы (00:28–07:53)

[+] keydown срабатывает при нажатии (и повторяется при удержании клавиши), keyup — при отпускании. Для горячих клавиш ориентируйтесь на event.code, а не на event.key!

```js
document.addEventListener('keydown', (event) => {
  /* true при автоповторе, если клавишу держат зажатой: */
  if (event.repeat) return;
  /* Символ с учётом раскладки: "q" (ENG) или "й" (RUS): */
  console.log(event.key);
  /* Физическая клавиша: всегда "KeyQ" в любой раскладке: */
  console.log(event.code);

  /* Модификаторы (true/false): altKey, ctrlKey, shiftKey, metaKey */
  if ((event.ctrlKey || event.metaKey) && event.code === 'KeyS') {
    console.log('Нажали Ctrl+S / Cmd+S на Mac в любой раскладке!');
  }
});
/* event.keyCode (например, 81 или 32 для Space) — устаревшее свойство */
```

## 2. Отмена действий браузера на keydown (07:54–15:52)

[+] В keydown вызов event.preventDefault() отменяет действие браузера (скролл по PageDown, переход по Tab или появление запрещённого символа в поле ввода). Но системные комбинации ОС (закрытие окна) отменить нельзя.

```js
const anyDigitRegExp = /\d/; /* регулярное выражение: любая цифра */

document.addEventListener('keydown', (event) => {
  if (!event.target.matches('input')) return; /* делегирование */

  if (anyDigitRegExp.test(event.key)) {
    /* Запретим вводить цифры (в keyup отменять уже ПОЗДНО!): */
    event.preventDefault();
    console.log('Цифра заблокирована:', event.key);
  }
  /* Минус keydown: вставку мышкой не ловит — чистите в input! */
});
```

## 3. События ввода: почему не keydown/keyup, а input и change (15:53–22:12)

[!] В keydown новое значение input.value ещё не успело обновиться (отстаёт на 1 шаг), а keyup не ловит вставку/вырезание мышкой из меню. Для полей ввода используют input и change.

```js
const input = document.querySelector('input');
const output = document.querySelector('.name-output');

/* input срабатывает МГНОВЕННО (клавиатура, мышь, вставка): */
input.addEventListener('input', () => {
  /* Надёжная чистка от цифр (работает и после вставки мышкой): */
  input.value = input.value.replace(/\d/g, '');
  /* preventDefault() здесь уже не отменит ввод: */
  output.textContent = input.value;
});

/* Живой поиск с паузой (debounce): не бьёт сервер на каждую букву */
let searchTimerId;
input.addEventListener('input', () => {
  clearTimeout(searchTimerId);
  searchTimerId = setTimeout(() => {
    console.log('Запрос:', input.value);
  }, 300);
});

/* change: у текстового поля — при blur; у <select>/checkbox — сразу */
input.addEventListener('change', () => {
  const isInvalid = input.value.length < 5;
  input.classList.toggle('is-invalid', isInvalid);
  /* Идеально для валидации, чтобы не дёргать на каждую букву */
});
```

## 4. События буфера обмена: cut, copy и paste (22:13–23:55)

[+] Срабатывают и по Ctrl+X/C/V, и через правый клик мыши. Старый способ event.clipboardData.getData("text/plain") работает только в paste (в cut/copy даёт ""). Современный navigator.clipboard.readText() работает везде.

```js
document.addEventListener('paste', (event) => {
  /* Синхронное чтение работает только в paste: */
  console.log(event.clipboardData.getData('text/plain'));
  /* event.preventDefault(); — запрет вставки/копирования/вырезания */
});

/* Асинхронный Clipboard API (cut/copy/paste, нужен HTTPS и доступ): */
document.addEventListener('copy', () => {
  navigator.clipboard.readText().then((text) => console.log(text));
});
```

## 5. Шпаргалка выбора события клавиатуры и ввода

- Горячие клавиши (Esc, Ctrl+S) -> keydown + event.code.
- Счётчик символов, очистка лишнего или поиск с таймером (debounce) -> input.
- Валидация по завершении ввода, а также `<select>`, checkbox, radio -> change.
- Перехват или запрет копирования / вставки -> cut, copy, paste.

## 3 главные ловушки урока (чек-лист для повторения)

1. Проверять хоткеи через event.key === "s" вместо event.code === "KeyS" — на русской раскладке горячая клавиша перестанет работать.

2. Читать input.value в keydown (получите старое значение) или в keyup (пропустит вставку текста мышкой) вместо события input.

3. Вешать тяжёлую проверку/валидацию на input вместо change (будет бить ошибкой с первой буквы) или читать event.clipboardData в copy (вернёт пустую строку).

## Вопросы для закрепления

**1. Почему хоткей `Ctrl + S` ниже сломается на русской раскладке, и зачем в `keydown` ставят `if (event.repeat) return;`?**

```js
document.addEventListener('keydown', (event) => {
  if (event.ctrlKey && event.key === 's') {
    console.log('Сохранено!');
  }
});
```

<details>
<summary>Показать ответ</summary>

1. `event.key` зависит от **текущей раскладки** и регистра: на русской раскладке вернёт `'ы'`, при `CapsLock` — `'S'`. Физический код клавиши `event.code === 'KeyS'` срабатывает на любой раскладке (а для поддержки Mac добавляют `event.ctrlKey || event.metaKey`).
2. Если клавишу удерживать нажатой, `keydown` срабатывает многократно подряд (`event.repeat === true`), поэтому ранняя проверка `if (event.repeat) return;` отсекает случайные повторы.

</details>

**2. Почему для живой очистки текста в поле нельзя полагаться на `keydown` или `keyup`, и чем `input` отличается от `change`?**

<details>
<summary>Показать ответ</summary>

1. В `keydown` новая буква ещё не записалась в `input.value` (значение отстаёт на шаг), а `keyup` вообще пропустит вставку или вырезание мышкой. Любые живые изменения поля отслеживают через событие **`input`**.
2. Событие `input` срабатывает **мгновенно** на каждый символ/вставку, а **`change`** у текстового `<input>` — только после завершения ввода при потере фокуса (зато у `<select>`, `checkbox` и `radio` — сразу при выборе).

</details>

**3. Почему `event.preventDefault()` блокирует символ в `keydown`, но не работает в `input`, и почему `event.clipboardData.getData('text/plain')` в `copy` отдаёт `""`?**

<details>
<summary>Показать ответ</summary>

1. `keydown` запускается **до** появления символа на экране, поэтому `preventDefault()` успевает его отменить. К моменту `input` значение уже обновилось — там лишние символы чистят перезаписью `input.value`.
2. Синхронное чтение `event.clipboardData.getData('text/plain')` работает **только при вставке в `paste`** (в событиях `copy` и `cut` буфер этим способом не читается — используют асинхронный `navigator.clipboard.readText()`).

</details>

## Задачи

**Задача 1. Поисковая строка с `debounce` (`input`) и валидацией по выходу (`change`)**

Поисковое поле должно считать символы в реальном времени, но не слать запрос на каждую букву и не ругаться на короткий ввод раньше времени. Напиши функцию `initSearchField(inputElement)`:

1. На событие `'input'`: обнови счётчик символов в `[data-js-counter]` (если элемент найден) и настрой отложенный поиск с паузой **400 мс** (`clearTimeout` + `setTimeout`), чтобы при быстром вводе в консоль выводилось `'Поиск: <текст>'` только после остановки печати.
2. На событие `'change'`: проверь, что введённая строка после `.trim()` короче `3` символов, и переключи на `inputElement` класс `'is-invalid'` через `classList.toggle`.

```js
'use strict';

/* Твоё решение: */
function initSearchField(inputElement) {
  /* ... */
}

const searchInputElement = document.querySelector('[data-js-search]');
initSearchField(searchInputElement);
```

<details>
<summary>Подсказка и решение</summary>

```js
'use strict';

function initSearchField(inputElement) {
  if (!inputElement) return;

  const counterElement = document.querySelector('[data-js-counter]');
  let searchTimerId;

  inputElement.addEventListener('input', () => {
    const query = inputElement.value.trimStart();

    if (counterElement) {
      counterElement.textContent = String(query.length);
    }

    /*
      Debounce: сбрасываем прошлый таймер на каждой букве и ставим новый
      на 400 мс — поиск запустится 1 раз после паузы в печати
    */
    clearTimeout(searchTimerId);
    searchTimerId = setTimeout(() => {
      console.log(`Поиск: ${query.trim()}`);
    }, 400);
  });

  /* change сработает при потере фокуса — не пугаем ошибкой сразу */
  inputElement.addEventListener('change', () => {
    const isInvalid = inputElement.value.trim().length < 3;
    inputElement.classList.toggle('is-invalid', isInvalid);
  });
}

const searchInputElement = document.querySelector('[data-js-search]');
initSearchField(searchInputElement);
```

</details>

**Задача 2. Поле для 6-значного SMS-кода (`paste` и очистка в `input`)**

В поле подтверждения SMS должны попадать только первые 6 цифр при любом способе ввода (клавиатура, вставка мышкой, автозаполнение). Напиши функцию `initDigitsOnlyCodeField(codeInputElement)`:

1. На `'paste'`: прочитай текст из `event.clipboardData.getData('text/plain')`. Если в тексте нет ни одной цифры (`!/\d/.test(...)`), отмени вставку через `event.preventDefault()` и выведи `'Буфер не содержит цифр'`.
2. На `'input'`: вырежи все нецифровые символы (`/\D/g`) и обрежь строку до `6` символов (`.slice(0, 6)`).

```js
'use strict';

/* Твоё решение: */
function initDigitsOnlyCodeField(codeInputElement) {
  /* ... */
}

const codeInputElement = document.querySelector('[data-js-sms-code]');
initDigitsOnlyCodeField(codeInputElement);
```

<details>
<summary>Подсказка и решение</summary>

```js
'use strict';

function initDigitsOnlyCodeField(codeInputElement) {
  if (!codeInputElement) return;

  codeInputElement.addEventListener('paste', (event) => {
    /* getData('text/plain') работает в paste и даёт текст до вставки */
    const pastedText = event.clipboardData?.getData('text/plain') ?? '';

    if (!/\d/.test(pastedText)) {
      event.preventDefault();
      console.log('Буфер не содержит цифр');
    }
  });

  codeInputElement.addEventListener('input', () => {
    /*
      Чистим в input (не в keydown!), чтобы сработало при вставке мышкой:
      \D удаляет все не-цифры, slice(0, 6) ограничивает код 6 знаками
    */
    const digitsOnly = codeInputElement.value.replace(/\D/g, '');
    codeInputElement.value = digitsOnly.slice(0, 6);
  });
}

const codeInputElement = document.querySelector('[data-js-sms-code]');
initDigitsOnlyCodeField(codeInputElement);
```

</details>

**Задача 3. Отслеживание одновременного нажатия клавиш `runOnKeys(callback, codes)`**

Нужно запускать `callback()`, как только пользователь **одновременно** зажал все физические клавиши из массива `codes` (в любой раскладке, по `event.code`). Напиши функцию `runOnKeys(callback, codes)`:

1. Храни зажатые сейчас клавиши в коллекции `Set`.
2. На `'keydown'` на `document`: добавляй `event.code` в `Set`; если все элементы из `codes` присутствуют в `Set` (`.every`), очисти `Set` (`clear()`, чтобы не сработало повторно при удержании) и вызови `callback()`.
3. На `'keyup'` на `document`: удаляй отпущенную клавишу (`delete(event.code)`), а на `'blur'` у `window` очищай весь `Set` (`clear()`), чтобы зажатые клавиши не «залипали» при переключении окна (`Alt+Tab`).

```js
'use strict';

/* Твоё решение: */
function runOnKeys(callback, codes) {
  /* ... */
}

runOnKeys(
  () => console.log('Сработала комбинация Q + W в любой раскладке!'),
  ['KeyQ', 'KeyW']
);
```

<details>
<summary>Подсказка и решение</summary>

```js
'use strict';

function runOnKeys(callback, codes) {
  /* Set хранит только уникальные коды клавиш, зажатых в данный момент */
  const pressedCodes = new Set();

  document.addEventListener('keydown', (event) => {
    pressedCodes.add(event.code);

    /* Проверяем, все ли нужные физические клавиши сейчас зажаты */
    const areAllPressed = codes.every((code) => pressedCodes.has(code));
    if (!areAllPressed) return;

    /* Очищаем Set до вызова, чтобы удержание не запускало callback вновь */
    pressedCodes.clear();
    callback();
  });

  document.addEventListener('keyup', (event) => {
    pressedCodes.delete(event.code);
  });

  /* Если окно потеряло фокус (Alt+Tab), keyup не придёт — очищаем Set */
  window.addEventListener('blur', () => {
    pressedCodes.clear();
  });
}

runOnKeys(
  () => console.log('Сработала комбинация Q + W в любой раскладке!'),
  ['KeyQ', 'KeyW']
);
```

</details>
