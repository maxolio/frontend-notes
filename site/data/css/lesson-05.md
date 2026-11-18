# Урок 05. Стили браузера, Reset, Normalize и современная нормализация

Суть урока: Вместо грубого `* { margin: 0; padding: 0; }` или полного обнуления в `reset.css` в современных проектах пишут точечную нормализацию с `box-sizing: border-box`, псевдоклассом `:where()` (нулевой вес `0-0-0`) и фильтром `[class]`, чтобы не ломать чужую разметку из CMS и не перебивать стили компонентов.

## 1. Стили браузера и почему `* { margin: 0; padding: 0; }` избыточен (00:22–01:42)

[+] У разных браузеров (Chrome, Safari, Firefox) свои встроенные стили (User-Agent): заголовки `<h1>`–`<h6>`, `<p>` и списки имеют вертикальные `margin`, у `<ul>`/`<ol>` есть левый `padding`, у `<li>` — маркеры, а элементы форм (`<input>`, `<button>`) стилизованы по-разному.

[!] Сбрасывать всё подряд через `* { margin: 0; padding: 0; border: 0; }` — грязное решение: у большинства тегов (вроде `<div>` или `<span>`) и так нет отступов, рамки есть менее чем у десятка тегов, а `list-style` работает только для списков.

## 2. `reset.css` против `normalize.css` (01:43–02:44, 03:47–04:20)

[+] В индустрии есть два классических подхода, и выбор зависит от задачи проекта:

```css
/* 1. RESET (например, reset.css Эрика Мейера):
      Полностью обнуляет отступы, размеры заголовков и маркеры списков в 0.
      Плюс: чистый лист. Минус: даже списки и заголовки теряют вид без новых классов. */

/* 2. NORMALIZE (библиотека normalize.css):
      НЕ убирает отступы у <p>/<h1> и маркеры списков, а приводит все браузеры
      к единому предсказуемому виду и чинит известные баги (особенно в формах). */
```

## 3. Блочная модель в нормализации: `box-sizing: border-box` (02:45–03:46)

[!] Ни классический `reset.css`, ни `normalize.css` не меняют `box-sizing` — это нужно прописать самому для всех элементов и псевдоэлементов `::before` / `::after`:

<!-- demo-html:
<style>
  .demo-wrap { display: flex; flex-direction: column; gap: 8px; }
  .demo-box { width: 200px; padding: 16px; border: 4px solid #b45309; background: #fef3c7; font-size: 13px; }
  .demo-ref { box-sizing: content-box !important; background: #fee2e2; border-color: #b91c1c; }
</style>
<div class="demo-wrap">
  <div class="demo-box">Этот блок: width 200px (с border-box = ровно 200px)</div>
  <div class="demo-box demo-ref">Эталон content-box: 200 + 32 + 8 = 240px</div>
</div>
-->
```css
/* Меняем формулу расчёта размеров: padding и border теперь входят внутрь width/height */
*,
::before,
::after {
  box-sizing: border-box;
}
```

## 4. Современная нормализация с `:where()` и `[class]` (04:21–07:55)

[+] Псевдокласс `:where(...)` всегда даёт **нулевую специфичность (`0-0-0`)**, даже если внутри перечислены теги или `[class]` (в отличие от `:is()`, который берёт максимальный вес из списка). Благодаря этому любой твой класс (`.card`, `.title`) легко перебьёт сброс.

<!-- demo-html:
<style>
  .cms-box { border: 1px dashed #94a3b8; padding: 8px 12px; margin-top: 8px; border-radius: 6px; font-size: 13px; }
  .nav { display: flex; gap: 12px; background: #fef3c7; padding: 6px 10px; border-radius: 6px; }
</style>
<ul class="nav"><li>Главная</li><li>Каталог</li><li>Контакты</li></ul>
<div class="cms-box">
  <p>Статья из CMS (без классов): маркеры и отступы сохранились.</p>
  <ul><li>Пункт списка 1</li><li>Пункт списка 2</li></ul>
</div>
<div style="margin-top:8px;"><button type="button">Кнопка наследует шрифт</button></div>
-->
```css
/* 1. Левый padding убираем ТОЛЬКО у списков, и только если у них есть атрибут class */
:where(ul, ol):where([class]) {
  padding-left: 0;
}

/* 2. Сброс всех отступов у body, figure, blockquote и описание-списков с [class] */
body,
:where(blockquote, figure, fieldset):where([class]) {
  margin: 0;
}

/* 3. Вертикальные внешние отступы убираем только у текстовых тегов с классом */
:where(h1, h2, h3, h4, h5, h6, p, ul, ol, dl):where([class]) {
  margin-block: 0;
}

:where(dd[class]) {
  margin-left: 0;
}

/* Убираем точки только у списков с классом */
:where(ul[class]) {
  list-style: none;
}

/* 4. Картинки: убираем зазор снизу (baseline) и защищаем от вылезания за контейнер */
img {
  display: block;
  max-width: 100%;
}

/* 5. Теги форм единственные не наследуют шрифт от body — заставляем наследовать */
input, textarea, select, button {
  font: inherit;
}

/* 6. База для прижатия футера к низу экрана и плавный переход по #якорям */
html {
  height: 100%;
  scroll-behavior: smooth;
}

body {
  min-height: 100%;
  line-height: 1.5; /* Единый комфортный интервал вместо браузерных 1.2 */
}
```

## 5. Защита контента CMS (`[class]`) и доступность (07:55–09:40)

[+] **Зачем везде фильтр `:where([class])`:** в вёрстке 99% элементов имеют свой класс, и мы сбрасываем им браузерные отступы. Но если на сайт прилетит чистая статья без классов из админки (CMS / WYSIWYG-редактора), обычные `<p>`, `<h2>` и `<ul>` сохранят аккуратные браузерные отступы и маркеры, не слипнувшись в кашу.

```css
/* Уважаем настройку ОС «уменьшить движение» для людей с вестибулярной чувствительностью */
@media (prefers-reduced-motion: reduce) {
  *,
  ::before,
  ::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important; /* Отключаем и плавный скролл по якорям */
  }
}
```

## 3 главные ловушки урока (чек-лист для повторения)

1. Использовать жёсткий сброс `* { margin: 0; padding: 0; }` без `[class]` и `:where()`: отступы и маркеры пропадут даже у обычных статей из CMS без классов, а `padding` пропадёт у элементов, где он не мешал.

2. Забыть `box-sizing: border-box` или не добавить туда `::before` и `::after`: ни `reset.css`, ни `normalize.css` не меняют блочную модель, и псевдоэлементы с `padding` начнут распирать размеры.

3. Забыть `font: inherit;` для `<input>`, `<textarea>`, `<select>`, `<button>` или `display: block;` для `<img>`: кнопки и поля останутся со старым шрифтом браузера, а под картинками останется зазор 3–4px от `baseline`.

## Вопросы для закрепления

**1. Почему в современной нормализации селекторы заворачивают в `:where(h1, h2, p):where([class])`, а не пишут просто `h1, h2, p`?**

<details>
<summary>Показать ответ</summary>

Псевдокласс `:where()` обнуляет специфичность всего, что внутри него, до `0-0-0`. Благодаря этому любой твой рабочий селектор (даже тег `0-0-1` или класс `0-1-0`) перебьёт нормализацию без конфликтов, а фильтр `[class]` не трогает чистый HTML из CMS без классов.

</details>

**2. Почему под тегом `<img>` по умолчанию часто появляется странная пустая полоска высотой 3–4px снизу, и как это чинит `display: block`?**

<details>
<summary>Показать ответ</summary>

По умолчанию `<img>` ведёт себя как строчный элемент (`inline` / `inline-block`) и выравнивается по базовой линии текста (`baseline`), оставляя снизу место под «хвостики» букв вроде `p`, `g`, `y`. Перевод в `display: block` отключает строчное выравнивание, и зазор исчезает.

</details>

**3. В чём главное отличие `reset.css` от `normalize.css`, и что из них добавляет `box-sizing: border-box`?**

<details>
<summary>Показать ответ</summary>

`reset.css` обнуляет все отступы, заголовки и маркеры списков в ноль («с чистого листа»), а `normalize.css` сохраняет полезные стили и выравнивает поведение и баги разных браузеров. `box-sizing: border-box` не добавляет **ни один из них** — его всегда дописывают отдельно.

</details>

## Задачи

**Задача 1. Безопасная нормализация без поломки статьи из CMS**

У тебя на одной странице есть навигация с классами `<ul class="nav-list">` и обычная статья без классов `<ul>...</ul>`. Напиши CSS-правило с `:where()` и `[class]`, которое уберёт маркеры (`list-style: none;`) и левый `padding-left: 0;` **только** у списка с классом, оставив обычный список в статье нетронутым, и с нулевой специфичностью (`0-0-0`).

```html
<ul class="nav-list">
  <li>Главная</li>
  <li>Каталог</li>
</ul>

<article>
  <ul>
    <li>Обычный пункт статьи</li>
    <li>Второй пункт статьи</li>
  </ul>
</article>
```

<details>
<summary>Подсказка и решение</summary>

```css
/* :where(...) гарантирует нулевой вес 0-0-0, а [class] выбирает только списки с атрибутом class */
:where(ul[class]) {
  padding-left: 0;
  list-style: none;
}
```

</details>

**Задача 2. Почини шрифт кнопки, инпута и зазор под картинкой**

В карточке ниже шрифт задан на `body`, но `<input>` и `<button>` рисуются стандартным шрифтом браузера, под `<img>` виднеется лишний зазор 4px снизу, а слишком широкая картинка вылезает за пределы карточки `300px`. Напиши 2 компактных CSS-правила нормализации.

```html
<div class="card">
  <img src="banner.jpg" alt="Баннер" />
  <input type="text" placeholder="Имя" />
  <button type="button">Отправить</button>
</div>
```

<details>
<summary>Подсказка и решение</summary>

<!-- demo-html:
<style>
  body { font-family: Georgia, serif; }
  .card { width: 220px; border: 2px solid #94a3b8; background: #f8fafc; padding: 8px; }
  .card-img-wrap { background: #fde68a; margin-bottom: 8px; }
</style>
<div class="card">
  <div class="card-img-wrap"><img src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='360' height='70'><rect width='360' height='70' fill='%23b45309'/><text x='14' y='42' fill='white' font-size='20'>Баннер 360px</text></svg>" alt="Баннер" /></div>
  <input type="text" placeholder="Имя (Georgia)" style="width:100%;margin-bottom:6px;" />
  <button type="button">Отправить (Georgia)</button>
</div>
-->
```css
/* Блочное отображение убирает зазор от baseline, а max-width не даёт вылезти за 300px */
img {
  display: block;
  max-width: 100%;
}

/* Поля форм и кнопки по умолчанию не наследуют шрифт — принудительно передаём от родителя */
input,
button {
  font: inherit;
}
```

</details>

**Задача 3. Глобальная блочная модель с псевдоэлементами**

Сделай так, чтобы у всех элементов на странице (включая псевдоэлементы `::before` и `::after`) `width` и `height` уже включали в себя `padding` и `border`, а на `body` стоял комфортный межстрочный интервал `1.5` и минимальная высота `100%` (при `html { height: 100%; }`).

```css
/* Допиши недостающие правила нормализации */
```

<details>
<summary>Подсказка и решение</summary>

```css
/* Переводим блочную модель в border-box для всех элементов и псевдоэлементов */
*,
::before,
::after {
  box-sizing: border-box;
}

/* Задаём базу высоты для прижатия футера и читаемый интерлиньяж */
html {
  height: 100%;
}

body {
  min-height: 100%;
  line-height: 1.5;
}
```

</details>
