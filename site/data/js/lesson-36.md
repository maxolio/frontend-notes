# Урок 36. События фокуса: focus/blur, focusin/focusout, tabindex, activeElement

Суть урока: focus и blur ловят вход/выход фокуса на конкретном элементе (не всплывают!), focusin и focusout позволяют делегировать фокус на родителе, tabindex делает доступным любой тег, а document.activeElement показывает кто в фокусе.

## 1. События focus и blur, отличие blur от change (00:25–04:35)

[+] Фокус появляется по клику или клавише Tab (назад — Shift + Tab). В отличие от change, событие blur сработает при уходе из поля ДАЖЕ если текст внутри в итоге не изменился (ввели пару букв и сразу стёрли).

```js
const loginInput = document.querySelector('#login');

/* Убираем красную рамку, когда пользователь вернулся в поле: */
loginInput.addEventListener('focus', () => {
  loginInput.classList.remove('is-invalid');
});

/* Ставим ошибку при уходе с пустого поля (change тут бы промолчал, если не меняли): */
loginInput.addEventListener('blur', () => {
  /* event.preventDefault() в blur НЕ удержит фокус! */
  if (loginInput.value.length === 0) {
    loginInput.classList.add('is-invalid');
  }
});
```

## 2. Программный фокус: методы focus(), blur() и autofocus (04:36–06:11)

[+] Фокусом можно управлять из JS. Если автофокус нужен сразу при открытии страницы, чаще ставят HTML-атрибут autofocus (но учтите: при старте браузер ставит его до подписки в JS, поэтому первое событие focus не поймается).

```js
<!-- В HTML: сразу ставит фокус при загрузке страницы -->
<input id="login" autofocus />

/* Программно через JS: */
loginInput.focus(); /* поставить фокус (браузер сам прокрутит страницу к элементу) */
loginInput.focus({ preventScroll: true }); /* поставить фокус БЕЗ прокрутки экрана */
setTimeout(() => loginInput.blur(), 2000); /* принудительно снять фокус */
```

[!] Почему focus() молча не срабатывает: 1) элемент скрыт (display: none / visibility: hidden — сначала покажи, потом фокусируй); 2) у `<div>` нет tabindex; 3) поле disabled. В CSS для красивой рамки только с клавиатуры берите :focus-visible.

## 3. Делегирование фокуса: focusin и focusout (06:12–07:50)

[!] События focus и blur НЕ всплывают — повесить их на document или форму не получится. Для делегирования используют всплывающие аналоги focusin и focusout.

```js
document.addEventListener('focusin', (event) => {
  if (event.target.matches('input')) {
    console.log('В фокусе инпут:', event.target);
  }
});

document.addEventListener('focusout', (event) => {
  if (event.target.matches('input')) {
    console.log('Ушёл с:', event.target, 'На элемент:', event.relatedTarget);
  }
  /* Кейс с меню: if (!menu.contains(event.relatedTarget)) closeMenu(); */
});
/* focusin / focusout вешаются ТОЛЬКО через addEventListener (не onfocusin) */
```

## 4. Интерактивные элементы и атрибут tabindex (07:51–09:51)

[+] По умолчанию фокус берут только интерактивные элементы (input, button, a). Обычный `<div>` клавиша Tab пропускает, пока не задан атрибут tabindex:

```html
<!-- В 99% используют только два значения: 0 или -1 -->
<div tabindex="0">Можно дойти по Tab (в порядке разметки) и кликом</div>
<div tabindex="-1">Tab пропустит, но можно вызвать div.focus() из JS</div>
<!-- Положительные tabindex="1", "2" ломают естественный порядок — не используйте -->
/* В JavaScript это свойство пишется в camelCase с заглавной I: elem.tabIndex = 0; */
```

## 5. Кто сейчас в фокусе: document.activeElement (09:52–12:18)

[+] Свойство document.activeElement хранит DOM-элемент, который прямо сейчас в фокусе. Если скрытая через transform: scale(0) модалка ворует Tab, в DevTools Console можно включить Live Expression (иконка глаза) и вписать туда document.activeElement.

```js
console.log(document.activeElement); /* текущий элемент в фокусе (или body) */

/* Паттерн модалки: запомнить где был фокус и вернуть его при закрытии */
let lastActiveElement = null;
function openModal(modal, closeBtn) {
  lastActiveElement = document.activeElement; /* сохраняем кнопку открытия */
  modal.classList.add('is-open');
  closeBtn.focus();
}
function closeModal(modal) {
  modal.classList.remove('is-open');
  lastActiveElement?.focus(); /* возвращаем фокус обратно на кнопку */
}
```

## 6. Короткая шпаргалка по событиям фокуса

- Один конкретный элемент -> focus / blur.
- Делегирование на форме/списке -> focusin / focusout.
- Закрыть меню при уходе фокуса -> focusout + !menu.contains(event.relatedTarget).

## 3 главные ловушки урока (чек-лист для повторения)

1. Вешать focus или blur на document / родительскую форму для делегирования — они не всплывают; бери focusin и focusout.

2. Проверять пустое обязательное поле через change вместо blur — если зайти в поле и уйти ничего не введя, change не сработает.

3. Прятать модалку или дропдаун через transform: scale(0) / opacity: 0 — их кнопки остаются в очереди Tab и незаметно крадут фокус (прячьте display: none / visibility: hidden).

## Вопросы для закрепления

**1. Почему форма ниже не поймает уход фокуса с инпута, и удержит ли `event.preventDefault()` курсор внутри пустого поля?**

```js
formElement.addEventListener('blur', (event) => {
  if (event.target.value === '') {
    event.preventDefault();
    event.target.classList.add('is-invalid');
  }
});
```

<details>
<summary>Показать ответ</summary>

Оба приёма не сработают:
1. События `focus` и `blur` **не всплывают**, поэтому слушатель на родителе `formElement` их не увидит. Для делегирования используют всплывающие `focusin` и `focusout` (строго через `addEventListener`).
2. `event.preventDefault()` внутри `blur` или `focusout` **не запрещает уход фокуса** — браузер не даёт запереть курсор в поле таким способом.

</details>

**2. Чем отличаются `tabindex="0"`, `tabindex="-1"` и `tabindex="1"`, и по каким трём причинам вызов `elem.focus()` может не сработать?**

<details>
<summary>Показать ответ</summary>

1. `tabindex="0"` добавляет обычный тег (`<div>`) в естественную очередь `Tab`; `tabindex="-1"` скрывает от `Tab`, но разрешает ставить фокус из JS через `.focus()`; положительные значения (`"1"`, `"2"`) ломают порядок обхода и не используются.
2. Вызов `elem.focus()` молча проигнорируется, если: а) элемент скрыт (`display: none` или `visibility: hidden`); б) это неинтерактивный тег вроде `<div>` без `tabindex`; в) на элементе стоит атрибут `disabled`.

</details>

**3. Почему пустое обязательное поле проверяют на `blur` вместо `change`, и чем опасна модалка, скрытая через `opacity: 0` или `transform: scale(0)`?**

<details>
<summary>Показать ответ</summary>

1. Событие `change` сработает только если текст **изменился**: если пользователь кликнул в пустое поле и ушёл, ничего не вводя (или ввёл и стёр), `change` промолчит, а `blur` поймает уход всегда.
2. Скрытые только визуально (`opacity: 0` / `transform: scale(0)`) кнопки остаются в потоке доступности — при нажатии `Tab` фокус провалится внутрь невидимого окна (это легко заметить через `document.activeElement` в DevTools). Поэтому закрытые модалки прячут через `display: none` или `visibility: hidden`.

</details>

## Задачи

**Задача 1. Делегирование фокуса и закрытие меню при уходе (`focusin` / `focusout`)**

Напиши функцию `initMenuFocusGuard(menuElement)` для выпадающего меню:
1) При `focusin` на `menuElement` добавляй меню класс `'has-focus'`.
2) При `focusout` на `menuElement` проверяй `event.relatedTarget` (куда перешёл фокус): если фокус ушёл **за пределы** всего `menuElement` (`!menuElement.contains(event.relatedTarget)`), убирай классы `'has-focus'` и `'is-open'`.

```js
'use strict';

/*
  HTML на странице:
  <div class="dropdown is-open" data-js-menu>
    <button type="button" data-js-trigger>Меню</button>
    <a href="#profile">Профиль</a>
    <a href="#logout">Выйти</a>
  </div>
*/

/* Твоё решение: */
function initMenuFocusGuard(menuElement) {
  /* ... */
}

const menuElement = document.querySelector('[data-js-menu]');
initMenuFocusGuard(menuElement);
```

<details>
<summary>Подсказка и решение</summary>

```js
'use strict';

function initMenuFocusGuard(menuElement) {
  if (!menuElement) return;

  /* focusin всплывает — сработает, когда фокус попадёт на кнопку или любую ссылку внутри */
  menuElement.addEventListener('focusin', () => {
    menuElement.classList.add('has-focus');
  });

  menuElement.addEventListener('focusout', (event) => {
    /*
      Пока пользователь прыгает клавишей Tab между кнопкой и ссылками меню,
      event.relatedTarget находится внутри menuElement -> закрывать рано.
      При клике в пустое место relatedTarget === null, и contains(null) даст false
    */
    if (menuElement.contains(event.relatedTarget)) return;

    menuElement.classList.remove('has-focus', 'is-open');
  });
}

const menuElement = document.querySelector('[data-js-menu]');
initMenuFocusGuard(menuElement);
```

</details>

**Задача 2. Доступное модальное окно с возвратом `document.activeElement`**

Реализуй пару функций `openModal(modalElement)` и `closeModal(modalElement)`:
1) При `openModal`: сохрани текущий активный элемент `document.activeElement` в `lastActiveElement`, убери `'is-hidden'` и добавь `'is-open'`. Переведи фокус на кнопку закрытия `[data-js-close]` внутри модалки — а если её нет, поставь самой модалке `tabIndex = -1` и вызови `.focus({ preventScroll: true })`.
2) При `closeModal`: верни `'is-hidden'`, убери `'is-open'` и верни фокус обратно на `lastActiveElement` (через `?.focus({ preventScroll: true })`).

```js
'use strict';

let lastActiveElement = null;

/* Твоё решение: */
function openModal(modalElement) {
  /* ... */
}

function closeModal(modalElement) {
  /* ... */
}

const modalElement = document.querySelector('[data-js-modal]');
```

<details>
<summary>Подсказка и решение</summary>

```js
'use strict';

let lastActiveElement = null;

function openModal(modalElement) {
  if (!modalElement) return;

  /* Запоминаем кнопку/элемент, с которого открыли окно, чтобы вернуть туда фокус */
  lastActiveElement = document.activeElement;

  /* Показываем окно ДО вызова .focus(), иначе на скрытом элементе фокус не сработает */
  modalElement.classList.remove('is-hidden');
  modalElement.classList.add('is-open');

  const closeButtonElement = modalElement.querySelector('[data-js-close]');
  if (closeButtonElement) {
    closeButtonElement.focus({ preventScroll: true });
  } else {
    /* tabIndex = -1 разрешает фокусировать <div> программно, не добавляя в очередь Tab */
    modalElement.tabIndex = -1;
    modalElement.focus({ preventScroll: true });
  }
}

function closeModal(modalElement) {
  if (!modalElement) return;

  /* Прячем через класс с display: none / visibility: hidden, чтобы не красть Tab */
  modalElement.classList.remove('is-open');
  modalElement.classList.add('is-hidden');

  lastActiveElement?.focus({ preventScroll: true });
  lastActiveElement = null;
}

const modalElement = document.querySelector('[data-js-modal]');
```

</details>

**Задача 3. Редактируемый `<div>` по клику (`<div>` -> `<textarea>` -> `blur` / `Enter`)**

Напиши функцию `makeEditable(boxElement)`:
1) Сделай `boxElement` доступным через `Tab` (`boxElement.tabIndex = 0`) и повесь `'click'`: создай `<textarea>`, запиши в её `.value` текст из `boxElement.textContent`, замени `boxElement` на `<textarea>` через `.replaceWith(...)` и вызови `.focus()`.
2) При `'blur'` на `<textarea>` или нажатии `Enter` (`event.code === 'Enter'` без `shiftKey`, не забудь `preventDefault()`!) сохрани новое `.value` обратно в `boxElement.textContent` и верни `boxElement` на место. Защитись флагом от двойного срабатывания `Enter` + `blur`.

```js
'use strict';

/*
  HTML на странице:
  <div class="note" data-js-editable>Нажми, чтобы изменить заметку</div>
*/

/* Твоё решение: */
function makeEditable(boxElement) {
  /* ... */
}

const noteElement = document.querySelector('[data-js-editable]');
makeEditable(noteElement);
```

<details>
<summary>Подсказка и решение</summary>

```js
'use strict';

function makeEditable(boxElement) {
  if (!boxElement) return;

  /* Делаем обычный <div> фокусируемым с клавиатуры в общем порядке Tab */
  boxElement.tabIndex = 0;

  boxElement.addEventListener('click', () => {
    const textareaElement = document.createElement('textarea');
    textareaElement.classList.add('editor');
    textareaElement.value = boxElement.textContent;

    /* Флаг защищает от двойного сохранения: replaceWith при Enter само вызовет blur */
    let isSaved = false;

    const finishEdit = () => {
      if (isSaved) return;
      isSaved = true;

      boxElement.textContent = textareaElement.value;
      textareaElement.replaceWith(boxElement);
    };

    textareaElement.addEventListener('blur', finishEdit);

    textareaElement.addEventListener('keydown', (event) => {
      if (event.code === 'Enter' && !event.shiftKey) {
        event.preventDefault(); /* не вставляем перенос строки в textarea */
        finishEdit();
      }
    });

    boxElement.replaceWith(textareaElement);
    textareaElement.focus();
  });
}

const noteElement = document.querySelector('[data-js-editable]');
makeEditable(noteElement);
```

</details>
