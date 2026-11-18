# Урок 15. CSS Grid Layout: сетка, `fr`, `repeat()`, `grid-template-areas` и линии

Суть урока: `display: grid` создаёт двумерную сетку с рядами и колонками; `grid-template-columns` с единицей доли `fr`, `repeat()` и `minmax()` задаёт структуру колонок, `grid-template-areas` рисует карту зон словами, `place-items` центрирует содержимое одной строкой, а `grid-column` / `grid-row` растягивают ячейки по линиям.

## 1. Термины Grid, `grid-template-columns`, `repeat()` и `fr` (00:10–06:47)

[+] Grid не заменяет Flexbox, а дополняет его: Flexbox идеален для одного ряда или колонки, а Grid — для **двумерных сеток** (одновременно строки и колонки). В DevTools сетку удобно подсвечивать во вкладке `Layout` -> `Grid overlays`.

[+] Основные понятия: **грид-линии** (вертикальные и горизонтальные разделители с номерами `1, 2, 3...`), **треки** (полосы между двумя соседними линиями) и **области** (прямоугольники из 4 линий).

[+] Единица **`fr`** (*fraction*) делит оставшееся свободное пространство на доли. Функция `repeat(3, 1fr)` заменяет `1fr 1fr 1fr`. Под капотом `1fr` — это `minmax(auto, 1fr)`, поэтому чтобы длинное слово не распирало колонку, пишут `minmax(0, 1fr)`. Для адаптивной сетки без медиазапросов используют `repeat(auto-fit, minmax(120px, 1fr))`.

<!-- demo-html:
<style>
  .g-card { padding: 10px; background: #fef3c7; border: 2px solid #b45309; text-align: center; font-weight: 700; font-size: 13px; }
</style>
<div class="g-grid">
  <div class="g-card">1fr</div>
  <div class="g-card">2fr (вдвое шире)</div>
  <div class="g-card">80px</div>
  <div class="g-card">Строка 2</div>
  <div class="g-card">Строка 2</div>
  <div class="g-card">Строка 2</div>
</div>
-->
```css
/* Резервируем 80px справа, остаток делим на 3 доли (1fr и 2fr) */
.g-grid {
  display: grid;
  grid-template-columns: 1fr 2fr 80px;
  grid-auto-rows: 52px;
  gap: 8px;
}
```

## 2. Карта сетки `grid-template-areas` и `gap` (06:48–07:56)

[+] `grid-template-areas` позволяет буквально «нарисовать» макет словами в кавычках (каждая строка кавычек — один ряд сетки, точка `.` — пустая ячейка). Затем дочерним элементам назначают `grid-area: имя;` (без кавычек).

[!] Все строки в `grid-template-areas` должны содержать **одинаковое число ячеек**, а каждая область должна быть строго **прямоугольной** (Г-образная область сделает правило невалидным).

<!-- demo-html:
<style>
  .area-box { padding: 8px; font-weight: 700; font-size: 13px; border-radius: 4px; }
  .a-head { background: #dbeafe; }
  .a-side { background: #fef3c7; }
  .a-main { background: #dcfce7; }
  .a-foot { background: #e2e8f0; }
</style>
<div class="page-grid">
  <header class="area-box a-head">header</header>
  <aside class="area-box a-side">aside</aside>
  <main class="area-box a-main">main</main>
  <footer class="area-box a-foot">footer</footer>
</div>
-->
```css
/* Визуальная карта: шапка и футер на 2 колонки, посередине aside и main */
.page-grid {
  display: grid;
  grid-template-columns: 110px 1fr;
  grid-template-areas:
    "head head"
    "side main"
    "foot foot";
  gap: 8px;
}

.a-head { grid-area: head; }
.a-side { grid-area: side; }
.a-main { grid-area: main; }
.a-foot { grid-area: foot; }
```

## 3. Выравнивание `place-items` и позиционирование по линиям (07:57–13:55)

[+] В Grid работают `justify-content`, `align-items` и шорткат **`place-items: align justify;`**. Запись `place-items: center;` центрирует содержимое внутри ячеек по вертикали и горизонтали одной строкой.

[+] Для растяжения ячейки на несколько колонок или строк используют `grid-column` и `grid-row`: можно указать номера линий через слеш (`1 / 3`), ключевое слово `span 2` (занять 2 колонки) или универсальное **`grid-column: 1 / -1;`** (от первой линии до самой последней, независимо от числа колонок).

<!-- demo-html:
<style>
  .line-cell { padding: 10px; background: #e2e8f0; border: 1px solid #64748b; font-weight: 700; font-size: 13px; }
  .line-banner { background: #fde68a; border-color: #b45309; }
  .line-big { background: #bfdbfe; border-color: #2563eb; }
</style>
<div class="line-grid">
  <div class="line-cell line-banner">1 / -1 (на всю ширину)</div>
  <div class="line-cell line-big">span 2 (2 колонки)</div>
  <div class="line-cell">3</div>
  <div class="line-cell">4</div>
</div>
-->
```css
.line-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

/* Растягивает элемент от 1-й линии до самой последней (-1) */
.line-banner {
  grid-column: 1 / -1;
}

/* Элемент автоматически занимает 2 колонки подряд */
.line-big {
  grid-column: span 2;
}
```

## 3 главные ловушки урока (чек-лист для повторения)

1. Делать Г-образную зону или разное количество ячеек в строках `grid-template-areas` — браузер отбросит весь шаблон сетки целиком.

2. Забывать, что `1fr` — это `minmax(auto, 1fr)`: длинное неразрывное слово разопрёт колонку (чтобы колонки всегда делились строго поровну, пишите `minmax(0, 1fr)`).

3. Путать порядок в `grid-column: 1 / -1;` (писать `-1 / 1`) или забывать, что в `place-items: vertical horizontal;` первым идёт вертикальное выравнивание (`align-items`).

## Вопросы для закрепления

**1. В чём разница между `grid-template-columns: repeat(3, 1fr);` и `repeat(3, minmax(0, 1fr))`?**

<details>
<summary>Показать ответ</summary>

Обычный `1fr` работает как `minmax(auto, 1fr)`: если внутри ячейки окажется длинное неразрывное слово или широкий блок, колонка расширится под его минимальную ширину, сломав пропорции. `minmax(0, 1fr)` разрешает колонке сжиматься вплоть до `0`, строго удерживая равные доли.

</details>

**2. Что делает запись `grid-column: 1 / -1;` и почему она лучше, чем `grid-column: 1 / 4;`?**

<details>
<summary>Показать ответ</summary>

`1` — это первая вертикальная грид-линия слева, а `-1` — всегда самая последняя линия справа в явной сетке. Запись `1 / -1` растянет элемент на всю ширину сетки, даже если позже изменится число колонок (например, с 3 на 4 на широком экране).

</details>

**3. Почему браузер может проигнорировать весь блок `grid-template-areas`?**

<details>
<summary>Показать ответ</summary>

Если в разных строках шаблона указано разное количество ячеек, или если какая-либо именованная область не образует замкнутый прямоугольник (например, имеет форму буквы «Г» или «Т»).

</details>

## Задачи

**Задача 1. Адаптивная сетка карточек без медиазапросов**

Создай адаптивную сетку `.cards-grid` с помощью `display: grid`, чтобы:
1) Колонки автоматически подстраивались под ширину контейнера с минимальной шириной карточки `130px` и максимальной `1fr` (`repeat(auto-fit, minmax(130px, 1fr))`).
2) Зазор между карточками со всех сторон был `10px` (`gap`).

```html
<div class="cards-grid">
  <div class="card-item">Карточка 1</div>
  <div class="card-item">Карточка 2</div>
  <div class="card-item">Карточка 3</div>
  <div class="card-item">Карточка 4</div>
</div>
```

<details>
<summary>Подсказка и решение</summary>

<!-- demo-html:
<style>
  .card-item { padding: 14px; background: #fef3c7; border: 2px solid #b45309; border-radius: 6px; text-align: center; font-weight: 700; }
</style>
<div class="cards-grid">
  <div class="card-item">Карточка 1</div>
  <div class="card-item">Карточка 2</div>
  <div class="card-item">Карточка 3</div>
  <div class="card-item">Карточка 4</div>
</div>
-->
```css
/* Карточки не уже 130px и сами переносятся на новую строку при нехватке места */
.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  gap: 10px;
}
```

</details>

**Задача 2. Идеальное центрирование одной строкой через `place-items`**

Внутри блока `.hero-banner` высотой `130px` лежит надпись `.hero-badge`. Сделай `.hero-banner` грид-контейнером и отцентрируй `.hero-badge` ровно по центру по вертикали и горизонтали одной строкой (`place-items`).

```html
<div class="hero-banner">
  <span class="hero-badge">Точно по центру</span>
</div>
```

<details>
<summary>Подсказка и решение</summary>

<!-- demo-html:
<style>
  .hero-banner { height: 130px; background: #dbeafe; border: 2px solid #2563eb; border-radius: 8px; }
  .hero-badge { padding: 8px 14px; background: #1e3a8a; color: #fff; border-radius: 6px; font-weight: 700; }
</style>
<div class="hero-banner">
  <span class="hero-badge">Точно по центру</span>
</div>
-->
```css
/* place-items: center ставит оба свойства (align-items и justify-items) в center */
.hero-banner {
  display: grid;
  place-items: center;
}
```

</details>

**Задача 3. Сетка из 3 колонок с шапкой во всю ширину (`1 / -1`) и выделенной карточкой**

Для `.catalog` ниже задай `display: grid` с 3 равными колонками (`repeat(3, minmax(0, 1fr))`) и `gap: 8px;`:
1) Сделай `.catalog-head` во всю ширину сетки (`1 / -1`) и поставь первым (`order: -1`).
2) Сделай `.item-wide` шириной в 2 колонки с помощью `span 2`.

```html
<div class="catalog">
  <div class="catalog-item item-wide">Широкая (2 колонки)</div>
  <div class="catalog-item">Обычная</div>
  <div class="catalog-head">Заголовок каталога</div>
</div>
```

<details>
<summary>Подсказка и решение</summary>

<!-- demo-html:
<style>
  .catalog-item, .catalog-head { padding: 10px; border-radius: 6px; font-weight: 700; font-size: 13px; text-align: center; }
  .catalog-head { background: #0f172a; color: #fff; }
  .catalog-item { background: #e2e8f0; border: 1px solid #64748b; }
  .item-wide { background: #dcfce7; border-color: #16a34a; }
</style>
<div class="catalog">
  <div class="catalog-item item-wide">Широкая (2 колонки)</div>
  <div class="catalog-item">Обычная</div>
  <div class="catalog-head">Заголовок каталога</div>
</div>
-->
```css
/* 3 равные колонки, устойчивые к длинному тексту */
.catalog {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

/* Растягиваем на все колонки и переносим визуально в самое начало */
.catalog-head {
  grid-column: 1 / -1;
  order: -1;
}

/* Объединяем две соседние колонки */
.item-wide {
  grid-column: span 2;
}
```

</details>
