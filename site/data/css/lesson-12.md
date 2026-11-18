# Урок 12. Flexbox Layout: оси, `flex-wrap`, `flex`, выравнивание и `gap`

Суть урока: `display: flex` превращает блок в flex-контейнер с двумя осями (основной и поперечной); `flex-direction` и `flex-wrap` задают направление и перенос, `flex` (`grow shrink basis`) управляет гибкостью элементов, `justify-content` и `align-items` выравнивают их по осям, а `gap` задаёт отступы между элементами.

## 1. Flex-контейнер, оси и направление (00:30–04:47)

[+] Свойство `display: flex` делает элемент блочным flex-контейнером (во всю ширину), а `display: inline-flex` — строчно-блочным (ширина по контенту). Его **прямые дети** становятся flex-элементами.

[+] У контейнера две оси: **основная** (по умолчанию слева направо, `flex-direction: row`) и **поперечная** (перпендикулярна ей, сверху вниз). Смена `flex-direction: column` поворачивает основную ось вертикально, а поперечную — горизонтально.

[+] По умолчанию `flex-wrap: nowrap` пытается втиснуть все элементы в одну строку, сжимая их. Значение `wrap` разрешает перенос на следующие строки. Шорткат `flex-flow: row wrap;` задаёт оба свойства сразу.

<!-- demo-html:
<style>
  .f-box { width: 90px; padding: 10px; background: #fef3c7; border: 2px solid #b45309; text-align: center; font-weight: 700; }
  .f-wrap-demo { border: 2px dashed #94a3b8; padding: 8px; }
</style>
<div class="f-wrap-demo">
  <div class="f-box">1</div>
  <div class="f-box">2</div>
  <div class="f-box">3</div>
  <div class="f-box">4</div>
</div>
-->
```css
/* Разрешаем перенос элементов на новую строку и задаём отступ 8px */
.f-wrap-demo {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 8px;
}
```

## 2. Гибкость элементов: `flex-grow`, `flex-shrink`, `flex-basis` и `order` (04:48–09:40)

[+] Эти свойства применяются **к дочерним flex-элементам**:
- **`flex-grow`** (по умолчанию `0`): коэффициент растягивания. `1` заставляет элемент забрать оставшееся свободное место.
- **`flex-shrink`** (по умолчанию `1`): коэффициент сжатия при нехватке места. `0` запрещает сжимать элемент меньше его размера.
- **`flex-basis`** (по умолчанию `auto`): базовый размер вдоль основной оси до распределения места (приоритетнее `width` при `row` и `height` при `column`).

[+] Шорткат `flex` объединяет их: по умолчанию `flex: 0 1 auto;`. Частое `flex: 0 0 140px;` фиксирует ширину ровно `140px` (не растёт и не сжимается). А `order` (`-1` в начало, `1` в конец) меняет визуальный порядок, не меняя порядок клавиши `Tab`.

[!] Если длинный неразрывный текст или картинка распирают flex-элемент, добавьте ему `min-width: 0;` — это отменит дефолтный запрет сжатия меньше контента (`min-width: auto`).

<!-- demo-html:
<style>
  .grow-row { border: 2px solid #94a3b8; padding: 8px; background: #f8fafc; }
  .grow-side { padding: 8px; background: #e2e8f0; border: 1px solid #64748b; }
  .grow-main { padding: 8px; background: #dbeafe; border: 1px solid #2563eb; font-weight: 700; }
</style>
<div class="grow-row">
  <div class="grow-side">Меню (100px)</div>
  <div class="grow-main">Контент (flex-grow: 1)</div>
  <div class="grow-side">В конец?</div>
</div>
-->
```css
.grow-row {
  display: flex;
  gap: 8px;
}

/* Фиксированная ширина 100px: не растёт и не сжимается */
.grow-side {
  flex: 0 0 100px;
}

/* Забирает всё оставшееся место по основной оси */
.grow-main {
  flex-grow: 1;
  min-width: 0;
}
```

## 3. Выравнивание по осям: `justify-content`, `align-items` и `align-content` (09:41–14:58)

[+] **`justify-content`** выравнивает элементы по **основной** оси: `flex-start` (по умолчанию), `center`, `flex-end`, `space-between` (крайние по краям, равные зазоры между остальными), `space-around`, `space-evenly` (абсолютно равные зазоры везде).

[+] **`align-items`** выравнивает элементы по **поперечной** оси: `stretch` (по умолчанию растягивает на всю высоту строки), `flex-start` / `start`, `center`, `flex-end` / `end`, `baseline` (по линии первой строки текста).

[+] **`align-content`** распределяет **несколько рядов** вдоль поперечной оси (работает только при `flex-wrap: wrap` и наличии свободной высоты у контейнера). Для прижатия одного элемента к правому краю в строке удобно задать ему `margin-left: auto;`.

<!-- demo-html:
<style>
  .align-row { height: 95px; border: 2px solid #94a3b8; padding: 8px; background: #fff; }
  .a-item { padding: 8px 12px; background: #dcfce7; border: 1px solid #16a34a; font-weight: 700; }
</style>
<div class="align-row">
  <div class="a-item">Лево</div>
  <div class="a-item">Центр</div>
  <div class="a-item a-right">Вправо (margin-left: auto)</div>
</div>
-->
```css
/* Выравнивание по горизонтали (justify) и вертикальному центру (align) */
.align-row {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 8px;
}

/* Съедает всё свободное место слева, прижимая элемент к правому краю */
.a-right {
  margin-left: auto;
}
```

## 4. Отступы между элементами: `gap`, `row-gap` и `column-gap` (14:59–16:15)

[+] Свойство `gap` задаёт зазоры **только между** flex-элементами (не добавляя лишних отступов по краям контейнера). Это шорткат для двух свойств:
- **`row-gap`** — отступ между **рядами** (по вертикали).
- **`column-gap`** — отступ между **колонками** (по горизонтали).

```css
/* 12px между строками (row-gap) и 20px между колонками (column-gap) */
.cards-flex {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 20px;
}
```

## 3 главные ловушки урока (чек-лист для повторения)

1. Забывать, что `flex-direction: column` меняет оси местами: `justify-content` начинает двигать элементы **по вертикали**, а `align-items` — **по горизонтали**.

2. Путать `row-gap` и `column-gap` (а также их порядок в `gap: 12px 20px;`): `row-gap` — всегда между рядами (вертикальный зазор), `column-gap` — между колонками (горизонтальный).

3. Не добавлять `min-width: 0` длинному контенту во flex-элементе или злоупотреблять `order` на критичных кнопках/формах (порядок `Tab` остаётся как в HTML).

## Вопросы для закрепления

**1. Что произойдёт с работой `justify-content` и `align-items`, если переключить контейнер в `flex-direction: column`?**

<details>
<summary>Показать ответ</summary>

Оси поменяются местами: основная ось станет вертикальной, поэтому `justify-content` начнёт выравнивать элементы сверху вниз, а `align-items` (и `stretch`) — слева направо.

</details>

**2. В чём разница между `flex: 1;` (`1 1 0%`) и `flex: 0 0 200px;`?**

<details>
<summary>Показать ответ</summary>

`flex: 1` разрешает элементу и расти (`grow: 1`), и сжиматься (`shrink: 1`), распределяя пространство пропорционально. `flex: 0 0 200px` запрещает и растягиваться, и сжиматься — элемент будет строго `200px` по основной оси.

</details>

**3. Какое расстояние задаст `gap: 10px 24px;` между элементами по горизонтали и по вертикали при `flex-wrap: wrap`?**

<details>
<summary>Показать ответ</summary>

Первое значение (`10px`) — это `row-gap` (расстояние между рядами по вертикали), второе (`24px`) — `column-gap` (расстояние между элементами/колонками по горизонтали).

</details>

## Задачи

**Задача 1. Шапка сайта (`logo` слева, `menu` по центру, `login` справа)**

Оформи шапку `.site-header`:
1) Включи `display: flex`, выровняй все элементы по вертикальному центру (`align-items: center`) и распредели по горизонтали с помощью `justify-content: space-between;`.
2) Внутри списка `.nav-list` поставь ссылки в один ряд через `display: flex` с зазором `16px` (`gap`).

```html
<header class="site-header">
  <a class="logo" href="#">MySite</a>
  <nav class="nav-list">
    <a href="#">Курсы</a>
    <a href="#">Блог</a>
    <a href="#">О нас</a>
  </nav>
  <button class="login-btn" type="button">Войти</button>
</header>
```

<details>
<summary>Подсказка и решение</summary>

<!-- demo-html:
<style>
  .site-header { padding: 10px 14px; background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 6px; }
  .logo { font-weight: 900; text-decoration: none; color: #0f172a; }
  .nav-list a { text-decoration: none; color: #2563eb; }
  .login-btn { padding: 6px 12px; font: inherit; cursor: pointer; }
</style>
<header class="site-header">
  <a class="logo" href="#">MySite</a>
  <nav class="nav-list">
    <a href="#">Курсы</a>
    <a href="#">Блог</a>
    <a href="#">О нас</a>
  </nav>
  <button class="login-btn" type="button">Войти</button>
</header>
-->
```css
/* Разносим логотип, меню и кнопку по краям и выравниваем по вертикальному центру */
.site-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

/* Ставим пункты меню в ряд с одинаковым зазором без лишних margin */
.nav-list {
  display: flex;
  gap: 16px;
}
```

</details>

**Задача 2. Сетка тегов с переносом и отступами**

У тебя есть контейнер `.tags-wrap` шириной `240px` с тегами `.tag`. Сейчас все теги втиснулись в одну строку и вылезли за рамки:
1) Включи `display: flex` и разреши перенос строк (`flex-wrap: wrap`).
2) Задай вертикальный зазор между рядами `8px` и горизонтальный между тегами `12px` одним свойством `gap`.
3) Поставь `.tag-featured` самым первым визуально с помощью `order: -1`.

```html
<div class="tags-wrap">
  <span class="tag">HTML</span>
  <span class="tag">CSS</span>
  <span class="tag tag-featured">Flexbox</span>
  <span class="tag">JavaScript</span>
</div>
```

<details>
<summary>Подсказка и решение</summary>

<!-- demo-html:
<style>
  .tags-wrap { width: 240px; padding: 10px; border: 2px solid #94a3b8; background: #fff; }
  .tag { padding: 4px 10px; background: #e2e8f0; border-radius: 4px; font-size: 13px; }
  .tag-featured { background: #fde68a; font-weight: 700; }
</style>
<div class="tags-wrap">
  <span class="tag">HTML</span>
  <span class="tag">CSS</span>
  <span class="tag tag-featured">Flexbox</span>
  <span class="tag">JavaScript</span>
</div>
-->
```css
/* Перенос строк + row-gap 8px и column-gap 12px */
.tags-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 12px;
}

/* -1 ставит элемент перед остальными (у них order по умолчанию 0) */
.tag-featured {
  order: -1;
}
```

</details>

**Задача 3. Фиксированный сайдбар и резиновый контент без сжатия**

Для раскладки `.layout` ниже:
1) Включи `display: flex` с `gap: 12px` на `.layout`.
2) Сделай `.sidebar` строго `120px` в ширину, чтобы он не рос и не сжимался (`flex: 0 0 120px`).
3) Разреши `.main-content` занимать всё оставшееся место (`flex: 1;`) и защити от распирания длинными словами (`min-width: 0;`).

```html
<div class="layout">
  <aside class="sidebar">Сайдбар 120px</aside>
  <main class="main-content">Основной резиновый контент</main>
</div>
```

<details>
<summary>Подсказка и решение</summary>

<!-- demo-html:
<style>
  .layout { border: 2px solid #94a3b8; padding: 8px; background: #f8fafc; }
  .sidebar { background: #fef3c7; padding: 10px; font-size: 13px; }
  .main-content { background: #dbeafe; padding: 10px; font-size: 13px; }
</style>
<div class="layout">
  <aside class="sidebar">Сайдбар 120px</aside>
  <main class="main-content">Основной резиновый контент</main>
</div>
-->
```css
.layout {
  display: flex;
  gap: 12px;
}

/* Не растёт, не сжимается, база ровно 120px */
.sidebar {
  flex: 0 0 120px;
}

/* Забирает всё свободное пространство и умеет сжиматься при узком экране */
.main-content {
  flex: 1;
  min-width: 0;
}
```

</details>
