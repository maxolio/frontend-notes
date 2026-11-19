# Практика 1. Задачи по основам, функциям, объектам и строкам (уроки 01–14)

<details>
<summary>🧩 Задача 1. Проверка комментария на пробелы и запрещённые символы</summary>

### Что нужно сделать
Представь, что ты проверяешь комментарий пользователя перед публикацией. Напиши функцию `analyzeText(text, forbiddenChar = '!')`, которая:

1. **Защищается от пустоты:** если в `text` передали `null` или `undefined` (комментария нет), считает, что там пустая строка `''`.
2. **Считает статистику по символам** (проходит по строке циклом `for` от первого символа до последнего):
   - сколько раз встретился пробел `' '`;
   - сколько раз встретился запрещённый символ `forbiddenChar` (большие и маленькие буквы считаем одинаковыми, например `'А'` и `'а'` — это один и тот же символ).
3. **Возвращает результат** в виде объекта с тремя полями:
   - `length` — общая длина строки,
   - `spaces` — количество пробелов,
   - `forbiddenCount` — сколько раз встретился запрещённый символ.

### Шаблон для копирования
```js
'use strict';

function analyzeText(text, forbiddenChar = '!') {
  /* Твоё решение: */
}

console.log(analyzeText('Привет, Мир! Как дела?!', '!'));
/* Должно вернуть: { length: 23, spaces: 3, forbiddenCount: 2 } */

console.log(analyzeText(null, 'а'));
/* Должно вернуть: { length: 0, spaces: 0, forbiddenCount: 0 } */
```

<details>
<summary>Раскрыть решение</summary>

### Вариант 1 (классический цикл `for`)
```js
'use strict';

function analyzeText(text, forbiddenChar = '!') {
  /* Оператор ?? заменяет только null и undefined на '', не трогая другие значения */
  const textResult = text ?? '';
  const textLength = textResult.length;

  /* Выносим приведение к нижнему регистру до цикла, чтобы не делать его на каждом шаге */
  const targetChar = forbiddenChar.toLowerCase();

  let spaces = 0;
  let forbiddenCount = 0;

  /* Цикл for проходит по индексам строки от 0 до последнего символа */
  for (let i = 0; i < textResult.length; i++) {
    const char = textResult[i];

    if (char === ' ') {
      spaces += 1;
    }

    /* Сравниваем текущий символ тоже в нижнем регистре, чтобы 'А' и 'а' совпадали */
    if (char.toLowerCase() === targetChar) {
      forbiddenCount += 1;
    }
  }

  /* Сокращённая запись свойств: spaces: spaces и forbiddenCount: forbiddenCount */
  return { length: textLength, spaces, forbiddenCount };
}

/* Пояснение:
   1. text ?? '' страхует от ошибки при чтении .length у null/undefined.
   2. Оба сравниваемых символа (char и forbiddenChar) приводятся к lowerCase,
      иначе заглавная буква в тексте не совпала бы с маленькой в forbiddenChar. */
```

### Вариант 2 (через цикл `for..of` и единый нижний регистр)
```js
'use strict';

function analyzeText(text, forbiddenChar = '!') {
  /* Сразу приводим всю строку и искомый символ к нижнему регистру один раз */
  const normalized = (text ?? '').toLowerCase();
  const target = forbiddenChar.toLowerCase();

  let spaces = 0;
  let forbiddenCount = 0;

  /* for..of сразу даёт каждый символ строки без индекса i */
  for (const char of normalized) {
    if (char === ' ') {
      spaces += 1;
    } else if (char === target) {
      forbiddenCount += 1;
    }
  }

  return {
    length: normalized.length,
    spaces,
    forbiddenCount,
  };
}

/* Пояснение:
   1. Выражение (text ?? '').toLowerCase() сразу безопасно готовит строку.
   2. else if логично разделяет ветки: если символ — пробел (и target не пробел),
      второе условие проверять уже не нужно.
   3. Цикл for..of читается короче, когда индекс i внутри тела не используется. */
```

</details>

</details>
