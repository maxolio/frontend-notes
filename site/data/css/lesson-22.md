# Урок 22. CSS-переменные (`--custom-properties`) и `var()`

Суть урока: CSS-переменные (`--имя: значение;`) позволяют хранить токены в `:root` и локально в компонентах, читать их через `var(--имя, запасное)` (с учётом регистра и области видимости DOM), элегантно менять модификаторы компонентов без лишней вложенности и управлять темами даже из JS.

## 1. Объявление, `var()`, fallback и область видимости (00:15–03:33)

[+] Переменная объявляется внутри любого селектора с двумя дефисами в начале (`--accent: #2563eb;`) и **зависит от регистра** (`--bg` и `--BG` — разные переменные). Значение подставляется через `var(--accent)`, а вторым аргументом через запятую можно указать запасное значение `var(--accent, blue)`.

[+] **Область видимости:** переменная видна самому элементу и **всем вложенным потомкам** (наследуется по DOM-дереву). Во вложенном блоке переменную можно переопределить, не задев родителя. Одна переменная может ссылаться на другую.

[!] Запасное значение в `var(--color, red)` сработает только если `--color` вообще не объявлена или не видна в этом месте. Если же задать `--color: 20px;` и передать в `color: var(--color, red)`, браузер подставит `20px`, отбросит невалидное свойство и **не переключится на `red`**.

<!-- demo-html:
<style>
  .scope-box { padding: 10px; border: 3px solid var(--boxBorder, #64748b); border-radius: 6px; margin-bottom: 6px; font-size: 13px; }
</style>
<div class="scope-box scope-root">
  Уровень 1 (красная рамка из --boxBorder)
  <div class="scope-box scope-inner">
    Уровень 2 (переопределили --boxBorder на синюю)
    <div class="scope-box">Уровень 3 (унаследовал синюю рамку от Уровня 2)</div>
  </div>
</div>
-->
```css
/* Объявляем переменную на внешнем блоке — доступна ему и всем потомкам */
.scope-root {
  --boxBorder: #dc2626;
}

/* Локально переопределяем ту же переменную для вложенной ветки */
.scope-inner {
  --boxBorder: #2563eb;
}
```

## 2. Глобальные (`:root`) и локальные переменные в компонентах (03:34–08:11)

[+] Глобальные токены проекта (цвета, шрифты, отступы, тени, `z-index`) выносят в псевдокласс **`:root`** (он указывает на `<html>`, но имеет специфичность `0-1-0`). Это позволяет переключать светлую/тёмную тему из одной точки.

[+] В компонентах удобно разделять стили именования: глобальные в `:root` — в `kebab-case` (`--color-accent`), локальные внутри компонента — в `camelCase` (`--btnBg`). Тогда модификатор (`.btn--danger`) меняет только локальную переменную в 1–2 строки, не дублируя селекторы внутренних иконок и текстов.

<!-- demo-html:
<style>
  .ui-btn-row { display: flex; gap: 10px; flex-wrap: wrap; }
</style>
<div class="ui-btn-row">
  <button class="ui-btn" type="button">
    <span class="ui-btn-icon">★</span>
    <span>Основная</span>
  </button>
  <button class="ui-btn ui-btn--danger" type="button">
    <span class="ui-btn-icon">✕</span>
    <span>Удалить</span>
  </button>
</div>
-->
```css
:root {
  --color-primary: #2563eb;
  --color-danger: #dc2626;
}

/* Локальные переменные компонента ссылаются на глобальные из :root */
.ui-btn {
  --btnBg: var(--color-primary);
  --btnText: #ffffff;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border: 0;
  border-radius: 6px;
  background-color: var(--btnBg);
  color: var(--btnText);
  font: inherit;
  cursor: pointer;
}

/* Иконка внутри кнопки тоже использует локальную переменную или currentColor */
.ui-btn-icon {
  color: var(--btnText);
}

/* Модификатору достаточно поменять одну переменную, не трогая вложенные классы */
.ui-btn--danger {
  --btnBg: var(--color-danger);
}
```

## 3. Трюк для CMS и работа из JavaScript (08:12–10:28)

[+] Вместо инлайн-свойства `<div style="background-image: url(...)">` (которое сложно перебить из CSS без `!important`), бэкенд может прокинуть переменную `<div class="hero" style="--heroBg: url(...)">`. В CSS вы используете `background-image: var(--heroBg);` — и на мобильном экране её легко отключить обычным CSS без `!important`.

[+] В JavaScript задать переменную можно через `el.style.setProperty('--name', 'value')`. А вот чтобы **прочитать** переменную, объявленную в `:root` или `.css`-файле (не в инлайне), нужно `getComputedStyle(el).getPropertyValue('--name')`.

[!] Помните: CSS-переменные вычисляются уже на DOM-элементах, поэтому **в условиях `@media` они не работают** (`@media (max-width: var(--bp))` невалидно).

## 3 главные ловушки урока (чек-лист для повторения)

1. Писать `var(--myVar)` в разном регистре или ставить пробел перед скобкой `var (--myVar)` — имена переменных чувствительны к регистру, а пробел ломает вызов функции.

2. Пытаться использовать CSS-переменную внутри условий медиазапроса `@media (max-width: var(--tablet))` — переменные там не поддерживаются.

3. Читать переменную из `:root` через `element.style.getPropertyValue('--x')` — `el.style` видит только инлайн-атрибут `style="..."`; для стилей из CSS нужен `getComputedStyle(element).getPropertyValue('--x')`.

## Вопросы для закрепления

**1. Чем псевдокласс `:root` отличается от селектора по тегу `html` при объявлении глобальных переменных?**

<details>
<summary>Показать ответ</summary>

Оба указывают на корневой элемент `<html>`, но `:root` — это псевдокласс со специфичностью **`0-1-0`**, тогда как у тега `html` специфичность `0-0-1`. Кроме того, в сообществе сложился стандарт хранить глобальные токены именно в `:root`.

</details>

**2. Сработает ли запасное значение `blue` в `color: var(--btnSize, blue);`, если выше задано `--btnSize: 16px;`?**

<details>
<summary>Показать ответ</summary>

Нет, не сработает. Переменная `--btnSize` существует и видна в области видимости, поэтому `var()` подставит `16px`. Затем браузер увидит невалидное `color: 16px;` и отбросит свойство (текст получит унаследованный цвет). Запасное значение используется только когда переменная не объявлена.

</details>

**3. Зачем передавать картинку из CMS через `style="--bg: url(...)"`, а не напрямую через `style="background-image: url(...)"`?**

<details>
<summary>Показать ответ</summary>

Обычный инлайновый `style="..."` имеет очень высокий приоритет, и его невозможно переопределить из внешнего `.css`-файла без `!important`. Если передать URL через переменную `--bg`, то CSS-файл сам решает, применять ли `background-image: var(--bg)` или выключить его на мобильном экране.

</details>

## Задачи

**Задача 1. Глобальные токены темы в `:root` и запасное значение в `var()`**

Создай в `:root` две переменные `--surface-bg: #f8fafc;` и `--text-main: #0f172a;`. Затем стилизуй `.note-card`:
1) Фон возьми из `--surface-bg`, цвет текста — из `--text-main`.
2) Цвет рамки задай через `var(--border-accent, #2563eb)` (саму `--border-accent` не объявляй, чтобы сработало запасное значение `#2563eb`).

```html
<div class="note-card">Заметка с темой из :root и fallback-рамкой</div>
```

<details>
<summary>Подсказка и решение</summary>

<!-- demo-html:
<style>
  .note-card { padding: 12px 14px; border-width: 2px; border-style: solid; border-radius: 6px; font-weight: 700; }
</style>
<div class="note-card">Заметка с темой из :root и fallback-рамкой</div>
-->
```css
/* Глобальные токены доступны всему документу */
:root {
  --surface-bg: #f8fafc;
  --text-main: #0f172a;
}

/* Поскольку --border-accent не объявлена, браузер подставит #2563eb */
.note-card {
  background-color: var(--surface-bg);
  color: var(--text-main);
  border-color: var(--border-accent, #2563eb);
}
```

</details>

**Задача 2. Тёмная тема для вложенного блока через переопределение переменных**

Вся страница использует `--panelBg: #ffffff;` и `--panelText: #1e293b;`. Сделай так, чтобы карточка `.panel` брала эти переменные, а при добавлении контейнеру класса `.theme-dark` все `.panel` внутри него автоматически становились тёмными (`#0f172a` фон и `#f8fafc` текст) без изменения стилей самой `.panel`.

```html
<div class="panel">Светлая панель</div>
<div class="theme-dark">
  <div class="panel">Панель внутри тёмной секции</div>
</div>
```

<details>
<summary>Подсказка и решение</summary>

<!-- demo-html:
<style>
  .theme-dark { padding: 10px; background: #1e293b; margin-top: 8px; border-radius: 6px; }
  .panel { padding: 10px 12px; border: 1px solid #94a3b8; border-radius: 6px; font-weight: 700; }
</style>
<div class="panel">Светлая панель</div>
<div class="theme-dark">
  <div class="panel">Панель внутри тёмной секции</div>
</div>
-->
```css
/* Светлые значения по умолчанию на корневом уровне */
:root {
  --panelBg: #ffffff;
  --panelText: #1e293b;
}

.panel {
  background-color: var(--panelBg);
  color: var(--panelText);
}

/* Переопределяем переменные локально для ветки .theme-dark */
.theme-dark {
  --panelBg: #0f172a;
  --panelText: #f8fafc;
}
```

</details>

**Задача 3. Локальный модификатор бейджа без дублирования вложенных селекторов**

У компонента `.alert` внутри есть заголовок `.alert-title` и рамка. Оба используют локальную переменную `--alertColor` (по умолчанию `#0284c7`):
1) Задай `.alert` `--alertColor: #0284c7;` и рамку `2px solid var(--alertColor);`.
2) Задай `.alert-title` цвет текста `var(--alertColor);`.
3) Сделай модификатор `.alert--success`, который меняет только `--alertColor` на `#16a34a`, перекрашивая и рамку, и заголовок.

```html
<div class="alert">
  <strong class="alert-title">Информация</strong>
  <p>Обычное сообщение</p>
</div>
<div class="alert alert--success">
  <strong class="alert-title">Готово</strong>
  <p>Успешное сохранение</p>
</div>
```

<details>
<summary>Подсказка и решение</summary>

<!-- demo-html:
<style>
  .alert { padding: 10px 12px; border-radius: 6px; margin-bottom: 8px; background: #f8fafc; }
  .alert p { margin: 4px 0 0; font-size: 13px; }
</style>
<div class="alert"><strong class="alert-title">Информация</strong><p>Обычное сообщение</p></div>
<div class="alert alert--success"><strong class="alert-title">Готово</strong><p>Успешное сохранение</p></div>
-->
```css
/* Базовый компонент задаёт локальную переменную и использует её в рамке */
.alert {
  --alertColor: #0284c7;
  border: 2px solid var(--alertColor);
}

/* Внутренний элемент подхватывает переменную родителя */
.alert-title {
  color: var(--alertColor);
}

/* Модификатор меняет одну переменную — обновляются и рамка, и заголовок */
.alert--success {
  --alertColor: #16a34a;
}
```

</details>
