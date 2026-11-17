# Урок 31. Манипуляции с DOM: создание, вставка, удаление, клонирование

Суть урока: Текст меняют через textContent, HTML-разметку — через innerHTML или insertAdjacentHTML, а новые теги создают через createElement() и вставляют в DOM методами append / prepend / before / after / replaceWith.

## 1. Содержимое элементов: textContent, innerHTML, outerHTML (00:31–05:31)

[+] textContent работает только с чистым текстом (теги из строки не парсит, а старых детей стирает). innerHTML читает/пишет HTML внутри элемента, а outerHTML захватывает и сам тег элемента.

```js
const box = document.querySelector('.box');

/* textContent: склеивает текст всех детей; при записи сотрёт все вложенные теги! */
box.textContent = '<p>Текст</p>'; /* на экране выведет буквы '<p>Текст</p>', а не тег */
/* БЕЗОПАСНОСТЬ (XSS): чужой текст от пользователя вставляй ТОЛЬКО через textContent! */

/* innerHTML: парсит теги; "+=" не только медленный, но и СТИРАЕТ фокус и обработчики */
box.innerHTML = '<p>Обновлённый абзац</p>';
box.innerHTML += '<p>Ещё один в конец</p>';

/* outerHTML: включает сам тег .box; в старой переменной box останется УДАЛЁННЫЙ тег! */
box.outerHTML = '<section>Вместо box</section>';
```

## 2. Создание createElement и 5 методов вставки в DOM (05:32–11:08)

[+] Самый правильный способ добавления элементов: создать узел в памяти через document.createElement(tag), настроить его и вставить одним из 5 методов.

```js
const getNewParagraph = () => {
  const p = document.createElement('p'); /* создан в памяти, в DOM пока отсутствует */
  p.textContent = 'Новый параграф';
  p.classList.add('paragraph-4');
  return p;
};

/* 5 методов вставки относительно опорного элемента box: */
box.append(getNewParagraph(), "просто текст"); /* внутрь в КОНЕЦ (+ строки как текст) */
box.prepend(getNewParagraph());                /* внутрь в НАЧАЛО */
box.before(getNewParagraph());                 /* снаружи ДО открывающего тега box */
box.after(getNewParagraph());                  /* снаружи ПОСЛЕ закрывающего тега box */
box.replaceWith(getNewParagraph());            /* ЗАМЕНЯЕТ сам элемент box */

/* Пакетная вставка 100 элементов без 100 перерисовок: DocumentFragment или ...массив */
const fragment = document.createDocumentFragment(); /* виртуальный контейнер */
for (let i = 0; i < 3; i++) { fragment.append(getNewParagraph()); }
box.append(fragment); /* сам fragment растворится, внутри box окажутся только 3 <p> */

/* ВАЖНО: один и тот же созданный объект нельзя вставить дважды — он ПЕРЕМЕСТИТСЯ! */
/* И помни: box.append(p) всегда возвращает undefined, а НЕ вставленный элемент p */
```

## 3. Точная вставка HTML-строки: insertAdjacentHTML / Element (11:09–14:06)

[+] insertAdjacentHTML хирургически вставляет строку с HTML-разметкой в нужное место БЕЗ медленной перезаписи соседей (как при innerHTML +=). Аналог для готового элемента — insertAdjacentElement (принимает ровно 1 элемент).

```js
/* 4 позиции вставки (1-й аргумент): */
box.insertAdjacentHTML('beforebegin', '<p>До box снаружи</p>');
box.insertAdjacentHTML('afterbegin',  '<p>Внутрь в начало</p>');
box.insertAdjacentHTML('beforeend',   '<p>Внутрь в конец</p>');
box.insertAdjacentHTML('afterend',    '<p>После box снаружи</p>');

/* Для готового DOM-элемента (только 1 элемент) и безопасного текста: */
box.insertAdjacentElement('beforeend', getNewParagraph());
box.insertAdjacentText('beforeend', 'Безопасный текст (как textContent)');
```

## 4. Удаление, клонирование и перемещение элементов (14:07–16:43)

[+] Все методы вставки (append, after и др.) автоматически ПЕРЕМЕЩАЮТ уже существующие на странице элементы — удалять их перед переносом не нужно.

```js
const box1 = document.querySelector('.box-1');
const box3 = document.querySelector('.box-3');

/* Удаление элемента из DOM (в переменной box1 он остаётся живым — можно вставить снова): */
box1.remove();

/* Клонирование элемента: */
const shallowClone = box1.cloneNode();     /* ПОВЕРХНОСТНОЕ: тег пустой, без детей! */
const deepClone = box1.cloneNode(true);    /* ГЛУБОКОЕ (но НЕ копирует addEventListener!) */
box1.after(deepClone);

/* Перемещение существующего элемента (box1 исчезнет со старого места и встанет за box3): */
box3.after(box1);
```

## 5. Быстрая очистка replaceChildren() и шпаргалка выбора

[+] Чтобы полностью очистить всё содержимое внутри контейнера без innerHTML = "", вызывают box.replaceChildren() (без аргументов — удалит всех детей).

[+] Шпаргалка выбора инструмента:
- Поменять или вставить только текст -> textContent (или insertAdjacentText).
- Вставить готовую HTML-строку без перезаписи соседей -> insertAdjacentHTML.
- Собрать пачку элементов в цикле -> createElement + DocumentFragment + append.
- Очистить всё внутри контейнера -> box.replaceChildren().

## 3 главные ловушки урока (чек-лист для повторения)

1. Вызвать elem.cloneNode() без аргумента true — получится пустая оболочка элемента без внутреннего текста и дочерних тегов.

2. Пытаться вставить одну и ту же переменную в 2 места сразу (она просто переедет в последнее место) или передавать HTML-строку "`<p>`...`</p>`" в append / textContent.

3. Дописывать множество новых элементов в цикле через box.innerHTML += ... (тормозит браузер полной перестройкой внутренностей) вместо append() / insertAdjacentHTML.
