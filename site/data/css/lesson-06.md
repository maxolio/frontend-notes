# Урок 06. Шрифты в CSS: форматы, `@font-face`, Google Fonts и свойства

Суть урока: в современном вебе подключают только формат `.woff2` локально через `@font-face` с `font-display: swap`, всегда указывают запасной шрифт в `font-family` (например, `sans-serif`), а `line-height` задают безразмерным коэффициентом (`1.5`), чтобы он не ломал вложенные заголовки.

## 1. Форматы шрифтов и веса начертаний (00:19–01:30)

[+] Из всех форматов (`eot`, `svg`, `ttf`, `woff`, `woff2`) в продакшене сегодня нужен только **`.woff2`** — он самый лёгкий и поддерживается более чем в 96% браузеров. У каждого семейства есть набор весов `font-weight` от `100` (Thin) до `900` (Black), где `400` — обычный (`Regular`), а `700` — жирный (`Bold`).

[!] Не у каждого шрифта есть все веса: например, у Roboto нет `200`, `600` и `800`. Если задать отсутствующий вес, браузер выберет ближайший доступный или искусственно утолстит буквы (faux bold).

## 2. Системные шрифты, загрузка и DevTools (01:31–04:16)

[+] Браузер сначала ищет шрифт в операционной системе пользователя. Если указан редкий шрифт, которого нет на устройстве, пользователь увидит стандартный `Times New Roman` или системный шрифт по умолчанию.

[!] Прописанное в CSS свойство `font-family` ещё не доказывает, что шрифт реально применился. Реальный шрифт проверяют в DevTools (`Ctrl+Shift+C` -> вкладка `Computed` -> самый низ, блок `Rendered Fonts`).

## 3. 3 способа подключения: `@font-face`, `@import` и `<link>` (04:17–11:39)

[+] Внешние сервисы вроде Google Fonts удобно подключать через `<link>` в `<head>` или `@import` в самом начале CSS, но **лучший способ для продакшена** — скачать шрифт, сконвертировать `.ttf` в `.woff2` (например, через `transfonter.org`) и подключить локально через `@font-face`: так сайт не ждёт сторонний сервер и не тянет лишние форматы.

```css
/* Подключаем обычное начертание (400) локально в формате woff2 */
@font-face {
  font-family: "Roboto";
  src: url("../fonts/Roboto-Regular.woff2") format("woff2");
  font-weight: 400;
  font-style: normal;
  /* Показывает запасной шрифт сразу и меняет его на Roboto после загрузки */
  font-display: swap;
}

/* Жирное начертание (700) подключаем ОТДЕЛЬНЫМ @font-face с тем же именем */
@font-face {
  font-family: "Roboto";
  src: url("../fonts/Roboto-Bold.woff2") format("woff2");
  font-weight: 700;
  font-style: normal;
  font-display: swap;
}
```

[!] Важно для каждого веса (`400`, `700`) писать отдельный `@font-face` с одинаковым `font-family`: тогда браузер возьмёт настоящий жирный файл вместо размытого искусственного утолщения.

```html
<!-- Вариант 2: подключение с Google Fonts в <head> (до styles.css) -->
<link
  rel="stylesheet"
  href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap"
>
```

```css
/* Вариант 3: @import пишется строго в самом начале CSS-файла */
@import url("https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap");
```

## 4. Свойства текста: `font-family`, `font-weight`, `font-size`, `line-height` (11:40–15:15)

[+] В `font-family` названия из нескольких слов берут в кавычки и перечисляют запасные шрифты (fallback) через запятую слева направо: если первого нет, браузер пойдёт дальше до общего семейства (`sans-serif`, `serif`, `monospace`).

<!-- demo-html:
<style>
  .demo-row { padding: 4px 0; border-bottom: 1px dashed #cbd5e1; }
</style>
<p class="text-fallback demo-row">Проверка fallback: ошибка в имени -> сработал monospace</p>
<p class="w-400 demo-row">font-weight: 400 (обычный текст)</p>
<p class="w-700 demo-row">font-weight: 700 (жирный текст)</p>
<p class="w-900 demo-row">font-weight: 900 (максимальный вес)</p>
-->
```css
/* Ошибка в "PT Sanss" заставит браузер взять следующий рабочий шрифт (monospace) */
.text-fallback {
  font-family: "PT Sanss", monospace, sans-serif;
}

/* Обычное начертание (значение по умолчанию) */
.w-400 {
  font-weight: 400;
}

/* Жирное начертание (аналог ключевого слова bold) */
.w-700 {
  font-weight: 700;
}

/* Максимально плотное начертание (если есть у шрифта) */
.w-900 {
  font-weight: 900;
}
```

[!] Размер по умолчанию в браузере — `16px`. Межстрочный интервал `line-height` из макета (например, `24px` при `font-size: 16px`, или `150%`) лучше переводить в **безразмерный коэффициент** (`24 / 16 = 1.5`): число без единиц пересчитывается для каждого потомка от его собственного `font-size`, а `px` или `%` наследуются уже в жёстких пикселях и ломают крупные заголовки внутри блока.

<!-- demo-html:
<style>
  .lh-wrap { display: flex; gap: 12px; }
  .lh-card { width: 48%; padding: 8px; border: 2px solid #94a3b8; border-radius: 6px; }
  .lh-big { font-size: 24px; font-weight: 700; margin: 0; background: #fef3c7; }
</style>
<div class="lh-wrap">
  <div class="lh-card card-unitless">
    <p class="lh-big">Заголовок в две длинные строки</p>
  </div>
  <div class="lh-card card-fixed">
    <p class="lh-big">Заголовок в две длинные строки</p>
  </div>
</div>
-->
```css
/* Коэффициент 1.4 наследуется как множитель: для 24px станет 33.6px */
.card-unitless {
  font-size: 14px;
  line-height: 1.4;
}

/* Фиксированные 18px наследуются как 18px: строки заголовка 24px слипнутся! */
.card-fixed {
  font-size: 14px;
  line-height: 18px;
}
```

[+] Сокращённое свойство `font` объединяет параметры в одну строку (например, `font: 700 16px/1.5 "Roboto", sans-serif;`), но в нём строгий порядок и обязательны `font-size` и `font-family` в конце — на практике отдельные свойства читаются проще.

## 3 главные ловушки урока (чек-лист для повторения)

1. Верить вкладке `Styles` в DevTools без проверки `Computed` -> `Rendered Fonts`: правило `font-family` может быть написано без ошибок, но сам шрифт не загрузился и подменился на системный.

2. Подключить только `font-weight: 400` в `@font-face` и использовать `700` в стилях — браузер нарисует кривой искусственный bold вместо отдельного начертания.

3. Задавать `line-height` в `px` или `%` на `body` / родителе: при наследовании процент вычисляется в пиксели родителя, и вложенный крупный заголовок слипнется по вертикали.

## Вопросы для закрепления

**1. Почему в продакшене рекомендуют скачивать шрифт в `.woff2` и подключать через `@font-face`, а не оставлять `<link>` на Google Fonts?**

<details>
<summary>Показать ответ</summary>

При локальном `@font-face` браузер загружает только нужный лёгкий файл `.woff2` с вашего же домена без лишних запросов к стороннему серверу и без лишних форматов, что ускоряет загрузку страницы.

</details>

**2. Что произойдёт, если задать `body { font-size: 16px; line-height: 150%; }`, а внутри окажется `<h2>` с `font-size: 32px`?**

<details>
<summary>Показать ответ</summary>

Процентный `line-height: 150%` вычислится один раз на `body` (`16 * 1.5 = 24px`), и `<h2>` унаследует именно фиксированные `24px` при размере букв `32px` — строки наедут друг на друга. Нужно писать безразмерный коэффициент `line-height: 1.5`.

</details>

**3. Зачем в `@font-face` указывают `font-display: swap;` и как браузер ведёт себя до загрузки файла шрифта?**

<details>
<summary>Показать ответ</summary>

`font-display: swap` заставляет браузер почти мгновенно показать текст запасным шрифтом из `font-family`, чтобы пользователь сразу мог читать страницу, а после скачивания `.woff2` плавно подменяет шрифт на основной.

</details>

## Задачи

**Задача 1. Локальное подключение двух начертаний через `@font-face`**

В папке `fonts/` лежат два файла: `Inter-Regular.woff2` (вес `400`) и `Inter-Bold.woff2` (вес `700`). Подключи оба начертания под общим именем `"Inter UI"` со свойством `font-display: swap;`, а затем примени семейство к `body` с запасным шрифтом `sans-serif`.

```css
/* Напиши два @font-face и правило для body */
```

<details>
<summary>Подсказка и решение</summary>

```css
/* Обычное начертание (400) */
@font-face {
  font-family: "Inter UI";
  src: url("../fonts/Inter-Regular.woff2") format("woff2");
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}

/* Жирное начертание (700) под тем же именем семейства */
@font-face {
  font-family: "Inter UI";
  src: url("../fonts/Inter-Bold.woff2") format("woff2");
  font-weight: 700;
  font-style: normal;
  font-display: swap;
}

/* Имя из двух слов берём в кавычки и ставим fallback без засечек */
body {
  font-family: "Inter UI", sans-serif;
}
```

</details>

**Задача 2. Перевод `line-height` из макета Figma в коэффициент**

В макете у блока `.article` указаны `font-size: 18px` и `line-height: 27px`, а внутри него есть заголовок `.article-title` с `font-size: 30px`:
1) Посчитай безразмерный коэффициент `line-height` для `.article` (округли до 2 знаков) и запиши его в CSS.
2) Задай `.article-title` размер `30px` и проверь, что его строки не слипаются, не перезаписывая `line-height` вручную.

```html
<article class="article">
  <h2 class="article-title">Длинный заголовок карточки статьи в две строки</h2>
  <p>Основной текст статьи с размером 18px и комфортным интервалом.</p>
</article>
```

<details>
<summary>Подсказка и решение</summary>

<!-- demo-html:
<style>
  .article { width: 280px; padding: 10px; border: 2px solid #94a3b8; border-radius: 6px; }
  .article-title { margin: 0 0 8px; background: #fef3c7; }
  .article p { margin: 0; }
</style>
<article class="article">
  <h2 class="article-title">Длинный заголовок карточки статьи в две строки</h2>
  <p>Основной текст статьи с размером 18px и комфортным интервалом.</p>
</article>
-->
```css
/* 27px / 18px = 1.5 — безразмерный коэффициент пересчитается для всех потомков */
.article {
  font-size: 18px;
  line-height: 1.5;
}

/* Заголовок унаследует 1.5 и получит 30 * 1.5 = 45px без слипания строк */
.article-title {
  font-size: 30px;
}
```

</details>

**Задача 3. Типографика карточки и наследование шрифта кнопкой**

Для карточки `.promo-card` ниже настрой:
1) На `.promo-card` семейство `Georgia, serif`, размер `16px` и `line-height: 1.5`.
2) На `.promo-title` вес `700` и размер `22px`.
3) Сделай так, чтобы кнопка `.promo-btn` унаследовала семейство, размер и жирность/интервал шрифта от `.promo-card`, а не использовала системный мелкий шрифт браузера.

```html
<section class="promo-card">
  <h3 class="promo-title">Скидка на курс</h3>
  <p>Оформи доступ до конца недели.</p>
  <button class="promo-btn" type="button">Выбрать тариф</button>
</section>
```

<details>
<summary>Подсказка и решение</summary>

<!-- demo-html:
<style>
  .promo-card { padding: 12px; border: 2px solid #b45309; background: #fffbeb; border-radius: 6px; }
  .promo-title { margin: 0 0 6px; }
</style>
<section class="promo-card">
  <h3 class="promo-title">Скидка на курс</h3>
  <p>Оформи доступ до конца недели.</p>
  <button class="promo-btn" type="button">Выбрать тариф</button>
</section>
-->
```css
/* Настраиваем базовый шрифт и коэффициент интерлиньяжа на родителе */
.promo-card {
  font-family: Georgia, serif;
  font-size: 16px;
  line-height: 1.5;
}

/* Заголовку задаём вес 700 и крупный размер */
.promo-title {
  font-size: 22px;
  font-weight: 700;
}

/* Кнопки не наследуют шрифт автоматически — забираем его через inherit */
.promo-btn {
  font: inherit;
}
```

</details>
