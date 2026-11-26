# Этап 2. Урок 5. Разбор URL-хэша в `app.js`: запись, `hashchange` и `F5`

Суть урока: Поддержка `#lesson-02` в нашем `my-site/app.js` состоит из трёх небольших связок: запись хэша внутри `openLesson()`, реакция на «Назад / Вперёд» через `hashchange` и восстановление урока при старте в `init()`.

## 1. Весь код работы с хэшем в `my-site/app.js` с разбором

[+] Посмотри, как три блока работают вместе в единой связке:

```js
/* === 1. ЗАПИСЬ ХЭША (внутри openLesson(lesson)) === */
const nextHash = `#${lesson.id}`;
/* Собираем строку вида "#lesson-02" */

if (window.location.hash !== nextHash) {
  window.location.hash = nextHash;
}
/* Сравниваем, чтобы не перезаписывать тот же самый адрес лишний раз.
   Когда window.location.hash меняется (например, с #lesson-01 на #lesson-02),
   браузер НЕ перезагружает страницу, но сам добавляет этот шаг в историю
   вкладки — поэтому начинают работать кнопки «Назад» и «Вперёд». */


/* === 2. РЕАКЦИЯ НА «НАЗАД / ВПЕРЁД» (слушатель на window) === */
window.addEventListener('hashchange', () => {
/* Событие 'hashchange' срабатывает каждый раз, когда меняется часть URL после #
   (например, пользователь нажал в браузере «Назад» или изменил # в строке сам). */

  const hashId = window.location.hash.slice(1);
  /* window.location.hash возвращает строку с решёткой: "#lesson-02".
     Метод .slice(1) отрезает символ с индексом 0 ('#') -> остаётся "lesson-02". */

  const lesson = state.lessons.find((item) => item.id === hashId);
  /* Метод массива .find() ищет первый объект, у которого поле id === hashId.
     Если такого урока нет (например, опечатка #lesson-99), вернёт undefined. */

  if (lesson && lesson.id !== state.activeId) {
    openLesson(lesson);
  }
  /* Защита от лишнего круга: открываем урок, только если он реально найден
     и ещё не открыт прямо сейчас (иначе клик по кнопке вызвал бы openLesson дважды). */
});


/* === 3. ВОССТАНОВЛЕНИЕ ПРИ СТАРТЕ И ПОСЛЕ F5 (внутри init()) === */
const hashId = window.location.hash.slice(1);
/* При открытии сайта проверяем: вдруг в ссылке уже есть #lesson-03? */

const startLesson = state.lessons.find((item) => item.id === hashId) || state.lessons[0];
/* Оператор ИЛИ (||) работает как страховка:
   - если .find() нашёл урок по хэшу (объект -> truthy) — откроется именно он;
   - если хэша нет или он битый (.find() вернул undefined -> falsy) —
     выполнится правая часть и возьмётся самый первый урок state.lessons[0]. */

if (startLesson) {
  openLesson(startLesson);
}
```

## 2. Схема защиты от повторного вызова

```text
Клик по «Урок 02»
  │
  ▼
openLesson(lesson2):
  1. state.activeId = 'lesson-02'   (уже обновили!)
  2. window.location.hash = '#lesson-02'
        │
        ▼ (браузер стреляет событием hashchange)
  hashchange проверяет: lesson.id !== state.activeId ?
  'lesson-02' !== 'lesson-02'  ──►  FALSE! (повторного openLesson не будет)
```

[!] Именно строка `state.activeId = lesson.id;` **до** смены `window.location.hash` защищает нас от двойного `fetch()` и двойной перерисовки при каждом клике.

## 3 главные ловушки урока (чек-лист для повторения)

1. Поставить `window.location.hash = nextHash` **выше**, чем `state.activeId = lesson.id`: тогда в момент срабатывания `hashchange` в `state.activeId` ещё будет старый урок, и `openLesson()` запустится второй раз подряд.

2. Не поставить страховку `|| state.lessons[0]` в `init()`: если кто-то откроет сайт с битой ссылкой `#lesson-999`, `.find()` вернёт `undefined`, и пользователь увидит вечную надпись «Загрузка...».

3. Забыть проверку `if (lesson && ...)`: без проверки на существование `lesson` при ручной опечатке в `#...` код попытается прочитать `undefined.id` и упадёт с `TypeError`.

## Вопросы для закрепления

**1. Зачем внутри `hashchange` мы проверяем `&& lesson.id !== state.activeId`?**

<details>
<summary>Показать ответ</summary>

Когда пользователь кликает по кнопке в меню, `openLesson()` сначала меняет `state.activeId`, а потом меняет `window.location.hash`. Смена хэша вызывает событие `hashchange`. Проверка `lesson.id !== state.activeId` понимает, что этот урок уже открыт, и не запускает `openLesson()` повторно.

</details>

**2. Как работает страховка `state.lessons.find(...) || state.lessons[0]` в функции `init()`?**

<details>
<summary>Показать ответ</summary>

Если в адресе есть правильный хэш (например, `#lesson-02`), `.find()` вернёт объект урока (truthy), и оператор `||` сразу вернёт его. Если хэша нет или в нём опечатка, `.find()` вернёт `undefined` (falsy), и `||` подставит запасной вариант — первый урок `state.lessons[0]`.

</details>
