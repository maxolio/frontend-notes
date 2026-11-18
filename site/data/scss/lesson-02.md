# Урок 02. Вложенность селекторов, оператор `&` и БЭМ

Суть урока: SCSS позволяет вкладывать дочерние селекторы внутрь родителя, а символ амперсанда `&` подставляет имя родителя целиком — для псевдоклассов (`&:hover`), составных классов (`&.is-active`) и БЭМ-суффиксов (`&__item`, `&--big`). Главное правило индустрии — не углубляться глубже **3 уровней вложенности**.

## 1. Вложенность селекторов и «правило 3 уровней» (13:43–15:05)

[+] Вложенные селекторы избавляют от повторения родителя. Хороший тон — сначала писать собственные свойства блока, затем оставлять **пустую строку** и после неё размещать вложенные селекторы.

[!] **Правило 3 уровней (Best Practice):** никогда не вкладывайте селекторы глубже 3 уровней (иначе итоговый CSS превращается в монстров `.page .section .card .header .title span` с раздутой специфичностью и жёсткой привязкой к HTML).

```scss
.section {
  padding: 24px 0;

  /* Скомпилируется в .section .title */
  .title {
    margin-bottom: 16px;
    font-size: 28px;
  }

  /* Отделяем вложенные блоки пустой строкой для читаемости */
  .list {
    display: flex;
    gap: 12px;
  }
}
```

## 2. Оператор `&` для псевдоклассов, состояний и БЭМ (15:06–16:17)

[+] Знак **`&`** (*parent selector*) подставляет точный селектор родителя **без пробела**:
- **`&:hover`**, `&:focus-visible` -> `.button:hover`, `.button:focus-visible`.
- **`&.is-active`** -> `.tab.is-active` (два класса на одном теге).
- **`&__inner`**, **`&--big`** -> `.header__inner`, `.button--big` (БЭМ-элементы и модификаторы!).

[!] Важно: вложенная конструкция `&__menu { &-list { ... } }` скомпилируется в `.header__menu` и `.header__menu-list`, сохранив плоскую специфичность **`0-1-0`** (один класс), даже несмотря на вложенность в SCSS! Правда, при поиске имени класса по проекту через `Ctrl+F` склеенный `&__menu-list` не находится целиком — в командной разработке это учитывают заранее.

```scss
.header {
  padding: 12px 0;

  /* Склейка через & даёт плоский класс .header__inner (вес 0-1-0) */
  &__inner {
    display: flex;
    align-items: center;
  }

  &__menu {
    margin-left: auto;

    /* Скомпилируется в .header__menu-list — тоже один класс без потомков! */
    &-list {
      display: flex;
      gap: 16px;
      list-style: none;
    }
  }
}
```

<!-- demo-html:
<style>
  .btn-demo { padding: 8px 16px; border: 2px solid #2563eb; border-radius: 6px; background: #2563eb; color: #fff; font: inherit; cursor: pointer; }
</style>
<button class="btn-demo" type="button">Обычная</button>
<button class="btn-demo is-outline" type="button">С &.is-outline</button>
-->
```css
/* Итог компиляции SCSS с &:hover и &.is-outline */
.btn-demo:hover {
  background-color: #1d4ed8;
}

.btn-demo.is-outline {
  background-color: transparent;
  color: #2563eb;
}
```

## 3 главные ловушки урока (чек-лист для повторения)

1. Вкладывать селекторы на 4–6 уровней (`.card { .body { .list { .item { a { ... } } } } }`) — итоговый CSS приобретает огромный вес `0-5-1` и ломается при малейшей перестановке тегов.

2. Забывать `&` перед `:hover` или модификатором: запись `.button { :hover { ... } }` превратится в `.button :hover` (с пробелом — сработает на **потомках** кнопки, а не на самой кнопке!).

3. Писать вложенные БЭМ-селекторы без `&` (`&__title` вместо `.header__title`) и забывать, что в SCSS-файле склеенное `&-list` нельзя найти простым поиском `Ctrl+F` по слову `header__menu-list`.

## Вопросы для закрепления

**1. В чём разница между `.button { &:hover { ... } }` и `.button { :hover { ... } }` после компиляции в CSS?**

<details>
<summary>Показать ответ</summary>

`&:hover` склеивается с родителем без пробела и даёт `.button:hover` (наведение на саму кнопку). А `:hover` без амперсанда добавляет пробел — получается `.button :hover` (наведение на любой вложенный элемент внутри кнопки).

</details>

**2. Какой CSS-код сгенерируется из `.card { &__header { &-title { color: red; } } }` и какая у него будет специфичность?**

<details>
<summary>Показать ответ</summary>

Сгенерируется одиночный плоский селектор `.card__header-title { color: red; }` со специфичностью **`0-1-0`** (один класс). Несмотря на визуальную вложенность в SCSS, в итоговом CSS никакой вложенности потомков не будет.

</details>

**3. Почему в лучших гайдах по SCSS советуют не делать вложенность глубже 3 уровней?**

<details>
<summary>Показать ответ</summary>

Глубокая вложенность порождает длинные селекторы с высокой специфичностью (их потом трудно переопределять), увеличивает размер итогового CSS-файла и жёстко привязывает стили к конкретной структуре HTML-тегов.

</details>

## Задачи

**Задача 1. Перепиши кнопку с состояниями через `&`**

Сократи дублирование `.nav-link` с помощью вложенности и оператора `&` (для `:hover`, `:focus-visible` и модификатора `.is-active`).

```css
.nav-link { color: #1e293b; text-decoration: none; }
.nav-link:hover { color: #2563eb; }
.nav-link:focus-visible { outline: 2px solid #2563eb; }
.nav-link.is-active { font-weight: 700; }
```

<details>
<summary>Подсказка и решение</summary>

```scss
/* Внутри .nav-link оператор & подставит имя родителя без пробела */
.nav-link {
  color: #1e293b;
  text-decoration: none;

  &:hover {
    color: #2563eb;
  }

  &:focus-visible {
    outline: 2px solid #2563eb;
  }

  &.is-active {
    font-weight: 700;
  }
}
```

</details>

**Задача 2. Плоский БЭМ-компонент `.product-card` с `&__` и `&--`**

Напиши SCSS для карточки `.product-card`:
1) Свои стили карточки: `padding: 16px; border: 1px solid #cbd5e1;`.
2) Вложенный БЭМ-элемент `&__title` (`font-size: 18px; margin-bottom: 8px;`).
3) Вложенный БЭМ-модификатор `&--accent` (`border-color: #2563eb;`).

```scss
/* Напиши чистый БЭМ-компонент в SCSS без лишней вложенности */
```

<details>
<summary>Подсказка и решение</summary>

```scss
.product-card {
  padding: 16px;
  border: 1px solid #cbd5e1;

  /* Компилируется в .product-card__title (плоский класс 0-1-0) */
  &__title {
    font-size: 18px;
    margin-bottom: 8px;
  }

  /* Компилируется в .product-card--accent */
  &--accent {
    border-color: #2563eb;
  }
}
```

</details>

**Задача 3. Исправь слишком глубокую вложенность («правило 3 уровней»)**

В коде ниже 5 уровней вложенности, из-за чего в CSS получается монстр `.page .main .catalog .card .price`. Перепиши этот блок в плоский, поддерживаемый SCSS с использованием БЭМ-классов (`.catalog__card`, `.catalog__price`).

```scss
.page {
  .main {
    .catalog {
      .card {
        .price {
          font-weight: 700;
        }
      }
    }
  }
}
```

<details>
<summary>Подсказка и решение</summary>

```scss
/* Не глубже 2 уровней: плоские классы легко читать и переопределять */
.catalog {
  &__card {
    padding: 12px;
  }

  &__price {
    font-weight: 700;
  }
}
```

</details>
