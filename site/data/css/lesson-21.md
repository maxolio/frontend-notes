# Урок 21. Кроссбраузерность, вендорные префиксы, Can I Use и `@supports`

Суть урока: вендорные префиксы (`-webkit-`, `-moz-`, `-ms-`, `-o-`) пишут строго **до** стандартного свойства (а в реальных проектах их добавляет `Autoprefixer`), поддержку фич проверяют на `caniuse.com`, а директива `@supports` позволяет безопасно подключать новые возможности CSS поверх запасного стиля (fallback), записанного перед ней.

## 1. Вендорные префиксы и `caniuse.com` (00:18–03:49)

[+] **Вендорные префиксы** — временные приставки для экспериментальных или нестандартных возможностей браузерных движков:
- **`-webkit-`** — Chrome, Safari, Edge, Яндекс Браузер, Opera (движки WebKit / Blink).
- **`-moz-`** — Mozilla Firefox.
- **`-ms-`** — старые версии Edge и Internet Explorer.
- **`-o-`** — старые версии Opera (до 12-й).

[+] **Золотое правило порядка:** свойства с префиксами всегда идут **первыми**, а стандартное свойство без префикса — **последним** (чтобы современный браузер использовал эталонную реализацию). Вручную за префиксами не следят — в сборке проекта их автоматически расставляет `Autoprefixer` (PostCSS).

[+] Перед тем как брать код из старых статей (или решать, нужен ли префикс, как для `-webkit-background-clip: text`), проверяйте свойство на **`caniuse.com`** — там виден точный процент поддержки и нужные префиксы.

<!-- demo-html:
<style>
  .pref-title { font-size: 26px; font-weight: 900; margin: 0; }
</style>
<h2 class="pref-title">Градиентный текст с префиксом</h2>
-->
```css
/* Префикс -webkit- идёт ПЕРВЫМ, стандартное свойство — ПОСЛЕДНИМ */
.pref-title {
  background-image: linear-gradient(to right, #2563eb, #16a34a);
  color: transparent;
  -webkit-background-clip: text;
  background-clip: text;
}
```

## 2. Директива `@supports` и запасной стиль (fallback) (03:50–04:23)

[+] Директива `@supports (свойство: значение)` проверяет прямо в браузере пользователя, понимает ли парсер указанную CSS-конструкцию. Также можно использовать операторы `not`, `and`, `or` и проверку селекторов `@supports selector(:focus-visible)`.

[!] Два критических правила: 1) **запасной стиль (fallback) всегда пишут ДО `@supports`** — если поставить его ниже, он перезапишет новое свойство даже в современном браузере; 2) `@supports` проверяет только понимание синтаксиса парсером, но не гарантирует отсутствие визуальных багов.

<!-- demo-html:
<style>
  .sup-card { padding: 12px 16px; border-radius: 8px; border: 2px solid #94a3b8; font-weight: 700; }
</style>
<div class="sup-card">Карточка с fallback и @supports (display: grid)</div>
-->
```css
/* 1. Сначала пишем запасной стиль (fallback) для старых браузеров */
.sup-card {
  display: flex;
  gap: 8px;
  background-color: #f1f5f9;
}

/* 2. Только ПОСЛЕ fallback проверяем поддержку и улучшаем раскладку */
@supports (display: grid) {
  .sup-card {
    display: grid;
    grid-template-columns: 1fr;
    background-color: #dcfce7;
  }
}
```

## 3 главные ловушки урока (чек-лист для повторения)

1. Писать запасной стиль (fallback) **после** директивы `@supports` или ставить `-webkit-`-префикс **после** стандартного свойства — по каскаду более нижнее правило перебьёт современное.

2. Копировать устаревшие «простыни» префиксов (`-webkit-transition`, `-moz-transition`, `-o-transition`) из старых статей без проверки на `caniuse.com`.

3. Думать, что `@supports` защищает от любых багов отрисовки — он проверяет только, знает ли браузер такой синтаксис.

## Вопросы для закрепления

**1. Почему стандартное свойство без префикса всегда нужно писать ПОСЛЕ свойств с `-webkit-` / `-moz-`, а не наоборот?**

<details>
<summary>Показать ответ</summary>

По правилу каскада при равной специфичности побеждает правило, написанное **ниже**. Если браузер уже научился работать по стандарту и поддерживает оба варианта, он возьмёт нижнее стандартное свойство. Если поставить префикс ниже, браузер останется на устаревшей экспериментальной реализации.

</details>

**2. Что пойдёт не так, если написать блок `@supports (display: grid) { ... }`, а уже ПОСЛЕ него указать обычный `.box { display: flex; }` как запасной вариант?**

<details>
<summary>Показать ответ</summary>

Запасной `display: flex;` стоит ниже в файле, поэтому в современном браузере он просто перезапишет `display: grid;` из `@supports`. Fallback обязан идти строго **перед** `@supports`.

</details>

**3. Как проверить в `@supports`, поддерживает ли браузер новый псевдокласс вроде `:focus-visible`, и какой инструмент автоматически ставит префиксы при сборке?**

<details>
<summary>Показать ответ</summary>

Для проверки селекторов используют функцию `@supports selector(:focus-visible) { ... }`. А вендорные префиксы на реальных проектах автоматически добавляет инструмент **Autoprefixer** (плагин для PostCSS) на основе нужного списка браузеров.

</details>

## Задачи

**Задача 1. Правильный порядок вендорных префиксов для обрезки текста фоном**

В коде ниже разработчик перепутал порядок свойств и забыл префикс для Chrome/Safari, из-за чего градиент ложится на прямоугольник вместо букв. Исправь правило `.gradient-logo`: добавь `-webkit-background-clip: text;` в правильном месте относительно `background-clip: text;`.

```html
<span class="gradient-logo">CSS PRO</span>
```

```css
/* Проблемный CSS: */
.gradient-logo {
  font-size: 28px;
  font-weight: 900;
  background-image: linear-gradient(90deg, #0ea5e9, #8b5cf6);
  background-clip: text;
  color: transparent;
}
```

<details>
<summary>Подсказка и решение</summary>

<!-- demo-html:
<span class="gradient-logo">CSS PRO</span>
-->
```css
/* Префиксное свойство ставим ПЕРЕД стандартным background-clip: text */
.gradient-logo {
  font-size: 28px;
  font-weight: 900;
  background-image: linear-gradient(90deg, #0ea5e9, #8b5cf6);
  color: transparent;
  -webkit-background-clip: text;
  background-clip: text;
}
```

</details>

**Задача 2. Безопасный fallback и `@supports` для `gap` в Flexbox**

Допустим, нужно подстраховаться для очень старых браузеров, которые не знают `gap` во Flexbox:
1) Задай `.nav` базовый `display: flex;` и нижний отступ детям `.nav-item { margin-right: 12px; }` как fallback.
2) Внутри `@supports (gap: 12px)` включи `gap: 12px;` для `.nav` и обнули `margin-right: 0;` у `.nav-item`, чтобы отступы не удвоились.

```html
<nav class="nav">
  <a class="nav-item" href="#">Главная</a>
  <a class="nav-item" href="#">Уроки</a>
  <a class="nav-item" href="#">Тесты</a>
</nav>
```

<details>
<summary>Подсказка и решение</summary>

<!-- demo-html:
<style>
  .nav-item { padding: 6px 10px; background: #dbeafe; border-radius: 4px; text-decoration: none; color: #1e3a8a; font-weight: 700; }
</style>
<nav class="nav">
  <a class="nav-item" href="#">Главная</a>
  <a class="nav-item" href="#">Уроки</a>
  <a class="nav-item" href="#">Тесты</a>
</nav>
-->
```css
/* 1. Fallback для старых браузеров */
.nav {
  display: flex;
}

.nav-item {
  margin-right: 12px;
}

/* 2. Улучшение через @supports строго ПОСЛЕ fallback */
@supports (gap: 12px) {
  .nav {
    gap: 12px;
  }

  .nav-item {
    margin-right: 0;
  }
}
```

</details>

**Задача 3. Проверка селектора `:focus-visible` через `@supports selector(...)`**

Сделай так, чтобы для `.focus-btn` по умолчанию стояла классическая обводка `:focus { outline: 2px solid #2563eb; }`, а если браузер понимает `:focus-visible` (`@supports selector(:focus-visible)`), обводка при простом клике через `:focus` отключалась (`outline: none;`) и переносилась на `:focus-visible`.

```html
<button class="focus-btn" type="button">Проверь Tab и клик</button>
```

<details>
<summary>Подсказка и решение</summary>

<!-- demo-html:
<style>
  .focus-btn { padding: 8px 14px; border: 1px solid #64748b; border-radius: 6px; background: #fff; font: inherit; cursor: pointer; }
</style>
<button class="focus-btn" type="button">Проверь Tab и клик</button>
-->
```css
/* Fallback: обычная обводка фокуса для старых браузеров */
.focus-btn:focus {
  outline: 2px solid #2563eb;
}

/* Если браузер знает :focus-visible, убираем залипание при клике */
@supports selector(:focus-visible) {
  .focus-btn:focus {
    outline: none;
  }

  .focus-btn:focus-visible {
    outline: 3px solid #f59e0b;
    outline-offset: 2px;
  }
}
```

</details>
