# Урок 08. Фон в CSS: `background`, фоновые изображения и градиенты

Суть урока: шорткат `background` собирает цвет, картинку, повтор, позицию и размер (где `position / size` строго через `/`), для фото выбирают `cover` или `contain` с `no-repeat center`, градиенты задаются через `background-image`, а для смены одного лишь цвета пишут `background-color`, чтобы не сбросить остальные настройки фона.

## 1. Шорткат `background` и `background-color` (00:18–01:24)

[+] Свойство `background` задаёт сразу несколько параметров фона (цвет, картинку, повтор, позицию, размер, прокрутку и область заливки) почти в любом порядке. Исключение: `position` и `size` всегда идут подряд и строго через `/`.

[!] `background-color` принимает любые форматы цвета (`rgb()`, `HEX`, `hsl()`, `transparent`, `currentColor`) и **не наследуется** потомками (в отличие от `color`). Чтобы поменять только цвет фона и не сбросить уже заданную картинку/позицию, используйте точечно `background-color`, а не общий `background`.

```css
/* Точечная смена только цвета фона — безопасна, не сбрасывает другие настройки */
.card-tint {
  background-color: hsl(210 80% 94%);
}

/* Шорткат background: цвет, картинка, повтор, position / size через слеш */
.hero-bg {
  background: #1e293b url("img/hero.jpg") no-repeat center / cover;
}
```

## 2. `background-image` и наслоение фонов (01:25–02:10)

[+] Картинка задаётся через `background-image: url("...")`. Через запятую можно перечислить сразу несколько слоёв (картинок или градиентов): **первый в списке лежит сверху**, последующие — под ним, а `background-color` всегда рисуется самым нижним слоем под всеми изображениями.

```css
/* Первый url() (иконка/блик) накроет второй слой (подложку), а цвет будет снизу */
.layered-box {
  background-color: #0f172a;
  background-image: url("img/spark.png"), url("img/pattern.png");
}
```

## 3. `repeat`, `position` и `size` (02:11–06:50)

[+] По умолчанию фон повторяется по обеим осям (`repeat`), стоит в левом верхнем углу (`0 0`) и имеет оригинальный размер (`auto`):
- **`background-repeat`:** `no-repeat` (самое частое), `repeat-x` / `repeat-y` (по одной оси), `space` (пробелы между плитками), `round` (растягивает плитки, чтобы влезли ровно).
- **`background-position`:** `center` (в 99% случаев), `right bottom`, `100% 50%`, `20px 80px`. Одно слово (`bottom`) центрирует вторую ось.
- **`background-size`:** `cover` масштабирует картинку на весь блок с обрезкой краёв (хорошо для пейзажей и обложек), `contain` вмещает картинку целиком без обрезки (для товаров, людей и логотипов). При задании только одной стороны вторую ставят в `auto`, чтобы не исказить пропорции.

<!-- demo-html:
<style>
  .bg-grid { display: flex; gap: 10px; }
  .bg-box { width: 130px; height: 85px; border: 2px solid #94a3b8; background-color: #f8fafc; font-size: 12px; padding: 4px; font-weight: 700; }
  .bg-box { background-image: radial-gradient(circle, #f59e0b 28px, #fef3c7 29px); }
</style>
<div class="bg-grid">
  <div class="bg-box bg-cover">cover</div>
  <div class="bg-box bg-contain">contain</div>
  <div class="bg-box bg-tile">space</div>
</div>
-->
```css
/* Заполняет весь блок без пустых полей (края могут обрезаться) */
.bg-cover {
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
}

/* Вмещает изображение целиком без обрезки (для товаров и людей) */
.bg-contain {
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
}

/* Повторяет плитку без обрезки, добавляя равные промежутки */
.bg-tile {
  background-size: 28px 28px;
  background-repeat: space;
}
```

## 4. `background-attachment` и `background-clip` (06:51–08:42)

[+] `background-attachment` задаёт поведение при скролле: `scroll` (по умолчанию, едет с блоком), `fixed` (параллакс относительно окна; на мобильном iOS Safari часто отключается), `local` (прокручивается вместе с содержимым внутри блока с `overflow-y: auto`).

[+] `background-clip` ограничивает область заливки: `border-box` (по умолчанию, заходит под рамку), `padding-box` (до внутренней границы рамки), `content-box` (только область контента) и `text` (заливает сами буквы).

<!-- demo-html:
<style>
  .clip-row { display: flex; flex-direction: column; gap: 8px; align-items: flex-start; }
</style>
<div class="clip-row">
  <div class="clip-padding">padding-box (рамка dashed видна отдельно)</div>
  <div class="clip-content">content-box (фон только под текстом)</div>
  <div class="clip-text">Градиентный текст</div>
</div>
-->
```css
/* Фон останавливается у внутренней границы рамки */
.clip-padding {
  padding: 10px 14px;
  border: 4px dashed #334155;
  background-color: #fde68a;
  background-clip: padding-box;
}

/* Фон рисуется только под контентом, не заходя на padding и border */
.clip-content {
  padding: 10px 14px;
  border: 4px dashed #334155;
  background-color: #bfdbfe;
  background-clip: content-box;
}

/* Для background-clip: text нужен прозрачный текст и префикс -webkit- */
.clip-text {
  font-size: 24px;
  font-weight: 900;
  background-image: linear-gradient(90deg, #2563eb, #dc2626);
  color: transparent;
  -webkit-background-clip: text;
  background-clip: text;
}
```

## 5. Градиенты `linear-gradient` (08:43–12:38)

[+] Градиенты (линейный `linear-gradient`, радиальный `radial-gradient`, конический `conic-gradient`) задаются через **`background-image`**. По умолчанию линейный градиент идёт сверху вниз (`180deg`). Направление можно задать углом (`45deg`, `0.5turn`) или словами с обязательным `to` (`to right`, `to top right`).

[+] После цвета можно указать стоп-точки в `%` или `px`. Если конечная точка первого цвета совпадает со стартовой точкой второго (`30%` и `30%`), переход будет **резким без размытия**.

<!-- demo-html:
<style>
  .grad-box { height: 54px; border-radius: 6px; padding: 8px 12px; color: #fff; font-weight: 700; margin-bottom: 8px; }
</style>
<div class="grad-box grad-soft">Плавный переход слева направо (to right)</div>
<div class="grad-box grad-hard">Резкий переход на 35% + плавный дальше</div>
-->
```css
/* Обязательное ключевое слово "to" перед направлением */
.grad-soft {
  background-image: linear-gradient(to right, #2563eb, #9333ea, #e11d48);
}

/* Совпадение 35% и 35% даёт чёткую границу, затем плавный переход до 80% */
.grad-hard {
  background-image: linear-gradient(135deg, #0f172a 35%, #0284c7 35% 55%, #16a34a 85%);
}
```

## 3 главные ловушки урока (чек-лист для повторения)

1. Менять цвет фона при наведении через шорткат `background: red;` — он молча сбросит `background-image`, `background-size` и `background-position` на значения по умолчанию; меняйте только `background-color`.

2. Ставить `background-size: cover` на фото товаров, людей или логотипы — при несовпадении пропорций блока `cover` обрежет края (голову или часть товара); для них нужен `contain`.

3. Забывать слово `to` в направлении линейного градиента (`linear-gradient(right, ...)` не работает, нужно `to right`) или `-webkit-background-clip: text` + `color: transparent` для градиента внутри текста.

## Вопросы для закрепления

**1. Почему менять цвет фона кнопки при `:hover` нужно через `background-color`, а не `background`?**

<details>
<summary>Показать ответ</summary>

`background` — сокращённое свойство: оно перезаписывает не только цвет, но и `background-image`, `background-position`, `background-size` и `background-repeat` на значения по умолчанию. Если на кнопке был градиент или иконка, `background: blue;` их сотрёт.

</details>

**2. В чём разница между `background-size: cover` и `background-size: contain`, и для каких картинок что выбирают?**

<details>
<summary>Показать ответ</summary>

`cover` масштабирует картинку так, чтобы закрыть весь блок без пустых полей, обрезая лишние края (подходит для фоновых пейзажей и абстракций). `contain` вмещает картинку целиком без обрезки (подходит для товаров, логотипов и людей).

</details>

**3. Что нужно указать в `linear-gradient(...)`, чтобы граница между двумя цветами была чёткой, без плавного размытия?**

<details>
<summary>Показать ответ</summary>

Нужно задать одинаковую стоп-точку окончания первого цвета и начала второго, например: `linear-gradient(to right, #000 40%, #f59e0b 40%)`.

</details>

## Задачи

**Задача 1. Безопасная обложка секции и настройка `background` без искажений**

Для карточки товара `.product-photo` ниже настроена фоновая картинка (`url(...)`), но сейчас она размножилась плиткой и прижата к левому верхнему углу. Настрой:
1) Отключи повтор (`no-repeat`) и выровняй по центру (`center`).
2) Подбери `background-size`, чтобы фото товара поместилось **целиком без обрезки краёв**.
3) Задай цвет подложки `#f1f5f9` так, чтобы не сбросить картинку.

```html
<div class="product-photo">Фото товара</div>
```

<details>
<summary>Подсказка и решение</summary>

<!-- demo-html:
<style>
  .product-photo { width: 220px; height: 110px; border: 2px solid #94a3b8; padding: 8px; font-weight: 700; }
  .product-photo { background-image: radial-gradient(circle, #2563eb 34px, #bfdbfe 35px); }
</style>
<div class="product-photo">Товар внутри</div>
-->
```css
/* Товар нельзя обрезать — выбираем contain, отключаем повтор и ставим по центру */
.product-photo {
  background-color: #f1f5f9;
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
}
```

</details>

**Задача 2. Двухцветный флаг с резкой границей на `linear-gradient`**

Сделай блок `.flag` размером `200px` на `120px` с резким горизонтальным делением (сверху вниз): верхние `50%` синие (`#2563eb`), нижние `50%` жёлтые (`#facc15`) без плавного перехода посередине.

```html
<div class="flag"></div>
```

<details>
<summary>Подсказка и решение</summary>

```css
/* Совпадение стоп-точек 50% и 50% убирает плавный переход */
.flag {
  width: 200px;
  height: 120px;
  background-image: linear-gradient(180deg, #2563eb 50%, #facc15 50%);
}
```

</details>

**Задача 3. Градиентный заголовок через `background-clip: text`**

Покрась текст заголовка `.hero-title` диагональным градиентом (`to right`, от `#0ea5e9` к `#8b5cf6`) так, чтобы градиент был виден **только внутри букв**, а в Chrome/Safari не пропадал эффект.

```html
<h2 class="hero-title">Яркий заголовок</h2>
```

<details>
<summary>Подсказка и решение</summary>

<!-- demo-html:
<style>
  .hero-title { font-size: 28px; font-weight: 900; margin: 0; }
</style>
<h2 class="hero-title">Яркий заголовок</h2>
-->
```css
/* Прозрачный цвет текста открывает градиент, обрезанный по форме букв */
.hero-title {
  background-image: linear-gradient(to right, #0ea5e9, #8b5cf6);
  color: transparent;
  -webkit-background-clip: text;
  background-clip: text;
}
```

</details>
