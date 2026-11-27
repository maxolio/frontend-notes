# Практика 1. Селекторы, комбинаторы и специфичность (уроки 01–02)

## Вопросы для закрепления

**1. Почему `.task:nth-of-type(2n)` считает элементы по тегу `<li>`, а не по классу `.task`, и как посчитать именно по классу?**

<details>
<summary>Показать ответ</summary>

Псевдокласс `:nth-of-type(2n)` всегда нумерует **все элементы с тем же тегом** (`<li>`) внутри родителя и только потом проверяет наличие класса `.task`. Чтобы считать **именно среди элементов с классом `.task`**, используется современный синтаксис `:nth-child(2n of .task)`.

</details>

**2. Зачем в реальной разработке нужен селектор по атрибуту `[attribute]` (например, `[disabled]` или `[data-open]`)?**

<details>
<summary>Показать ответ</summary>

Он позволяет стилизовать состояния элементов без добавления лишних CSS-классов: например, заблокированные кнопки `button[disabled]`, обязательные поля `input[required]` или элементы, которым JS переключает `data-*` / `aria-*` атрибуты.

</details>

## Задачи

<details>
<summary>Задача 1. Комбинаторы (>, +) и селекторы по атрибуту</summary>

Нужно точечно стилизовать заголовок, ссылки и сообщение об ошибке, не добавляя новых классов в HTML.

1. Покрась в `navy` **только прямой** `<h2>` внутри `.panel` (вложенный `<h2>` внутри `.inner` должен остаться чёрным).
2. Ссылкам `<a>`, у которых `href` начинается с `https://`, задай `color: green`, а тем, у которых `href` оканчивается на `.pdf` (в любом регистре), задай `background-color: gold`.
3. Для `.field.is-invalid` покажи (`visibility: visible`) и покрась в `crimson` **только ближайший следующий** `.hint` (второй `.hint` должен остаться скрытым).

```html
<section class="panel">
  <h2>Заголовок панели</h2>
  <div class="inner">
    <h2>Вложенный заголовок</h2>
  </div>

  <ul class="menu">
    <li class="item"><a href="https://example.com">Внешняя ссылка</a></li>
    <li class="item"><a href="/docs/guide.pdf">Документ PDF</a></li>
    <li class="item"><a href="/about">О нас</a></li>
  </ul>

  <input class="field is-invalid" type="text" value="Неверный логин" />
  <span class="hint">Ошибка: минимум 5 символов</span>
  <span class="hint">Подсказка: только латиница</span>
</section>
```

<details>
<summary>Подсказка и решение</summary>

```css
/* Прямой потомок > не затрагивает h2 внутри .inner */
.panel > h2 {
  color: navy;
}

/* Значение атрибута со спецсимволами берём в кавычки */
a[href^="https://"] {
  color: green;
}

/* Флаг i игнорирует регистр (.pdf / .PDF) */
a[href$=".pdf" i] {
  background-color: gold;
}

/* + выбирает только ближайшего соседа сразу после .field.is-invalid */
.field.is-invalid + .hint {
  visibility: visible;
  color: crimson;
}
```

</details>

</details>

<details>
<summary>Задача 2. Псевдоклассы :not(), :nth-of-type(), :empty и :last-child</summary>

Есть список задач `.tasks` и блок тегов `.tags`. Выдели невыполненные задачи и наведи порядок в тегах.

1. Всем `.task`, у которых **нет** класса `.is-done`, задай светло-голубой фон (`background-color: #e0f2fe;`).
2. Всем чётным `.task` (2-й и 4-й по счёту) задай курсив (`font-style: italic;`) через `:nth-of-type(...)`.
3. Пустой `.tag` скрой (`display: none;`), а последнему `.tag` задай зелёную рамку (`border-color: #0f0;`).

```html
<section class="board">
  <ul class="tasks">
    <li class="task">Купить молоко</li>
    <li class="task is-done">Сделать зарядку</li>
    <li class="task">Прочитать главу CSS</li>
    <li class="task is-done">Настроить DevTools</li>
    <li class="task">Написать 3 селектора</li>
  </ul>

  <div class="tags">
    <span class="tag">HTML</span>
    <span class="tag"></span>
    <span class="tag">CSS</span>
    <span class="tag">JS</span>
  </div>
</section>
```

<details>
<summary>Подсказка и решение</summary>

```css
/* Выбирает все .task, у которых нет класса .is-done */
.task:not(.is-done) {
  background-color: #e0f2fe;
}

/* Считает по тегу li внутри ul и проверяет наличие класса .task */
.task:nth-of-type(2n) {
  font-style: italic;
}

/* Скрывает пустой тег без текста и дочерних элементов */
.tag:empty {
  display: none;
}

/* Выбирает последний дочерний элемент внутри .tags */
.tag:last-child {
  border-color: #0f0;
}
```

</details>

</details>

<details>
<summary>Задача 3. Специфичность, соседний комбинатор (+) и атрибуты</summary>

Есть карточка `#promo` с конфликтующим правилом `#promo .text { color: gray; }` (вес `1-1-0`). Перебей его без `!important` и стилизуй элементы точечно.

1. Покрась `.text.lead` в `crimson` так, чтобы перебить `#promo .text` (без `!important`).
2. Второму `<p>` (сразу после `.lead`) задай `font-size: 14px;` через комбинатор `+`.
3. Кнопке `.btn` с атрибутом `disabled` задай `background-color: #94a3b8;` и `cursor: not-allowed;`.

```html
<section id="promo" class="card">
  <h2 class="title">Акция дня</h2>
  <p class="text lead">Обычное описание товара</p>
  <p class="text">Дополнительная строка</p>

  <div class="actions">
    <button class="btn" type="button">Подробнее</button>
    <button class="btn" type="button" disabled>Нет в наличии</button>
  </div>
</section>
```

<details>
<summary>Подсказка и решение</summary>

```css
/* Вес 1-2-0 (1 ID + 2 класса) гарантированно перебивает 1-1-0 */
#promo .text.lead {
  color: crimson;
}

/* Выбирает p, идущий сразу после .lead внутри #promo */
#promo .lead + p {
  font-size: 14px;
}

/* Вес 0-2-0 (класс + атрибут) перебивает .btn (0-1-0) */
.btn[disabled] {
  background-color: #94a3b8;
  cursor: not-allowed;
}
```

</details>

</details>
