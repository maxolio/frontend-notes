# Урок 35. События клавиатуры, ввода и буфера обмена

Суть урока: Клавиатурные keydown/keyup служат для горячих клавиш (по event.code, независимому от раскладки), живой ввод в поля отслеживают через input, финальную проверку после потери фокуса — через change, а буфер обмена — через cut/copy/paste.

## 1. Клавиатура: keydown, keyup, key vs code и модификаторы (00:28–07:53)

[+] keydown срабатывает при нажатии (и повторяется при удержании клавиши), keyup — при отпускании. Для горячих клавиш ориентируйтесь на event.code, а не на event.key!

```js
document.addEventListener('keydown', (event) => {
  if (event.repeat) return; /* true при автоповторе, если клавишу держат зажатой */
  console.log(event.key);   /* символ с учётом раскладки: "q" (ENG) или "й" (RUS) */
  console.log(event.code);  /* физическая клавиша: всегда "KeyQ" в любой раскладке */

  /* Спецклавиши-модификаторы (true/false): altKey, ctrlKey, shiftKey, metaKey */
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
  if (!event.target.matches('input')) return; /* фильтр через делегирование */

  if (anyDigitRegExp.test(event.key)) {
    event.preventDefault(); /* запретим вводить цифры (в keyup отменять уже ПОЗДНО!) */
    console.log('Цифра заблокирована:', event.key);
  }
  /* Минус keydown: вставку мышкой ("Вставить") он не ловит; чистите в input! */
});
```

## 3. События ввода: почему не keydown/keyup, а input и change (15:53–22:12)

[!] В keydown новое значение input.value ещё не успело обновиться (отстаёт на 1 шаг), а keyup не ловит вставку/вырезание мышкой из меню. Для полей ввода используют input и change.

```js
const input = document.querySelector('input');
const output = document.querySelector('.name-output');

/* input: срабатывает МГНОВЕННО при любом изменении (клавиатура, мышь, вставка) */
input.addEventListener('input', () => {
  /* Надёжная чистка от цифр (работает и после вставки мышкой, и на телефоне): */
  input.value = input.value.replace(/\d/g, '');
  output.textContent = input.value; /* preventDefault() здесь уже не отменит ввод */
});

/* Живой поиск с паузой (debounce через setTimeout): не бьёт сервер на каждую букву */
let searchTimerId;
input.addEventListener('input', () => {
  clearTimeout(searchTimerId);
  searchTimerId = setTimeout(() => console.log("Запрос:", input.value), 300);
});

/* change: у текстового поля — при ПОТЕРЕ фокуса; у <select>/checkbox/radio — СРАЗУ! */
input.addEventListener('change', () => {
  const isInvalid = input.value.length < 5;
  input.classList.toggle('is-invalid', isInvalid);
  /* Идеально для валидации и тяжёлых запросов, чтобы не дёргать на каждую букву */
});
```

## 4. События буфера обмена: cut, copy и paste (22:13–23:55)

[+] Срабатывают и по Ctrl+X/C/V, и через правый клик мыши. Старый способ event.clipboardData.getData("text/plain") работает только в paste (в cut/copy даёт ""). Современный navigator.clipboard.readText() работает везде.

```js
document.addEventListener('paste', (event) => {
  console.log(event.clipboardData.getData('text/plain')); /* только в paste */
  /* event.preventDefault(); — можно запретить вставку/копирование/вырезание */
});

/* Асинхронный Clipboard API (работает в cut/copy/paste, нужен HTTPS и разрешение): */
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
