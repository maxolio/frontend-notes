# Урок 4: Архитектура (Partials), @use, @forward и @extend

**Суть урока:** Крупный проект разбивают на файлы-партиалы (`_name.scss`), подключают их через современный `@use` с пространствами имён и переэкспортируют через `@forward`, а общий CSS без параметров выносят в `@extend %placeholder`.

---

## Что такое партиалы (`_partials`)

Файл, имя которого начинается с нижнего подчёркивания (`_variables.scss`, `_mixins.scss`), называется **партиалом**. Компилятор Sass не создаёт для него отдельный `.css`-файл — он нужен только для подключения в главный файл `styles.scss`.

```text
scss/
|-- base/
|   |-- _normalize.scss
|   |-- _variables.scss
|   |-- _globals.scss
|-- helpers/
|   |-- _mixins.scss
|   |-- _index.scss
|-- blocks/
|   |-- _header.scss
|   |-- _card.scss
|-- styles.scss
```

Такая структура разделяет базовые настройки, хелперы и БЭМ-блоки: искать и править стили становится в разы быстрее.

---

## Почему `@import` устарел и чем его заменяет `@use`

В старых уроках часто показывают `@import 'variables';`. В современном Dart Sass **`@import` официально устарел** и удаляется из языка по трём причинам:
1. Загружал файл заново при каждом импорте (дублировал CSS).
2. Вываливал все переменные и миксины в глобальную область (конфликты имён).
3. Не давал понять, из какого файла пришла переменная `$accent`.

**Современная замена — `@use`:**
- Файл компилируется **ровно один раз**, сколько бы раз его ни подключили.
- Переменные и миксины получают **пространство имён** (по умолчанию — имя файла).

```scss
/* Подключение с именем пространства по умолчанию */
@use 'base/variables';

/* Короткий псевдоним через as */
@use 'helpers/mixins' as m;

/* Подключение без префикса (удобно только для 1-2 общих файлов) */
@use 'base/globals' as *;

.header {
  color: variables.$color-text;
  @include m.flex-center;
}
```

---

## `@forward` и паттерн `_index.scss`

Чтобы в каждом файле блоков не писать по пять строчек `@use`, в папке создают индексный партиал `_index.scss` и переэкспортируют файлы через `@forward`.

```scss
/* Файл helpers/_index.scss: собираем все хелперы в одну точку */
@forward 'variables';
@forward 'mixins';
@forward 'functions';
```

Теперь любой БЭМ-блок подключает всю папку одной строкой:

```scss
/* Файл blocks/_card.scss */
@use '../helpers' as h;

.card {
  padding: h.rem(16);
  background-color: h.$color-surface;
}
```

Важно: `@use` и `@forward` всегда должны стоять **в самом верху файла** (до любых CSS-правил).

---

## `@extend %placeholder` против `@mixin`

Плейсхолдер `%name` — это заготовка стилей, которая **не попадает в итоговый CSS**, пока её не расширят через `@extend`. В отличие от миксина, `@extend` не копирует свойства в каждый класс, а **объединяет селекторы через запятую**.

```scss
/* Плейсхолдер не попадёт в CSS сам по себе */
%button-reset {
  border: none;
  background: transparent;
  cursor: pointer;
}

.nav__btn {
  @extend %button-reset;
  color: #222;
}

.modal__close {
  @extend %button-reset;
  font-size: 20px;
}
```

В итоговом CSS оба селектора объединятся в один блок: `.nav__btn, .modal__close { border: none; ... }`.

**Как выбирать между `@extend` и `@mixin`:**
- Нужны **аргументы** (`$color`, `$size`) или работа внутри `@media` -> только `@mixin`.
- Нужен **одинаковый статичный набор** правил для многих элементов (сброс кнопки, скрытие `.visually-hidden`) -> `@extend %placeholder`.

---

## 3 главные ловушки урока

1. **[!] Использовать `@import` в новом проекте:** он объявлен устаревшим в Dart Sass; используйте `@use` и `@forward`.
2. **[!] `@extend` через границу `@media`:** Sass запрещает расширять плейсхолдер, объявленный снаружи, находясь внутри `@media` — для адаптива используйте `@mixin`.
3. **[!] Обычный класс вместо `%placeholder` в `@extend`:** расширяйте именно `%name`, чтобы не тянуть лишние случайные каскады и не оставлять мёртвый класс в CSS.

---

## Вопросы для закрепления

<details>
<summary>1. Для чего нужно нижнее подчёркивание в начале имени файла _variables.scss?</summary>

Оно помечает файл как партиал (частичный файл). Компилятор Sass не создаёт из него отдельный `variables.css`, а ждёт, пока его подключат через `@use` или `@forward` в основной файл.

</details>

<details>
<summary>2. Зачем в папке делают _index.scss с директивой @forward?</summary>

Чтобы объединить несколько партиалов (`_variables.scss`, `_mixins.scss`, `_functions.scss`) в одну точку входа и подключать их все одной строкой `@use 'helpers';`.

</details>

<details>
<summary>3. В чём разница между результатом компиляции @include и @extend %placeholder?</summary>

`@include` дублирует блок CSS-свойств внутри каждого селектора, а `@extend %placeholder` группирует сами селекторы через запятую над общим блоком свойств. При этом `@extend` не принимает параметры и не работает через границу `@media`.

</details>

---

## Задачи для практики

### Задача 1. Подключение модуля через `@use` с алиасом

Есть файл `_tokens.scss` с переменной `$radius: 8px;`. Подключите его в `_card.scss` под коротким именем `t` и примените `$radius` к классу `.card`.

<details>
<summary>Показать решение</summary>

```scss
/* Подключаем партиал без подчёркивания и задаём алиас t */
@use 'tokens' as t;

.card {
  border-radius: t.$radius;
}
```

</details>

### Задача 2. Индексный файл `_index.scss`

Соберите единую точку экспорта `helpers/_index.scss` для файлов `_variables.scss` и `_mixins.scss`, чтобы их можно было подключить одной строкой.

<details>
<summary>Показать решение</summary>

```scss
/* Файл helpers/_index.scss */
@forward 'variables';
@forward 'mixins';
```

</details>

### Задача 3. Переиспользование через `@extend %placeholder`

Вынесите общие свойства центрирования текста и сброса подчёркивания (`text-decoration: none; display: inline-block;`) в плейсхолдер `%link-base` и примените его к `.header__link` и `.footer__link`.

<details>
<summary>Показать решение</summary>

```scss
/* Плейсхолдер объединит оба селектора через запятую */
%link-base {
  display: inline-block;
  text-decoration: none;
}

.header__link {
  @extend %link-base;
  color: #111;
}

.footer__link {
  @extend %link-base;
  color: #666;
}
```

</details>
