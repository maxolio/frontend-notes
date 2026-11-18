# Урок 23. Математические функции CSS: `calc()`, `min()`, `max()` и `clamp()`

Суть урока: `calc()` смешивает разные единицы измерения (`100vh - 50px`, `100% / 3`), `min()` и `max()` выбирают меньшее или большее из выражений без медиазапросов, а `clamp(min, preferred, max)` задаёт плавно меняющийся размер (для контейнера или шрифта) в строгих границах.

## 1. Функция `calc()` и правила вычислений (00:14–05:37)

[+] `calc()` позволяет выполнять `+`, `-`, `*`, `/` и группировать операции круглыми скобками прямо в значениях CSS-свойств (включая `var()`). В отличие от фиксированных `33.33%`, `calc(100% / 3)` даёт точную треть ширины.

[!] Три строгих правила синтаксиса `calc()`:
1) **Пробелы вокруг `+` и `-` обязательны** (`calc(100% - 20px)` — верно, `calc(100%-20px)` браузер отбросит как ошибку).
2) Хотя бы у одного числа должна быть единица измерения (кроме безразмерных свойств вроде `line-height`, `opacity`, `z-index`).
3) **Справа от `/` (и хотя бы с одной стороны `*`) должно быть голое число без единиц** (`100% / 3` можно, `100% / 20px` — нельзя).

<!-- demo-html:
<style>
  .calc-row { display: flex; gap: 6px; margin-bottom: 10px; }
  .calc-col { background: #dbeafe; border: 1px solid #2563eb; padding: 8px 4px; text-align: center; font-size: 12px; font-weight: 700; box-sizing: border-box; }
  .calc-hero { background: #fef3c7; border: 2px solid #b45309; padding: 8px 12px; font-size: 13px; font-weight: 700; }
</style>
<div class="calc-row">
  <div class="calc-col">1/3 минус gap</div>
  <div class="calc-col">1/3 минус gap</div>
  <div class="calc-col">1/3 минус gap</div>
</div>
<div class="calc-hero">Контейнер с max-width: calc(220px + 15px * 2) и padding-inline: 15px</div>
-->
```css
/* Три точные колонки с учётом двух зазоров gap по 6px (суммарно 12px) */
.calc-col {
  width: calc((100% - 12px) / 3);
}

/* В border-box добавляем удвоенный padding к нужной ширине контента */
.calc-hero {
  box-sizing: border-box;
  max-width: calc(220px + 15px * 2);
  padding-inline: 15px;
  margin-inline: auto;
}
```

## 2. Функции `min()` и `max()` (05:38–07:38)

[+] `min(a, b, ...)` выбирает **наименьшее** значение из списка (работает как потолок `max-width`), а `max(a, b, ...)` — **наибольшее** (работает как пол `min-width`). Внутри скобок можно сразу писать математику (`+`, `-`, `*`, `/`) без вложенного `calc()`.

<!-- demo-html:
<style>
  .mm-box { padding: 10px; margin-bottom: 8px; font-size: 13px; font-weight: 700; box-sizing: border-box; }
  .mm-min { background: #dcfce7; border: 2px solid #16a34a; }
  .mm-max { background: #e0e7ff; border: 2px solid #4338ca; }
</style>
<div class="mm-box mm-min">min(100% - 24px, 280px) — не шире 280px, но сжимается на узком экране</div>
<div class="mm-box mm-max">max(180px, 50%) — минимум 180px или половина родителя</div>
-->
```css
/* Удобный контейнер в одну строку: на узком экране 100% - 24px, на широком 280px */
.mm-min {
  width: min(100% - 24px, 280px);
  margin-inline: auto;
}

/* Никогда не станет уже 180px, но на широком экране займёт 50% */
.mm-max {
  width: max(180px, 50%);
}
```

## 3. Диапазон `clamp(min, preferred, max)` (07:39–09:48)

[+] `clamp()` принимает ровно **3 аргумента** в строгом порядке: минимум, желаемое («резиновое») значение и максимум. Пока желаемое значение лежит между минимумом и максимумом — работает оно, иначе включается соответствующая граница.

[!] Для «резинового» заголовка (`font-size`) в средний аргумент лучше прибавлять `rem` к `vw` (например, `clamp(1.25rem, 1rem + 2vw, 2.5rem)`), чтобы текст оставался доступным и увеличивался при смене масштаба шрифта в настройках браузера.

<!-- demo-html:
<style>
  .clamp-card { background: #fffbeb; border: 2px solid #d97706; padding: 10px; border-radius: 6px; }
  .clamp-title { margin: 0 0 6px; font-weight: 900; }
</style>
<div class="clamp-card">
  <h3 class="clamp-title">Резиновый заголовок clamp()</h3>
  <p style="margin:0;font-size:13px;">Ширина карточки тоже тянется через clamp(180px, 70%, 340px).</p>
</div>
-->
```css
/* Плавная ширина карточки в коридоре от 180px до 340px */
.clamp-card {
  width: clamp(180px, 70%, 340px);
}

/* От 18px до 32px, с поддержкой пользовательского масштаба за счёт rem */
.clamp-title {
  font-size: clamp(1.125rem, 0.9rem + 2vw, 2rem);
}
```

## 3 главные ловушки урока (чек-лист для повторения)

1. Писать `calc(100%-20px)` без пробелов вокруг `-` или `+` — браузер приклеит минус к `20px` и отбросит всё правило.

2. Делить или умножать длину на длину в `calc()` (`calc(100% / 20px)` или `calc(10px * 20px)`) — справа от `/` (и хотя бы с одной стороны `*`) должно быть голое число без единиц.

3. Ставить чистое `5vw` в середину `clamp()` для `font-size` без `rem` — такой шрифт перестаёт реагировать на пользовательское увеличение текста в настройках браузера.

## Вопросы для закрепления

**1. Почему `calc(100% - 50px)` работает, а `calc(100%-50px)` и `calc(100vw / 10px)` браузер отбросит как ошибку?**

<details>
<summary>Показать ответ</summary>

1) В `calc(100%-50px)` нет пробелов вокруг оператора `-`, поэтому парсер считает `-50px` отрицательным значением без знака операции. 2) В `calc(100vw / 10px)` деление происходит на величину с единицей (`px`), тогда как делитель обязан быть простым числом без единиц.

</details>

**2. Как в одну строку заменить стандартный `.container { width: 100%; max-width: 1170px; padding-inline: 16px; margin-inline: auto; }` с помощью `min()`?**

<details>
<summary>Показать ответ</summary>

Можно написать `width: min(100% - 32px, 1170px); margin-inline: auto;` — на широком экране блок ограничится шириной `1170px` ровно под контент, а на узком автоматически оставит по `16px` воздуха слева и справа!

</details>

**3. Что вернёт `clamp(200px, 50%, 400px)` внутри родителя шириной `300px` и родителя шириной `1000px`?**

<details>
<summary>Показать ответ</summary>

При родителе `300px`: желаемое `50%` равно `150px`, что меньше минимума `200px` -> вернётся граница **`200px`**. При родителе `1000px`: `50%` равно `500px`, что больше максимума `400px` -> вернётся граница **`400px`**.

</details>

## Задачи

**Задача 1. Секция на весь экран под фиксированной шапкой**

На странице есть фиксированная шапка высотой `--headerHeight: 56px;`. Сделай так, чтобы минимальная высота первой секции `.hero` занимала ровно оставшуюся часть экрана (`100vh` минус высота шапки), используя `calc()` и переменную `--headerHeight`.

```html
<section class="hero">Первый экран под шапкой</section>
```

<details>
<summary>Подсказка и решение</summary>

<!-- demo-html:
<style>
  .hero { background: #dbeafe; border: 2px solid #2563eb; padding: 14px; font-weight: 700; }
</style>
<section class="hero">Первый экран под шапкой (min-height через calc)</section>
-->
```css
:root {
  --headerHeight: 56px;
}

/* Не забываем пробелы вокруг знака минус внутри calc() */
.hero {
  min-height: calc(100vh - var(--headerHeight));
}
```

</details>

**Задача 2. Гибкий контейнер через `min()` без `padding`**

Сделай блок `.wrapper` с горизонтальным центрированием (`margin-inline: auto;`), ширина которого через `min()` равна `600px` на широком экране, но на узком экране автоматически сжимается до `100% - 32px` (оставляя по `16px` от краёв).

```html
<div class="wrapper">Адаптивный блок через min()</div>
```

<details>
<summary>Подсказка и решение</summary>

<!-- demo-html:
<style>
  .wrapper { background: #dcfce7; border: 2px solid #16a34a; padding: 12px; font-weight: 700; text-align: center; }
</style>
<div class="wrapper">Адаптивный блок через min()</div>
-->
```css
/* Внутри min() математика 100% - 32px работает без обёртки calc() */
.wrapper {
  width: min(100% - 32px, 600px);
  margin-inline: auto;
}
```

</details>

**Задача 3. Плавная типографика `clamp()` и отступы без медиазапросов**

Для карточки `.promo`:
1) Задай внутренний отступ `padding` через `clamp(12px, 3vw, 28px)`.
2) Для заголовка `.promo-title` задай размер шрифта от `1.25rem` (`20px`) до `2.25rem` (`36px`) с желаемым значением `1rem + 2vw` через `clamp()`.

```html
<div class="promo">
  <h3 class="promo-title">Заголовок без @media</h3>
  <p>Отступы и размер шрифта плавно меняются при ресайзе.</p>
</div>
```

<details>
<summary>Подсказка и решение</summary>

<!-- demo-html:
<style>
  .promo { background: #fef3c7; border: 2px solid #b45309; border-radius: 8px; }
  .promo-title { margin: 0 0 6px; }
  .promo p { margin: 0; font-size: 13px; }
</style>
<div class="promo">
  <h3 class="promo-title">Заголовок без @media</h3>
  <p>Отступы и размер шрифта плавно меняются при ресайзе.</p>
</div>
-->
```css
/* Внутренние отступы карточки плавно растут от 12px до 28px */
.promo {
  padding: clamp(12px, 3vw, 28px);
}

/* Шрифт в коридоре 1.25rem..2.25rem, сохраняет масштабирование от настроек ОС */
.promo-title {
  font-size: clamp(1.25rem, 1rem + 2vw, 2.25rem);
}
```

</details>
