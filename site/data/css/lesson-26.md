# Урок 26. Методология БЭМ: Блок, Элемент, Модификатор и миксы

Суть урока: БЭМ (Блок — Элемент — Модификатор) делит интерфейс на независимые компоненты (`block`, `block__element`, `block--modifier`), запрещает блокам иметь внешние отступы `margin` (их задают через миксы родительских элементов вроде `header__logo logo`), запрещает «элемент элемента» (`__` бывает только один раз) и делает CSS-селекторы плоскими (вес `0-1-0`).

## 1. Три сущности БЭМ: Блок, Элемент и Модификатор (00:34–05:55)

[+] **Блок** — независимый переиспользуемый компонент (`header`, `logo`, `product-card`). Имя — существительное в `kebab-case`. Блоку **нельзя** задавать внешнюю геометрию (`margin`, `top`/`left`), чтобы он не ломал окружение при вставке в другое место.

[+] **Элемент (`block__element`)** — составная часть блока, не используемая в отрыве от него (`logo__image`, `header__menu`). Пишется через **два нижних подчёркивания `__`**. Элемент всегда привязан напрямую к Блоку: **делать «элемент элемента» вроде `.header__menu__list` запрещено** — вместо этого пишут `.header__menu-list` (одно `__`).

[+] **Модификатор (`block--modifier` или `block__element--modifier`)** — вариация внешнего вида или поведения (`button--big`, `button--transparent`, `products__item--wide`), пишется через **два дефиса `--`**. Модификатор **всегда идёт вместе с базовым классом** (`class="button button--big"`), а в CSS располагается ниже базового правила.

<!-- demo-html:
<style>
  .btn-row { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
</style>
<div class="btn-row">
  <button class="button" type="button">Обычная</button>
  <button class="button button--big" type="button">Большая (button--big)</button>
  <button class="button button--transparent" type="button">Прозрачная</button>
</div>
-->
```css
/* Базовый блок: без внешних margin, чтобы работал везде */
.button {
  padding: 8px 14px;
  border: 2px solid #0f172a;
  border-radius: 6px;
  background-color: #0f172a;
  color: #ffffff;
  font: inherit;
  cursor: pointer;
}

/* Модификатор размера: пишется ПОСЛЕ .button при том же весе 0-1-0 */
.button--big {
  padding: 12px 20px;
  font-size: 17px;
}

/* Модификатор темы */
.button--transparent {
  background-color: transparent;
  color: #0f172a;
}
```

## 2. Миксы (`header__logo logo`), практика шапки и плоский CSS (05:56–09:49)

[+] **Микс** — совмещение на одном HTML-теге класса БЭМ-блока и класса БЭМ-элемента родителя (например, `<a class="header__logo logo">`). Зачем это нужно: сам `.logo` остаётся чистым и переиспользуемым в футере (`.footer__logo logo`), а внешние отступы (`margin-right: auto;`) задаются только элементу `.header__logo`!

[+] Главная выгода БЭМ в CSS — **плоские селекторы из одного класса** (специфичность `0-1-0`) вместо длинных каскадных цепочек вроде `.header nav ul li a`. Благодаря этому легко понять, какое правило победит, и не возникает «войны специфичности».

```html
<header class="header">
  <div class="header__inner">
    <a class="header__logo logo" href="#">
      <img class="logo__image" src="logo.svg" alt="Логотип" />
    </a>
    <nav class="header__menu">
      <ul class="header__menu-list">
        <li class="header__menu-item"><a class="header__menu-link" href="#">Курсы</a></li>
      </ul>
    </nav>
    <button class="header__button button button--transparent" type="button">Войти</button>
  </div>
</header>
```

<!-- demo-html:
<style>
  .site-header { display: flex; align-items: center; padding: 8px 12px; background: #f8fafc; border: 2px solid #cbd5e1; border-radius: 6px; }
  .site-logo { padding: 4px 10px; background: #2563eb; color: #fff; font-weight: 900; border-radius: 4px; text-decoration: none; }
  .site-nav { display: flex; gap: 12px; }
</style>
<header class="site-header">
  <a class="site-header__logo site-logo" href="#">LOGO</a>
  <nav class="site-nav">
    <a href="#">Уроки</a>
    <a href="#">Задачи</a>
  </nav>
</header>
-->
```css
/* Блок .site-logo не знает про отступы — их задаёт элемент родителя .site-header__logo */
.site-header__logo {
  margin-right: auto;
}
```

## 3 главные ловушки урока (чек-лист для повторения)

1. Писать двойную вложенность в имени элемента (`.header__menu__list__item`) — по БЭМ в имени может быть только **одно `__`** (`.header__menu-item`).

2. Задавать `margin` или `position: absolute` напрямую БЭМ-блоку (`.button { margin-left: 20px; }`) — при вставке этого же блока в другой раздел внешний отступ сломает сетку (отступы задают через микс `.header__button`).

3. Ставить класс модификатора без базового класса (`<button class="button--big">`) — модификатор меняет лишь 1–2 свойства поверх базового `.button`.

## Вопросы для закрепления

**1. Почему в БЭМ класс `.card__header__title` считается ошибкой и как его нужно переписать?**

<details>
<summary>Показать ответ</summary>

Потому что БЭМ запрещает создавать «элемент элемента» (`__` встречается строго один раз, ведь любой элемент принадлежит напрямую Блоку). Правильное имя — `.card__header-title` или `.card__title`: если завтра тег перенести внутри карточки в другой `<div>`, класс не придётся переименовывать.

</details>

**2. Зачем на кнопке в шапке писать сразу три класса: `class="header__button button button--transparent"`?**

<details>
<summary>Показать ответ</summary>

1) `button` задаёт базовый вид переиспользуемого блока кнопки. 2) `button--transparent` модифицирует её цвет и фон. 3) `header__button` (микс) отвечает только за её положение и внешние отступы `margin` именно внутри шапки `.header`.

</details>

**3. Как БЭМ решает проблему длинных селекторов и конфликтов специфичности в CSS?**

<details>
<summary>Показать ответ</summary>

В БЭМ стили пишутся почти исключительно на одиночные классы (`.header__menu-link` вместо `.header .menu ul li a`). Все правила имеют одинаковую низкую специфичность `0-1-0`, а модификаторы просто идут ниже базовых классов в файле.

</details>

## Задачи

**Задача 1. Собери карточку товара по БЭМ (блок, элементы и модификатор)**

Оформи карточку товара `.product-card`:
1) Задай базовые стили блока `.product-card` (ширина `200px`, `padding: 12px`, `border: 2px solid #cbd5e1;`).
2) Стилизуй элементы `.product-card__title` (`margin: 0 0 6px; font-size: 16px;`) и `.product-card__price` (`font-weight: 700; color: #2563eb;`).
3) Добавь модификатор `.product-card--featured` с золотой рамкой `#d97706` и фоном `#fffbeb`.

```html
<article class="product-card product-card--featured">
  <h3 class="product-card__title">Механическая клавиатура</h3>
  <span class="product-card__price">8 900 ₽</span>
</article>
```

<details>
<summary>Подсказка и решение</summary>

<!-- demo-html:
<article class="product-card product-card--featured">
  <h3 class="product-card__title">Механическая клавиатура</h3>
  <span class="product-card__price">8 900 ₽</span>
</article>
-->
```css
/* Базовый блок без внешних margin */
.product-card {
  width: 200px;
  padding: 12px;
  border: 2px solid #cbd5e1;
  border-radius: 8px;
}

/* Элементы принадлежат напрямую блоку .product-card */
.product-card__title {
  margin: 0 0 6px;
  font-size: 16px;
}

.product-card__price {
  font-weight: 700;
  color: #2563eb;
}

/* Модификатор идёт ниже базового блока при равном весе 0-1-0 */
.product-card--featured {
  border-color: #d97706;
  background-color: #fffbeb;
}
```

</details>

**Задача 2. Микс элемента и блока для внешней геометрии**

У нас есть переиспользуемый блок `.badge` (зелёный бейдж), который лежит внутри `.promo-box` с миксом `.promo-box__badge badge`. Задай базовый вид для `.badge` **без `margin`**, а отступ `margin-left: auto;` припиши только элементу `.promo-box__badge`, чтобы бейдж прижался к правому краю `.promo-box`.

```html
<div class="promo-box">
  <span>Тариф Pro</span>
  <span class="promo-box__badge badge">-20%</span>
</div>
```

<details>
<summary>Подсказка и решение</summary>

<!-- demo-html:
<style>
  .promo-box { display: flex; align-items: center; width: 240px; padding: 10px; border: 2px solid #94a3b8; border-radius: 6px; }
</style>
<div class="promo-box">
  <span>Тариф Pro</span>
  <span class="promo-box__badge badge">-20%</span>
</div>
-->
```css
/* Сам блок .badge остаётся чистым и переносимым в любое место */
.badge {
  padding: 2px 8px;
  border-radius: 4px;
  background-color: #16a34a;
  color: #ffffff;
  font-size: 12px;
  font-weight: 700;
}

/* Внешнюю геометрию (margin) задаём через микс родительского элемента */
.promo-box__badge {
  margin-left: auto;
}
```

</details>

**Задача 3. Исправь ошибки БЭМ в «элементе элемента»**

В коде ниже два нарушения БЭМ: двойное `__` в `.sidebar__nav__list` / `.sidebar__nav__link` и каскадная цепочка `.sidebar ul li a`. Исправь HTML-классы и CSS-селекторы на плоский БЭМ (`0-1-0`).

```html
<aside class="sidebar">
  <nav class="sidebar__nav">
    <ul class="sidebar__nav-list">
      <li><a class="sidebar__nav-link" href="#">Профиль</a></li>
    </ul>
  </nav>
</aside>
```

<details>
<summary>Подсказка и решение</summary>

<!-- demo-html:
<aside class="sidebar">
  <nav class="sidebar__nav">
    <ul class="sidebar__nav-list">
      <li><a class="sidebar__nav-link" href="#">Профиль</a></li>
      <li><a class="sidebar__nav-link" href="#">Настройки</a></li>
    </ul>
  </nav>
</aside>
-->
```css
/* Только одно __ в имени элемента и плоский селектор из 1 класса */
.sidebar__nav-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sidebar__nav-link {
  color: #2563eb;
  font-weight: 700;
  text-decoration: none;
}
```

</details>
