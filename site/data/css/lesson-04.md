# Урок 04. Внутренние и внешние отступы (`padding`, `margin`) и схлопывание

Суть урока: `padding` отталкивает контент внутрь от границ элемента (не может быть отрицательным), `margin` толкает соседние элементы снаружи (может быть `auto` и отрицательным), а вертикальные `margin` соседних блоков в обычном потоке схлопываются до наибольшего значения.

## 1. Внутренние отступы `padding` и форматы записи (00:19–02:51)

[+] У большинства HTML-тегов `padding` по умолчанию равен `0` (исключение: у `<ul>` и `<ol>` в Chrome слева `40px`). В DevTools отступы `padding` подсвечиваются бледно-зелёным. Значения `padding` **не могут быть отрицательными**.

```css
padding: 20px;                  /* 1 значение: со всех 4 сторон */
padding: 15px 40px;             /* 2 значения: вертикаль (верх/низ) и горизонталь (право/лево) */
padding: 50px 100px 150px;      /* 3 значения: верх | право-лево | низ (плохо читается) */
padding: 50px 100px 150px 20px; /* 4 значения (по часовой): верх -> право -> низ -> лево */

/* Отдельные стороны и современные логические свойства (поддержка 92%+): */
padding-top: 10px;              /* padding-right / padding-bottom / padding-left */
padding-block: 16px;            /* только сверху и снизу (вертикальная ось) */
padding-inline: 24px;           /* только слева и справа (горизонтальная ось) */
```

## 2. Внешние отступы `margin`, `auto` и отрицательные значения (02:52–05:22)

[+] Браузер по умолчанию добавляет `margin` заголовкам `<h1>`–`<h6>`, `<p>`, спискам и т.д. Синтаксис сторон такой же, как у `padding`, но `margin` **может быть отрицательным** и принимать значение `auto` (браузер сам распределяет доступное место).

[!] Для горизонтального центрирования через `margin-inline: auto` (или `margin: 0 auto`) у элемента должен быть `display: block` и заданная ширина меньше ширины родителя (`width` / `max-width`). В обычном потоке `margin-block: auto` по вертикали блок не центрирует.

<!-- demo-html:
<style>
  .card { background: #fef3c7; border: 2px solid #b45309; padding: 16px; text-align: center; }
  .badge-overlap { width: 170px; margin-inline: auto; background: #b91c1c; color: #fff; padding: 4px 8px; text-align: center; border-radius: 4px; font-size: 13px; }
</style>
<div class="card">.card (width: 320px; margin-inline: auto)</div>
<div class="badge-overlap">.badge-overlap (-20px)</div>
-->
```css
.card {
  display: block;
  width: 320px;        /* Без ограниченной ширины auto нечего делить по сторонам */
  margin-inline: auto; /* Центрирует блок по горизонтали внутри родителя */
}

.badge-overlap {
  margin-top: -20px;   /* Отрицательный margin сдвигает блок вверх, наезжая на соседа */
}
```

## 3. Схлопывание отступов (`margin collapsing`) (05:23–06:08)

[+] Когда два вертикальных `margin` соседних блоков в обычном потоке соприкасаются, они не складываются, а **схлопываются**: браузер выбирает больший из них.

[!] Три важных уточнения: 1) схлопывание происходит **только по вертикали** (горизонтальные `margin` у `inline-block` складываются); 2) во Flexbox и Grid вертикального схлопывания нет; 3) если у родителя нет `padding` или `border`, `margin-top` первого ребёнка выпадает наружу и сдвигает сам родительский блок.

<!-- demo-html:
<style>
  .box-top { background: #dbeafe; border: 1px solid #2563eb; padding: 10px; font-size: 13px; }
  .box-bottom { background: #dcfce7; border: 1px solid #16a34a; padding: 10px; font-size: 13px; }
</style>
<div class="box-top">.box-top (margin-bottom: 50px)</div>
<div class="box-bottom">.box-bottom (margin-top: 100px) -> итог между блоками 100px</div>
-->
```css
/* Итоговый зазор между блоками = 100px (максимум), а НЕ 150px! */
.box-top {
  margin-bottom: 50px;
}

.box-bottom {
  margin-top: 100px;
}
```

## 4. Правило выбора между `padding` и `margin` (06:09–07:06)

[+] Используйте `padding`, когда нужно отодвинуть внутреннее содержимое от границ блока, и `margin` — когда нужно оттолкнуть соседние элементы снаружи. Задавайте внешние отступы в одном направлении (только `margin-bottom` и `margin-right`), чтобы избегать лишних схлопываний.

## 3 главные ловушки урока (чек-лист для повторения)

1. Суммировать вертикальные `margin` соседних блоков (`50px + 100px = 150px`) — в обычном потоке они схлопнутся до большего значения (`100px`).

2. Пытаться центрировать элемент через `margin-inline: auto` без заданной ширины `width` (или на `inline`-теге) либо писать отрицательный `padding` (браузер его отбросит).

3. Задавать `margin` и сверху, и снизу элементам списка, а также забывать про `padding`/`border` у родителя — `margin-top` первого ребёнка «пробьёт» родителя и сдвинет его вниз.

## Вопросы для закрепления

**1. У верхнего блока `.top` задан `margin-bottom: 40px`, у нижнего `.bottom` — `margin-top: 60px`. Какое расстояние будет между ними? И что изменится, если поставить рядом два `inline-block` элемента с `margin-right: 40px` и `margin-left: 60px`?**

<details>
<summary>Показать ответ</summary>

По вертикали в обычном потоке сработает схлопывание — браузер выберет наибольший отступ, то есть **`60px`**. А вот по горизонтали внешние отступы **не схлопываются** никогда: между двумя `inline-block` будет `40 + 60 = 100px`.

</details>

**2. Почему `margin-inline: auto` на теге `<span class="tag">Новость</span>` или на `<div class="box">` без `width` не сдвигает элемент в центр родителя?**

<details>
<summary>Показать ответ</summary>

`margin-inline: auto` центрирует только **блочный** элемент (`display: block`) с **ограниченной шириной** меньше ширины родителя. У `<span>` (`display: inline`) горизонтальный `auto` считается как `0`, а у `<div>` без `width` ширина равна `100%` родителя — свободного места слева и справа просто не остаётся.

</details>

**3. Почему у `<section>` без рамки и `padding` появляется пустой отступ сверху страницы, хотя `margin-top: 30px` вы задали только для лежащего внутри `<h2>`?**

<details>
<summary>Показать ответ</summary>

Это **схлопывание внешнего отступа с родителем**. Если у `<section>` нет `padding-top` или `border-top` (и он не в `flex`/`grid`), `margin-top` первого дочернего `<h2>` «выпадает» наружу и двигает сам `<section>` целиком.

</details>

## Задачи

**Задача 1. Сокращённые записи `padding`, логические свойства и центрирование через `auto`**

Оформи стили для `.card` и `.alert`:
1) Для `.card` задай `box-sizing: border-box`, ширину `320px`, внутренние отступы в одну строку (по часовой стрелке): сверху `16px`, справа `24px`, снизу `20px`, слева `12px`. Центрируй `.card` по горизонтали через `margin-inline: auto;` и добавь `margin-bottom: 32px;`.
2) Для `.alert` задай внутренние отступы `12px` сверху/снизу и `20px` слева/справа двумя отдельными логическими свойствами (`padding-block` и `padding-inline`).

```html
<div class="card">Карточка по центру</div>
<div class="alert">Уведомление</div>
```

<details>
<summary>Подсказка и решение</summary>

<!-- demo-html:
<style>
  .card { background: #fef3c7; border: 2px solid #b45309; }
  .alert { background: #dbeafe; border: 2px solid #2563eb; }
</style>
<div class="card">Карточка по центру</div>
<div class="alert">Уведомление</div>
-->
```css
.card {
  box-sizing: border-box;
  width: 320px;
  /* 4 значения идут по часовой стрелке: верх -> право -> низ -> лево: */
  padding: 16px 24px 20px 12px;
  /* Работает, т.к. у <div> display: block и задана ширина меньше родителя: */
  margin-inline: auto;
  margin-bottom: 32px;
}

.alert {
  /* Логические свойства отдельно управляют вертикальной (block) и горизонтальной (inline) осями: */
  padding-block: 12px;
  padding-inline: 20px;
}
```

</details>

**Задача 2. Устранение схлопывания в списке карточек и выпадения `margin` из родителя**

Сейчас у карточек `.item` заданы оба вертикальных отступа (`margin-top: 20px; margin-bottom: 30px;`), а у обёртки `.wrapper` нет ни рамки, ни `padding`, из-за чего отступ первого `.item` сдвигает сам `.wrapper`:
1) Оставь у `.item` внешний отступ только в одном направлении (`margin-bottom: 30px;`).
2) Добавь для `.wrapper` `padding-block: 16px;` и `border: 1px solid #cccccc;`, и в комментарии объясни, как это решает проблему выпадения отступа первого ребёнка.

```html
<section class="wrapper">
  <div class="item">Карточка 1</div>
  <div class="item">Карточка 2</div>
</section>
```

```css
/* Проблемный CSS: */
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

```css
.wrapper {
  background-color: #f5f5f5;
  /* padding или border у родителя ставят физическую «перегородку»,
     поэтому margin первого и последнего ребёнка больше не выпадают наружу: */
  padding-block: 16px;
  border: 1px solid #cccccc;
}

.item {
  /* Однонаправленный отступ (только снизу) убирает схлопывание между соседними .item: */
  margin-bottom: 30px;
  padding: 12px;
  border: 1px solid #dddddd;
}
```

</details>

**Задача 3. Нахлёст блока через отрицательный `margin`**

Есть карточка `.card` с `padding: 24px; border: 1px solid #cccccc;` и следующий сразу под ней блок `.promo-banner` (`padding: 12px;`):
1) Подними `.promo-banner` на `16px` вверх с помощью отрицательного `margin`, чтобы он слегка заехал на нижний край `.card`.
2) В комментарии объясни, почему для этого подходит `margin-top: -16px`, а `padding-top: -16px` браузер бы проигнорировал.

```html
<div class="card">Основной блок</div>
<div class="promo-banner">Акция -20%</div>
```

<details>
<summary>Подсказка и решение</summary>

<!-- demo-html:
<style>
  .card { background: #fef3c7; }
  .promo-banner { width: 180px; margin-inline: auto; background: #dc2626; color: #fff; text-align: center; border-radius: 6px; }
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
  /* Отрицательный margin разрешён спецификацией и тянет элемент навстречу соседу: */
  margin-top: -16px;
  /* padding-top: -16px не сработает, т.к. внутренние отступы не могут быть отрицательными! */
}
```

</details>
