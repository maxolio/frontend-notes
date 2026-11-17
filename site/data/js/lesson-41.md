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
