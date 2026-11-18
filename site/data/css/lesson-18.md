# Урок 18. Трансформации (`transform`) и плавные переходы (`transition`)

Суть урока: `transform` визуально смещает (`translate`), масштабирует (`scale`), поворачивает (`rotate`) и наклоняет (`skew`) элемент без сдвига соседей в потоке, `transform-origin` меняет точку опоры (по умолчанию `center`), а `transition` делает смену свойств плавной — причём задавать его нужно в обычном состоянии элемента, а не в `:hover`.

## 1. Функции `transform` и отдельные свойства (00:14–05:47)

[+] Трансформации **не влияют на поток документа**: соседи продолжают видеть блок на его старом месте. Основные функции внутри `transform` (комбинируются через пробел):
- **`translate(x, y)`** (`translateX`, `translateY`) — сдвигает элемент (`%` считаются от размеров самого элемента!).
- **`scale(x, y)`** (`scaleX`, `scaleY`) — масштаб без единиц (`1` — норма, `1.5` — больше, `-1` — отзеркалить).
- **`rotate(deg | turn)`** — поворот (`45deg`, `0.5turn` = `180deg`).
- **`skew(x, y)`** — наклон/искажение в градусах.

[+] В современных браузерах `translate`, `scale` и `rotate` можно писать отдельными свойствами без обёртки `transform`. Учитывайте порядок в `transform`: поворот меняет направление осей для следующих функций (`translateX(40px) rotate(45deg)` и `rotate(45deg) translateX(40px)` дадут разный результат).

<!-- demo-html:
<style>
  .tr-row { display: flex; gap: 18px; padding: 14px; flex-wrap: wrap; }
  .tr-box { width: 82px; height: 52px; background: #dbeafe; border: 2px solid #2563eb; display: grid; place-items: center; font-size: 12px; font-weight: 700; }
</style>
<div class="tr-row">
  <div class="tr-box tr-move">translate</div>
  <div class="tr-box tr-rot">rotate</div>
  <div class="tr-box tr-flip">scale(-1, 1)</div>
</div>
-->
```css
/* Сдвиг на 12px вправо и -6px вверх без сдвига соседей */
.tr-move {
  transform: translate(12px, -6px);
}

/* Поворот на 12 градусов по часовой стрелке */
.tr-rot {
  rotate: 12deg;
}

/* Отрицательный scale по X отражает элемент по горизонтали */
.tr-flip {
  transform: scale(-1, 1);
}
```

## 2. Точка опоры `transform-origin` (05:48–06:31)

[+] По умолчанию все повороты и масштабирование происходят вокруг центра (`transform-origin: center` или `50% 50%`). Если задать `transform-origin: 0 0;` (левый верхний угол) или `bottom center`, элемент будет вращаться или расти именно от этой точки.

<!-- demo-html:
<style>
  .org-row { display: flex; gap: 36px; padding: 18px; }
  .org-parent { width: 64px; height: 64px; background: #e2e8f0; border: 1px dashed #64748b; }
  .org-child { width: 64px; height: 64px; background: rgb(245 158 11 / 0.7); display: grid; place-items: center; font-size: 11px; font-weight: 700; }
</style>
<div class="org-row">
  <div class="org-parent"><div class="org-child org-center">center</div></div>
  <div class="org-parent"><div class="org-child org-corner">0 0</div></div>
</div>
-->
```css
/* Вращение вокруг центра элемента (по умолчанию) */
.org-center {
  transform: rotate(20deg);
}

/* Вращение вокруг верхнего левого угла (0 0) */
.org-corner {
  transform-origin: 0 0;
  transform: rotate(20deg);
}
```

## 3. Плавные переходы `transition` (06:32–11:05)

[+] `transition` объединяет 4 параметра:
1. **`transition-property`** — конкретное свойство (лучше перечислять нужные через запятую, чем писать `all`).
2. **`transition-duration`** — длительность (`0.25s`, `250ms`).
3. **`transition-timing-function`** — кривая скорости (`ease`, `linear`, `ease-in`, `ease-out`, `ease-in-out`, `cubic-bezier(...)`).
4. **`transition-delay`** — задержка перед стартом (`0.1s`).

[!] Две главные вещи на практике: 1) **`transition` всегда пишут в статичном состоянии элемента**, а не в `:hover` — иначе при уводе мыши элемент резко прыгнет назад; 2) для плавных 60 FPS лучше анимировать `transform` и `opacity`, а не `width` или `margin`.

<!-- demo-html:
<style>
  .btn-row { display: flex; gap: 12px; padding: 10px; }
  .btn-anim { padding: 10px 16px; border: 0; border-radius: 6px; background: #2563eb; color: #fff; font: inherit; font-weight: 700; cursor: pointer; }
</style>
<div class="btn-row">
  <button class="btn-anim" type="button">Наведи курсор на меня</button>
</div>
-->
```css
/* transition пишем в обычном состоянии — сработает и при наведении, и при уходе мыши */
.btn-anim {
  transition: transform 0.25s ease, background-color 0.25s ease;
}

/* На :hover меняем только свойства, которые должны плавно измениться */
.btn-anim:hover {
  transform: translateY(-3px) scale(1.04);
  background-color: #1d4ed8;
}
```

## 3 главные ловушки урока (чек-лист для повторения)

1. Писать `transition: 0.3s;` внутри селектора `:hover` вместо обычного селектора кнопки — при наведении анимация сработает, а при уводе курсора кнопка резко вернётся обратно без плавности.

2. Ждать, что `transform: translateY(30px)` сдвинет нижние блоки в потоке — трансформации работают только визуально и не меняют место элемента среди соседей.

3. Пытаться анимировать `display: none` -> `block` или нагружать анимацией `width` / `margin` вместо `transform` и `opacity` (для плавности на 60 FPS используйте GPU-свойства).

## Вопросы для закрепления

**1. Почему `transition` нужно задавать в обычном селекторе `.btn`, а не внутри `.btn:hover`?**

<details>
<summary>Показать ответ</summary>

Когда правило `transition` находится только в `.btn:hover`, оно исчезает в тот момент, когда курсор уходит с кнопки. В результате кнопка плавно появляется при наведении, но мгновенно «обрывается» при возврате в исходное состояние.

</details>

**2. В чём разница между `position: relative; top: 20px;` и `transform: translateY(20px);` для анимации?**

<details>
<summary>Показать ответ</summary>

Оба свойства визуально сдвигают элемент, не трогая соседей. Но при анимации `top` браузер каждый кадр пересчитывает геометрию раскладки (Layout), а `transform: translateY()` выполняется на видеокарте (GPU) гораздо плавнее. Кроме того, в `translateY(50%)` проценты считаются от **высоты самого элемента**, а не родителя.

</details>

**3. Что делает `transform-origin: left bottom;` при применении `scale(1.2)` или `rotate(15deg)`?**

<details>
<summary>Показать ответ</summary>

Смещает неподвижную точку опоры трансформации из центра элемента в его левый нижний угол: элемент будет расти вправо-вверх или поворачиваться вокруг этого угла.

</details>

## Задачи

**Задача 1. Плавный подъём карточки при наведении**

Для карточки `.hover-card` настрой плавный переход длительностью `0.25s` (кривая `ease-out`) для свойств `transform` и `box-shadow`:
1) Задай `transition` в основном правиле `.hover-card`.
2) При `:hover` подними карточку вверх на `6px` через `transform: translateY(-6px);` и добавь тень `0 10px 20px rgb(15 23 42 / 0.2)`.

```html
<div class="hover-card">Наведи курсор</div>
```

<details>
<summary>Подсказка и решение</summary>

<!-- demo-html:
<style>
  .hover-card { width: 180px; padding: 14px; background: #fef3c7; border: 2px solid #b45309; border-radius: 8px; text-align: center; font-weight: 700; cursor: pointer; }
</style>
<div style="padding:14px;"><div class="hover-card">Наведи курсор</div></div>
-->
```css
/* Задаём transition для конкретных свойств в статичном состоянии */
.hover-card {
  transition: transform 0.25s ease-out, box-shadow 0.25s ease-out;
}

/* При наведении плавно поднимаем карточку и усиливаем тень */
.hover-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 10px 20px rgb(15 23 42 / 0.2);
}
```

</details>

**Задача 2. Полоса подчёркивания, растущая из левого края (`transform-origin` + `scaleX`)**

У ссылки `.underline-link` есть псевдоэлемент `::after` (синяя линия внизу шириной `100%` и высотой `2px`):
1) В обычном состоянии сожми линию по горизонтали до `0` (`transform: scaleX(0);`), смести точку опоры влево (`transform-origin: left;`) и добавь `transition: transform 0.3s ease;`.
2) При наведении на ссылку (`.underline-link:hover::after`) верни масштаб в `scaleX(1)`.

```html
<a class="underline-link" href="#">Наведи на ссылку</a>
```

<details>
<summary>Подсказка и решение</summary>

<!-- demo-html:
<style>
  .underline-link { position: relative; display: inline-block; text-decoration: none; color: #0f172a; font-weight: 700; padding-bottom: 4px; }
  .underline-link::after { content: ""; position: absolute; left: 0; bottom: 0; width: 100%; height: 2px; background: #2563eb; }
</style>
<a class="underline-link" href="#">Наведи на ссылку</a>
-->
```css
/* Линия сжата в точку у левого края и готова к плавному росту */
.underline-link::after {
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.3s ease;
}

/* При наведении на ссылку линия выезжает слева направо */
.underline-link:hover::after {
  transform: scaleX(1);
}
```

</details>

**Задача 3. Отзеркаливание иконки-стрелки и поворот на `90deg`**

Для двух элементов:
1) Поверни `.arrow-down` на `90deg` отдельным свойством `rotate`.
2) Отзеркаль `.icon-mirror` по горизонтали через `transform: scaleX(-1);`.

```html
<div class="icons">
  <span class="arrow-down">→</span>
  <span class="icon-mirror">🚗</span>
</div>
```

<details>
<summary>Подсказка и решение</summary>

<!-- demo-html:
<style>
  .icons { display: flex; gap: 20px; font-size: 24px; padding: 8px; }
  .arrow-down, .icon-mirror { display: inline-block; }
</style>
<div class="icons">
  <span class="arrow-down">→</span>
  <span class="icon-mirror">🚗</span>
</div>
-->
```css
/* Поворот стрелки вправо на 90 градусов превращает её в стрелку вниз */
.arrow-down {
  rotate: 90deg;
}

/* -1 по оси X отражает элемент зеркально слева направо */
.icon-mirror {
  transform: scaleX(-1);
}
```

</details>
