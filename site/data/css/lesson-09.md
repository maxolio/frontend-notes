# Урок 09. Рамки (`border`), обводки (`outline`), `border-radius`, тени и `filter`

Суть урока: `border` входит в блочную модель и может задаваться разным сторонам по отдельности, `outline` рисуется поверх элемента без влияния на размеры (включая `outline-offset` и скругления `border-radius`), `box-shadow` даёт тень прямоугольному блоку, а `filter: drop-shadow()` — точно по контуру прозрачного PNG/SVG.

## 1. Рамка `border` и её под-свойства (00:18–05:04)

[+] Шорткат `border: 4px solid skyblue;` объединяет толщину (`border-width`), стиль линии (`border-style`) и цвет (`border-color`) в любом порядке. Чтобы задать рамку только с одной стороны или оси, используют `border-top`, `border-right`, `border-bottom`, `border-left`, а также `border-block` (верх/низ) и `border-inline` (право/лево).

[+] Популярные стили `border-style`: `none` (по умолчанию), `solid` (сплошная), `dashed` (пунктир), `dotted` (точки), `double` (двойная). Для `border-width` и `border-color` можно задавать от 1 до 4 значений по часовой стрелке.

[!] В стандартном `content-box` толщина `border` прибавляется к `width` и `height`, а при `box-sizing: border-box` входит внутрь указанных размеров.

<!-- demo-html:
<style>
  .b-row { display: flex; gap: 10px; flex-wrap: wrap; }
  .b-card { width: 120px; padding: 10px; background: #f8fafc; font-size: 13px; text-align: center; }
</style>
<div class="b-row">
  <div class="b-card b-solid">solid</div>
  <div class="b-card b-dashed">dashed + dotted</div>
  <div class="b-card b-sides">top + inline</div>
</div>
-->
```css
/* Обычная сплошная рамка со всех 4 сторон */
.b-solid {
  border: 4px solid #0284c7;
}

/* Разные стили и цвета по сторонам: верх/низ — пунктир, бока — точки */
.b-dashed {
  border-width: 4px;
  border-style: dashed dotted;
  border-color: #b45309 #16a34a;
}

/* Рамка только сверху и по бокам (снизу границы нет) */
.b-sides {
  border-top: 4px solid #dc2626;
  border-inline: 4px solid #334155;
}
```

## 2. Обводка `outline` и `border-radius` (05:05–07:59)

[+] `outline` синтаксически похож на `border` (`2px solid orange`), но **не влияет на размеры элемента** и не сдвигает соседей. Обводка всегда рисуется сразу вокруг всех 4 сторон, зато имеет свойство `outline-offset` (положительное отодвигает обводку наружу, отрицательное — внутрь).

[!] Не отключайте `outline: none` без замены на кнопках и ссылках — это ломает видимость фокуса при навигации с клавиатуры (`Tab`). Сегодня `outline` во всех современных браузерах повторяет скругления `border-radius`.

[+] `border-radius` скругляет углы (`12px`, `50%` для идеального круга у квадратного блока, либо 4 значения от верхнего левого по часовой стрелке). Если дочерняя картинка торчит острыми углами из скруглённой карточки, родителю добавляют `overflow: hidden`.

<!-- demo-html:
<style>
  .o-row { display: flex; gap: 22px; align-items: center; padding: 10px; }
  .o-box { padding: 10px 14px; background: #fef3c7; font-size: 13px; }
</style>
<div class="o-row">
  <div class="o-box o-pill">border-radius + outline-offset</div>
  <div class="o-box o-circle">50%</div>
</div>
-->
```css
/* Скругление + внешняя обводка с зазором 4px от края кнопки */
.o-pill {
  border-radius: 12px;
  outline: 2px solid #d97706;
  outline-offset: 4px;
}

/* 50% превращает квадрат (64x64) в идеальный круг */
.o-circle {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  outline: 3px dashed #2563eb;
  outline-offset: -6px;
}
```

## 3. Тени `box-shadow` (08:00–09:51)

[+] `box-shadow` принимает смещение по `X`, смещение по `Y`, радиус размытия (`blur >= 0`), радиус распространения (`spread`, может быть отрицательным) и цвет. Ключевое слово `inset` переносит тень внутрь элемента. Несколько теней перечисляются через **запятую**.

<!-- demo-html:
<style>
  .s-row { display: flex; gap: 18px; padding: 12px; }
  .s-card { width: 140px; padding: 14px; background: #fff; border-radius: 8px; font-size: 13px; text-align: center; }
</style>
<div class="s-row">
  <div class="s-card s-soft">Мягкая тень</div>
  <div class="s-card s-inset">Внутренняя inset</div>
</div>
-->
```css
/* X=0, Y=6px, размытие 16px, распространение -2px, полупрозрачный цвет */
.s-soft {
  box-shadow: 0 6px 16px -2px rgb(15 23 42 / 0.25);
}

/* inset рисует тень внутри блока (удобно для вдавленных кнопок и полей) */
.s-inset {
  box-shadow: inset 0 2px 8px rgb(15 23 42 / 0.28);
}
```

## 4. Фильтры `filter` и `drop-shadow` против `box-shadow` (09:52–14:04)

[+] Свойство `filter` накладывает визуальные эффекты: `blur(3px)`, `brightness(1.3)`, `contrast(150%)`, `grayscale(100%)`, `hue-rotate(90deg)`, `invert(100%)`, `saturate(2)`, `sepia(100%)`. Несколько фильтров перечисляются **через пробел** (не через запятую!).

[!] Главное отличие `filter: drop-shadow(x y blur color)` от `box-shadow`: `box-shadow` всегда рисует тень прямоугольнику самого элемента, а `drop-shadow()` обводит **реальный контур** прозрачного PNG или SVG (при этом не поддерживает `spread` и `inset`).

<!-- demo-html:
<style>
  .f-row { display: flex; gap: 22px; align-items: center; padding: 10px; }
</style>
<div class="f-row">
  <svg class="f-box-shadow" width="68" height="68" viewBox="0 0 64 64">
    <polygon points="32,4 40,24 62,24 44,38 50,60 32,47 14,60 20,38 2,24 24,24" fill="#f59e0b" />
  </svg>
  <svg class="f-drop-shadow" width="68" height="68" viewBox="0 0 64 64">
    <polygon points="32,4 40,24 62,24 44,38 50,60 32,47 14,60 20,38 2,24 24,24" fill="#f59e0b" />
  </svg>
</div>
-->
```css
/* box-shadow обводит прямоугольную коробку вокруг SVG, а не саму звезду */
.f-box-shadow {
  box-shadow: 0 6px 10px rgb(15 23 42 / 0.4);
}

/* drop-shadow() повторяет контур звезды, а фильтры через пробел усиливают цвет */
.f-drop-shadow {
  filter: drop-shadow(0 6px 8px rgb(15 23 42 / 0.45)) saturate(1.4);
}
```

## 3 главные ловушки урока (чек-лист для повторения)

1. Отключать обводку фокуса через `outline: none;` без замены — пользователи с клавиатуры перестают видеть, на какой кнопке или ссылке находится фокус.

2. Перечислять несколько функций в `filter` через запятую (`filter: blur(2px), grayscale(1);`) — по стандарту CSS они разделяются **пробелом**, запятая делает правило невалидным.

3. Ставить `box-shadow` на PNG/SVG с прозрачным фоном вместо `filter: drop-shadow(...)` — тень ляжет вокруг невидимого прямоугольника картинки, а не по контуру объекта.

## Вопросы для закрепления

**1. Чем `outline` отличается от `border` в плане блочной модели и возможности задать линию только снизу?**

<details>
<summary>Показать ответ</summary>

`border` входит в блочную модель (в `content-box` увеличивает размеры и сдвигает соседей) и может задаваться отдельно по сторонам (`border-bottom`). `outline` не влияет на размеры и раскладку, но рисуется строго по всем 4 сторонам сразу (зато поддерживает `outline-offset`).

</details>

**2. Почему `filter: blur(4px), contrast(150%);` не сработает в браузере?**

<details>
<summary>Показать ответ</summary>

Несколько функций в `filter` перечисляются через **пробел**, а не через запятую: правильно писать `filter: blur(4px) contrast(150%);`.

</details>

**3. Когда нужно использовать `filter: drop-shadow(...)` вместо `box-shadow`, и каких параметров нет в `drop-shadow`?**

<details>
<summary>Показать ответ</summary>

`drop-shadow()` нужен для PNG и SVG с прозрачным фоном, чтобы тень повторяла контур рисунка, а не прямоугольник элемента. В `drop-shadow` нельзя указать 4-е число (радиус распространения `spread`) и ключевое слово `inset`.

</details>

## Задачи

**Задача 1. Кнопка-пилюля с `border-radius` и отступающей обводкой `outline-offset`**

Оформи кнопку `.pill-btn`:
1) Добавь рамку `2px solid #2563eb` и максимальное скругление углов (`9999px`).
2) Добавь внешнюю обводку `outline: 2px dashed #93c5fd;` и отодвинь её от края кнопки наружу на `4px` через `outline-offset`.

```html
<button class="pill-btn" type="button">Оформить подписку</button>
```

<details>
<summary>Подсказка и решение</summary>

<!-- demo-html:
<style>
  .pill-btn { padding: 10px 20px; background: #eff6ff; color: #1e3a8a; font: inherit; font-weight: 700; cursor: pointer; }
</style>
<div style="padding:10px;"><button class="pill-btn" type="button">Оформить подписку</button></div>
-->
```css
/* Большой border-radius делает аккуратную «пилюлю» при любой ширине текста */
.pill-btn {
  border: 2px solid #2563eb;
  border-radius: 9999px;
  outline: 2px dashed #93c5fd;
  outline-offset: 4px;
}
```

</details>

**Задача 2. Двойная тень карточки (внешняя + внутренняя подсветка)**

Для карточки `.elevated-card` ниже задай скругление `12px` и две тени через запятую в одном свойстве `box-shadow`:
1) Внешнюю тень: `0 10px 20px -4px rgb(15 23 42 / 0.25)`.
2) Внутреннюю тонкую подсветку сверху: `inset 0 2px 0 rgb(255 255 255 / 0.8)`.

```html
<div class="elevated-card">Карточка с двойной тенью</div>
```

<details>
<summary>Подсказка и решение</summary>

<!-- demo-html:
<style>
  .elevated-card { width: 220px; padding: 16px; background: #e2e8f0; font-weight: 700; }
</style>
<div style="padding:14px;"><div class="elevated-card">Карточка с двойной тенью</div></div>
-->
```css
/* Несколько теней перечисляем через запятую в одном свойстве */
.elevated-card {
  border-radius: 12px;
  box-shadow:
    0 10px 20px -4px rgb(15 23 42 / 0.25),
    inset 0 2px 0 rgb(255 255 255 / 0.8);
}
```

</details>

**Задача 3. Фильтры через пробел и контурная тень для SVG**

К иконке `.badge-icon` примени в одном свойстве `filter` сразу два фильтра: контурную тень `drop-shadow(0 4px 6px rgb(0 0 0 / 0.35))` и обесцвечивание `grayscale(80%)`.

```html
<svg class="badge-icon" width="64" height="64" viewBox="0 0 64 64">
  <polygon points="32,4 40,24 62,24 44,38 50,60 32,47 14,60 20,38 2,24 24,24" fill="#ef4444" />
</svg>
```

<details>
<summary>Подсказка и решение</summary>

<!-- demo-html:
<div style="padding:10px;">
  <svg class="badge-icon" width="64" height="64" viewBox="0 0 64 64">
    <polygon points="32,4 40,24 62,24 44,38 50,60 32,47 14,60 20,38 2,24 24,24" fill="#ef4444" />
  </svg>
</div>
-->
```css
/* Несколько функций filter разделяются ПРОБЕЛОМ, а не запятой */
.badge-icon {
  filter: drop-shadow(0 4px 6px rgb(0 0 0 / 0.35)) grayscale(80%);
}
```

</details>
