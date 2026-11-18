# Урок 02. Все виды селекторов, комбинаторы и расчёт специфичности

Суть урока: базовый рабочий инструмент в CSS — селектор по классу (.card) со средней специфичностью 0-1-0; для точечных выборок есть селекторы атрибутов и комбинаторы (пробел, >, +, ~), а итоговый вес сравнивается по трём разрядам слева направо.

## 1. Базовые селекторы: тег, класс и ID (00:15–01:57)

[+] Селектор по тегу выбирает все теги на странице; класс (.red) можно переиспользовать и задавать списком через пробел в HTML; ID (#header) должен быть уникальным на странице и завышает вес, поэтому в стилях его избегают.

<!-- demo-html:
<p>Обычный &lt;p&gt; (тег)</p>
<p class="red blue">&lt;p class="red blue"&gt; (победит .red, т.к. ниже)</p>
<p id="hero" class="red">&lt;p id="hero" class="red"&gt; (победит #hero)</p>
-->
```css
/* По тегу: применится ко всем <p> на странице */
p {
  color: red;
}

/* По классу: переиспользуется, пишется через точку */
.blue {
  color: blue;
}

/* У <p class="red blue"> победит .red, т.к. он НИЖЕ в CSS */
.red {
  color: red;
}

/* По ID: не рекомендуется — привязка к 1 элементу и высокий вес */
#hero {
  color: navy;
}
```

## 2. Селекторы по атрибуту и модификаторы (01:58–06:53)

[+] Позволяют находить элементы по любому HTML-атрибуту в квадратных скобках [attr]. Спецсимволы перед = работают как мини-регулярки; флаг i отключает регистр (только латиница).

<!-- demo-html:
<div style="display:flex;flex-direction:column;gap:6px;font-size:14px;align-items:flex-start;">
  <input placeholder="Есть [placeholder]" />
  <input type="email" value="test@mail.com" />
  <a href="http://habr.com/posts">http://habr.com/posts (подстрока habr)</a>
  <a href="https://example.org">https://example.org (начинается с https://)</a>
  <a href="http://site.ru">http://site.ru (оканчивается на .ru)</a>
  <div style="display:flex;gap:8px;align-items:center;">
    <img src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='68' height='26'><rect width='68' height='26' fill='%23fef3c7'/><text x='6' y='17' font-size='11'>my cat</text></svg>" alt="my cat" />
    <img src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='68' height='26'><rect width='68' height='26' fill='%23e0e7ff'/><text x='10' y='17' font-size='11'>BIG CAT</text></svg>" alt="BIG CAT" />
  </div>
  <span class="warning-text">class="warning-text" ([class|="warning"])</span>
</div>
-->
```css
/* Есть атрибут placeholder (значение любое) */
[placeholder] {
  border-color: skyblue;
}

/* Точное совпадение (кавычки обязательны для символов/пробелов) */
[type="email"] {
  box-shadow: 0 0 3px navy;
}

/* * — подстрока в любом месте значения */
[href*="habr"] {
  color: green;
}

/* ^ — значение НАЧИНАЕТСЯ с указанной строки */
[href^="https://"] {
  color: darkgreen;
}

/* $ — значение ОКАНЧИВАЕТСЯ на указанную строку */
[href$=".ru"] {
  color: navy;
}

/* ~ — отдельное слово, отделённое пробелами */
[alt~="cat"] {
  border: 2px solid tan;
}

/* | — точно "warning" или "warning-..." с дефисом */
[class|="warning"] {
  color: orange;
}

/* i — игнор регистра (с кириллицей НЕ работает) */
[alt*="cat" i] {
  opacity: 0.75;
}
```

## 3. Универсальный селектор * (06:54–07:42)

[+] Выбирает все элементы разметки (часто применяют в сбросе стилей), но не затрагивает псевдоэлементы ::before / ::after. Шрифт лучше задавать на body (наследование), а не в *.

```css
* { margin: 0; } /* Вес 0-0-0 (слабее даже одиночного тега p), ::before/::after не трогает */
```

## 4. Комбинаторы, группировка и объединение классов (07:43–11:44)

[+] Комбинаторы связывают селекторы по положению в DOM-дереве и не добавляют веса. Не смешивайте .btn.is-active (оба класса на одном теге) и .btn .is-active (вложенность).

<!-- demo-html:
<style>.error-message{visibility:hidden;color:crimson;font-size:13px;}</style>
<section style="border:1px solid #cbd5e1;padding:8px;border-radius:6px;">
  <h2>Прямой &lt;h2&gt; (синий)</h2>
  <div><h2>Вложенный &lt;h2&gt; (не синий)</h2></div>
  <p>Параграф после &lt;h2&gt; (серый)</p>
  <button class="button is-active" type="button">.button.is-active</button>
  <input class="input is-invalid" value="Неверный ввод" />
  <span class="error-message">Ошибка ввода!</span>
</section>
-->
```css
/* Группировка через запятую (общие стили) */
h1, h2, h3 {
  color: #222;
}

/* Объединение (без пробела): оба класса на 1 элементе */
.button.is-active {
  background: coral;
}

/* Потомок (пробел): любой <p> внутри <section> */
section p {
  color: #333;
}

/* Прямой ребёнок (>): только <h2> на 1-м уровне ниже */
section > h2 {
  color: blue;
}

/* Сосед (+): ближайший следующий элемент на 1 уровне */
.input.is-invalid + .error-message {
  visibility: visible;
}

/* Все следующие братья (~) на том же уровне после <h2> */
h2 ~ p {
  color: gray;
}
```

## 5. Специфичность селекторов: 3 разряда веса (11:45–15:15)

[+] Вес любого селектора состоит из трёх счётчиков (A-B-C): A — число #id, B — число .class, [attr] и :псевдоклассов, C — число тегов и ::псевдоэлементов. Разряды сравниваются слева направо (как версии 1.0.0 > 0.20.0), а не как десятичное число.

```css
*               /* 0-0-0 (универсальный селектор и комбинаторы пробел/>/+/~ дают 0) */
p               /* 0-0-1 (1 тег) */
section > p     /* 0-0-2 (2 тега; комбинатор > ничего не прибавляет) */
.text           /* 0-1-0 (1 класс — золотая середина для большинства задач!) */
p.text[title]   /* 0-2-1 (1 тег + 1 класс + 1 атрибут) */
#lead           /* 1-0-0 (1 ID — перебьёт даже 20 классов 0-20-0!) */
p#lead.text     /* 1-1-1 (1 ID + 1 класс + 1 тег) */
```

## 3 главные ловушки урока (чек-лист для повторения)

1. Считать специфичность десятичным числом: даже 15 классов (0-15-0) не перебьют один #id (1-0-0), так как сравнение идёт по разрядам слева направо.

2. Поставить лишний пробел между классами: .btn.active ищет один элемент с двумя классами, а .btn .active — дочерний элемент .active внутри .btn.

3. Ждать от [alt*="кот" i] игнорирования регистра в кириллице или путать [attr~="word"] (целое слово через пробел) с [attr*="word"] (любая подстрока).

## Вопросы для закрепления

**1. У элемента `<div class="a b c ...">` есть правило из 12 классов (вес `0-12-0`) и правило `#main` (вес `1-0-0`). Какое победит и почему запись специфичности как «120 против 100» ошибочна?**

<details>
<summary>Показать ответ</summary>

Победит `#main` (`1-0-0`). Разряды специфичности `(A-B-C)` **не являются десятичным числом** и никогда не перетекают в соседний столбец: браузер сравнивает их слева направо, как номера версий (`1.0.0` больше `0.12.0`). Даже 50 классов не перебьют один `#id`.

</details>

**2. Чем отличаются селекторы `.btn.is-active` и `.btn .is-active`? И изменится ли вес, если вместо пробела поставить `>` (`.btn > .is-active`)?**

<details>
<summary>Показать ответ</summary>

`.btn.is-active` (без пробела) выбирает **один** элемент, у которого указаны сразу оба класса (`class="btn is-active"`). `.btn .is-active` (с пробелом) ищет элемент с классом `is-active`, который лежит **внутри** `.btn` на любом уровне вложенности. При замене пробела на `>` вес останется **точно таким же (`0-2-0`)** — комбинаторы (` `, `>`, `+`, `~`) не добавляют специфичности.

</details>

**3. В чём разница между `[alt~="cat"]`, `[alt*="cat"]` и `[alt|="cat"]` на строке `alt="cat-2 blackcat"`?**

<details>
<summary>Показать ответ</summary>

- `[alt*="cat"]` — **сработает** (ищет подстроку `cat` в любом месте).
- `[alt~="cat"]` — **не сработает** (ищет отдельное слово `cat`, отделённое пробелами, а тут `cat-2` и `blackcat`).
- `[alt|="cat"]` — **сработает**, потому что вся строка атрибута начинается с `cat-` (значение либо равно `cat`, либо начинается с `cat-`).

</details>

## Задачи

**Задача 1. Селекторы по атрибуту для умной стилизации ссылок и картинок**

Напиши CSS-правила без добавления новых классов в HTML:
1) Ссылкам, у которых `href` начинается с `https://`, задай зелёный цвет (`green`).
2) Ссылкам, у которых `href` начинается с `http://`, задай красный цвет (`red`).
3) Ссылкам, у которых `href` оканчивается на `.pdf` в любом регистре (`pdf` / `PDF`), задай фон `gold`.
4) Картинкам `<img>`, у которых в `alt` есть отдельное слово `avatar` (не `avatars` и не `myavatar`), задай рамку `2px solid navy`.

```html
<a href="https://example.com">Безопасная ссылка</a>
<a href="http://example.com">Небезопасная ссылка</a>
<a href="/docs/guide.PDF">Инструкция PDF</a>
<img src="u1.png" alt="user avatar" />
<img src="u2.png" alt="avatars list" />
```

<details>
<summary>Подсказка и решение</summary>

<!-- demo-html:
<div style="display:flex;flex-direction:column;gap:8px;align-items:flex-start;">
  <a href="https://example.com">https://example.com (зелёная)</a>
  <a href="http://example.com">http://example.com (красная)</a>
  <a href="/docs/guide.PDF">/docs/guide.PDF (фон gold)</a>
  <div style="display:flex;gap:10px;align-items:center;">
    <img src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='90' height='34'><rect width='90' height='34' fill='%23dbeafe'/><text x='8' y='21' font-size='12'>user avatar</text></svg>" alt="user avatar" />
    <img src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='90' height='34'><rect width='90' height='34' fill='%23fee2e2'/><text x='8' y='21' font-size='12'>avatars list</text></svg>" alt="avatars list" />
  </div>
</div>
-->
```css
a[href^="https://"] {
  /* ^ проверяет начало значения атрибута: сработает на https:// */
  color: green;
}

a[href^="http://"] {
  /* Отдельный префикс http:// без 's' не перекроет https:// ссылки */
  color: red;
}

a[href$=".pdf" i] {
  /* $ проверяет конец строки атрибута, а флаг 'i' игнорирует регистр (.PDF и .pdf) */
  background-color: gold;
}

img[alt~="avatar"] {
  /* ~ ищет отдельное слово, отделённое пробелами, поэтому 'avatars list' не попадёт */
  border: 2px solid navy;
}
```

</details>

**Задача 2. Комбинаторы прямого ребёнка (`>`) и соседей (`+`, `~`)**

Для приведённой разметки напиши CSS-правила:
1) Покрась в `blue` только **прямой** заголовок `<h2>` внутри `<section class="card">`, не задев `<h2>` внутри вложенного `<div>`.
2) Скрой все `.error-message` (`visibility: hidden;`), а когда у стоящего сразу перед ним `.input` есть одновременно класс `.is-invalid` — покажи **только ближайший следующий** `.error-message` (`visibility: visible;`).
3) Сделай серыми (`color: gray;`) все параграфы `<p>`, идущие на том же уровне после `<h3>` (не только первый, а все следующие братья).

```html
<section class="card">
  <h2>Заголовок карточки</h2>
  <div>
    <h2>Вложенный подзаголовок</h2>
  </div>

  <input class="input is-invalid" type="text" />
  <span class="error-message">Ошибка ввода</span>
  <span class="error-message">Запасная подсказка</span>

  <h3>Примечания</h3>
  <p>Первый комментарий</p>
  <p>Второй комментарий</p>
</section>
```

<details>
<summary>Подсказка и решение</summary>

```css
.card > h2 {
  /* Комбинатор '>' выбирает только прямых детей .card; <h2> внутри <div> останется нетронутым */
  color: blue;
}

.error-message {
  visibility: hidden;
}

.input.is-invalid + .error-message {
  /* Два класса без пробела (.input.is-invalid) требуют оба класса на одном <input>,
     а '+' выбирает только ПЕРВЫЙ соседний .error-message сразу после него */
  visibility: visible;
}

h3 ~ p {
  /* '~' выбирает ВСЕ последующие элементы <p> на том же уровне вложенности после <h3> */
  color: gray;
}
```

</details>

**Задача 3. Расчёт специфичности и починка конфликта без `!important`**

Посмотри на HTML и 4 конфликтующих правила ниже:
1) В комментариях рядом с каждым правилом укажи его специфичность в формате `(A-B-C)` и напиши, какого цвета станет текст сейчас.
2) Перепиши стиль (и при необходимости замени `#lead` на класс `.lead` в CSS/HTML), чтобы выиграл цвет `teal` для `.text.note` **без `#id` и без `!important`**.

```html
<div id="app">
  <p class="text note lead" id="lead">Важный абзац</p>
</div>
```

```css
#lead { color: navy; }
div p.text { color: crimson; }
.text.note { color: teal; }
p { color: black; }
```

<details>
<summary>Подсказка и решение</summary>

```css
/* Исходный расчёт веса (A-B-C):
   #lead      -> (1-0-0) — ПОБЕДИТ СЕЙЧАС (navy), т.к. 1 ID сильнее любого числа классов!
   div p.text -> (0-1-2) — 1 класс + 2 тега
   .text.note -> (0-2-0) — 2 класса (сильнее, чем 0-1-2, но слабее 1-0-0)
   p          -> (0-0-1) — 1 тег */

/* Исправленный вариант: убираем #id из стилей и заменяем на класс .lead (0-1-0).
   Теперь селектор .text.note (0-2-0) тяжелее и .lead (0-1-0), и div p.text (0-1-2),
   потому что 2 класса во втором разряде больше, чем 1 класс! */
.lead { color: navy; }       /* 0-1-0 */
div p.text { color: crimson; } /* 0-1-2 */
.text.note { color: teal; }  /* 0-2-0 -> побеждает! */
p { color: black; }          /* 0-0-1 */
```

</details>
