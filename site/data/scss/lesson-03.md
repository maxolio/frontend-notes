# Урок 3: Переменные $, миксины, функции, math.div и циклы @for

**Суть урока:** Переменные `$` хранят настройки до компиляции, `@mixin` генерирует готовые наборы свойств, `@function` возвращает одно вычисленное значение, а `@for` автоматизирует создание повторяющихся классов.

---

## Переменные `$var` против CSS-переменных `--var`

В SCSS переменные начинаются со знака `$`. При компиляции они **полностью исчезают**, превращаясь в обычные статичные значения в CSS.

```scss
/* Переменные SCSS для констант сборки */
$color-accent: #ff5500;
$container-width: 1200px;

.button {
  background-color: $color-accent;
  max-width: $container-width;
}
```

- **Когда брать `$var`:** брейкпоинты `@media`, размеры сетки, расчёты в функциях и миксинах (CSS `--var` в `@media` не работают).
- **Когда брать `--var`:** цвета тем (светлая/тёмная), отступы и всё, что нужно менять в браузере на лету через `@media` или JavaScript.

---

## Интерполяция `#{$var}`

Если переменную нужно подставить в **имя класса**, имя свойства или внутрь CSS-функции вроде `calc()` / `clamp()`, её оборачивают в `#{...}`.

```scss
/* Подстановка переменной в имя класса и в clamp() */
$name: card;
$min-size: 16;
$max-size: 32;

.#{$name}__title {
  font-size: clamp(#{$min-size}px, 2vw, #{$max-size}px);
}
```

Без `#{...}` внутри `clamp()` или имени селектора Sass воспримет `$name` как обычный текст или выдаст ошибку синтаксиса.

---

## Миксины `@mixin` и `@include`

Миксин — это шаблон набора CSS-свойств с параметрами и значениями по умолчанию (`$arg: default`). Вызывается через `@include`.

```scss
/* Миксин обрезки текста с параметром по умолчанию */
@mixin line-clamp($lines: 1) {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: $lines;
  overflow: hidden;
}

/* Вызов с аргументом по умолчанию (1 строка) */
.card__title {
  @include line-clamp;
}

/* Вызов с явным числом строк */
.card__desc {
  @include line-clamp(3);
}
```

Внутри миксинов удобно использовать условия `@if` / `@else`, например для центрирования `flex` или `inline-flex`:

```scss
/* Условная генерация свойства через @if / @else */
@mixin flex-center($is-inline: false) {
  @if $is-inline {
    display: inline-flex;
  } @else {
    display: flex;
  }

  justify-content: center;
  align-items: center;
}

.badge {
  @include flex-center(true);
}
```

---

## Функции `@function`, `@return` и `math.div()`

В отличие от миксина, `@function` **не вставляет CSS-свойства**, а возвращает ровно одно значение через `@return`.

В современном Dart Sass деление через слэш `/` устарело (в `font: 16px/1.5` слэш — разделитель CSS). Для математического деления подключают встроенный модуль `sass:math` и вызывают `math.div($a, $b)`.

```scss
/* Подключение встроенного модуля математики */
@use 'sass:math';

/* Функция перевода px в rem на базе 16px */
@function rem($px) {
  @return math.div($px, 16) * 1rem;
}

/* Использование функции в значении свойства */
.hero__title {
  font-size: rem(32);
  margin-bottom: rem(24);
}
```

---

## Цикл `@for` для генерации классов

Цикл `@for` создаёт серию однотипных классов, например модификаторы колонок сетки `.grid--2` .. `.grid--12`.

- `from 2 through 12` — включает `12`.
- `from 2 to 12` — останавливается на `11` (не включая `12`).

```scss
/* Генерация модификаторов сетки от 2 до 4 колонок */
.grid {
  display: grid;
  gap: 16px;

  @for $i from 2 through 4 {
    &--#{$i} {
      grid-template-columns: repeat(#{$i}, 1fr);
    }
  }
}
```

---

## 3 главные ловушки урока

1. **[!] Деление через `$a / $b` устарело:** в современном Dart Sass нужно `@use 'sass:math';` и `math.div($a, $b)`.
2. **[!] Путаница `@mixin` и `@function`:** `@mixin` вставляет блок свойств (`@include`), а `@function` возвращает только одно значение (`@return`).
3. **[!] Забытая интерполяция `#{$var}`:** без `#{...}` нельзя подставить переменную в имя селектора (`.grid--#{$i}`) или внутрь `calc()`/`clamp()`.

---

## Вопросы для закрепления

<details>
<summary>1. В чём главное отличие переменной $accent от CSS-переменной --accent?</summary>

`$accent` существует только на этапе компиляции и в итоговом CSS заменяется на конкретное значение. `--accent` попадает в браузер и может меняться динамически в `@media` или через JavaScript.

</details>

<details>
<summary>2. Почему в современном Sass для деления используют math.div($a, $b) вместо $a / $b?</summary>

Потому что в самом CSS слэш `/` используется как разделитель (например, `font: 16px/1.5` или `grid-column: 1 / 3`). Чтобы не было конфликтов со стандартом CSS, деление в вычислениях вынесли в `math.div()` из модуля `sass:math`.

</details>

<details>
<summary>3. Чем @for $i from 1 through 4 отличается от @for $i from 1 to 4?</summary>

Ключевое слово `through` включает конечное число (`1, 2, 3, 4`), а `to` останавливается перед ним (`1, 2, 3`).

</details>

---

## Задачи для практики

### Задача 1. Перевод `px` в `rem` через `@function`

Напишите функцию `rem($px, $base: 16)`, которая переводит пиксели в `rem` через `math.div()`, и примените её для `.title` (`font-size: rem(28)` и `padding: rem(16)`).

<details>
<summary>Показать решение</summary>

```scss
/* Модуль sass:math обязателен для деления */
@use 'sass:math';

/* Функция возвращает вычисленное значение в rem */
@function rem($px, $base: 16) {
  @return math.div($px, $base) * 1rem;
}

.title {
  font-size: rem(28);
  padding: rem(16);
}
```

</details>

### Задача 2. Миксин квадрата / круга

Создайте `@mixin square($size, $is-circle: false)`, который задаёт `width` и `height` равными `$size`, а если `$is-circle` истинно — добавляет `border-radius: 50%`. Примените к `.avatar` (`48px`, круг).

<details>
<summary>Показать решение</summary>

```scss
/* Миксин с параметром по умолчанию и условием */
@mixin square($size, $is-circle: false) {
  width: $size;
  height: $size;

  @if $is-circle {
    border-radius: 50%;
  }
}

.avatar {
  @include square(48px, true);
}
```

</details>

### Задача 3. Генерация отступов через `@for`

С помощью цикла `@for $i from 1 through 3` сгенерируйте классы `.mt-1`, `.mt-2`, `.mt-3`, задающие `margin-top` с шагом `8px` (`8px`, `16px`, `24px`).

<details>
<summary>Показать решение</summary>

```scss
/* Интерполяция #{$i} подставляет число в имя класса */
@for $i from 1 through 3 {
  .mt-#{$i} {
    margin-top: $i * 8px;
  }
}
```

</details>
