# Урок 10. Позиционирование (`position`), `inset`, контекст наложения и `z-index`

Суть урока: по умолчанию все элементы в потоке (`static`), `relative` оставляет элемент на месте и задаёт точку отсчёта для `absolute`, `fixed` крепится к окну, `sticky` липнет при скролле, шорткат `inset` заменяет все 4 стороны смещения, а `z-index` работает только на позиционированных элементах с учётом контекста наложения родителя.

## 1. `static` и `relative` (00:31–02:38)

[+] Значение по умолчанию `position: static` держит элемент в обычном потоке — свойства `top`, `right`, `bottom`, `left`, `inset` и `z-index` на нём не работают.

[+] `position: relative` оставляет элемент в потоке (его место сохраняется, соседи не сдвигаются), но включает смещения и `z-index`. Главная роль `relative` — служить опорным родителем для вложенного `absolute`.

<!-- demo-html:
<style>
  .rel-wrap { display: flex; flex-direction: column; gap: 6px; padding: 10px; }
  .rel-item { padding: 8px 12px; background: #e2e8f0; border: 1px solid #94a3b8; font-size: 13px; }
</style>
<div class="rel-wrap">
  <div class="rel-item">Блок 1 (static)</div>
  <div class="rel-item rel-moved">Блок 2 (relative: сдвинут визуально, но дыра осталась)</div>
  <div class="rel-item">Блок 3 (стоит на своём месте, не заехал вверх)</div>
</div>
-->
```css
/* Визуальный сдвиг вверх и вправо, не затрагивающий соседние блоки */
.rel-moved {
  position: relative;
  top: -12px;
  left: 20px;
  background-color: #fef3c7;
}
```

## 2. `absolute` (02:39–05:40)

[+] `position: absolute` вырывает элемент из потока (соседи занимают его место) и сжимает ширину по контенту, если `width` не задана. Отсчёт идёт от **ближайшего родителя с `position !== static`**; если таких нет — от страницы (`body`).

<!-- demo-html:
<style>
  .card-rel { height: 90px; background: #f8fafc; border: 2px solid #94a3b8; padding: 12px; }
  .close-btn { background: #dc2626; color: #fff; border: 0; padding: 4px 8px; border-radius: 4px; }
</style>
<div class="card-rel">
  Модальное окно (родитель relative)
  <button class="close-btn" type="button">✕</button>
</div>
-->
```css
/* Опорный родитель: без relative кнопка улетела бы в угол всей страницы */
.card-rel {
  position: relative;
}

/* Крестик прижат к правому верхнему углу родителя .card-rel */
.close-btn {
  position: absolute;
  top: 8px;
  right: 8px;
}
```

## 3. `fixed` и `sticky` (05:41–07:50)

[+] `position: fixed` фиксирует элемент относительно окна браузера (не уезжает при скролле). Исключение: если у родителя заданы `filter` или `transform`, `fixed` начинает привязываться к этому родителю.

[+] `position: sticky` ведёт себя как `relative`, пока при прокрутке элемент не дойдёт до порога (например, `top: 8px`), после чего «липнет» внутри границ своего родителя.

[!] Частые причины поломки `sticky`: элемент растянут на всю высоту родителя (некуда липнуть), либо у любого из родителей задано `overflow: hidden` (заменяйте на `overflow: clip`).

<!-- demo-html:
<style>
  .scroll-box { height: 120px; overflow-y: auto; border: 2px solid #94a3b8; padding: 8px; background: #fff; }
  .sticky-bar { background: #dcfce7; border: 1px solid #16a34a; padding: 6px 10px; font-weight: 700; }
  .tall-text { height: 260px; padding-top: 10px; font-size: 13px; color: #475569; }
</style>
<div class="scroll-box">
  <div class="sticky-bar">Липкая шапка (покрути скролл здесь!)</div>
  <div class="tall-text">Прокрути этот блок вниз — зелёная плашка прилипнет к верхнему краю с отступом 6px.</div>
</div>
-->
```css
/* При прокрутке прилипнет на расстоянии 6px от верхнего края окна или скролл-блока */
.sticky-bar {
  position: sticky;
  top: 6px;
}
```

## 4. Смещения и шорткат `inset` (07:51–10:39)

[+] Проценты в `top`/`left` при `relative` считаются от размеров самого элемента, а при `absolute`/`fixed` — от размеров опорного родителя. Если указать противоположные стороны одновременно (`top` и `bottom`, `left` и `right`) при фиксированных размерах, побеждают `top` и `left`.

[+] Шорткат `inset` задаёт сразу `top`, `right`, `bottom`, `left` (от 1 до 4 значений по часовой стрелке). Если у `absolute` не заданы `width`/`height`, `inset: 0;` растянет его на всего родителя; а при заданных `width`/`height` пара `inset: 0; margin: auto;` отцентрирует блок.

<!-- demo-html:
<style>
  .parent-box { position: relative; height: 100px; background: #e2e8f0; border: 2px solid #64748b; }
  .center-badge { width: 170px; height: 36px; background: #2563eb; color: #fff; text-align: center; line-height: 36px; font-size: 13px; border-radius: 6px; }
</style>
<div class="parent-box">
  <div class="center-badge">Центр через inset: 0</div>
</div>
-->
```css
/* При явных width/height пара inset: 0 + margin: auto ставит блок точно в центр */
.center-badge {
  position: absolute;
  inset: 0;
  margin: auto;
}
```

## 5. Контекст наложения и `z-index` (10:40–15:40)

[+] По умолчанию выше по оси Z находится элемент, который стоит **ниже в HTML**. Чтобы управлять порядком слоёв вручную, задают `z-index` (обычно с шагом `100`: `100`, `200`, `300` — чтобы легко вставлять промежуточные слои).

[!] Два критических правила: 1) `z-index` **не работает** на элементах с `position: static`; 2) если родитель создал свой контекст наложения (например, `position: relative; z-index: 100;`), то ни один его ребёнок (даже с `z-index: 9999`) не сможет вылезти поверх соседнего блока с `z-index: 200`.

<!-- demo-html:
<style>
  .z-stage { position: relative; height: 95px; padding: 8px; }
  .z-box { width: 130px; padding: 12px; font-size: 13px; font-weight: 700; border: 2px solid #334155; }
  .z-one { background: #fde68a; }
  .z-two { top: 34px; left: 75px; background: #bfdbfe; }
</style>
<div class="z-stage">
  <div class="z-box z-one">Первый в HTML (z-index: 200)</div>
  <div class="z-box z-two">Второй в HTML (z-index: 100)</div>
</div>
-->
```css
/* Первый блок в HTML перекрывает второй, т.к. его z-index больше (200 > 100) */
.z-one {
  position: relative;
  z-index: 200;
}

/* Позиционирован как absolute и лежит под .z-one */
.z-two {
  position: absolute;
  z-index: 100;
}
```

## 3 главные ловушки урока (чек-лист для повторения)

1. Задать `z-index: 100;` без смены `position` (`static` по умолчанию) — свойство полностью проигнорируется браузером.

2. Ждать работы `position: sticky`, когда у родителя стоит `overflow: hidden` или сам липкий блок растянут на всю высоту контейнера.

3. Ставить `z-index: 9999` дочернему элементу, забыв, что у его родителя уже задан `z-index: 100` — ребёнок заперт внутри контекста наложения родителя и не перекроет соседа с `z-index: 200`.

## Вопросы для закрепления

**1. В чём разница между `position: relative` и `position: absolute` для соседних элементов в потоке?**

<details>
<summary>Показать ответ</summary>

`relative` оставляет элемент в потоке (его исходное место сохраняется, соседи никуда не двигаются, даже если блок визуально сдвинут через `top`/`left`). `absolute` полностью вырывает элемент из потока — соседние блоки занимают освободившееся место.

</details>

**2. Почему `z-index: 999` на вложенном тултипе не позволяет ему перекрыть шапку сайта с `z-index: 200`, если у родителя тултипа стоит `position: relative; z-index: 100;`?**

<details>
<summary>Показать ответ</summary>

Родитель с `position: relative` и `z-index: 100` создал собственный изолированный **контекст наложения**. Все дети внутри него сравниваются между собой и не могут вылезти за пределы уровня `100` своего родителя относительно внешнего блока с `z-index: 200`.

</details>

**3. Что сделает `inset: 0;` на элементе с `position: absolute` без `width`/`height` и с явно заданными `width: 100px; height: 100px;` + `margin: auto;`?**

<details>
<summary>Показать ответ</summary>

Без заданных `width`/`height` `inset: 0;` прижмёт все 4 края к опорному родителю и растянет блок на всю его площадь. С фиксированными `width`/`height` и `margin: auto;` браузер равномерно распределит свободное место и поставит блок ровно по центру родителя.

</details>

## Задачи

**Задача 1. Бейдж «NEW» в правом верхнем углу карточки**

Помести бейдж `.badge` в правый верхний угол карточки `.product-card` с отступом `10px` сверху и `10px` справа так, чтобы он не сдвигал текст внутри карточки и не улетел в угол всей страницы.

```html
<div class="product-card">
  <span class="badge">NEW</span>
  <h3>Наушники Pro</h3>
  <p>Беспроводные наушники с шумоподавлением.</p>
</div>
```

<details>
<summary>Подсказка и решение</summary>

<!-- demo-html:
<style>
  .product-card { width: 240px; padding: 14px; background: #f8fafc; border: 2px solid #94a3b8; border-radius: 8px; }
  .product-card h3 { margin: 0 0 6px; font-size: 16px; }
  .product-card p { margin: 0; font-size: 13px; }
  .badge { background: #16a34a; color: #fff; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: 700; }
</style>
<div class="product-card">
  <span class="badge">NEW</span>
  <h3>Наушники Pro</h3>
  <p>Беспроводные наушники с шумоподавлением.</p>
</div>
-->
```css
/* Делаем карточку опорным родителем для абсолютного бейджа */
.product-card {
  position: relative;
}

/* Вырываем из потока и крепим к правому верхнему углу карточки */
.badge {
  position: absolute;
  top: 10px;
  right: 10px;
}
```

</details>

**Задача 2. Полупрозрачный оверлей и модальное окно по центру через `inset: 0`**

Внутри `.modal-backdrop` лежит диалог `.modal-box` размером `220px` на `100px`.
1) Растяни `.modal-backdrop` на всю область контейнера через `position: absolute` и `inset: 0;`, задав полупрозрачный фон `rgb(15 23 42 / 0.55)` и `z-index: 500`.
2) Отцентрируй `.modal-box` внутри `.modal-backdrop` по обеим осям с помощью `position: absolute`, `inset: 0;` и `margin: auto;`.

```html
<div class="stage">
  <p>Контент под оверлеем</p>
  <div class="modal-backdrop">
    <div class="modal-box">Окно по центру</div>
  </div>
</div>
```

<details>
<summary>Подсказка и решение</summary>

<!-- demo-html:
<style>
  .stage { position: relative; height: 150px; border: 2px solid #94a3b8; padding: 12px; background: #fff; }
  .modal-box { background: #fff; border-radius: 8px; padding: 12px; text-align: center; font-weight: 700; }
</style>
<div class="stage">
  <p>Контент под оверлеем</p>
  <div class="modal-backdrop">
    <div class="modal-box">Окно по центру</div>
  </div>
</div>
-->
```css
/* Без width/height inset: 0 растягивает оверлей на весь родитель .stage */
.modal-backdrop {
  position: absolute;
  inset: 0;
  background-color: rgb(15 23 42 / 0.55);
  z-index: 500;
}

/* С фиксированными размерами inset: 0 + margin: auto даёт центр */
.modal-box {
  position: absolute;
  inset: 0;
  margin: auto;
  width: 220px;
  height: 100px;
}
```

</details>

**Задача 3. Исправление контекста наложения (убираем ловушку вложенного `z-index`)**

В коде ниже блок `.banner` с `z-index: 200` перекрывает выпадающее меню `.dropdown` внутри `.header`, хотя у `.dropdown` стоит `z-index: 9999`. Найди причину и исправь её одним изменением `z-index` в `.header`, не трогая `.banner` и `.dropdown`.

```html
<header class="header">
  Шапка
  <div class="dropdown">Выпадающее меню</div>
</header>
<section class="banner">Баннер ниже по коду</section>
```

```css
/* Проблемный CSS: */
.header {
  position: relative;
  z-index: 100;
}

.dropdown {
  position: absolute;
  top: 24px;
  left: 20px;
  z-index: 9999;
}

.banner {
  position: relative;
  z-index: 200;
}
```

<details>
<summary>Подсказка и решение</summary>

<!-- demo-html:
<style>
  .header { background: #dbeafe; padding: 8px; border: 1px solid #2563eb; }
  .dropdown { background: #fef08a; border: 2px solid #ca8a04; padding: 10px; width: 170px; font-weight: 700; }
  .banner { background: #fecaca; border: 1px solid #dc2626; padding: 24px 12px; }
</style>
<header class="header">
  Шапка
  <div class="dropdown">Выпадающее меню</div>
</header>
<section class="banner">Баннер ниже по коду</section>
-->
```css
/* Поднимаем контекст наложения самого родителя .header выше .banner (300 > 200) */
.header {
  position: relative;
  z-index: 300;
}

.dropdown {
  position: absolute;
  top: 24px;
  left: 20px;
  z-index: 9999;
}

.banner {
  position: relative;
  z-index: 200;
}
```

</details>
