# Урок 14. Псевдоклассы в CSS: `:nth-child`, `:not`, состояния и кастомный чекбокс

Суть урока: псевдоклассы (`:`) выбирают элементы по их положению среди соседей (`:first-child`, `:nth-child()`), исключению (`:not()`) или состоянию взаимодействия (`:hover`, `:focus-visible`, `:active`, `:disabled`, `:checked`), а связка `:checked` + `+` + `::after` позволяет стилизовать кастомный чекбокс без единой строчки JS.

## 1. Группа `child` и выборка по номеру (00:47–03:46)

[+] Псевдоклассы пишутся с **одним двоеточием `:`** (в отличие от псевдоэлементов `::`). Группа `child` считает позицию элемента **среди всех соседних детей** одного родителя:
- `:first-child` — первый ребёнок родителя; `:last-child` — последний; `:only-child` — единственный.
- `:nth-child(...)` — по формуле или ключевому слову: `odd` (нечётные), `even` (чётные), `2` (второй), `3n` (каждый третий), `3n + 5` (каждый третий начиная с 5-го), `-n + 4` (первые 4).
- `:nth-last-child(...)` — то же самое, но отсчёт с конца.

[!] Осторожно с `p:first-child`: если перед первым `<p>` внутри родителя стоит `<h2>`, селектор **не сработает**, потому что `<p>` уже 2-й ребёнок по счёту (для первого тега своего типа есть `:first-of-type`).

<!-- demo-html:
<style>
  .ch-list { list-style: none; padding: 0; margin: 0; display: flex; gap: 6px; }
  .ch-item { padding: 6px 10px; border: 1px solid #94a3b8; border-radius: 4px; font-weight: 700; }
</style>
<ul class="ch-list">
  <li class="ch-item">1</li>
  <li class="ch-item">2</li>
  <li class="ch-item">3</li>
  <li class="ch-item">4</li>
  <li class="ch-item">5</li>
</ul>
-->
```css
/* Закрасит нечётные пункты (1, 3, 5) */
.ch-item:nth-child(odd) {
  background-color: #fef3c7;
}

/* Выделит только первые 2 элемента формулой -n + 2 */
.ch-item:nth-child(-n + 2) {
  border-color: #2563eb;
  color: #1d4ed8;
}

/* Последний элемент списка */
.ch-item:last-child {
  background-color: #dcfce7;
}
```

## 2. Отрицание `:not()` (03:47–05:27)

[+] `:not(...)` инвертирует условие внутри скобок: удобно, чтобы задать отступ всем элементам списка **кроме последнего** (`li:not(:last-child)`), или скрыть элемент, когда у него нет активного класса (`.tooltip:not(.is-active)`).

[!] В отличие от `:where()`, псевдокласс `:not()` **добавляет специфичность** самого тяжёлого селектора внутри своих скобок (`.tooltip:not(.is-active)` весит `0-2-0`).

<!-- demo-html:
<style>
  .not-row { display: flex; }
  .not-btn { padding: 6px 12px; background: #e2e8f0; border: 1px solid #64748b; }
</style>
<div class="not-row">
  <span class="not-btn">Шаг 1</span>
  <span class="not-btn">Шаг 2</span>
  <span class="not-btn">Шаг 3 (последний без отступа)</span>
</div>
-->
```css
/* Отступ справа получат все кнопки, кроме самой последней */
.not-btn:not(:last-child) {
  margin-right: 10px;
}
```

## 3. Состояния: `:hover`, `:focus-visible`, `:active`, `:disabled`, `:checked` (05:28–09:20)

[+] Состояния реагируют на действия пользователя:
- **`:hover`** — наведение курсора мыши.
- **`:focus`** vs **`:focus-visible`** — `:focus` срабатывает даже при клике мышкой (обводка «залипает» на кнопке), а `:focus-visible` подсвечивает элемент **только при навигации с клавиатуры (`Tab`)**.
- **`:active`** — момент зажатия клика (пишется **после `:hover`**, иначе `:hover` перебьёт активный стиль).
- **`:disabled`** — отключённая кнопка или поле с HTML-атрибутом `disabled`.
- **`:checked`** — динамическое состояние отмеченного чекбокса или радиокнопки.

<!-- demo-html:
<style>
  .st-row { display: flex; gap: 10px; flex-wrap: wrap; }
  .st-btn { padding: 8px 14px; border: 2px solid #2563eb; background: #fff; border-radius: 6px; font: inherit; cursor: pointer; }
</style>
<div class="st-row">
  <button class="st-btn" type="button">Наведи / нажми / Tab</button>
  <button class="st-btn" type="button" disabled>Disabled</button>
</div>
-->
```css
/* При наведении курсора (только не для отключённых кнопок) */
.st-btn:not(:disabled):hover {
  background-color: #dbeafe;
}

/* В момент нажатия кнопки — обязательно ПОСЛЕ :hover */
.st-btn:not(:disabled):active {
  background-color: #93c5fd;
}

/* Подсветка фокуса только при навигации с клавиатуры (Tab) */
.st-btn:focus-visible {
  outline: 3px solid #f59e0b;
  outline-offset: 2px;
}

/* Бледный вид и запрет курсора для заблокированной кнопки */
.st-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
```

## 4. Практика: кастомный чекбокс без JavaScript (09:21–11:44)

[+] Напрямую перерисовать стандартный `<input type="checkbox">` сложно, поэтому используют обёртку `<label>`, визуально скрывают нативный `<input>` через `.visually-hidden` (НЕ `display: none`, чтобы он оставался доступным для клика и `Tab`!) и рисуют квадрат с галочкой на соседнем `<span class="checkbox-emulator">` через `::after` и комбинатор `+`.

<!-- demo-html:
<style>
  .visually-hidden { position: absolute; width: 1px; height: 1px; margin: -1px; overflow: hidden; clip-path: inset(50%); }
  .checkbox { display: inline-flex; align-items: center; gap: 8px; cursor: pointer; user-select: none; }
</style>
<label class="checkbox">
  <input class="checkbox-control visually-hidden" type="checkbox" />
  <span class="checkbox-emulator"></span>
  <span>Кликни, чтобы переключить галочку</span>
</label>
-->
```css
/* Квадрат-эмулятор: делаем опорным родителем для галочки ::after */
.checkbox-emulator {
  position: relative;
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 2px solid #2563eb;
  border-radius: 4px;
}

/* Галочка внутри квадрата */
.checkbox-emulator::after {
  content: "✓";
  position: absolute;
  inset: 0;
  text-align: center;
  line-height: 16px;
  font-weight: 700;
  color: #16a34a;
}

/* Если чекбокс НЕ отмечен, скрываем галочку у соседнего эмулятора */
.checkbox-control:not(:checked) + .checkbox-emulator::after {
  display: none;
}
```

## 3 главные ловушки урока (чек-лист для повторения)

1. Писать `:active` выше `:hover` у кнопок и ссылок — при зажатии кнопки курсор всё ещё над ней, и более нижний `:hover` перекроет `:active`.

2. Скрывать нативный чекбокс через `display: none;` при создании кастомного — такой `<input>` выпадает из клавиатурной навигации (`Tab`) и его сложнее озвучить скринридерам (нужен `.visually-hidden`).

3. Путать `p:first-child` с «первым `<p>` в родителе»: если перед `<p>` есть `<h2>`, то `p:first-child` не сработает (тогда нужен `:first-of-type`).

## Вопросы для закрепления

**1. Почему в современных интерфейсах вместо `:focus` для кнопок всё чаще используют `:focus-visible`?**

<details>
<summary>Показать ответ</summary>

`:focus` в Chrome и ряде браузеров срабатывает даже при обычном клике мышью, из-за чего рамка фокуса «залипает» на кнопке после нажатия. `:focus-visible` появляется только тогда, когда браузер видит навигацию с клавиатуры (`Tab`), не мешая пользователям мыши.

</details>

**2. Сработает ли селектор `.box p:first-child`, если внутри `<div class="box">` сначала идёт `<h3>Заголовок</h3>`, а сразу за ним `<p>Текст</p>`?**

<details>
<summary>Показать ответ</summary>

Нет, не сработает. `:first-child` проверяет, является ли элемент **самым первым ребёнком** родителя среди всех тегов. Здесь первым ребёнком является `<h3>`, а `<p>` — вторым. Чтобы выбрать первый именно `<p>`, нужно использовать `p:first-of-type`.

</details>

**3. Зачем в кастомном чекбоксе нативный `<input>` прячут классом `.visually-hidden`, а не простым `display: none;`?**

<details>
<summary>Показать ответ</summary>

При `display: none;` элемент полностью убирается из доступного дерева и теряет возможность фокусировки с клавиатуры (`Tab`). Класс `.visually-hidden` делает элемент невидимым размером в `1px`, но сохраняет возможность переключать его пробелом и озвучивать скринридерами.

</details>

## Задачи

**Задача 1. «Зебра» для строк списка и отступ без последнего элемента**

В списке `.rows-list` ниже:
1) Покрась все чётные пункты (`2`, `4`) в светло-серый фон `#f1f5f9` с помощью `:nth-child(even)`.
2) Задай всем пунктам, **кроме последнего**, нижний отступ `margin-bottom: 8px;` с помощью комбинации `:not(:last-child)`.

```html
<ul class="rows-list">
  <li>Строка 1</li>
  <li>Строка 2</li>
  <li>Строка 3</li>
  <li>Строка 4</li>
</ul>
```

<details>
<summary>Подсказка и решение</summary>

<!-- demo-html:
<style>
  .rows-list { list-style: none; padding: 0; margin: 0; width: 220px; }
  .rows-list li { padding: 6px 10px; border: 1px solid #cbd5e1; border-radius: 4px; }
</style>
<ul class="rows-list">
  <li>Строка 1</li>
  <li>Строка 2</li>
  <li>Строка 3</li>
  <li>Строка 4</li>
</ul>
-->
```css
/* Выбираем 2-й, 4-й и последующие чётные элементы */
.rows-list li:nth-child(even) {
  background-color: #f1f5f9;
}

/* Ставим нижний отступ всем, кроме последнего пункта */
.rows-list li:not(:last-child) {
  margin-bottom: 8px;
}
```

</details>

**Задача 2. Живая кнопка с состояниями в правильном порядке (`LoVe HAte`)**

Оформи кнопку `.action-btn` с базовым фоном `#2563eb` и белым текстом `#fff`:
1) При наведении (`:hover`) затемни фон до `#1d4ed8`.
2) В момент клика (`:active`) сделай фон `#1e3a8a` (подумай про порядок правил!).
3) При фокусе с клавиатуры (`:focus-visible`) добавь `outline: 3px solid #f59e0b; outline-offset: 2px;`.

```html
<button class="action-btn" type="button">Отправить заявку</button>
```

<details>
<summary>Подсказка и решение</summary>

<!-- demo-html:
<style>
  .action-btn { padding: 8px 16px; border: 0; border-radius: 6px; font: inherit; cursor: pointer; }
</style>
<button class="action-btn" type="button">Отправить заявку</button>
-->
```css
.action-btn {
  background-color: #2563eb;
  color: #fff;
}

/* Сначала :hover */
.action-btn:hover {
  background-color: #1d4ed8;
}

/* :active строго ПОСЛЕ :hover, чтобы нажатие не перебивалось наведением */
.action-btn:active {
  background-color: #1e3a8a;
}

/* Видимый фокус только при навигации клавишей Tab */
.action-btn:focus-visible {
  outline: 3px solid #f59e0b;
  outline-offset: 2px;
}
```

</details>

**Задача 3. Индикатор переключения для кастомной радиокнопки**

У нас есть обёртка `.radio` с `<input class="radio-input">` и `<span class="radio-dot"></span>`. Сделай так, чтобы когда `.radio-input` отмечен (`:checked`), соседний `.radio-dot` менял цвет фона на `#16a34a` и получал рамку `3px solid #bbf7d0`.

```html
<label class="radio">
  <input class="radio-input" type="radio" name="plan" />
  <span class="radio-dot"></span>
  <span>Тариф Pro</span>
</label>
```

<details>
<summary>Подсказка и решение</summary>

<!-- demo-html:
<style>
  .radio { display: inline-flex; align-items: center; gap: 8px; cursor: pointer; }
  .radio-dot { width: 16px; height: 16px; border-radius: 50%; border: 2px solid #64748b; display: inline-block; }
</style>
<label class="radio">
  <input class="radio-input" type="radio" name="plan" />
  <span class="radio-dot"></span>
  <span>Тариф Pro</span>
</label>
-->
```css
/* Когда соседний input отмечен (:checked), перекрашиваем кружок .radio-dot */
.radio-input:checked + .radio-dot {
  background-color: #16a34a;
  border: 3px solid #bbf7d0;
}
```

</details>
