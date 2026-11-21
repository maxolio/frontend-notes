# Урок 34. События мыши и указателя (Pointer Events), Drag and Drop

Суть урока:

- **Наведение и клик:** для наведения чаще берут `mouseenter`/`mouseleave` (не срабатывают лишний раз на детях); клик состоит из `mousedown` + `mouseup`.
- **Универсальный ввод:** для поддержки и мыши, и тачскрина используют Pointer Events (`pointerdown`, `pointermove`, `pointerup`).

## 1. Движение и наведение: mousemove, mouseover/out vs enter/leave (00:45–07:50)

[+] mousemove стреляет при каждом сдвиге мыши. mouseover / mouseout реагируют на наведение и увод, но СРАБАТЫВАЮТ повторно при переходе на любой вложенный тег (а relatedTarget при быстром движении или уходе за край окна может дать null).

```js
/* У mouseover / mouseout есть relatedTarget (откуда ушёл / куда перешёл курсор): */
box.addEventListener('mouseover', (event) => {
  console.log(event.target, event.relatedTarget); /* может быть null! */
});

/* mouseenter / mouseleave НЕ реагируют на внутренние дочерние элементы — удобнее! */
box.addEventListener('mouseenter', () => console.log('Вошли на сам блок целиком'));
box.addEventListener('mouseleave', () => console.log('Вышли за границы блока'));
/* ВАЖНО: mouseenter/mouseleave НЕ всплывают — их нельзя делегировать на document */
```

## 2. Нажатия мыши: mousedown, mouseup, click, dblclick, contextmenu (07:51–11:55)

[+] Обычный клик состоит из двух фаз на ОДНОМ элементе: 1) mousedown (нажали) -> 2) mouseup (отпустили) -> 3) click. Если зажать на кнопке, увести мышь в сторону и отпустить там — click НЕ сработает.

```js
btn.addEventListener('dblclick', () => console.log('Двойной клик'));

/* contextmenu — правая кнопка мыши; preventDefault() отменит системное меню: */
btn.addEventListener('contextmenu', (event) => {
  event.preventDefault();
});

/* Какая кнопка (mousedown) и какие клавиши были зажаты при клике: */
btn.addEventListener('mousedown', (event) => {
  console.log(event.button); /* 0 — левая, 1 — колёсико, 2 — правая */
  if (event.shiftKey || event.ctrlKey || event.metaKey) console.log("С модификатором");
});
```

## 3. События указателя (Pointer Events) для мыши, тача и стилуса (11:56–16:40)

[+] Pointer Events (pointerdown, pointermove, pointerup) работают одинаково с мышкой, пальцами на телефоне и стилусом, добавляя свойства для мультитача.

```js
document.addEventListener('pointerdown', (event) => {
  console.log(event.pointerType); /* "mouse" | "touch" | "pen" */
  console.log(event.pointerId);   /* у мыши всегда 1; у каждого пальца свой ID */
  console.log(event.isPrimary);   /* true для 1-го пальца, false для 2-го и далее */
  /* Захват указателя: все pointermove/up полетят в target, даже за пределы окна! */
  /* event.target.setPointerCapture(event.pointerId); */
});
```

## 4. Компонент Drag and Drop на Pointer Events (16:41–32:10)

[+] В CSS элементу с [data-js-dnd] задают position: absolute и touch-action: none (чтобы браузер на телефоне не скроллил экран вместо перетаскивания элемента). В JS события делегируем на document и не теряем this при передаче методов.

```js
class DragAndDrop {
  selectors = { root: '[data-js-dnd]' };
  stateClasses = { isDragging: 'is-dragging' };
  initialState = {
    offsetX: null, offsetY: null, isDragging: false, currentDraggingElement: null,
  };
  constructor() { this.resetState(); this.bindEvents(); }
  resetState() { this.state = { ...this.initialState }; }

  onPointerDown({ target, x, y }) {
    if (!target.matches(this.selectors.root)) return;
    /* Если внутри лежат <img>/<span>, задай им CSS pointer-events: none (или closest) */
    target.classList.add(this.stateClasses.isDragging);
    const { left, top } = target.getBoundingClientRect();
    this.state = {
      offsetX: x - left, offsetY: y - top, /* смещение от угла элемента */
      isDragging: true, currentDraggingElement: target,
    };
  }
  onPointerMove(event) {
    if (!this.state.isDragging) return;
    const x = event.pageX - this.state.offsetX; /* pageX/Y для absolute; clientX/Y — fixed */
    const y = event.pageY - this.state.offsetY;
    this.state.currentDraggingElement.style.left = `${x}px`;
    this.state.currentDraggingElement.style.top = `${y}px`;
  }
  onPointerUp() {
    if (!this.state.isDragging) return;
    this.state.currentDraggingElement.classList.remove(this.stateClasses.isDragging);
    this.resetState();
  }
  bindEvents() {
    /* Стрелочная обёртка сохраняет this экземпляра DragAndDrop (не document!) */
    document.addEventListener('pointerdown', (e) => this.onPointerDown(e));
    document.addEventListener('pointermove', (e) => this.onPointerMove(e));
    document.addEventListener('pointerup',   () => this.onPointerUp());
    /* Если тащим саму <img> (без div), отменяем встроенный dragstart браузера: */
    /* document.addEventListener('dragstart', (e) => { */
    /*   if (e.target.matches(this.selectors.root)) e.preventDefault(); */
    /* }); */
  }
}
new DragAndDrop();

/* Как в onPointerUp(event) узнать, над какой зоной ("миской") отпустили элемент? */
/* el.hidden = true;                                                               */
/* const elemBelow = document.elementFromPoint(event.clientX, event.clientY);      */
/* el.hidden = false;                                                              */
/* const dropzone = elemBelow?.closest('[data-js-dropzone]');                      */
```

## 3 главные ловушки урока (чек-лист для повторения)

1. Вешать mouseover / mouseout на карточку с детьми внутри и получать ложные срабатывания (для блока целиком бери mouseenter / mouseleave), или считать, что relatedTarget никогда не равен null.

2. Забыть touch-action: none в CSS для Drag and Drop на телефоне или не учесть смещение offsetX/offsetY от левого верхнего угла элемента (тогда карточка прыгнет углом под палец).

3. Передать в addEventListener метод класса напрямую без стрелки или bind (this.onPointerDown вместо (e) => this.onPointerDown(e)) — this внутри превратится в document и state сломается.

## Вопросы для закрепления

**1. Почему `mouseover` на карточке с текстом срабатывает по нескольку раз, почему `mouseenter` нельзя делегировать на `document`, и когда `relatedTarget` равен `null`?**

<details>
<summary>Показать ответ</summary>

1. События `mouseover` и `mouseout` **всплывают** и срабатывают каждый раз при переходе курсора между родителем и его дочерними тегами (`<h3>`, `<span>`). События `mouseenter` / `mouseleave` игнорируют детей и реагируют только на границы блока целиком.
2. `mouseenter` и `mouseleave` **не всплывают**, поэтому повесить их делегированием на `document` не получится (для делегирования используют `mouseover`/`mouseout` с проверкой `relatedTarget`).
3. `event.relatedTarget` равен `null`, когда курсор только что залетел в окно браузера снаружи или резко вылетел за его пределы.

</details>

**2. Зачем в Drag and Drop сохраняют `offsetX` / `offsetY`, и какую роль играют `touch-action: none` и отмена `dragstart`?**

<details>
<summary>Показать ответ</summary>

1. `offsetX` и `offsetY` хранят сдвиг от левого верхнего угла карточки до точки, за которую её ухватили (`x - left`, `y - top`). Без них при первом сдвиге карточка резко «прыгнет» своим углом под курсор.
2. Без `touch-action: none` в CSS мобильный браузер перехватит движение пальца под прокрутку страницы и оборвёт `pointermove`.
3. У картинок `<img>` есть встроенное перетаскивание полупрозрачной копии — без `event.preventDefault()` на `dragstart` оно перебьёт самописное перетаскивание.

</details>

**3. Что сломается при передаче `this.onPointerDown` без обёртки в `addEventListener`, и зачем прятать элемент (`el.hidden = true`) перед `document.elementFromPoint`?**

<details>
<summary>Показать ответ</summary>

1. Без стрелочной обёртки `(e) => this.onPointerDown(e)` или `.bind(this)` браузер подменит `this` внутри метода на объект **`document`**, и обращение к `this.state` сразу сломается.
2. Перетаскиваемый элемент лежит прямо под курсором, поэтому `document.elementFromPoint(x, y)` вернёт сам этот элемент, а не зону сброса (`dropzone`) под ним. Его прячут через `hidden = true`, определяют элемент ниже и тут же включают `hidden = false` — браузер даже не успевает перерисовать кадр.

</details>

## Задачи

**Задача 1. Защита галереи от контекстного меню, перетаскивания и `Shift + ЛКМ`**

Напиши функцию `initMediaControls(galleryElement)` с делегированием событий на контейнер `galleryElement`:
1) При `contextmenu` и `dragstart` на картинках `<img>` внутри галереи отменяй стандартное действие браузера (`preventDefault`) и выводи в консоль `'Действие запрещено'`.
2) При `mousedown` на `<img>`: если нажата **левая** кнопка мыши (`event.button === 0`) **и** зажата клавиша `Shift` (`event.shiftKey`), выведи в консоль путь `imgElement.getAttribute('src')`.

```js
'use strict';

/* Твоё решение: */
function initMediaControls(galleryElement) {
  /* ... */
}

const galleryElement = document.querySelector('[data-js-gallery]');
initMediaControls(galleryElement);
```

<details>
<summary>Подсказка и решение</summary>

```js
'use strict';

function initMediaControls(galleryElement) {
  if (!galleryElement) return;

  const blockDefaultForImg = (event) => {
    const imgElement = event.target.closest('img');
    if (!imgElement || !galleryElement.contains(imgElement)) return;

    event.preventDefault();
    console.log('Действие запрещено');
  };

  /* Отменяем правое меню и встроенный drag-n-drop картинок одной функцией */
  galleryElement.addEventListener('contextmenu', blockDefaultForImg);
  galleryElement.addEventListener('dragstart', blockDefaultForImg);

  galleryElement.addEventListener('mousedown', (event) => {
    const imgElement = event.target.closest('img');
    if (!imgElement || !galleryElement.contains(imgElement)) return;

    /* event.button === 0 — левая кнопка (1 — колесо, 2 — правая) */
    if (event.button === 0 && event.shiftKey) {
      console.log('Выбрано фото:', imgElement.getAttribute('src'));
    }
  });
}

const galleryElement = document.querySelector('[data-js-gallery]');
initMediaControls(galleryElement);
```

</details>

**Задача 2. Делегируемая подсказка (`mouseover` / `mouseout` + `relatedTarget`)**

Напиши функцию `initTooltips()` с делегированием на `document` для любых элементов с атрибутом `[data-tooltip]` (даже если внутри лежит `<span>`):
1) В обработчике `mouseover`: найди `tooltipTarget = event.target.closest('[data-tooltip]')`. Если `tooltipTarget` найден и курсор пришёл **извне** (т. е. `!tooltipTarget.contains(event.relatedTarget)`), выведи `'Показать подсказку: ' + tooltipTarget.dataset.tooltip`.
2) В обработчике `mouseout`: если курсор ушёл **за пределы** всего `tooltipTarget` (`!tooltipTarget.contains(event.relatedTarget)`), выведи `'Скрыть подсказку'`.

```js
'use strict';

/*
  HTML на странице:
  <button data-tooltip="Сохранить изменения"><span>Сохранить</span></button>
*/

/* Твоё решение: */
function initTooltips() {
  /* ... */
}

initTooltips();
```

<details>
<summary>Подсказка и решение</summary>

```js
'use strict';

function initTooltips() {
  document.addEventListener('mouseover', (event) => {
    const tooltipTarget = event.target.closest('[data-tooltip]');
    if (!tooltipTarget) return;

    /*
      Если relatedTarget (откуда пришёл курсор) уже лежит внутри tooltipTarget,
      значит мы просто перешагнули между <span> и <button> — повторно не срабатываем.
      Когда relatedTarget === null (заход извне окна), contains(null) даёт false
    */
    if (tooltipTarget.contains(event.relatedTarget)) return;

    console.log(`Показать подсказку: ${tooltipTarget.dataset.tooltip}`);
  });

  document.addEventListener('mouseout', (event) => {
    const tooltipTarget = event.target.closest('[data-tooltip]');
    if (!tooltipTarget) return;

    /* Скрываем подсказку, только если курсор ушёл за пределы всего элемента */
    if (tooltipTarget.contains(event.relatedTarget)) return;

    console.log('Скрыть подсказку');
  });
}

initTooltips();
```

</details>

**Задача 3. Горизонтальный ползунок на Pointer Events с `setPointerCapture`**

Напиши функцию `initRangeSlider(trackElement, thumbElement)` для перетаскивания бегунка строго по горизонтали внутри шкалы:
1) На `pointerdown` по `thumbElement`: захвати указатель (`setPointerCapture(event.pointerId)`), вычисли смещение `shiftX = event.clientX - thumbElement.getBoundingClientRect().left` и включи `isDragging = true`.
2) На `pointermove` по `thumbElement`: если `isDragging`, рассчитай `newLeft = event.clientX - shiftX - trackElement.getBoundingClientRect().left`, ограничь его в диапазоне `[0 .. trackElement.clientWidth - thumbElement.offsetWidth]` через `Math.max` / `Math.min` и обнови `thumbElement.style.left` в `'px'`.
3) На `pointerup`: выключи `isDragging = false`.

```js
'use strict';

/*
  Вёрстка:
  <div data-js-track style="position: relative; width: 300px;">
    <div data-js-thumb style="position: absolute; width: 20px; touch-action: none;"></div>
  </div>
*/

/* Твоё решение: */
function initRangeSlider(trackElement, thumbElement) {
  /* ... */
}

const trackElement = document.querySelector('[data-js-track]');
const thumbElement = document.querySelector('[data-js-thumb]');
initRangeSlider(trackElement, thumbElement);
```

<details>
<summary>Подсказка и решение</summary>

```js
'use strict';

function initRangeSlider(trackElement, thumbElement) {
  if (!trackElement || !thumbElement) return;

  let isDragging = false;
  let shiftX = 0;

  thumbElement.addEventListener('pointerdown', (event) => {
    /* Захватываем указатель — все pointermove/up прилетят в thumb даже за краем окна */
    thumbElement.setPointerCapture(event.pointerId);
    shiftX = event.clientX - thumbElement.getBoundingClientRect().left;
    isDragging = true;
  });

  thumbElement.addEventListener('pointermove', (event) => {
    if (!isDragging) return;

    const trackRect = trackElement.getBoundingClientRect();
    let newLeft = event.clientX - shiftX - trackRect.left;

    /* Ограничиваем сдвиг рамками шкалы: не левее 0 и не правее (шкала - ширина бегунка) */
    const maxLeft = trackElement.clientWidth - thumbElement.offsetWidth;
    newLeft = Math.max(0, Math.min(newLeft, maxLeft));

    thumbElement.style.left = `${Math.round(newLeft)}px`;
  });

  thumbElement.addEventListener('pointerup', () => {
    isDragging = false;
  });
}

const trackElement = document.querySelector('[data-js-track]');
const thumbElement = document.querySelector('[data-js-thumb]');
initRangeSlider(trackElement, thumbElement);
```

</details>
