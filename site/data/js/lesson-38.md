# Урок 38. Формы в JS: событие submit и сбор данных через FormData

Суть урока: Отправку формы перехватывают через событие submit и event.preventDefault(), а данные со всех полей собирают одной строкой через new FormData(formElement) — эта коллекция устроена как Map и читается через forEach или Object.fromEntries(formData).

## 1. Событие submit и отмена стандартной отправки (01:08–02:23)

[+] По умолчанию отправка формы перезагружает страницу (браузер шлёт запрос на адрес из атрибута action методом из атрибута method — GET или POST). Событие submit срабатывает как при клике по кнопке отправки (`<button>` без type="button" — это submit!), так и по нажатию Enter в любом `<input>` (при этом браузер сам генерирует click по кнопке). Чтобы собрать данные в JS, отменяем стандартное поведение браузера.

```js
const formElement = document.forms.regForm;

formElement.addEventListener('submit', (event) => {
  event.preventDefault(); /* отменяет перезагрузку страницы при клике на отправку */
  /* дальше здесь собираем данные и отправляем на сервер через JS */
});
```

## 2. Ручной обход formElement.elements и его проблемы (02:24–07:21)

[!] Если просто перебирать formElement.elements циклом for..of, приходится вручную фильтровать пустые элементы, чекбоксы, радиокнопки, select multiple и файлы.

```js
const formData = {};

for (const element of formElement.elements) {
  /* 1. У <fieldset> и <button> нет name — без проверки появится ключ "" */
  if (!element.name) continue;

  /* 2. У checkbox свойство .value всегда "on", даже когда галочка не стоит! */
  if (element.type === 'checkbox') {
    formData[element.name] = element.checked; /* берём true или false */
    continue;
  }

  /* 3. Радиокнопок с одним name несколько — невыбранные перезапишут ключ! */
  if (element.type === 'radio' && !element.checked) continue;

  formData[element.name] = element.value;
}
```

## 3. Сбор данных через new FormData и чтение значений (07:22–10:13)

[+] Класс FormData сам собирает значения всех полей формы (включая select и file) без ручных проверок. Внутри он похож на коллекцию Map, поэтому console.log(formData) в консоли выглядит пустым — пары ключ/значение смотрят через цикл, forEach или Object.

```js
formElement.addEventListener('submit', (event) => {
  event.preventDefault();

  /* Передаём DOM-элемент формы — FormData сам соберёт все поля по атрибуту name: */
  const formData = new FormData(formElement);
  console.log(formData); /* в консоли будет пустой объект {}, но данные внутри есть! */

  /* Способ 1 — встроенный forEach (ВНИМАНИЕ: 1-й аргумент value, 2-й name!): */
  formData.forEach((value, name) => {
    console.log(`${name}: ${value}`);
  });

  /* Способ 2 — перебрать пары через цикл for..of: */
  for (const [name, value] of formData) {
    console.log(name, value);
  }

  /* Способ 3 (самый наглядный для отладки) — превратить в обычный JS-объект: */
  console.log(Object.fromEntries(formData)); /* на сервер шлём сам formData, не его! */
  /* ВНИМАНИЕ: если у ключа несколько значений, Object.fromEntries оставит лишь последнее! */
  /* FormData НЕ собирает поля без name, disabled и неотмеченные checkbox/radio! */

  /* Можно создать пустую коллекцию new FormData() без формы и слать через fetch: */
  /* fetch('/api', { method: 'POST', body: formData }) — Content-Type ставить НЕ нужно */
  /* Если бэкенд ждёт JSON (без файлов): JSON.stringify(Object.fromEntries(formData)) */
});
```

## 4. Методы FormData: append, set, get, getAll, has, delete (10:14–11:15)

[+] Готовую коллекцию FormData можно дополнять своими данными, перезаписывать ключи, проверять наличие полей или удалять лишние записи перед отправкой на сервер.

```js
/* append(name, value[, filename]) — ДОБАВЛЯЕТ значение (не затирает старое!): */
formData.append('tag', 'js');
formData.append('tag', 'dom'); /* теперь у ключа 'tag' сразу два значения */

/* set(name, value) — ЗАМЕНЯЕТ: удаляет все старые записи с этим ключом и пишет новую: */
formData.set('tag', 'forms');

/* get(name) вернёт только 1-е значение (или null), getAll(name) — массив всех значений: */
console.log(formData.get('tag'));    /* 'forms' */
console.log(formData.getAll('tag')); /* ['forms'] */

/* has(name) — проверить наличие записи (true или false): */
console.log(formData.has('tag')); /* true */

/* delete(name) — удалить запись (все значения по этому имени) из коллекции: */
formData.delete('tag');
console.log(formData.has('tag')); /* false */

/* Все значения внутри FormData — строки (или File): даже число станет строкой! */
formData.append('age', 25); console.log(typeof formData.get('age')); /* 'string' */
/* Пустой <input type="file"> без файла даст объект File с size === 0 и name: "" */
```

## 3 главные ловушки урока (чек-лист для повторения)

1. Забыть event.preventDefault() внутри обработчика submit — браузер перезагрузит страницу по атрибуту action, и JS не успеет обработать или отправить данные.

2. Увидеть пустой объект {} в console.log(formData) и решить, что поля не собрались: проверять содержимое нужно через Object.fromEntries(formData) или formData.forEach.

3. Перепутать порядок аргументов в formData.forEach((value, name) => ...) — как и в Map, первым параметром всегда приходит значение (value), а вторым имя поля (name).
