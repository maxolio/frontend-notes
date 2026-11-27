# Урок 03. Блочная модель CSS (Box Model), `display` и `box-sizing`

Суть урока: блочная модель складывает размер элемента из `content` (`width`/`height`), `padding`, `border` и внешнего `margin`; поведение размеров задаёт свойство `display` (`block`, `inline`, `inline-block`, `none`), а `box-sizing: border-box` включает `padding` и `border` внутрь `width` и `height`.

## 1. DevTools и состав блочной модели (00:11–01:54)

[+] Схему блочной модели удобно проверять в DevTools (`F12`, ПКМ → `Inspect` или `Ctrl+Shift+C` → вкладка `Elements` → `Styles` / `Computed`). Любой элемент состоит из 4 слоёв от центра наружу:

| Слой | CSS-свойства | Видимый фон | Входит в размер блока |
| --- | --- | --- | --- |
| `content` | `width`, `height` | Да | Да |
| `padding` | Внутренние отступы | Да | Да |
| `border` | Рамка элемента | Поверх фона | Да |
| `margin` | Внешние отступы | Нет | Нет (всегда снаружи) |

## 2. Типы отображения `display`: `block`, `inline`, `inline-block`, `none` (01:55–05:17)

[+] У `<div>`, `<p>`, `<section>` по умолчанию `display: block`: блок занимает всю доступную ширину, а его `height` равна `auto` (тянется за текстом). У `<span>` и `<a>` по умолчанию `display: inline` — они идут в потоке текста.

| Значение `display` | Ширина по умолчанию | `width` / `height` | Вертикальные `margin` / `padding` | Место в потоке |
| --- | --- | --- | --- | --- |
| `block` | Вся ширина родителя | Работают | Работают | С новой строки |
| `inline` | По содержимому | Игнорируются | `margin` нет, `padding` налезает | Внутри строки |
| `inline-block` | По содержимому | Работают | Работают | Внутри строки |
| `none` | Нет | Нет | Нет | Полностью убран |

[!] Три частые детали на практике:
- У `inline`-элементов **горизонтальные** `padding` и `margin` работают, игнорируются именно `width`/`height` и вертикальный `margin`. Исключение — замещаемые теги (`<img>`, `<input>`): они принимают `width`/`height`.
- Не фиксируйте `height` у текстовых блоков и не пишите лишний `width: 100%` для `block`-элементов (при `width: auto` блок сам впишется в родителя вместе с `margin`, а `width: 100%` + горизонтальный `margin` вылезет наружу).
- Между соседними `inline-block` тегами из-за переносов строк в HTML появляется пробельный зазор ~`4px`. На вырост: для рядов без зазоров используют Flexbox и Grid (Уроки 12 и 15).

[+] Сравнение скрытия: `display: none` полностью удаляет элемент из раскладки (соседи занимают его место), а `visibility: hidden` делает его невидимым, **оставляя пустую дыру** того же размера.

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
/* На всю ширину родителя, height: auto тянется за текстом */
.block-box {
  display: block;
}

/* width, height и вертикальные margin не работают */
.inline-box {
  display: inline;
}

/* Ширина по контенту, но работают width, height и все отступы */
.btn-link {
  display: inline-block;
}

/* Полностью убирает элемент из раскладки (места не занимает) */
.hidden-box {
  display: none;
}
```

## 3. Как `padding`, `border` и `margin` влияют на габариты (05:18–07:31)

[+] По умолчанию `padding` и `border` (толщина, стиль линии и цвет через пробел) **прибавляются** к `width` и `height`. Внешний `margin` отталкивает соседей снаружи и в габариты самого блока не входит.

<!-- demo-html:
<style>.box { background: #fef3c7; font-size: 13px; }</style>
<div class="box">.box: 200x200 + padding 15/40 + border 10 -> 300x250px</div>
-->
```css
/* В content-box padding и border прибавляются к width и height: */
/* ширина = 200 + 40*2 + 10*2 = 300px */
/* высота = 200 + 15*2 + 10*2 = 250px */
.box {
  width: 200px;
  height: 200px;
  /* 15px сверху/снизу и 40px слева/справа */
  padding: 15px 40px;
  border: 10px solid #333;
  /* margin снаружи рамки — в габариты блока не входит */
  margin: 50px;
}
```

## 4. Свойство `box-sizing`: `content-box` vs `border-box` (07:32–09:15)

[+] Свойство `box-sizing` меняет формулу расчёта размеров элемента:

| Значение | Что задают `width` и `height` | Видимая ширина элемента | Где `margin` |
| --- | --- | --- | --- |
| `content-box` (по умолч.) | Только область `content` | `width + padding + border` | Снаружи |
| `border-box` | `content + padding + border` | Ровно `width` | Снаружи |

[!] Свойство `box-sizing` **не наследуется**, поэтому его нельзя задать просто на `<body>` — в проектах его включают глобально через `*` вместе с псевдоэлементами `::before` и `::after` (Урок 13). Если в `border-box` сумма `padding` и `border` окажется больше `width`, контент сожмётся до `0`, а блок расширится до этой суммы.

<!-- demo-html:
<style>.normal-size { background: #dbeafe; font-size: 13px; }</style>
<div class="normal-size">.normal-size: видимая ширина ровно 200px (включая padding и border)</div>
-->
```css
/* Глобальный стандарт: охватывает теги и псевдоэлементы (Урок 13) */
*,
*::before,
*::after {
  box-sizing: border-box;
}

/* Видимая ширина ровно 200px; под контент: 200 - 40 - 20 = 140px */
.normal-size {
  width: 200px;
  padding: 20px;
  border: 10px solid #000;
}
```

## 3 главные ловушки урока (чек-лист для повторения)

1. Задавать жёсткую `height` блокам с текстом или лишний `width: 100%` вместе с горизонтальным `margin` — текст вылезет за рамку, а блок с `width: 100%` выйдет за пределы родителя.

2. Пытаться задать `width`, `height` или вертикальные `margin`/`padding` строчному тегу (`<span>`, `<a>`) без переключения его в `display: inline-block` или `block`.

3. Забывать про `box-sizing: border-box` (или про `::before`/`::after` в сбросе) — в стандартном `content-box` добавление `padding` и `border` незаметно раздувает элемент сверх `width`.

## Вопросы для закрепления

**1. Какими будут итоговые видимые ширина и высота `.box` при стандартном `content-box` и при `border-box`?**

```css
.box {
  width: 200px;
  height: 100px;
  padding: 15px 40px;
  border: 10px solid #000;
  margin: 20px;
}
```

<details>
<summary>Показать ответ</summary>

- При **`content-box`** (по умолчанию) `padding` и `border` прибавляются к `width` и `height`: ширина = `200 + 40*2 + 10*2 = 300px`, высота = `100 + 15*2 + 10*2 = 150px` (`margin` в габариты самого блока не входит).
- При **`border-box`** видимые размеры по краю рамки останутся ровно `200px` на `100px` (а область `content` внутри сожмётся до `100px` на `50px`).

</details>

**2. Почему `.btn` не стал кнопкой `140px` на `44px`, отступ `margin-top: 30px` пропал, а фон наехал на верхнюю строку текста?**

```html
<p>Верхняя строка текста</p>
<span class="btn">Кнопка</span>
```

```css
.btn {
  width: 140px;
  height: 44px;
  margin-top: 30px;
  padding: 15px 20px;
  background-color: #fde68a;
}
```

<details>
<summary>Показать ответ</summary>

Потому что у `<span>` по умолчанию `display: inline`. Строчные элементы игнорируют `width`, `height` и вертикальные `margin`, а вертикальный `padding` только рисует фон и рамку, не раздвигая соседние строки. Чтобы всё заработало, нужно переключить `.btn` в `display: inline-block` (или `block`).

</details>

**3. В чём разница между `display: none` и `visibility: hidden`, и почему `display: none` нельзя просто плавно проанимировать?**

<details>
<summary>Показать ответ</summary>

`display: none` полностью убирает элемент из раскладки (он **не занимает места**), а `visibility: hidden` прячет его визуально, но **пустое место остаётся**. Сам `display` — дискретное свойство без промежуточных значений, поэтому по умолчанию переключается скачком; на практике для плавного скрытия используют `opacity` с `visibility` (на вырост: в современном CSS для связки `display: none` с плавным `opacity` добавили `transition-behavior: allow-discrete` и `@starting-style`).

</details>

## Задачи

**Задача 1. Сравнение `content-box` и `border-box` на практике**

Есть две карточки с одинаковыми размерами и отступами, но второй добавлен модификатор `.is-border-box`. Проверь, как `box-sizing` меняет реальную ширину блока и области контента.

1. Задай для `.card` свойства `width: 300px`, `padding: 20px`, `border: 5px solid #333` и `margin: 16px`.
2. Для `.card.is-border-box` включи `box-sizing: border-box`.
3. В комментариях над каждым правилом распиши видимую ширину блока, ширину контента внутри и объясни, влияет ли `margin: 16px` на эти цифры.

Проверка: вторая карточка визуально уже первой на `50px`; в DevTools на схеме Box Model у первой `content` равен `300`, а у второй — `250`.

```html
<div class="card">Стандартный content-box</div>
<div class="card is-border-box">Удобный border-box</div>
```

<details>
<summary>Подсказка и решение</summary>

```css
/* content-box: контент = 300px, блок = 300 + 20*2 + 5*2 = 350px */
/* margin: 16px толкает соседей снаружи и в ширину блока не входит */
.card {
  width: 300px;
  padding: 20px;
  border: 5px solid #333;
  margin: 16px;
}

/* border-box: блок = 300px, контент = 300 - 20*2 - 5*2 = 250px */
/* margin: 16px по-прежнему остаётся снаружи рамки */
.card.is-border-box {
  box-sizing: border-box;
}
```

</details>

**Задача 2. Кнопка-ссылка из строчного тега `<a>`**

Нужно превратить обычную строчную ссылку `.btn-link` в аккуратную кнопку фиксированной ширины `220px`, которая не расползается из-за отступов и рамки.

1. Переключи `display` ссылки `.btn-link` с `inline` на `inline-block`.
2. Задай `width: 220px`, `padding: 12px 24px`, `border: 2px solid navy`, `margin-top: 20px` и `color: navy`.
3. Включи `box-sizing: border-box`, чтобы итоговая ширина кнопки осталась ровно `220px`, а не выросла до `272px`.

Проверка: кнопка стоит с отступом `20px` от верхнего `<p>`, рамка не налезает на текст выше, а в DevTools (вкладка `Computed`) итоговая ширина элемента равна ровно `220px`.

```html
<p>Инструкция готова к загрузке:</p>
<a class="btn-link" href="#">Скачать файл</a>
```

<details>
<summary>Подсказка и решение</summary>

```css
/* inline-block включает width и вертикальные отступы для <a> */
/* border-box не даёт padding и border раздуть ширину сверх 220px */
.btn-link {
  display: inline-block;
  box-sizing: border-box;
  width: 220px;
  padding: 12px 24px;
  border: 2px solid navy;
  margin-top: 20px;
  color: navy;
}
```

</details>

**Задача 3. Глобальный `border-box`, починка переполнения и полное скрытие бейджа**

В коде ниже длинный текст вылезает за нижнюю рамку карточки `.article-box`, карточка шире указанных `260px`, а скрытый бейдж `.badge.is-hidden` оставляет перед текстом пустую дыру.

1. Добавь глобальное правило `box-sizing: border-box` для всех элементов и псевдоэлементов `::before` и `::after`.
2. Почини `.article-box`, чтобы высота подстраивалась под любой объём текста (удали фиксированную `height`).
3. Измени способ скрытия `.badge.is-hidden`, чтобы бейдж не занимал места в строке.

Проверка: текст полностью помещается внутри рамки, ширина `.article-box` в DevTools ровно `260px`, а текст начинается сразу от левого внутреннего края без пустого пробела от скрытого бейджа.

```html
<div class="article-box">
  <span class="badge is-hidden">NEW</span>
  Длинный текст статьи, который со временем может стать ещё длиннее
  и точно не поместится в фиксированные 80px по высоте.
</div>
```

```css
/* Проблемный CSS */
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
/* 1. Глобальный border-box для всех тегов и псевдоэлементов */
*,
*::before,
*::after {
  box-sizing: border-box;
}

/* 2. Убираем фиксированную высоту (auto — значение по умолчанию) */
.article-box {
  width: 260px;
  padding: 16px;
  border: 2px solid #999;
}

/* 3. display: none полностью убирает бейдж без пустой дыры */
.badge.is-hidden {
  display: none;
}
```

</details>
