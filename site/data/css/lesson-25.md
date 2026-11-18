# Урок 25. Нейминг CSS-классов: правила, словарь интерфейса и модификаторы

Суть урока: хорошие классы пишутся в `kebab-case`, отражают роль элемента по смыслу (а не цвет или тег), избегают лишних сокращений и цифр, группируются по контексту (`user-avatar`, `field-control`), используют булевы префиксы `is-*` / `has-*` для состояний и обходят слова, которые режет AdBlock (`socials`, `ad-*`).

## 1. Базовые правила именования классов (00:34–01:58)

[+] Шесть базовых принципов чистого нейминга:
1. Пишите в нижнем регистре в стиле **`kebab-case`** (слова через дефис: `.user-card`, а не `.userCard`).
2. Не используйте цифры (`.box-1`) и однобуквенные имена (`.a`, `.b`).
3. Не экономьте буквы на непонятных сокращениях: `.button` вместо `.btn`, `.link` вместо `.lnk`, `.image` вместо `.img`.
4. Называйте **по смыслу и роли**, а не по внешнему виду или тегу (`.button--danger` вместо `.red-button`, т.к. цвет при редизайне может стать оранжевым). Исключение — структурные семантические теги (`header`, `footer`, `nav`, `main`, `section`).
5. Используйте **существительные** (для сущностей) и прилагательные (для модификаторов), избегая глаголов.
6. Если блоки одинаковые по стилю — давайте им один общий класс (`.section`), а не плодите 5 разных имён.

## 2. Словарь интерфейса: структура, карточки, формы и компоненты (01:59–08:17)

[+] Готовый словарь, чтобы не придумывать имена с нуля:
- **Структура страницы:** `page`, `header`, `main` / `content`, `footer`, `aside` / `sidebar`, `nav` / `menu`, `container`, `wrapper`, `section-inner` / `section-body`, `grid` / `row` / `column` / `cell`.
- **Списки, карточки и текст:** `list`, `item`, `card`, `image` / `avatar` / `icon`, `title`, `subtitle`, `description`, `caption`, `quote`, `copyright`, `snippet`.
- **Формы:** `form`, `form-group`, `field`, `field-label`, `field-control` (общий класс для `<input>`, `<textarea>`, `<select>`), `checkbox`, `checkbox-control`, `checkbox-emulator`, `checkbox-label`.
- **Компоненты:** `button`, `dropdown`, `accordion`, `modal` / `popup`, `overlay` / `backdrop`, `tooltip`, `slider` / `carousel`, `pagination`, `breadcrumbs`, `cart` / `basket`, `summary` / `total`, `search`.

[!] Блокировщики рекламы (AdBlock) часто скрывают элементы с классами `.socials`, `.ad-box`, `.banner-ad`, `.promo-ad`. Для блока соцсетей безопаснее использовать `.soc1als` или `.community-links`, а для JS-хуков отделять их префиксом `js-*` или `data-*` атрибутами.

<!-- demo-html:
<style>
  .user-card { display: flex; align-items: center; gap: 12px; padding: 10px 12px; border: 2px solid #cbd5e1; border-radius: 8px; background: #f8fafc; }
</style>
<article class="user-card">
  <div class="user-avatar">АИ</div>
  <div class="user-body">
    <h3 class="user-name">Анна Иванова</h3>
    <p class="user-role">Frontend-разработчик</p>
  </div>
</article>
-->
```css
/* Контекст компонента (.user-*) сразу показывает, к чему относится элемент */
.user-avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background-color: #2563eb;
  color: #ffffff;
  display: grid;
  place-items: center;
  font-weight: 700;
}

.user-name {
  margin: 0;
  font-size: 15px;
}

.user-role {
  margin: 2px 0 0;
  font-size: 13px;
  color: #475569;
}
```

## 3. Модификаторы размеров, наличия `has-*` и состояний `is-*` (08:18–09:55)

[+] Для вариаций компонента используют понятные суффиксы и префиксы:
- **Размеры:** `small`, `medium`, `large`, `wide`, `narrow`.
- **Наличие детали (`has-*`):** `has-icon`, `has-error`, `has-underline`.
- **Булево состояние (`is-*`):** `is-active`, `is-current`, `is-open`, `is-expanded`, `is-hidden`, `is-invalid`.
- **Статусы:** `success`, `warning`, `error`, `loading` / `pending`.

<!-- demo-html:
<style>
  .field-wrap { display: flex; flex-direction: column; gap: 4px; width: 240px; }
  .field-label { font-size: 13px; font-weight: 700; }
  .field-control { padding: 6px 10px; border: 2px solid #94a3b8; border-radius: 6px; font: inherit; }
  .field-error { display: none; font-size: 12px; color: #dc2626; }
</style>
<div class="field-wrap has-error">
  <label class="field-label">Электронная почта</label>
  <input class="field-control is-invalid" type="email" value="wrong@" />
  <span class="field-error is-visible">Проверьте формат адреса</span>
</div>
-->
```css
/* Состояние ошибки на самом поле ввода */
.field-control.is-invalid {
  border-color: #dc2626;
  background-color: #fef2f2;
}

/* Показываем подсказку ошибки только когда у блока есть модификатор has-error */
.field-wrap.has-error .field-error.is-visible {
  display: block;
}
```

## 3 главные ловушки урока (чек-лист для повторения)

1. Называть классы по внешнему виду (`.red-text`, `.mt-20`, `.big-btn-2`) или дублировать теги (`.div-box`, `.span-title`) — при изменении дизайна имя начинает противоречить стилю.

2. Использовать слова `socials`, `ad`, `banner-ad` для обычных блоков интерфейса — расширения вроде AdBlock молча скроют эти элементы у пользователя.

3. Придумывать уникальные имена каждому из 5 одинаковых блоков (`.card-1`, `.card-2`, `.card-3`) вместо одного общего класса `.card` и редких модификаторов.

## Вопросы для закрепления

**1. Почему класс `.button--danger` или `.alert--error` лучше, чем `.red-button` и `.red-box`?**

<details>
<summary>Показать ответ</summary>

`.red-button` привязан к текущему цвету: если при редизайне кнопку перекрасят в тёмно-оранжевый или чёрный, название станет лживым. Имя `.button--danger` описывает **смысл и роль** элемента в интерфейсе и остаётся верным при любой смене палитры.

</details>

**2. В чём смысловая разница между модификаторами `has-*` и `is-*` (приведите по одному примеру)?**

<details>
<summary>Показать ответ</summary>

`has-*` говорит о **наличии** внутри элемента какой-то детали или под-элемента (например, `.button.has-icon`, `.field.has-error`). `is-*` описывает текущее **динамическое состояние** элемента (например, `.modal.is-open`, `.tab.is-active`, `.input.is-invalid`).

</details>

**3. Почему класс `.socials` может внезапно пропасть со страницы у части пользователей, и как этого избежать?**

<details>
<summary>Показать ответ</summary>

Популярные блокировщики рекламы (AdBlock, uBlock) скрывают блоки с известными списками классов вроде `.socials`, `.ad-box`, `.banner-ad`. Для таких блоков используют альтернативные имена вроде `.soc1als` или `.community-links`.

</details>

## Задачи

**Задача 1. Перепиши «грязную» разметку в чистый нейминг по стандартам урока**

В HTML ниже все 4 класса нарушают правила (есть цифры, однобуквенные имена, цвет в имени и `camelCase`):
1) Замени имена классов на чистые в `kebab-case` без цифр и цветов: `.card`, `.card-image`, `.card-title`, `.card-button`.
2) Оформи для них стили в CSS.

```html
<article class="card">
  <div class="card-image">Фото</div>
  <h3 class="card-title">Товар дня</h3>
  <button class="card-button" type="button">Купить</button>
</article>
```

<details>
<summary>Подсказка и решение</summary>

<!-- demo-html:
<article class="card">
  <div class="card-image">Фото</div>
  <h3 class="card-title">Товар дня</h3>
  <button class="card-button" type="button">Купить</button>
</article>
-->
```css
/* Единый контекст .card-* без цифр, сокращений и привязки к цвету в имени */
.card {
  width: 200px;
  padding: 12px;
  border: 2px solid #cbd5e1;
  border-radius: 8px;
}

.card-image {
  height: 70px;
  background-color: #e2e8f0;
  display: grid;
  place-items: center;
  margin-bottom: 8px;
}

.card-title {
  margin: 0 0 8px;
  font-size: 16px;
}

.card-button {
  width: 100%;
  padding: 6px 10px;
  background-color: #2563eb;
  color: #ffffff;
  border: 0;
  border-radius: 6px;
}
```

</details>

**Задача 2. Улучши форму единым классом `.field-control` и модификаторами**

В форме ниже есть `<input>` и `<textarea>` внутри обёрток `.field`:
1) Задай общий стиль рамок и отступов для `.field-control` (`width: 100%; padding: 8px; border: 2px solid #94a3b8; border-radius: 6px; box-sizing: border-box;`).
2) Сделай так, чтобы только `<textarea class="field-control">` имела `min-height: 70px; resize: vertical;` через комбинированный селектор `textarea.field-control`.
3) Добавь состояние ошибки `.field-control.is-invalid` с красной рамкой `#dc2626`.

```html
<div class="field">
  <label class="field-label">Имя</label>
  <input class="field-control is-invalid" type="text" />
</div>
<div class="field">
  <label class="field-label">Комментарий</label>
  <textarea class="field-control"></textarea>
</div>
```

<details>
<summary>Подсказка и решение</summary>

<!-- demo-html:
<style>
  .field { margin-bottom: 10px; width: 230px; }
  .field-label { display: block; font-size: 13px; font-weight: 700; margin-bottom: 4px; }
</style>
<div class="field">
  <label class="field-label">Имя</label>
  <input class="field-control is-invalid" type="text" />
</div>
<div class="field">
  <label class="field-label">Комментарий</label>
  <textarea class="field-control"></textarea>
</div>
-->
```css
/* Базовый стиль для всех полей ввода (input, textarea, select) */
.field-control {
  box-sizing: border-box;
  width: 100%;
  padding: 8px;
  border: 2px solid #94a3b8;
  border-radius: 6px;
  font: inherit;
}

/* Специфика только для многострочного поля без отдельного нового класса */
textarea.field-control {
  min-height: 70px;
  resize: vertical;
}

/* Булев модификатор состояния ошибки */
.field-control.is-invalid {
  border-color: #dc2626;
}
```

</details>

**Задача 3. Безопасный блок соцсетей (обход фильтров AdBlock) и статус `is-current`**

Напиши CSS:
1) Для списка ссылок на соцсети с безопасным классом `.soc1als-list` включи `display: flex; gap: 10px; list-style: none; padding: 0;`.
2) Для активного пункта навигации `.menu-link.is-current` задай жирность `700` и цвет `#2563eb`.

```html
<ul class="soc1als-list">
  <li><a class="menu-link is-current" href="#">Telegram</a></li>
  <li><a class="menu-link" href="#">YouTube</a></li>
</ul>
```

<details>
<summary>Подсказка и решение</summary>

<!-- demo-html:
<ul class="soc1als-list">
  <li><a class="menu-link is-current" href="#">Telegram</a></li>
  <li><a class="menu-link" href="#">YouTube</a></li>
</ul>
-->
```css
/* Безопасное имя .soc1als-list не режется блокировщиками рекламы */
.soc1als-list {
  display: flex;
  gap: 10px;
  list-style: none;
  padding: 0;
}

/* Модификатор текущего активного пункта */
.menu-link.is-current {
  font-weight: 700;
  color: #2563eb;
}
```

</details>
