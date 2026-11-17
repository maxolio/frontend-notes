# Урок 34. События мыши и указателя (Pointer Events), Drag and Drop

Суть урока: Для наведения чаще берут mouseenter/mouseleave (без лишних срабатываний на детях), клик состоит из mousedown + mouseup, а для поддержки и мыши, и тачскрина используют Pointer Events (pointerdown, pointermove, pointerup).

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
