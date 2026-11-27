# Урок 04. Внутренние и внешние отступы (`padding`, `margin`) и схлопывание

Суть урока:

- **`padding` (внутренний отступ):** отталкивает контент внутрь от `border`, окрашивается фоном (`background`), входит в кликабельную область и **не может быть отрицательным**.
- **`margin` (внешний отступ):** толкает соседние элементы снаружи от `border`, всегда прозрачный, может быть отрицательным и `auto`.
- **Схлопывание:** два соприкасающихся положительных вертикальных `margin` в обычном потоке не складываются, а схлопываются до наибольшего.

## 1. Внутренние отступы `padding` и форматы записи (00:19–02:51)

[+] У большинства HTML-тегов `padding` по умолчанию равен `0` (исключение: у `<ul>` и `<ol>` в Chrome слева `40px`). В DevTools область `padding` подсвечивается зелёным, внутри неё виден `background` элемента. Значения `padding` **не могут быть отрицательными** — браузер отбросит их как ошибку.

```css
/* Сокращённая запись: 1, 2, 3 или 4 значения */
padding: 20px;                  /* все 4 стороны одинаково */
padding: 15px 40px;             /* верх-низ | право-лево */
padding: 50px 100px 150px;      /* верх | право-лево | низ */
padding: 50px 100px 150px 20px; /* по часовой: верх право низ лево */

/* Отдельные стороны (физические свойства) */
padding-top: 10px;
padding-right: 16px;
padding-bottom: 10px;
padding-left: 16px;

/* Современные логические свойства (поддержка во всех браузерах) */
padding-block: 16px;            /* вертикаль: верх и низ */
padding-inline: 24px;           /* горизонталь: лево и право */
```

## 2. Внешние отступы `margin`, `auto` и отрицательные значения (02:52–05:22)

[+] Браузер по умолчанию добавляет `margin` заголовкам `<h1>`–`<h6>`, абзацам `<p>`, спискам `<ul>`/`<ol>` и тегу `<body>`. Синтаксис сторон такой же, как у `padding`, но `margin` **может быть отрицательным** и принимать значение `auto` (браузер сам делит свободное место).

[!] Три важных правила для `margin`:
- Для горизонтального центрирования через `margin-inline: auto` у элемента должны быть `display: block` и ширина меньше ширины родителя (`width` или `max-width`). В отличие от `margin: 0 auto`, свойство `margin-inline: auto` **не сбрасывает** верхний и нижний отступы в `0`.
- В обычном потоке `margin-block: auto` по вертикали блок не центрирует.
- У строчных элементов (`display: inline`, например `<span>` и `<a>`) вертикальные `margin-top` / `margin-bottom` вообще не работают, а горизонтальный `auto` считается как `0`.

<!-- demo-html:
<style>
  .card {
    background: #fef3c7;
    border: 2px solid #b45309;
    padding: 16px;
    text-align: center;
  }
  .badge-overlap {
    width: 170px;
    margin-inline: auto;
    background: #b91c1c;
    color: #fff;
    padding: 4px 8px;
    text-align: center;
    border-radius: 4px;
    font-size: 13px;
  }
</style>
<div class="card">.card (width: 320px; margin-inline: auto)</div>
<div class="badge-overlap">.badge-overlap (-20px)</div>
-->
```css
.card {
  display: block;
  /* Без ограниченной ширины auto нечего делить по сторонам */
  width: 320px;
  /* Центрирует по горизонтали и не затирает margin-top / bottom */
  margin-inline: auto;
}

.badge-overlap {
  /* Отрицательный margin сдвигает блок вверх, наезжая на соседа */
  margin-top: -20px;
}
```

## 3. Схлопывание отступов (`margin collapsing`) (05:23–06:08)

[+] Когда два положительных вертикальных `margin` соседних блоков в обычном потоке соприкасаются, они не складываются, а **схлопываются**: браузер оставляет только больший из них.

[!] Три важных уточнения:
- Схлопывание работает **только по вертикали** — горизонтальные `margin` (например, у соседних `inline-block`) всегда складываются.
- **Выпадение из родителя:** если у родителя нет `padding` или `border`, то `margin-top` первого ребёнка и `margin-bottom` последнего ребёнка «выпадают» наружу и двигают сам родительский блок.
- На вырост: во Flexbox (`display: flex`), Grid (`display: grid`) и при `display: flow-root` вертикального схлопывания и выпадения из родителя нет.

<!-- demo-html:
<style>
  .box-top {
    background: #dbeafe;
    border: 1px solid #2563eb;
    padding: 10px;
    font-size: 13px;
  }
  .box-bottom {
    background: #dcfce7;
    border: 1px solid #16a34a;
    padding: 10px;
    font-size: 13px;
  }
</style>
<div class="box-top">.box-top (margin-bottom: 50px)</div>
<div class="box-bottom">.box-bottom (margin-top: 100px) -> итог 100px</div>
-->
```css
/* Итоговый зазор между блоками = 100px (максимум), а не 150px */
.box-top {
  margin-bottom: 50px;
}

.box-bottom {
  margin-top: 100px;
}
```

## 4. Правило выбора между `padding` и `margin` (06:09–07:06)

[+] Используйте `padding`, чтобы отодвинуть внутренний контент от границ блока (и увеличить кликабельную область кнопки/ссылки), и `margin` — чтобы оттолкнуть соседние блоки снаружи. В списках задавайте внешние отступы в одном направлении (только `margin-bottom` и `margin-right`), чтобы избегать непредсказуемых схлопываний.

На вырост: лишний отступ у последнего элемента списка позже убирают через `:last-child` или заменяют на свойство `gap` во Flexbox/Grid.

| Свойство | `padding` (внутренний) | `margin` (внешний) |
| :--- | :--- | :--- |
| Где находится | Внутри `border` | Снаружи `border` |
| Закрашивается `background` | Да (и кликабелен) | Нет (всегда прозрачный) |
| Отрицательные значения | Нет (игнорируются) | Да (можно делать нахлёст) |
| Значение `auto` | Нет | Да (центрирование блока) |
| Схлопывание по вертикали | Нет | Да (в обычном потоке) |

## 3 главные ловушки урока (чек-лист для повторения)

1. Суммировать вертикальные `margin` соседних блоков (`50px + 100px = 150px`) — в обычном потоке они схлопнутся до большего значения (`100px`).

2. Пытаться центрировать элемент через `margin-inline: auto` без ограниченной ширины `width` (или на `inline`-теге вроде `<span>`), либо писать отрицательный `padding` (браузер его отбросит).

3. Задавать `margin` одновременно сверху и снизу у элементов списка, а также забывать про `padding` / `border` у родителя — крайние вертикальные `margin` детей «пробьют» родителя и сдвинут его целиком.

## Вопросы для закрепления

**1. У верхнего блока `.top` задан `margin-bottom: 40px`, у нижнего `.bottom` — `margin-top: 60px`. Какое расстояние будет между ними? И что изменится, если поставить рядом два `inline-block` элемента с `margin-right: 40px` и `margin-left: 60px`?**

<details>
<summary>Показать ответ</summary>

По вертикали в обычном потоке сработает схлопывание — браузер выберет наибольший отступ, то есть **`60px`**. А по горизонтали внешние отступы **не схлопываются** никогда: между двумя `inline-block` будет `40 + 60 = 100px`.

</details>

**2. Почему `margin-inline: auto` на теге `<span class="tag">Новость</span>` или на `<div class="box">` без `width` не сдвигает элемент в центр родителя?**

<details>
<summary>Показать ответ</summary>

`margin-inline: auto` центрирует только **блочный** элемент (`display: block`) с **ограниченной шириной** меньше ширины родителя. У `<span>` (`display: inline`) горизонтальный `auto` считается как `0`, а у `<div>` без `width` ширина и так `100%` родителя — свободного места слева и справа просто не остаётся.

</details>

**3. Почему у `<section>` без рамки и `padding` появляется пустой отступ сверху страницы, хотя `margin-top: 30px` вы задали только для лежащего внутри `<h2>`?**

<details>
<summary>Показать ответ</summary>

Это **выпадение (схлопывание) внешнего отступа с родителем**. Если у `<section>` нет `padding-top` или `border-top` (и на вырост: он не `flex`/`grid`/`flow-root`), `margin-top` первого дочернего `<h2>` «выпадает» наружу и сдвигает вниз сам `<section>` целиком.

</details>

## Задачи

**Задача 1. Сокращённая запись `padding`, логические свойства и центрирование**

Оформи стили для карточки `.card` и блока уведомления `.alert`:

1. Для `.card` задай `box-sizing: border-box`, `width: 320px` и сокращённый `padding` в 4 значения (по часовой): сверху `16px`, справа `24px`, снизу `20px`, слева `12px`.
2. Центрируй `.card` по горизонтали через `margin-inline: auto` и добавь нижний отступ `margin-bottom: 32px`.
3. Для `.alert` задай внутренние отступы `12px` сверху/снизу и `20px` слева/справа двумя логическими свойствами (`padding-block` и `padding-inline`).

Проверка: `.card` шириной `320px` стоит ровно по центру над `.alert` с зазором `32px`, а у `.alert` текст отодвинут от границ на `12px` по вертикали и `20px` по горизонтали.

```html
<div class="card">Карточка по центру</div>
<div class="alert">Уведомление</div>
```

<details>
<summary>Подсказка и решение</summary>

<!-- demo-html:
<style>
  .card {
    background: #fef3c7;
    border: 2px solid #b45309;
  }
  .alert {
    background: #dbeafe;
    border: 2px solid #2563eb;
  }
</style>
<div class="card">Карточка по центру</div>
<div class="alert">Уведомление</div>
-->
```css
.card {
  box-sizing: border-box;
  width: 320px;
  /* 4 значения по часовой: верх -> право -> низ -> лево */
  padding: 16px 24px 20px 12px;
  /* Работает, т.к. у <div> блочный тип и задана ширина */
  margin-inline: auto;
  margin-bottom: 32px;
}

.alert {
  /* Логические свойства отдельно задают вертикаль и горизонталь */
  padding-block: 12px;
  padding-inline: 20px;
}
```

</details>

**Задача 2. Однонаправленные `margin` и защита родителя от выпадения отступов**

Сейчас у карточек `.item` заданы оба вертикальных отступа (`margin-top` и `margin-bottom`), а у обёртки `.wrapper` нет ни рамки, ни `padding`, из-за чего крайние отступы детей выпадают наружу. Исправь вёрстку:

1. У `.item` убери `margin-top: 20px` и оставь внешний отступ только в одном направлении — `margin-bottom: 30px`.
2. Добавь для `.wrapper` свойства `padding-block: 16px` и `border: 1px solid #cccccc`.
3. В CSS-комментарии над свойствами `.wrapper` объясни, как `padding` и `border` останавливают выпадение вертикальных `margin` детей (включая `margin-bottom` последнего `.item`).

Проверка: обе карточки лежат внутри серой рамки `.wrapper` с ровным зазором `30px` между ними, а внешние отступы `.item` не «пробивают» границы `.wrapper`.

```html
<section class="wrapper">
  <div class="item">Карточка 1</div>
  <div class="item">Карточка 2</div>
</section>
```

```css
/* Проблемный CSS */
.wrapper {
  background-color: #f5f5f5;
}

.item {
  margin-top: 20px;
  margin-bottom: 30px;
  padding: 12px;
  border: 1px solid #dddddd;
}
```

<details>
<summary>Подсказка и решение</summary>

<!-- demo-html:
<section class="wrapper">
  <div class="item">Карточка 1</div>
  <div class="item">Карточка 2</div>
</section>
-->
```css
.wrapper {
  background-color: #f5f5f5;
  /*
    padding и border ставят физическую перегородку у родителя:
    вертикальные margin детей (включая margin-bottom последнего .item)
    больше не выпадают наружу из .wrapper
  */
  padding-block: 16px;
  border: 1px solid #cccccc;
}

.item {
  /* Отступ только вниз убирает схлопывание между соседними .item */
  margin-bottom: 30px;
  padding: 12px;
  border: 1px solid #dddddd;
}
```

</details>

**Задача 3. Нахлёст блока через отрицательный `margin`**

Есть карточка `.card` (`padding: 24px; border: 1px solid #cccccc;`) и следующий под ней баннер `.promo-banner` (`padding: 12px;`). Сделай визуальный нахлёст:

1. Подними `.promo-banner` на `16px` вверх с помощью отрицательного `margin-top`, чтобы он заехал на нижний край `.card`.
2. В CSS-комментарии объясни, почему здесь работает `margin-top: -16px`, а `padding-top: -16px` браузер бы проигнорировал.

Проверка: красный баннер `.promo-banner` сдвинут вверх на `16px` и частично перекрывает нижнюю границу `.card`.

```html
<div class="card">Основной блок</div>
<div class="promo-banner">Акция -20%</div>
```

<details>
<summary>Подсказка и решение</summary>

<!-- demo-html:
<style>
  .card {
    background: #fef3c7;
  }
  .promo-banner {
    width: 180px;
    margin-inline: auto;
    background: #dc2626;
    color: #fff;
    text-align: center;
    border-radius: 6px;
  }
</style>
<div class="card">Основной блок</div>
<div class="promo-banner">Акция -20%</div>
-->
```css
.card {
  padding: 24px;
  border: 1px solid #cccccc;
}

.promo-banner {
  padding: 12px;
  /*
    Отрицательный margin разрешён: он тянет блок вверх на соседа.
    А padding-top: -16px браузер отбросит — padding не бывает < 0
  */
  margin-top: -16px;
}
```

</details>
