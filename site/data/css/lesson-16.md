# Урок 16. Переполнение (`overflow`), видимость (`opacity`, `visibility`) и `clip-path`

Суть урока: `overflow` управляет вылезающим контентом (`hidden`, `auto`, строгое `clip` без скролла и с поддержкой одной оси), `opacity: 0` оставляет элемент кликабельным (в отличие от `visibility: hidden`), а `clip-path` вырезает блок в виде круга, эллипса или многоугольника.

## 1. Переполнение `overflow`: `visible`, `hidden`, `scroll`, `auto`, `clip` (00:16–04:07)

[+] Значения `overflow` для блока с ограниченными размерами:
- **`visible`** (по умолчанию) — контент свободно вылезает за границы.
- **`hidden`** — обрезает лишнее, полосы прокрутки нет, но JS всё ещё может скроллить блок программно.
- **`scroll`** — всегда рисует полосы прокрутки (на Windows видны пустые полосы, даже если текст влез).
- **`auto`** — показывает скролл только тогда, когда контент реально не помещается.
- **`clip`** — жёстко обрезает без всякого скролла (даже из JS) и **не ломает `position: sticky`**.

[!] По спецификации CSS, если задать `overflow: visible hidden;`, браузер автоматически заменит `visible` на `auto`. А вот **`overflow: visible clip;`** оставляет ось X видимой, обрезая только ось Y!

<!-- demo-html:
<style>
  .ov-row { display: flex; gap: 12px; flex-wrap: wrap; }
  .ov-box { width: 120px; height: 64px; border: 2px solid #dc2626; padding: 4px 6px; font-size: 12px; background: #fef2f2; }
</style>
<div class="ov-row">
  <div class="ov-box ov-hidden">overflow: hidden — длинный текст обрезается без прокрутки</div>
  <div class="ov-box ov-auto">overflow: auto — появляется аккуратная полоса прокрутки</div>
</div>
-->
```css
/* Жёстко обрезает вылезающий текст по краям блока */
.ov-hidden {
  overflow: hidden;
}

/* Показывает скролл только при реальном переполнении (лучше, чем scroll) */
.ov-auto {
  overflow: auto;
}
```

## 2. Видимость: `opacity` против `visibility` (04:08–06:19)

[+] Оба свойства оставляют место элемента в потоке (в отличие от `display: none`), но работают по-разному:
- **`opacity`** (`0`..`1`) — меняет прозрачность. При `opacity: 0` элемент невидим, но **остаётся кликабельным** и плавно анимируется. Кроме того, `opacity < 1` создаёт новый контекст наложения (`z-index`).
- **`visibility`** (`visible` / `hidden`) — полностью прячет элемент **без возможности клика и фокуса** (но не анимируется плавно, как `opacity`).

<!-- demo-html:
<style>
  .vis-row { display: flex; gap: 10px; align-items: center; }
  .vis-btn { padding: 8px 12px; border: 2px solid #2563eb; background: #dbeafe; border-radius: 6px; cursor: pointer; }
</style>
<div class="vis-row">
  <button class="vis-btn vis-opacity" type="button">opacity: 0.25</button>
  <button class="vis-btn vis-hidden" type="button">visibility: hidden (дыра остаётся)</button>
  <button class="vis-btn" type="button">Сосед на месте</button>
</div>
-->
```css
/* Полупрозрачная кнопка остаётся кликабельной и занимает место */
.vis-opacity {
  opacity: 0.25;
}

/* Полностью невидима и не кликается, но место в раскладке сохранено */
.vis-hidden {
  visibility: hidden;
}
```

## 3. Фигурная обрезка `clip-path` (06:20–08:40)

[+] `clip-path` вырезает видимую область элемента по геометрической маске:
- **`circle(50%)`** или `circle(40px at 30% 40%)` — круг (с указанием радиуса и центра).
- **`ellipse(50% 35%)`** — эллипс с горизонтальным и вертикальным радиусами.
- **`polygon(x1 y1, x2 y2, ...)`** — любой многоугольник по точкам (удобно собирать в генераторе Clippy).
- **`path("...")`** — сложная кривая из SVG.

[!] `clip-path` отрезает всё за контуром, включая `box-shadow` и область клика. Чтобы у вырезанной фигуры была тень, применяют `filter: drop-shadow(...)` на её родительскую обёртку.

<!-- demo-html:
<style>
  .cp-row { display: flex; gap: 14px; align-items: center; }
  .cp-box { width: 90px; height: 90px; background: linear-gradient(135deg, #2563eb, #9333ea); color: #fff; display: grid; place-items: center; font-size: 12px; font-weight: 700; }
</style>
<div class="cp-row">
  <div class="cp-box cp-circle">circle</div>
  <div class="cp-box cp-triangle">polygon</div>
</div>
-->
```css
/* Круглая маска с центром по умолчанию (50% 50%) */
.cp-circle {
  clip-path: circle(48%);
}

/* Треугольник по трём вершинам (верх-центр, низ-право, низ-лево) */
.cp-triangle {
  clip-path: polygon(50% 5%, 95% 95%, 5% 95%);
}
```

## 3 главные ловушки урока (чек-лист для повторения)

1. Прятать модальное окно или кнопку через `opacity: 0;` без `visibility: hidden` или `display: none` — невидимый элемент продолжит перехватывать клики мышкой!

2. Писать `overflow: visible hidden;` в надежде обрезать только вертикаль — браузер превратит `visible` в `auto` (для такого сценария нужен `overflow: visible clip;`).

3. Вешать `box-shadow` прямо на элемент с `clip-path` — маска обрежет тень вместе с углами; для тени вокруг фигуры вешайте `filter: drop-shadow(...)` на обёртку.

## Вопросы для закрепления

**1. Чем `opacity: 0;` отличается от `visibility: hidden;` при работе с кнопкой или ссылкой?**

<details>
<summary>Показать ответ</summary>

Оба свойства оставляют место элемента в потоке, но кнопка с `opacity: 0;` остаётся интерактивной — по ней всё ещё можно кликнуть мышкой, а с `visibility: hidden;` клики и взаимодействие полностью отключаются.

</details>

**2. В чём две главные разницы между `overflow: hidden` и `overflow: clip`?**

<details>
<summary>Показать ответ</summary>

1) `overflow: hidden` допускает программную прокрутку из JavaScript и часто ломает `position: sticky` внутри, а `clip` запрещает любой скролл и дружит со `sticky`. 2) При `overflow-x: visible; overflow-y: clip;` ось X остаётся открытой, тогда как с `hidden` браузер превратил бы `visible` в `auto`.

</details>

**3. Почему `overflow: auto;` почти всегда лучше, чем `overflow: scroll;`?**

<details>
<summary>Показать ответ</summary>

`overflow: scroll;` на Windows принудительно рисует серые полосы прокрутки даже тогда, когда контент полностью помещается в блок. `overflow: auto;` показывает скроллбар только при реальном переполнении.

</details>

## Задачи

**Задача 1. Чат-окно с умной прокруткой и обрезка по одной оси**

Настрой два блока:
1) Для `.chat-log` высотой `100px` добавь полосу прокрутки, которая появляется **только при переполнении** (`overflow: auto;`).
2) Для `.banner-wrap` оставь горизонтальную ось видимой, а вертикальное переполнение жёстко обрежь через `clip`, чтобы не появился скролл по X (`overflow: visible clip;`).

```html
<div class="chat-log">
  <p>Сообщение 1</p>
  <p>Сообщение 2</p>
  <p>Сообщение 3</p>
  <p>Сообщение 4</p>
  <p>Сообщение 5</p>
</div>
```

<details>
<summary>Подсказка и решение</summary>

<!-- demo-html:
<style>
  .chat-log { width: 220px; height: 100px; border: 2px solid #94a3b8; padding: 6px; background: #f8fafc; }
  .chat-log p { margin: 0 0 8px; }
</style>
<div class="chat-log">
  <p>Сообщение 1</p>
  <p>Сообщение 2</p>
  <p>Сообщение 3</p>
  <p>Сообщение 4</p>
  <p>Сообщение 5</p>
</div>
-->
```css
/* auto покажет скролл только тогда, когда сообщения не влезут в 100px */
.chat-log {
  overflow: auto;
}

/* clip позволяет оставить ось X видимой без превращения в auto */
.banner-wrap {
  overflow: visible clip;
}
```

</details>

**Задача 2. Полное скрытие карточки без потери места, но с запретом кликов**

У нас есть карточка `.secret-card` с кнопкой внутри. Скрой её так, чтобы соседний блок **не сдвинулся** на её место (дыра осталась), но при этом кликнуть по скрытой кнопке было **нельзя**.

```html
<div class="secret-card">
  <button type="button">Секретная кнопка</button>
</div>
<div class="next-block">Соседний блок</div>
```

<details>
<summary>Подсказка и решение</summary>

<!-- demo-html:
<style>
  .secret-card { padding: 10px; border: 2px solid #b45309; background: #fef3c7; margin-bottom: 8px; }
  .next-block { padding: 10px; background: #dbeafe; border: 2px solid #2563eb; }
</style>
<div class="secret-card"><button type="button">Секретная кнопка</button></div>
<div class="next-block">Соседний блок (остался на своём месте)</div>
-->
```css
/* visibility: hidden сохраняет место в потоке, но полностью отключает клики */
.secret-card {
  visibility: hidden;
}
```

</details>

**Задача 3. Вырезка ромба через `clip-path: polygon()`**

Вырежи квадратный блок `.diamond` (`100px` на `100px`) в форме ромба с помощью `clip-path: polygon(...)`, соединив 4 середины сторон (`50% 0`, `100% 50%`, `50% 100%`, `0 50%`).

```html
<div class="diamond">Ромб</div>
```

<details>
<summary>Подсказка и решение</summary>

<!-- demo-html:
<style>
  .diamond { width: 100px; height: 100px; background: linear-gradient(135deg, #0ea5e9, #16a34a); color: #fff; display: grid; place-items: center; font-weight: 700; }
</style>
<div class="diamond">Ромб</div>
-->
```css
/* Четыре вершины по часовой стрелке: верх, право, низ, лево */
.diamond {
  clip-path: polygon(50% 0, 100% 50%, 50% 100%, 0 50%);
}
```

</details>
