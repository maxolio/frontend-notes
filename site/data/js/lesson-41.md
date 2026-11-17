# Урок 41. Браузерные хранилища: cookie, localStorage, sessionStorage и IndexedDB

Суть урока: Все браузерные хранилища привязаны к домену и переживают перезагрузку страницы: cookies (~4 КБ) нужны для работы с сервером, sessionStorage живёт до закрытия вкладки, localStorage хранится вечно (5+ МБ), а IndexedDB — сложная БД для оффлайн-PWA.

## 1. Работа с document.cookie: запись, чтение и удаление (00:22–10:35)

[+] Свойство document.cookie работает как сеттер (добавляет/обновляет 1 запись по ключу, не затирая остальные) и геттер (возвращает все куки одной строкой через "; "). Лимит: до ~20 записей на домен и ~4 КБ на одну куку; главное назначение — токены и сессии.

```js
/* Запись, опции (path, max-age, secure, samesite) и кодирование пробелов/символов: */
/* Серверные куки с httpOnly полностью скрыты от JS (защита от кражи через XSS)! */
const setCookie = (name, value, options = {}) => {
  const fullOptions = { path: '/', ...options }; /* без path=/ кука видна лишь на URL */
  let newEntryBody = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;
  const optionsString = Object.entries(fullOptions)
    .map(([key, val]) => `${key}=${val}`)
    .join('; ');
  if (optionsString) newEntryBody += `; ${optionsString}`;
  document.cookie = newEntryBody;
};

/* Удаление куки в коде — ставим отрицательный срок жизни max-age: -1 */
const deleteCookie = (name) => setCookie(name, '', { 'max-age': -1 });

/* Чтение нужной куки по имени (парсим строку вида "a=1; b=2"): */
const getCookie = (name) => {
  for (const entryStr of document.cookie.split('; ')) {
    const [entryName, entryValue] = entryStr.split('=');
    if (decodeURIComponent(entryName) === name) return decodeURIComponent(entryValue);
  }
};
```

## 2. sessionStorage и localStorage: отличие и 4 метода (10:36–14:32)

[+] У обоих хранилищ объём от 5 МБ и одинаковые методы, разница лишь в сроке жизни: sessionStorage очищается при закрытии вкладки, а localStorage не пропадает даже после перезагрузки ПК. Смотреть их удобно в DevTools -> Application -> Storage.

```js
sessionStorage.setItem('age', 25); /* внутри всё приводится к строке! */
console.log(typeof sessionStorage.getItem('age')); /* 'string', а не 'number' */

/* Объекты и массивы сохраняем через JSON.stringify и читаем через JSON.parse: */
localStorage.setItem('user', JSON.stringify({ name: 'Alex', isAdmin: false }));
const user = JSON.parse(localStorage.getItem('user')); /* вернёт null, если ключа нет */
/* В продакшене JSON.parse прячут в try..catch (битая строка не должна уронить скрипт) */
/* Секреты/токены в localStorage НЕ хранят (доступно XSS) — там только UI-настройки! */

localStorage.removeItem('user'); /* удалить одну запись по ключу */
localStorage.clear();            /* полностью очистить хранилище домена */

/* Перебор: for..in брать НЕЛЬЗЯ (попадут методы)! Берите Object.keys(localStorage) */
/* При переполнении (~5 МБ) setItem кидает QuotaExceededError — страхуют try..catch */
window.addEventListener('storage', (e) => { /* key, oldValue, newValue */ });
/* Событие storage ловится в ДРУГИХ вкладках этого сайта (не в текущей!) */
```

## 3. Практика: компонент смены темы ThemeSwitcher (14:33–22:45)

[+] Навешиваем/снимаем CSS-класс .is-dark-theme на теге `<html>` (document.documentElement) и сохраняем выбор в localStorage, чтобы тема не сбрасывалась между визитами.

```js
class ThemeSwitcher {
  selectors = { switchThemeButton: '[data-js-theme-switcher]' };
  themes = { dark: 'dark', light: 'light' };
  stateClasses = { isDarkTheme: 'is-dark-theme' };
  storageKey = 'theme';

  constructor() {
    this.switchThemeButtonElement = document.querySelector(this.selectors.switchThemeButton);
    this.setInitialTheme();
    this.bindEvents();
  }

  /* Геттер читается как свойство (без скобок): this.isDarkThemeCached */
  get isDarkThemeCached() {
    return localStorage.getItem(this.storageKey) === this.themes.dark;
  }

  setInitialTheme() {
    document.documentElement.classList.toggle(
      this.stateClasses.isDarkTheme, this.isDarkThemeCached
    );
  }

  /* Стрелочный метод сохраняет this при передаче в addEventListener: */
  onClick = () => {
    localStorage.setItem(
      this.storageKey, this.isDarkThemeCached ? this.themes.light : this.themes.dark
    );
    document.documentElement.classList.toggle(this.stateClasses.isDarkTheme);
  };

  bindEvents() {
    this.switchThemeButtonElement.addEventListener('click', this.onClick);
  }
}
new ThemeSwitcher();
/* Чтобы не было "белой вспышки" при загрузке, стартовый класс .is-dark-theme ставят */
/* синхронным <script> в <head> до <body>, а здесь оставляют лишь кнопку переключения. */
```

## 4. IndexedDB — асинхронная база данных в браузере (22:46–23:59)

[+] IndexedDB — самое мощное браузерное хранилище для больших структурированных данных и файлов. Работает асинхронно через события (onupgradeneeded, onsuccess, onerror) и чаще применяется в PWA вместе с Service Worker; для обычных сайтов избыточно.

## 3 главные ловушки урока (чек-лист для повторения)

1. Хранить в localStorage числа, булевы или объекты напрямую без JSON.stringify / JSON.parse — при чтении получите строку (например, "false" вместо false или "[object]").

2. Писать в document.cookie пробелы/спецсимволы без encodeURIComponent или пытаться засунуть туда большие данные (лимит 4 КБ отрежет значение и сломает парсинг).

3. Сохранить долгоживущие настройки (например, тему сайта) в sessionStorage вместо localStorage — после закрытия вкладки все данные исчезнут.

## Вопросы для закрепления

**1. Мы выполнили `localStorage.setItem('isDark', false)`. Что вернёт `localStorage.getItem('isDark')` и сработает ли условие `if (localStorage.getItem('isDark'))`?**

<details>
<summary>Показать ответ</summary>

Хранилища `localStorage` и `sessionStorage` автоматически приводят любые ключи и значения к **строке**. Поэтому вместо булева `false` сохранится непустая строка `'false'`. Условие `if ('false')` **сработает** (любая непустая строка — truthy). Если же ключа в хранилище вообще нет, `getItem` вернёт `null`. Для сохранения типов нужно использовать `JSON.stringify` и `JSON.parse`.

</details>

**2. Сработает ли обработчик `window.addEventListener('storage', ...)` в той же вкладке, где скрипт только что вызвал `localStorage.setItem(...)`? И почему ключи хранилища нельзя перебирать циклом `for..in`?**

<details>
<summary>Показать ответ</summary>

Нет — событие `storage` срабатывает **только в других открытых вкладках (или окнах) того же домена**, чтобы синхронизировать состояние между ними (например, тему или выход из аккаунта), но не в текущей вкладке. Цикл `for..in` по `localStorage` перебирает не только ваши ключи, но и встроенные свойства и методы объекта (`length`, `getItem`, `setItem`, `clear` и т.д.). Для перебора только сохранённых ключей используйте `Object.keys(localStorage)` или `localStorage.key(i)`.

</details>

**3. Если выполнить `document.cookie = 'theme=dark; path=/'`, затрутся ли остальные куки домена? И как прочитать в JS серверную куку, установленную с флагом `HttpOnly`?**

<details>
<summary>Показать ответ</summary>

Не затрутся: `document.cookie` устроен как специальный сеттер — присваивание добавляет или перезаписывает только одну куку по указанному имени, не трогая остальные. Серверную куку с флагом `HttpOnly` прочитать через JS **невозможно** (браузер скрывает её от `document.cookie` для защиты сессии от кражи при XSS-атаках).

</details>

## Задачи

**Задача 1. Безопасные обёртки `saveJson(key, value)` и `loadJson(key, fallback = null)` для `localStorage`**

Напиши две функции-помощника для работы с объектами, массивами и примитивами без потери типов:
1) `saveJson(key, value)` — сериализует `value` через `JSON.stringify` (если результат `undefined`, ничего не записывает и возвращает `false`), сохраняет в `localStorage` внутри `try..catch` (защита от `QuotaExceededError` и циклических ссылок) и возвращает `true` при успехе или `false` при ошибке.
2) `loadJson(key, fallback = null)` — читает строку через `localStorage.getItem(key)`: если вернулся `null`, возвращает `fallback`; иначе парсит через `JSON.parse` в `try..catch` и при битом JSON возвращает `fallback`.

```js
'use strict';

/* Твоё решение: */
```

<details>
<summary>Подсказка и решение</summary>

```js
'use strict';

function saveJson(key, value) {
  /* try..catch страхует сразу от двух ошибок: циклической ссылки в JSON.stringify
     и переполнения лимита хранилища (~5 МБ, QuotaExceededError) в setItem: */
  try {
    const serialized = JSON.stringify(value);
    /* JSON.stringify(undefined) возвращает не строку, а undefined —
       запись его напрямую превратилась бы в строку 'undefined', которую JSON.parse сломает: */
    if (serialized === undefined) return false;

    localStorage.setItem(key, serialized);
    return true;
  } catch {
    return false;
  }
}

function loadJson(key, fallback = null) {
  const raw = localStorage.getItem(key);
  /* Если ключа нет, getItem возвращает null — возвращаем значение по умолчанию без парсинга: */
  if (raw === null) return fallback;

  /* Если пользователь или расширение повредили строку в DevTools, JSON.parse кинет SyntaxError;
     обработка исключения не даст упасть всему приложению: */
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

saveJson('settings', { volume: 80, muted: false });
console.log(loadJson('settings')); /* { volume: 80, muted: false } */
console.log(loadJson('missing', { volume: 50 })); /* { volume: 50 } */
```

</details>

**Задача 2. Утилиты для работы с `document.cookie`: `setCookie`, `getCookie` и `deleteCookie`**

Реализуй три функции:
1) `setCookie(name, value, options = {})` — объединяет `{ path: '/', ...options }`, кодирует `name` и `value` через `encodeURIComponent`, добавляет опции через `; ` (если значение опции равно `true`, например `secure: true`, пишет только имя флага `secure` без `=true`; значения `false`, `null`, `undefined` пропускает) и записывает строку в `document.cookie`.
2) `getCookie(name)` — ищет запись в `document.cookie` по декодированному имени (учитывай, что внутри самого значения куки может встречаться знак `=`, поэтому не теряй хвост значения!) и возвращает декодированное значение или `undefined`.
3) `deleteCookie(name)` — удаляет куку, вызывая `setCookie` с `{ 'max-age': -1 }`.

```js
'use strict';

/* Твоё решение: */
```

<details>
<summary>Подсказка и решение</summary>

```js
'use strict';

function setCookie(name, value, options = {}) {
  /* Без path=/ кука будет видна только на текущем URL-пути, а не на всём сайте: */
  const fullOptions = { path: '/', ...options };
  /* Кодируем имя и значение, чтобы пробелы, ';' и '=' не сломали формат строки cookie: */
  let entry = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

  for (const [optKey, optVal] of Object.entries(fullOptions)) {
    if (optVal === false || optVal === null || optVal === undefined) continue;
    entry += `; ${optKey}`;
    /* Флаговые опции вроде secure или HttpOnly задаются без '=true': */
    if (optVal !== true) {
      entry += `=${optVal}`;
    }
  }

  /* Сеттер document.cookie добавляет или обновляет только эту запись, сохраняя остальные: */
  document.cookie = entry;
}

function getCookie(name) {
  if (!document.cookie) return undefined;

  for (const part of document.cookie.split('; ')) {
    /* Ищем только ПЕРВЫЙ знак '=', чтобы не обрезать '=' внутри самого значения: */
    const eqIndex = part.indexOf('=');
    if (eqIndex === -1) continue;

    const entryName = decodeURIComponent(part.slice(0, eqIndex));
    if (entryName === name) {
      return decodeURIComponent(part.slice(eqIndex + 1));
    }
  }

  return undefined;
}

function deleteCookie(name) {
  /* Отрицательный max-age немедленно удаляет куку с тем же path=/, с которым она была создана: */
  setCookie(name, '', { 'max-age': -1 });
}

setCookie('userName', 'Alex Ivanov', { 'max-age': 3600, samesite: 'Lax' });
console.log(getCookie('userName')); /* 'Alex Ivanov' */
deleteCookie('userName');
console.log(getCookie('userName')); /* undefined */
```

</details>

**Задача 3. Класс `DraftSaver` — автосохранение черновика формы и синхронизация между вкладками**

Напиши класс `DraftSaver`, который привязывается к форме (с полями с атрибутом `name`) и хранит её черновик в `localStorage` по ключу `'feedback-draft'`:
1) В `constructor(formSelector)` найди форму; если не найдена — выйди. Иначе восстанови сохранённый черновик из `localStorage` (если он есть) и повесь обработчики.
2) При событии `'input'` на форме собери значения именованных полей (`this.form.elements`) в объект (игнорируя элементы без `name` и кнопки `submit`/`button`) и сохрани JSON в `localStorage` (внутри `try..catch`).
3) При событии `'submit'` отмени отправку (`preventDefault()`), удали черновик через `removeItem` и сбрось форму (`reset()`).
4) Подпишись на `window` событие `'storage'`: если изменился наш ключ `this.storageKey`, при `event.newValue === null` сбрось форму (`reset()`), иначе примени новое значение черновика, чтобы форма синхронизировалась с другими вкладками.

```html
<!-- Пример разметки:
<form data-js-feedback-form>
  <input name="author" placeholder="Имя" />
  <textarea name="message" placeholder="Сообщение"></textarea>
  <button type="submit">Отправить</button>
</form>
-->
```

```js
'use strict';

class DraftSaver {
  storageKey = 'feedback-draft';

  /* Твоё решение: */
}

new DraftSaver('[data-js-feedback-form]');
```

<details>
<summary>Подсказка и решение</summary>

```js
'use strict';

class DraftSaver {
  storageKey = 'feedback-draft';

  constructor(formSelector) {
    this.form = document.querySelector(formSelector);
    if (!this.form) return;

    /* При загрузке страницы сразу подставляем черновик, если он сохранился с прошлого визита: */
    this.applyDraft(localStorage.getItem(this.storageKey));
    this.bindEvents();
  }

  /* Стрелочные методы привязывают this к экземпляру DraftSaver при передаче в addEventListener: */
  onInput = () => {
    const draft = {};

    /* Перебираем элементы формы через коллекцию elements и пропускаем кнопки / поля без name: */
    for (const field of this.form.elements) {
      if (!field.name || field.type === 'submit' || field.type === 'button') continue;
      draft[field.name] = field.value;
    }

    try {
      localStorage.setItem(this.storageKey, JSON.stringify(draft));
    } catch {
      /* Ошибка квоты или запрета storage в приватном режиме не должна ломать ввод текста */
    }
  };

  onSubmit = (event) => {
    event.preventDefault();
    /* Очищаем ключ после успешной отправки — это вызовет событие 'storage' в соседних вкладках: */
    localStorage.removeItem(this.storageKey);
    this.form.reset();
  };

  onStorage = (event) => {
    /* Игнорируем изменения других ключей в localStorage: */
    if (event.key !== this.storageKey) return;

    /* Если черновик удалили (submit в другой вкладке), сбрасываем поля текущей формы: */
    if (event.newValue === null) {
      this.form.reset();
      return;
    }

    this.applyDraft(event.newValue);
  };

  applyDraft(rawJson) {
    if (!rawJson) return;

    try {
      const draft = JSON.parse(rawJson);
      if (!draft || typeof draft !== 'object') return;

      for (const field of this.form.elements) {
        /* Object.hasOwn защищает от чтения унаследованных свойств вроде toString: */
        if (field.name && Object.hasOwn(draft, field.name)) {
          field.value = String(draft[field.name] ?? '');
        }
      }
    } catch {
      /* Битый JSON в хранилище молча игнорируем */
    }
  }

  bindEvents() {
    this.form.addEventListener('input', this.onInput);
    this.form.addEventListener('submit', this.onSubmit);
    /* Событие 'storage' на window приходит только при изменениях из других вкладок этого домена: */
    window.addEventListener('storage', this.onStorage);
  }
}

new DraftSaver('[data-js-feedback-form]');
```

</details>
