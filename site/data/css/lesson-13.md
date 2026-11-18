# Урок 13. Псевдоэлементы в CSS: `::before`, `::after`, `::marker`, `::placeholder` и др.

Суть урока: псевдоэлементы (`::`) — это виртуальные части элементов, которые не пишутся в HTML, а создаются из CSS: специализированные (`::placeholder`, `::file-selector-button`, `::first-letter`, `::selection`, `::marker`) стилизуют встроенные детали, а универсальные `::before` и `::after` добавляют декор через обязательный `content: ""`.

## 1. Специализированные псевдоэлементы: формы, текст и списки (00:56–04:09)

[+] В отличие от псевдоклассов (`:`), псевдоэлементы пишутся с двумя двоеточиями `::`. У каждого встроенного псевдоэлемента свой набор разрешённых свойств:
- **`::placeholder`** — текст-подсказка в `<input>` и `<textarea>` (работают только свойства текста и фона).
- **`::file-selector-button`** — встроенная кнопка выбора файла у `<input type="file">`.
- **`::first-letter`** и **`::first-line`** — первая буква (принимает также `margin`, `padding`, `border`) и первая строка абзаца.
- **`::selection`** — выделенный мышкой текст (обычно задают `color` и `background-color`).
- **`::marker`** — маркер пункта `<li>` (можно менять цвет, размер шрифта и символ через `content`).

<!-- demo-html:
<style>
  .pe-box { display: flex; flex-direction: column; gap: 8px; font-size: 14px; }
  .pe-input, .pe-file { font: inherit; }
  .pe-list { margin: 0; padding-left: 20px; }
</style>
<div class="pe-box">
  <input class="pe-input" type="text" placeholder="Подсказка (::placeholder)" />
  <input class="pe-file" type="file" />
  <p class="pe-quote">Буквица и выделение текста мышкой (попробуй выделить меня!).</p>
  <ul class="pe-list">
    <li class="pe-item">Пункт списка с кастомным маркером</li>
  </ul>
</div>
-->
```css
/* Меняем цвет текста-подсказки в инпуте */
.pe-input::placeholder {
  color: #0284c7;
}

/* Стилизуем кнопку «Выбрать файл» у input[type="file"] */
.pe-file::file-selector-button {
  background-color: #fef3c7;
  border: 1px solid #b45309;
  border-radius: 4px;
  padding: 4px 10px;
}

/* Оформляем первую букву абзаца как буквицу */
.pe-quote::first-letter {
  font-size: 24px;
  font-weight: 700;
  color: #dc2626;
}

/* Стиль текста, когда пользователь выделяет его мышкой */
.pe-quote::selection {
  background-color: #0f172a;
  color: #fde047;
}

/* Заменяем стандартную точку списка на символ галочки */
.pe-item::marker {
  content: "✓ ";
  color: #16a34a;
  font-weight: 700;
}
```

## 2. Универсальные `::before` и `::after` (04:10–07:15)

[+] `::before` вставляет виртуальный элемент **внутрь** тега перед его содержимым, а `::after` — **внутрь** в самом конце. У одного элемента может быть максимум два таких псевдоэлемента.

[!] Чтобы `::before` или `::after` появились на странице, им **обязательно** нужно свойство `content` (для декоративного кружка или линии пишут пустую строку `content: "";`). По умолчанию они строчные (`inline`), поэтому для задания `width`/`height` им нужен `display: block` / `inline-block` или `position: absolute`.

[!] Важные ограничения: 1) `::before` и `::after` **не работают** на одиночных и замещаемых тегах без внутреннего содержимого (`<img>`, `<input>`, `<br>`) — вешайте их на обёртку (`<div>`, `<label>`); 2) текст внутри `content: "Текст";` могут читать скринридеры, поэтому декор делают с пустым `content: "";`.

<!-- demo-html:
<style>
  .status-row { display: flex; flex-direction: column; gap: 10px; align-items: flex-start; }
  .status-dot { font-weight: 700; padding: 6px 12px; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; }
  .card-arrow { padding: 8px 14px; background: #fef3c7; border-radius: 6px; font-weight: 700; }
</style>
<div class="status-row">
  <span class="status-dot">В сети (кружок через ::before)</span>
  <div class="card-arrow">Карточка с точкой (relative + ::after)</div>
</div>
-->
```css
/* Добавляем зелёный индикатор перед текстом без лишнего <span> в HTML */
.status-dot::before {
  content: "";
  display: inline-block;
  width: 10px;
  height: 10px;
  margin-right: 8px;
  border-radius: 50%;
  background-color: #16a34a;
}

/* Родитель как точка отсчёта для абсолютного псевдоэлемента */
.card-arrow {
  position: relative;
  padding-right: 28px;
}

/* Декоративный акцент в правом верхнем углу; absolute сам делает его блочным */
.card-arrow::after {
  content: "";
  position: absolute;
  top: 6px;
  right: 8px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #dc2626;
}
```

## 3 главные ловушки урока (чек-лист для повторения)

1. Забыть свойство `content: "";` в `::before` или `::after` — без него браузер вообще не создаст псевдоэлемент, даже если заданы `width`, `height` и `background`.

2. Пытаться задать `width` и `height` псевдоэлементу `::before` без `display: inline-block` / `block` или `position: absolute` — по умолчанию он строчный (`inline`) и игнорирует размеры.

3. Вешать `::before` или `::after` на `<img>` или `<input>` — одиночные теги не имеют внутреннего содержимого, поэтому псевдоэлемент внутри них не отобразится.

## Вопросы для закрепления

**1. Почему код `.badge::before { width: 12px; height: 12px; background: red; }` ничего не нарисует на экране (сразу две причины)?**

<details>
<summary>Показать ответ</summary>

1) Не указано обязательное свойство `content: "";` — без него браузер не создаёт псевдоэлемент. 2) По умолчанию `::before` имеет `display: inline`, поэтому игнорирует `width` и `height` (нужен `display: inline-block` / `block` или `position: absolute`).

</details>

**2. На каких HTML-тегах нельзя использовать `::before` и `::after`, и как решить задачу, если к картинке или инпуту нужна иконка?**

<details>
<summary>Показать ответ</summary>

`::before` и `::after` не работают на одиночных и замещаемых тегах вроде `<img>`, `<input>`, `<br>`, потому что псевдоэлемент вставляется **внутрь** тега. Чтобы добавить декоративную иконку или бейдж, тег оборачивают в `<div>` или `<label>` и вешают псевдоэлемент на обёртку.

</details>

**3. Чем отличаются `::placeholder` и `::selection` по смыслу и какие свойства в них стоит менять?**

<details>
<summary>Показать ответ</summary>

`::placeholder` стилизует текст-подсказку внутри пустого поля ввода (меняют `color` и параметры шрифта), а `::selection` — вид любого текста в момент выделения мышкой (обычно меняют `background-color` и `color`).

</details>

## Задачи

**Задача 1. Обязательная звёздочка `*` у подписи поля через `::after`**

Сделай так, чтобы после текста `<label class="field-label">` автоматически появлялась красная звёздочка ` *` без добавления её в HTML.

```html
<label class="field-label">Электронная почта</label>
```

<details>
<summary>Подсказка и решение</summary>

<!-- demo-html:
<style>
  .field-label { font-weight: 700; }
</style>
<label class="field-label">Электронная почта</label>
-->
```css
/* Добавляем символ в конец содержимого label с небольшим отступом слева */
.field-label::after {
  content: " *";
  color: #dc2626;
}
```

</details>

**Задача 2. Декоративная вертикальная полоса слева у цитаты (`::before` + `position`)**

Для блока цитаты `.quote-card` ниже нарисуй синюю полосу шириной `4px` вдоль левого края, используя `position: relative` на `.quote-card` и `::before` с `position: absolute` (без `border-left`, чтобы потренировать `::before` и `inset`).

```html
<blockquote class="quote-card">
  Чистый HTML и аккуратный CSS экономят часы отладки.
</blockquote>
```

<details>
<summary>Подсказка и решение</summary>

<!-- demo-html:
<style>
  .quote-card { margin: 0; padding: 10px 14px 10px 20px; background: #f8fafc; border-radius: 6px; }
</style>
<blockquote class="quote-card">
  Чистый HTML и аккуратный CSS экономят часы отладки.
</blockquote>
-->
```css
/* Опорный родитель для декоративной полосы */
.quote-card {
  position: relative;
}

/* Растягиваем полосу по всей высоте цитаты через top: 0 и bottom: 0 */
.quote-card::before {
  content: "";
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: 4px;
  background-color: #2563eb;
  border-radius: 4px;
}
```

</details>

**Задача 3. Кастомный маркер списка и выделение текста**

Для списка `.check-list`:
1) Поменяй стандартные точки пунктов `li` на символ `"→ "` синего цвета (`#2563eb`) с помощью `::marker`.
2) Сделай так, чтобы при выделении текста внутри `.check-list` фон выделения был `#fde047`, а цвет текста `#0f172a` (`::selection`).

```html
<ul class="check-list">
  <li>Изучить ::before и ::after</li>
  <li>Потренировать ::marker</li>
</ul>
```

<details>
<summary>Подсказка и решение</summary>

```css
/* Стилизуем встроенный маркер каждого пункта списка */
.check-list li::marker {
  content: "→ ";
  color: #2563eb;
  font-weight: 700;
}

/* Стилизуем выделение текста мышкой внутри списка */
.check-list li::selection {
  background-color: #fde047;
  color: #0f172a;
}
```

</details>
