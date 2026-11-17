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
