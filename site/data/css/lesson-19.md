# Урок 19. Анимации в CSS: `@keyframes` и свойства `animation-*`

Суть урока: в отличие от `transition` (который ждёт смены состояния вроде `:hover`), CSS-анимации работают по расписанию ключевых кадров `@keyframes` (`0%..100%` или `from..to`), стартуют сразу после загрузки страницы, могут повторяться бесконечно (`infinite`), ходить туда-обратно (`alternate`), ставиться на паузу (`paused`) и фиксировать финальный кадр через `animation-fill-mode: forwards`.

## 1. Директива `@keyframes` и запуск анимации (00:07–02:46)

[+] Анимация создаётся директивой `@keyframes имя { ... }`, где шаги задаются через `from` / `to` или проценты (`0%`, `50%`, `100%`). Если `0%` не указывать, браузер начнёт с исходных стилей элемента.

[+] Чтобы запустить анимацию, элементу достаточно указать `animation: имя длительность;` (или отдельно `animation-name` и `animation-duration`). Анимация стартует после загрузки HTML (DOM) и CSS (CSSOM). В шорткате первое время — всегда `duration`, а второе — `delay`.

<!-- demo-html:
<style>
  .anim-stage { padding: 14px; }
  .anim-card { width: 120px; padding: 10px; background: #dbeafe; border: 2px solid #2563eb; border-radius: 8px; text-align: center; font-weight: 700; font-size: 13px; }
</style>
<div class="anim-stage">
  <div class="anim-card">Качаюсь сам</div>
</div>
-->
```css
/* Описываем сценарий ключевых кадров с именем wobble */
@keyframes wobble {
  0%, 100% {
    transform: rotate(0deg);
  }
  50% {
    transform: rotate(10deg);
  }
}

/* Минимум для запуска: имя анимации и длительность одного цикла */
.anim-card {
  animation-name: wobble;
  animation-duration: 1.4s;
  animation-iteration-count: infinite;
}
```

## 2. Повторы, направление, пауза и `fill-mode` (02:47–05:11)

[+] Для гибкой настройки удобнее писать отдельные свойства вместо длинной строки `animation`:
- **`animation-delay`** (`0.5s`, `-0.5s` — отрицательная задержка начинает анимацию уже с середины).
- **`animation-iteration-count`** (`1` по умолчанию, `3` или `infinite` для бесконечного цикла).
- **`animation-timing-function`** (`ease`, `linear`, `cubic-bezier(...)`).
- **`animation-direction`** (`normal`, `reverse`, `alternate` — нечётные круги вперёд, чётные назад, `alternate-reverse`).
- **`animation-play-state`** (`running` / `paused` — удобно ставить на паузу при `:hover`).

[!] По умолчанию после окончания анимации элемент резко прыгает в исходный вид. Чтобы он **остался в финальном кадре (`100%`)**, добавьте `animation-fill-mode: forwards;` (или `both`, если нужно применить и кадр `0%` во время `animation-delay`). А бесконечные анимации отключайте при `@media (prefers-reduced-motion: reduce)`.

<!-- demo-html:
<style>
  .pulse-stage { padding: 12px; display: flex; gap: 16px; align-items: center; }
  .pulse-dot { width: 34px; height: 34px; border-radius: 50%; background: #16a34a; cursor: pointer; }
  .fade-badge { padding: 6px 12px; background: #fef3c7; border: 2px solid #b45309; border-radius: 6px; font-weight: 700; font-size: 13px; }
</style>
<div class="pulse-stage">
  <div class="pulse-dot" title="Наведи для паузы"></div>
  <div class="fade-badge">Появился и остался (forwards)</div>
</div>
-->
```css
@keyframes pulse {
  from {
    transform: scale(0.85);
    opacity: 0.6;
  }
  to {
    transform: scale(1.15);
    opacity: 1;
  }
}

/* alternate гоняет пульсацию плавно туда-обратно без скачка */
.pulse-dot {
  animation-name: pulse;
  animation-duration: 0.9s;
  animation-iteration-count: infinite;
  animation-direction: alternate;
}

/* Пауза по наведению, а при уходе мыши продолжит с того же места */
.pulse-dot:hover {
  animation-play-state: paused;
}

@keyframes slide-in {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* forwards удержит элемент в конечном кадре (opacity: 1) после завершения */
.fade-badge {
  animation-name: slide-in;
  animation-duration: 0.7s;
  animation-fill-mode: forwards;
}
```

## 3 главные ловушки урока (чек-лист для повторения)

1. Забывать `animation-fill-mode: forwards;` в анимациях появления — элемент плавно появится, но в конце мгновенно прыгнет обратно в `opacity: 0` (или начальную позицию).

2. Путать порядок времени в шорткате `animation: move 1s ease 2s;` — первое время всегда означает длительность (`duration`), а второе — задержку (`delay`).

3. Ставить `animation-iteration-count: infinite` с `normal` для маятникового движения — в конце круга элемент резко прыгнет к `0%` (для плавного движения туда-обратно нужен `animation-direction: alternate`).

## Вопросы для закрепления

**1. Зачем нужно свойство `animation-fill-mode: forwards;` и чем оно отличается от `both`?**

<details>
<summary>Показать ответ</summary>

По умолчанию после завершения анимации элемент возвращается к своим обычным стилям. `forwards` фиксирует стили последнего кадра (`100%` / `to`), а `both` делает то же самое плюс применяет стили стартового кадра (`0%` / `from`) уже во время ожидания `animation-delay`.

</details>

**2. Как сделать так, чтобы вращающийся лоадер останавливался при наведении курсора и продолжал крутиться с того же угла после ухода мыши?**

<details>
<summary>Показать ответ</summary>

Добавить на `:hover` свойство `animation-play-state: paused;`. Оно замораживает текущий кадр анимации, а при уходе курсора возвращается значение `running` по умолчанию, и анимация продолжается без сброса в начало.

</details>

**3. Что делает отрицательная задержка `animation-delay: -1s;` при длительности анимации `2s`?**

<details>
<summary>Показать ответ</summary>

Анимация запустится сразу же без ожидания, но не с нуля, а так, будто `1s` уже прошла — то есть сразу с середины (`50%`) сценария.

</details>

## Задачи

**Задача 1. Бесконечный спиннер-загрузчик**

Опиши `@keyframes spin` (поворот `rotate` от `0deg` до `360deg`) и примени его к `.spinner` так, чтобы круг крутился равномерно (`linear`), бесконечно (`infinite`), за `1s` на один оборот.

```html
<div class="spinner"></div>
```

<details>
<summary>Подсказка и решение</summary>

<!-- demo-html:
<style>
  .spinner { width: 38px; height: 38px; border: 4px solid #cbd5e1; border-top-color: #2563eb; border-radius: 50%; margin: 12px; }
</style>
<div class="spinner"></div>
-->
```css
/* Полный оборот на 360 градусов */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* linear убирает замедление на стыке кругов — вращение становится ровным */
.spinner {
  animation-name: spin;
  animation-duration: 1s;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
}
```

</details>

**Задача 2. Плавное появление уведомления с фиксацией в конце (`forwards`)**

Анимируй `.toast`: за `0.6s` оно должно выехать снизу (`translateY(20px)` и `opacity: 0` в `from`) в нормальное место (`translateY(0)` и `opacity: 1` в `to`) и **не исчезнуть** после завершения.

```html
<div class="toast">Изменения сохранены</div>
```

<details>
<summary>Подсказка и решение</summary>

<!-- demo-html:
<style>
  .toast { display: inline-block; padding: 10px 14px; background: #16a34a; color: #fff; border-radius: 6px; font-weight: 700; margin: 12px; }
</style>
<div class="toast">Изменения сохранены</div>
-->
```css
@keyframes toast-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* forwards удержит уведомление видимым в финальной точке */
.toast {
  animation-name: toast-up;
  animation-duration: 0.6s;
  animation-fill-mode: forwards;
}
```

</details>

**Задача 3. Плавное покачивание туда-обратно с паузой при наведении**

Задай `@keyframes float-y` (сдвиг `translateY` от `0` до `-10px`) и подключи к `.float-box`:
1) Длительность `1.2s`, бесконечный повтор (`infinite`) и движение туда-обратно (`alternate`).
2) При наведении мыши (`.float-box:hover`) ставь анимацию на паузу (`paused`).

```html
<div class="float-box">Наведи, чтобы остановить</div>
```

<details>
<summary>Подсказка и решение</summary>

<!-- demo-html:
<style>
  .float-box { display: inline-block; padding: 10px 16px; background: #fde68a; border: 2px solid #b45309; border-radius: 8px; font-weight: 700; margin: 18px; cursor: pointer; }
</style>
<div class="float-box">Наведи, чтобы остановить</div>
-->
```css
@keyframes float-y {
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(-10px);
  }
}

.float-box {
  animation-name: float-y;
  animation-duration: 1.2s;
  animation-iteration-count: infinite;
  animation-direction: alternate;
}

/* Замораживаем текущий кадр на :hover */
.float-box:hover {
  animation-play-state: paused;
}
```

</details>
