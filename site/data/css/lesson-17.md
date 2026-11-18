# Урок 17. Взаимодействие: `cursor`, `user-select`, `pointer-events`, `resize` и `scroll-behavior`

Суть урока: `cursor` меняет вид указателя мыши, `user-select: none` запрещает случайное выделение текста на кнопках, `pointer-events: none` пропускает клики сквозь элемент (с возможностью вернуть `auto` ребёнку), `resize` разрешает тянуть угол у `<textarea>` или блока с `overflow`, а `scroll-behavior: smooth` делает прокрутку по якорям плавной.

## 1. Вид указателя `cursor` и `user-select` (00:16–03:48)

[+] По умолчанию `cursor: auto` сам ставит стрелку тексту, руку-указатель (`pointer`) — ссылкам `<a>` и вертикальную черту (`text`) — полям ввода. Полезные значения: `grab` / `grabbing` (перетаскивание), `not-allowed` (запрещено), `wait` / `progress` (загрузка), `zoom-in` / `zoom-out`, `none` (скрыть курсор). Для кастомного курсора через `url(...)` картинка должна быть `<= 32x32px` с обязательным запасным словом (`cursor: url("cur.svg"), auto;`).

[!] Старайтесь не ставить `cursor: pointer` всем обычным `<button>` без нужды — по стандартам UX рука-указатель означает именно ссылку, ведущую на другую страницу.

[+] `user-select: none;` отключает выделение текста мышью — удобно для кнопок и перетаскиваемых элементов, чтобы при частых кликах текст не подсвечивался синим.

<!-- demo-html:
<style>
  .ui-row { display: flex; gap: 10px; flex-wrap: wrap; }
  .ui-chip { padding: 8px 12px; border: 2px solid #94a3b8; border-radius: 6px; background: #f8fafc; font-size: 13px; font-weight: 700; }
</style>
<div class="ui-row">
  <div class="ui-chip cur-grab">cursor: grab</div>
  <div class="ui-chip cur-ban">not-allowed</div>
  <button class="ui-chip no-select" type="button">Кнопка (user-select: none)</button>
</div>
-->
```css
/* Иконка открытой ладони для перетаскиваемых карточек */
.cur-grab {
  cursor: grab;
}

/* Перечёркнутый круг — действие временно недоступно */
.cur-ban {
  cursor: not-allowed;
}

/* Запрещает случайное выделение текста на кнопке при двойном клике */
.no-select {
  user-select: none;
}
```

## 2. Клики сквозь слой `pointer-events` (03:49–04:33)

[+] `pointer-events: none;` делает элемент «прозрачным» для мыши и касаний: клик пройдёт сквозь него к элементам снизу (отлично подходит для декоративных оверлеев или бликов). При этом `pointer-events` наследуется потомками, но конкретному ребёнку можно вернуть `pointer-events: auto;`.

[!] Важно для доступности: `pointer-events: none;` отключает **только мышь и тач**, но на кнопку всё ещё можно перейти с клавиатуры (`Tab`) и нажать `Enter`. Для настоящей блокировки кнопки используйте HTML-атрибут `disabled`.

<!-- demo-html:
<style>
  .pe-stage { position: relative; height: 86px; border: 2px solid #94a3b8; padding: 10px; background: #f8fafc; }
  .pe-under { padding: 8px 12px; background: #dbeafe; border: 1px solid #2563eb; border-radius: 6px; cursor: pointer; }
  .pe-overlay { position: absolute; inset: 0; background: rgb(254 243 199 / 0.65); padding: 8px; display: flex; justify-content: flex-end; align-items: flex-end; }
  .pe-badge { background: #16a34a; color: #fff; border: 0; padding: 4px 10px; border-radius: 4px; cursor: pointer; }
</style>
<div class="pe-stage">
  <button class="pe-under" type="button">Кликни меня сквозь оверлей!</button>
  <div class="pe-overlay">
    <button class="pe-badge" type="button">А я с pointer-events: auto</button>
  </div>
</div>
-->
```css
/* Оверлей пропускает клики к синей кнопке под ним */
.pe-overlay {
  pointer-events: none;
}

/* Возвращаем кликабельность конкретной зелёной кнопке внутри оверлея */
.pe-badge {
  pointer-events: auto;
}
```

## 3. Изменение размера `resize` и `scroll-behavior` (04:34–06:15)

[+] `resize` позволяет пользователю тянуть правый нижний угол элемента: `none` (запретить), `both` (по обеим осям), `horizontal` (только по ширине), `vertical` (только по высоте). По умолчанию работает у `<textarea>`, а на обычном `<div>` заработает **только если задан `overflow`** отличный от `visible` (`auto` или `hidden`).

[+] `html { scroll-behavior: smooth; }` делает переход по якорным ссылкам (`#section`) плавным. Чтобы не вызывать дискомфорт у людей с вестибулярной чувствительностью, плавность отключают в `@media (prefers-reduced-motion: reduce)`.

<!-- demo-html:
<style>
  .res-area { width: 220px; height: 60px; padding: 6px; font: inherit; }
  .res-box { width: 220px; height: 60px; border: 2px solid #2563eb; padding: 6px; background: #eff6ff; font-size: 13px; margin-top: 8px; }
</style>
<textarea class="res-area">Потяни мой угол только по вертикали (resize: vertical)</textarea>
<div class="res-box">Обычный div с overflow: auto и resize: both</div>
-->
```css
/* Ограничиваем растягивание поля только по вертикали, чтобы не ломать сетку */
.res-area {
  resize: vertical;
}

/* Для обычного div свойство resize работает только вместе с overflow */
.res-box {
  overflow: auto;
  resize: both;
}
```

## 3 главные ловушки урока (чек-лист для повторения)

1. Ждать, что `pointer-events: none;` полностью заблокирует кнопку — она перестанет нажиматься мышкой, но останется доступной через `Tab` + `Enter` (для полной блокировки нужен атрибут `disabled`).

2. Писать `resize: both;` обычному `<div>` без `overflow: auto` или `hidden` — уголок для растягивания даже не появится.

3. Забывать запасное значение при кастомном курсоре (`cursor: url("cur.png");` без `, auto`) — без fallback браузер проигнорирует всю строку.

## Вопросы для закрепления

**1. Почему кнопка с `pointer-events: none;` всё равно может сработать, если пользователь пользуется клавиатурой?**

<details>
<summary>Показать ответ</summary>

`pointer-events: none;` отключает только события указателя (мышь, тачпад, касания на экране). Клавиатурный фокус (`Tab`) и активация клавишей `Enter` / `Пробел` продолжают работать, поэтому для реального отключения кнопки используют атрибут `disabled`.

</details>

**2. Что нужно обязательно дописать обычному `<div>`, чтобы на нём заработало свойство `resize: horizontal;`?**

<details>
<summary>Показать ответ</summary>

Нужно задать свойство `overflow` со значением отличным от `visible` (обычно `overflow: auto;` или `overflow: hidden;`). У тега `<textarea>` это уже включено по умолчанию.

</details>

**3. Какие два правила нужно помнить, когда задаёшь кастомный курсор через `cursor: url(...)`?**

<details>
<summary>Показать ответ</summary>

1) После `url(...)` через запятую обязательно указать запасное стандартное ключевое слово (например, `cursor: url("icon.svg"), auto;`). 2) Размер картинки курсора не должен превышать `32x32` пикселя (иначе браузер её отбросит).

</details>

## Задачи

**Задача 1. Безопасный `<textarea>` и запрет выделения у кнопки**

Настрой форму:
1) Для `<textarea class="comment-input">` разреши пользователю менять размер **только по высоте**, чтобы он не растянул поле вправо за пределы карточки (`resize: vertical;`).
2) Для кнопки `.submit-btn` отключи случайное выделение текста при двойном клике (`user-select: none;`).

```html
<textarea class="comment-input" placeholder="Ваш отзыв"></textarea>
<button class="submit-btn" type="button">Отправить</button>
```

<details>
<summary>Подсказка и решение</summary>

<!-- demo-html:
<style>
  .comment-input { display: block; width: 230px; min-height: 60px; margin-bottom: 8px; font: inherit; padding: 6px; }
  .submit-btn { padding: 8px 14px; background: #2563eb; color: #fff; border: 0; border-radius: 6px; font: inherit; }
</style>
<textarea class="comment-input" placeholder="Ваш отзыв"></textarea>
<button class="submit-btn" type="button">Отправить</button>
-->
```css
/* Разрешаем тянуть только вниз, сохраняя ширину колонки */
.comment-input {
  resize: vertical;
}

/* Текст внутри кнопки не выделится синим при быстрых кликах */
.submit-btn {
  user-select: none;
}
```

</details>

**Задача 2. Декоративный стикер поверх кликабельной карточки**

Над карточкой `.promo-link` лежит полупрозрачный декоративный слой `.sparkle-layer`, который мешает кликнуть по ссылке под ним:
1) Сделай так, чтобы `.sparkle-layer` пропускал клики насквозь (`pointer-events: none;`).
2) Внутри `.sparkle-layer` лежит кнопка помощи `.help-chip` — верни ей кликабельность (`pointer-events: auto;`) и курсор со знаком вопроса (`cursor: help;`).

```html
<div class="card-wrap">
  <a class="promo-link" href="#">Перейти к акции</a>
  <div class="sparkle-layer">
    <button class="help-chip" type="button">?</button>
  </div>
</div>
```

<details>
<summary>Подсказка и решение</summary>

<!-- demo-html:
<style>
  .card-wrap { position: relative; height: 80px; border: 2px solid #94a3b8; padding: 12px; background: #f8fafc; }
  .sparkle-layer { position: absolute; inset: 0; background: rgb(219 234 254 / 0.45); display: flex; justify-content: flex-end; align-items: flex-start; padding: 8px; }
  .help-chip { width: 26px; height: 26px; border-radius: 50%; border: 1px solid #2563eb; background: #fff; font-weight: 700; }
</style>
<div class="card-wrap">
  <a class="promo-link" href="#">Перейти к акции</a>
  <div class="sparkle-layer">
    <button class="help-chip" type="button">?</button>
  </div>
</div>
-->
```css
/* Пропускаем клики сквозь декоративный слой к ссылке снизу */
.sparkle-layer {
  pointer-events: none;
}

/* Точечно возвращаем взаимодействие для кнопки помощи и ставим курсор ? */
.help-chip {
  pointer-events: auto;
  cursor: help;
}
```

</details>

**Задача 3. Плавная прокрутка с защитой доступности**

Добавь для `html` плавный переход по якорным ссылкам (`scroll-behavior: smooth;`), но отключи его в медиазапросе `@media (prefers-reduced-motion: reduce)` для пользователей, у которых в ОС включено уменьшение движения.

```css
/* Настрой плавный скролл с медиазапросом доступности */
```

<details>
<summary>Подсказка и решение</summary>

```css
/* Плавная прокрутка при клике на #якорь */
html {
  scroll-behavior: smooth;
}

/* Отключаем плавный скролл, если в ОС включена настройка уменьшения анимаций */
@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }
}
```

</details>
