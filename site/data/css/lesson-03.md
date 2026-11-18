# Урок 03. Блочная модель CSS (Box Model), display и box-sizing

Суть урока: блочная модель определяет итоговый размер элемента из `content` (`width`/`height`), `padding`, `border` и внешнего `margin`; поведение размеров зависит от свойства `display` (`block`, `inline`, `inline-block`, `none`), а `box-sizing: border-box` включает `padding` и `border` внутрь `width`.

## 1. DevTools и состав блочной модели (00:11–01:54)

[+] Схему блочной модели любого элемента удобно смотреть в DevTools (`F12`, ПКМ -> Inspect или `Ctrl+Shift+C` -> вкладка `Elements` -> `Styles` / `Computed`). Модель состоит из 4 слоёв (от центра наружу): `content` (`width`/`height`) -> `padding` (внутренние отступы) -> `border` (рамка) -> `margin` (внешние отступы).

## 2. Типы отображения `display`: `block`, `inline`, `inline-block`, `none` (01:55–05:17)

[+] У `<div>` по умолчанию `display: block` — он занимает всю доступную ширину, а высота по умолчанию `auto` (подстраивается под содержимое). Фиксировать `width` и особенно `height` опасно: при росте текста контент вылезет за границы. У `<span>` по умолчанию `display: inline`: его `width` и `height` браузер игнорирует.

[!] У `inline`-элементов (`<span>`, `<a>`) игнорируются не только `width`/`height`, но и вертикальные `margin-top`/`margin-bottom`, а вертикальный `padding` визуально наезжает на строки сверху и снизу, не раздвигая их. Для кнопок из `<a>` ставят `display: inline-block`.

<!-- demo-html:
<style>
  .block-box, .inline-box, .btn-link { background: #fef3c7; border: 2px solid #b45309; padding: 6px 10px; margin: 4px 0; color: #1f2328; text-decoration: none; }
</style>
<div class="block-box">.block-box (display: block — во всю ширину)</div>
<span class="inline-box">.inline-box (inline)</span>
<a class="btn-link" href="#">.btn-link (inline-block)</a>
<div class="hidden-box">.hidden-box (скрыт)</div>
-->
```css
/* Во всю ширину, height: auto — тянется за текстом */
.block-box {
  display: block;
}

/* width/height и вертикальные margin НЕ работают */
.inline-box {
  display: inline;
}

/* Ширина по контенту, но принимает width/height/margin */
.btn-link {
  display: inline-block;
}

/* Убирает элемент из раскладки (не анимируется; vs visibility) */
.hidden-box {
  display: none;
}
```

## 3. Как `padding`, `border` и `margin` влияют на габариты (05:18–07:31)

[+] По умолчанию `padding` и `border` (ширина, тип линии и цвет через пробел в любом порядке) **прибавляются** к заданным `width` и `height`. Внешний отступ `margin` отталкивает соседние элементы снаружи и к фактическим габаритам самого блока не прибавляется.

<!-- demo-html:
<style>.box { background: #fef3c7; font-size: 13px; }</style>
<div class="box">.box: 200x200 + padding 15/40 + border 10 -> 300x250px</div>
-->
```css
.box {
  width: 200px;
  height: 200px;
  padding: 15px 40px;      /* 15px сверху и снизу, 40px слева и справа */
  border: 10px solid #333; /* толщина, тип линии и цвет рамки */
  margin: 50px;            /* внешний отступ со всех сторон (в размер блока не входит) */
}
/* По умолчанию: итоговая ширина = 200 + 40*2 + 10*2 = 300px, высота = 200 + 15*2 + 10*2 = 250px */
```

## 4. Свойство `box-sizing`: `content-box` vs `border-box` (07:32–09:15)

[+] Свойство `box-sizing` меняет формулу расчёта размеров: значение по умолчанию `content-box` добавляет `padding` и `border` поверх `width`/`height`, а `border-box` включает их внутрь заданных `width`/`height` (при этом `margin` всегда остаётся снаружи).

<!-- demo-html:
<style>.normal-size { background: #dbeafe; font-size: 13px; }</style>
<div class="normal-size">.normal-size: видимая ширина ровно 200px (включая padding и border)</div>
-->
```css
/* Глобальный стандарт в проектах (учитывает также псевдоэлементы ::before и ::after): */
*,
*::before,
*::after {
  box-sizing: border-box;
}

.normal-size {
  width: 200px;
  padding: 20px;
  border: 10px solid #000;
  /* Видимая ширина элемента = ровно 200px (под контент внутри останется 200 - 40 - 20 = 140px) */
}
```

## 3 главные ловушки урока (чек-лист для повторения)

1. Задавать жёсткие `width` и `height` блокам с текстом — при изменении текста или размера шрифта содержимое вылезет за границы и сломает вёрстку.

2. Пытаться задать `width`, `height` или вертикальные `margin`/`padding` строчному тегу (`<span>`, `<a>`) без переключения его в `display: inline-block` или `block`.

3. Забывать про `box-sizing: border-box` — в стандартном `content-box` добавление `padding` и `border` незаметно раздувает элемент сверх указанной ширины.

## Вопросы для закрепления

**1. У блока `.box` заданы `width: 200px; height: 100px; padding: 15px 40px; border: 10px solid #000; margin: 20px;`. Какими будут итоговые видимые ширина и высота при стандартном `content-box` и при `border-box`?**

<details>
<summary>Показать ответ</summary>

- При **`content-box`** (по умолчанию) `padding` и `border` прибавляются к `width`/`height`: ширина = `200 + 40*2 + 10*2 = 300px`, высота = `100 + 15*2 + 10*2 = 150px` (`margin` в габариты самого блока не входит).
- При **`border-box`** видимые размеры блока по краю рамки останутся ровно `200px` на `100px` (а внутренняя область под контент автоматически сожмётся на сумму `padding` и `border`).

</details>

**2. Почему `span.btn { width: 140px; height: 44px; margin-top: 30px; }` не работает как кнопка, а `padding: 15px 20px;` визуально налезает на текст строкой выше?**

<details>
<summary>Показать ответ</summary>

Потому что у `<span>` по умолчанию `display: inline`. Строчные элементы игнорируют `width`, `height` и вертикальные `margin-top`/`margin-bottom`, а вертикальный `padding` только рисует фон/рамку, не отталкивая соседние строки. Нужно переключить элемент в `display: inline-block` (или `block`).

</details>

**3. В чём разница между `display: none` и `visibility: hidden`, и можно ли плавно анимировать появление элемента через `display: none -> block`?**

<details>
<summary>Показать ответ</summary>

`display: none` полностью убирает элемент из раскладки (он **не занимает места** на странице), а `visibility: hidden` делает его прозрачным/невидимым, но **пустое место под него остаётся**. Плавно анимировать свойство `display` нельзя — оно переключается скачком; для плавного появления/скрытия используют `opacity` в паре с `visibility`.

</details>

## Задачи

**Задача 1. Сравнение `content-box` и `border-box` на практике**

Задай базовый класс `.card` с `width: 300px; padding: 20px; border: 5px solid #333; margin: 16px;` и модификатор `.card.is-border-box`, который включает `box-sizing: border-box`:
1) Оформи оба правила в CSS.
2) В комментариях рядом с каждым распиши точную ширину самого блока (по краю рамки) и ширину области контента внутри, а также объясни, влияет ли `margin: 16px` на эти цифры.

```html
<div class="card">Стандартный content-box</div>
<div class="card is-border-box">Удобный border-box</div>
```

<details>
<summary>Подсказка и решение</summary>

```css
.card {
  width: 300px;
  padding: 20px;
  border: 5px solid #333;
  margin: 16px;
  /* По умолчанию box-sizing: content-box:
     ширина контента = 300px;
     видимая ширина блока = 300 + 20*2 + 5*2 = 350px;
     margin: 16px толкает соседей снаружи и в ширину самого блока не входит. */
}

.card.is-border-box {
  box-sizing: border-box;
  /* Теперь padding и border включены внутрь width:
     видимая ширина блока = ровно 300px;
     ширина контента внутри = 300 - 20*2 - 5*2 = 250px;
     margin: 16px по-прежнему остаётся снаружи рамки. */
}
```

</details>

**Задача 2. Кнопка-ссылка из строчного тега `<a>`**

Сделай из `<a class="btn-link" href="#">Скачать</a>` полноценную кнопку фиксированной ширины:
1) Переключи `display` с `inline` на `inline-block`, чтобы заработали `width`, вертикальные `padding` и `margin-top`.
2) Задай `width: 220px`, `padding: 12px 24px`, `border: 2px solid navy`, `margin-top: 20px`.
3) Включи `box-sizing: border-box`, чтобы кнопка осталась ровно `220px` в ширину, а не расползлась до `272px`.

```html
<p>Инструкция готова к загрузке:</p>
<a class="btn-link" href="#">Скачать файл</a>
```

<details>
<summary>Подсказка и решение</summary>

```css
.btn-link {
  /* Переключаем строчный <a> в строчно-блочный: теперь работают width и вертикальные отступы: */
  display: inline-block;
  /* Включаем border-box, чтобы padding (24px*2) и border (2px*2) не раздули кнопку сверх 220px: */
  box-sizing: border-box;
  width: 220px;
  padding: 12px 24px;
  border: 2px solid navy;
  margin-top: 20px;
  color: navy;
}
```

</details>

**Задача 3. Глобальный `border-box`, починка переполнения текста и полное скрытие бейджа**

В коде ниже длинный текст вылезает за рамки карточки `.article-box`, а скрытый бейдж `.badge.is-hidden` оставляет после себя пустую дыру:
1) Напиши глобальное правило включения `box-sizing: border-box`, которое охватит и все элементы, и псевдоэлементы `::before` / `::after`.
2) Исправь `.article-box`, чтобы высота подстраивалась под любой объём текста.
3) Скрой `.badge.is-hidden` так, чтобы он **не занимал место** на странице.

```html
<div class="article-box">
  <span class="badge is-hidden">NEW</span>
  Длинный текст статьи, который со временем может стать ещё длиннее и не поместится в 80px.
</div>
```

```css
/* Проблемный CSS: */
.article-box {
  width: 260px;
  height: 80px;
  padding: 16px;
  border: 2px solid #999;
}

.badge.is-hidden {
  visibility: hidden;
}
```

<details>
<summary>Подсказка и решение</summary>

```css
/* 1. Глобально включаем border-box для всех тегов и псевдоэлементов (т.к. '*' их не цепляет): */
*,
*::before,
*::after {
  box-sizing: border-box;
}

.article-box {
  width: 260px;
  /* 2. Убираем фиксированную height: 80px — значение auto по умолчанию само растянет блок под текст: */
  height: auto;
  padding: 16px;
  border: 2px solid #999;
}

.badge.is-hidden {
  /* 3. В отличие от visibility: hidden, display: none полностью убирает элемент из раскладки без дыры: */
  display: none;
}
```

</details>
