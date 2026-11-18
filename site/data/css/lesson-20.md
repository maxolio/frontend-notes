# Урок 20. Адаптивная вёрстка: `min`/`max`-размеры, `viewport` и `@media`

Суть урока: адаптивная вёрстка сочетает гибкие ограничения размеров (`min-width`, `max-width`, `min-height`, `max-height`) с директивой `@media`, обязательным `<meta name="viewport">` в `<head>`, строгим порядком брейкпоинтов (в Desktop First — от большего к меньшему, в Mobile First — от меньшего к большему) и защитой `:hover` через `@media (hover: hover)`.

## 1. Подходы Desktop First, Mobile First и `min`/`max`-размеры (00:10–05:00)

[+] В **Desktop First** сначала верстают широкий экран, а затем в `@media (max-width: ...)` скрывают лишний декор, уменьшают отступы/шрифты и сжимают сетку (например, с 4 колонок в 2 и 1). В **Mobile First** наоборот: базовые стили пишут под телефон, а затем расширяют через `@media (min-width: ...)`. Оба подхода сочетают с «резиной» (`%`, `vw`, `fr`).

[+] Свойства ограничений делают блок гибким без медиазапросов:
- **`min-width` / `max-width`** — задают коридор ширины (например, `width: 50%; min-width: 200px; max-width: 500px;`).
- **`min-height: 100vh;`** — секция не ниже экрана, но спокойно растянется, если текста станет больше.
- **`max-height: 100%; overflow-y: auto;`** — спасает модальное окно от обрезки на низких экранах, добавляя прокрутку.

<!-- demo-html:
<style>
  .flex-panel { background: #fef3c7; border: 2px solid #b45309; padding: 10px; font-weight: 700; font-size: 13px; margin-bottom: 10px; }
  .modal-card { width: 240px; padding: 8px 10px; border: 2px solid #2563eb; background: #eff6ff; font-size: 13px; }
</style>
<div class="flex-panel">width: 70% в коридоре 180px..320px</div>
<div class="modal-card">Модалка с max-height: 80px и overflow-y: auto — длинный текст внутри прокручивается, не вылезая за экран и не обрезаясь.</div>
-->
```css
/* Блок тянется на 70% ширины, но не меньше 180px и не больше 320px */
.flex-panel {
  width: 70%;
  min-width: 180px;
  max-width: 320px;
}

/* Ограничиваем высоту окна и включаем скролл при переполнении */
.modal-card {
  max-height: 80px;
  overflow-y: auto;
}
```

## 2. Метатег `viewport` и директива `@media` (05:01–11:23)

[!] Чтобы медиазапросы вообще заработали на смартфонах, в `<head>` обязателен метатег `viewport`. Не добавляйте туда `user-scalable=no` — запрет зума ломает доступность для людей со слабым зрением.

```html
<!-- Базовый стандарт в <head> для адаптивных сайтов -->
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

[+] В **Desktop First** брейкпоинты идут **от большего к меньшему** (`max-width: 700px`, затем `max-width: 400px`). В **Mobile First** — строго **от меньшего к большему** (`min-width: 401px`, затем `min-width: 701px`), иначе более широкое правило перебьёт узкое из-за каскада. В новых браузерах также работает синтаксис диапазона `@media (width <= 700px)`.

[+] Другие полезные медиазапросы: `@media (orientation: landscape)` (альбомная ориентация), `@media print` (стили для печати через `Ctrl+P`) и **`@media (hover: hover)`** — оборачивайте туда `:hover`-эффекты, чтобы они работали только на устройствах с мышью и не «залипали» после тапа на телефоне.

<!-- demo-html:
<style>
  .mq-grid { display: grid; gap: 8px; }
  .mq-cell { padding: 10px; background: #dcfce7; border: 1px solid #16a34a; text-align: center; font-weight: 700; font-size: 13px; }
  .mq-btn { margin-top: 10px; padding: 8px 14px; border: 0; border-radius: 6px; background: #2563eb; color: #fff; font: inherit; cursor: pointer; }
</style>
<div class="mq-grid">
  <div class="mq-cell">1</div>
  <div class="mq-cell">2</div>
  <div class="mq-cell">3</div>
  <div class="mq-cell">4</div>
</div>
<button class="mq-btn" type="button">Кнопка с @media (hover: hover)</button>
-->
```css
/* Подход Mobile First: по умолчанию (на узком экране) 1 колонка */
.mq-grid {
  grid-template-columns: 1fr;
}

/* От 320px и шире — перестраиваем в 2 колонки */
@media (min-width: 320px) {
  .mq-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* От 480px и шире — 4 колонки (идёт ПОСЛЕ 320px!) */
@media (min-width: 480px) {
  .mq-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

/* Эффект наведения работает только на устройствах с настоящим курсором */
@media (hover: hover) {
  .mq-btn:hover {
    background-color: #1d4ed8;
  }
}
```

## 3 главные ловушки урока (чек-лист для повторения)

1. Забыть `<meta name="viewport" content="width=device-width, initial-scale=1.0">` в `<head>` — на смартфоне страница откроется в масштабе ~980px и ни один `@media` для мобильных не сработает.

2. Перепутать порядок `@media` в каскаде: поставить `max-width: 480px` выше `max-width: 768px` (или `min-width: 768px` выше `min-width: 480px`) — более широкий запрос перезапишет более узкий.

3. Ставить `height: 100vh;` вместо `min-height: 100vh;` или вешать `:hover` без `@media (hover: hover)` — на телефоне текст вылезет за `height: 100vh`, а `:hover` залипнет после нажатия пальцем.

## Вопросы для закрепления

**1. Что произойдёт, если написать медиазапросы в таком порядке: `@media (max-width: 480px)` и ниже `@media (max-width: 768px)`? Почему?**

<details>
<summary>Показать ответ</summary>

На телефоне шириной `375px` сработают **оба** условия (`375 <= 480` и `375 <= 768`), но из-за каскада победит то правило, которое написано **ниже** — то есть стили для `768px` перезатрут стили для `480px`. В Desktop First правила с `max-width` должны идти от большего к меньшему.

</details>

**2. Зачем оборачивать эффекты `:hover` в `@media (hover: hover)`?**

<details>
<summary>Показать ответ</summary>

На смартфонах и планшетах после тапа пальцем по кнопке браузер активирует `:hover` и «замораживает» его, пока пользователь не нажмёт в другое место. `@media (hover: hover)` применяет `:hover` только там, где есть полноценное наведение курсора (мышь), не вызывая залипания на тачскринах.

</details>

**3. Почему в `<meta name="viewport">` не стоит добавлять `user-scalable=no`?**

<details>
<summary>Показать ответ</summary>

`user-scalable=no` запрещает пользователю приближать страницу двумя пальцами на экране телефона. Это серьёзно ухудшает доступность для людей со слабым зрением и снижает оценку качества сайта (Lighthouse).

</details>

## Задачи

**Задача 1. Адаптивная сетка в подходе Mobile First**

Напиши стили для сетки `.cards`:
1) По умолчанию (для мобильных) сделай `display: grid; grid-template-columns: 1fr; gap: 10px;`.
2) Начиная от ширины `360px` (`@media (min-width: 360px)`) перестрой сетку в 2 равные колонки (`repeat(2, 1fr)`).
3) Начиная от ширины `540px` (`@media (min-width: 540px)`) перестрой сетку в 3 равные колонки.

```html
<div class="cards">
  <div class="card">1</div>
  <div class="card">2</div>
  <div class="card">3</div>
</div>
```

<details>
<summary>Подсказка и решение</summary>

<!-- demo-html:
<style>
  .card { padding: 12px; background: #fef3c7; border: 2px solid #b45309; text-align: center; font-weight: 700; }
</style>
<div class="cards">
  <div class="card">1</div>
  <div class="card">2</div>
  <div class="card">3</div>
</div>
-->
```css
/* Базовый вид для мобильных — 1 колонка */
.cards {
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
}

/* В Mobile First брейкпоинты min-width идут от меньшего к большему */
@media (min-width: 360px) {
  .cards {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 540px) {
  .cards {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

</details>

**Задача 2. Контейнер с гибким коридором ширины и защитой модалки по высоте**

Настрой два класса:
1) `.container` занимает `90%` ширины, не сжимается уже `260px` (`min-width`) и не разъезжается шире `960px` (`max-width`), с горизонтальным центрированием `margin-inline: auto;`.
2) `.dialog-body` не превышает `80vh` по высоте (`max-height`) и показывает вертикальный скролл при переполнении (`overflow-y: auto;`).

```html
<div class="container">
  <div class="dialog-body">Контент контейнера и диалога</div>
</div>
```

<details>
<summary>Подсказка и решение</summary>

<!-- demo-html:
<style>
  .container { background: #e2e8f0; padding: 8px; }
  .dialog-body { background: #fff; border: 2px solid #2563eb; padding: 10px; }
</style>
<div class="container">
  <div class="dialog-body">Контейнер 90% (260px..960px) по центру экрана</div>
</div>
-->
```css
/* Гибкая ширина в жёстких рамках от 260px до 960px и центрирование */
.container {
  width: 90%;
  min-width: 260px;
  max-width: 960px;
  margin-inline: auto;
}

/* Внутри диалога появится прокрутка, если контент превысит 80vh */
.dialog-body {
  max-height: 80vh;
  overflow-y: auto;
}
```

</details>

**Задача 3. Кнопка с `:hover` без залипания на телефонах и откликом `:active`**

Настрой кнопку `.tap-btn`:
1) Базовый фон `#16a34a`, цвет текста `#fff`.
2) Эффект наведения (`background-color: #15803d;`) оберни в `@media (hover: hover)`, чтобы он не залипал на смартфонах.
3) Эффект нажатия `.tap-btn:active` (`background-color: #166534;`) оставь доступным на всех устройствах (включая тачскрины).

```html
<button class="tap-btn" type="button">Подтвердить</button>
```

<details>
<summary>Подсказка и решение</summary>

<!-- demo-html:
<style>
  .tap-btn { padding: 10px 18px; border: 0; border-radius: 6px; font: inherit; font-weight: 700; cursor: pointer; }
</style>
<button class="tap-btn" type="button">Подтвердить</button>
-->
```css
.tap-btn {
  background-color: #16a34a;
  color: #fff;
}

/* Наведение сработает только там, где есть курсор */
@media (hover: hover) {
  .tap-btn:hover {
    background-color: #15803d;
  }
}

/* Отклик при нажатии работает везде (и мышкой, и пальцем) */
.tap-btn:active {
  background-color: #166534;
}
```

</details>
