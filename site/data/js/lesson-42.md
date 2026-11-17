# Урок 42. Location API, History API и работа с URLSearchParams

Суть урока: window.location читает части URL и управляет переходами (reload, assign, replace), window.history листает историю вкладки и меняет URL без перезагрузки страницы (pushState, replaceState), а класс URLSearchParams удобно собирает и парсит GET-параметры.

## 1. window.location: структура URL и методы перехода (00:28–08:02)

[+] Свойство window.location содержит разобранный текущий URL: protocol, hostname/host, origin (протокол + хост), pathname (путь), search (с ?), hash (с # — идёт после search) и полный href. Для переходов есть методы reload, assign и replace.

```js
/* Пример URL: https://site.ru/catalog?page=2#top */
console.log(window.location.origin);   /* "https://site.ru" */
console.log(window.location.pathname); /* "/catalog" */
console.log(window.location.search);   /* "?page=2" */
console.log(window.location.hash);     /* "#top" */

/* Методы навигации: */
/* window.location.reload();              -> перезагрузка страницы */
/* window.location.assign('/catalog.html'); -> переход С записью в историю */
/* window.location.replace('/catalog.html'); -> переход БЕЗ записи (кнопка Назад обойдёт) */

/* Сеттер window.location.href = url: по клику работает как assign(), */
/* а при автоматическом редиректе сразу на старте — как replace()! */

/* У window.location нет .searchParams, но есть встроенный конструктор new URL(...): */
const urlObj = new URL(window.location.href); /* уже содержит urlObj.searchParams! */
```

## 2. window.history: back/forward/go и pushState / replaceState (08:03–15:52)

[+] window.history управляет историей текущей вкладки (её длина — history.length). На методах pushState и replaceState работают SPA-роутеры вроде React Router: они меняют URL в адресной строке без перезагрузки страницы (новый HTML сам по себе не грузится).

```js
/* Навигация по уже существующей истории вкладки: */
window.history.back();    /* на 1 шаг назад (как стрелка браузера) */
window.history.forward(); /* на 1 шаг вперёд */
window.history.go(-2);    /* прыгнуть на N шагов назад (-) или вперёд (+) */

/* Смена URL без перезагрузки (2-й аргумент title игнорируется — передаём ""): */
window.history.pushState({ from: 'home' }, '', '/catalog.html'); /* +1 запись в историю */
window.history.replaceState({}, '', '/catalog.html'); /* заменяет текущую запись */
/* Новый url обязан быть на том же origin (иначе SecurityError)! В SPA при F5 сервер */
/* должен отдавать index.html на любой путь (иначе будет 404). */

/* pushState/replaceState НЕ запускают popstate — оно ловит кнопки Назад/Вперёд: */
window.addEventListener('popstate', (e) => { /* в e.state лежит 1-й аргумент */ });
```

## 3. Синхронизация формы с URL через URLSearchParams (15:53–23:39)

[+] Вместо ручной склейки строк через split/join используют класс URLSearchParams: он превращает объект с полями в query-строку и удобно разбирает window.location.search обратно. Также у него есть методы get, set, has, append, delete и sort.

```js
/* 1) Запись фильтров в URL без перезагрузки (при change на форме): */
filterFormElement.addEventListener('change', () => {
  const formData = new FormData(filterFormElement);
  const formDataObject = Object.fromEntries(formData);
  const paramsString = new URLSearchParams(formDataObject).toString();

  window.history.replaceState({}, "", `${window.location.pathname}?${paramsString}`);
});

/* 2) Восстановление фильтров из URL при загрузке страницы: */
const setFilterFromUrl = () => {
  const searchParams = new URLSearchParams(window.location.search);
  /* ВНИМАНИЕ: в forEach у URLSearchParams 1-й аргумент value, 2-й — name! */
  searchParams.forEach((value, name) => {
    /* Проверка защитит от лишних меток в URL вроде ?utm_source=... (иначе TypeError!): */
    const field = filterFormElement.elements[name];
    if (field) field.value = value; /* а для checkbox нужно менять .checked */
  });
};
setFilterFromUrl();
```

## 3 главные ловушки урока (чек-лист для повторения)

1. Вызвать location.replace(url) (или авто-редирект через location.href при загрузке) и удивляться, почему кнопка «Назад» перепрыгивает текущую страницу.

2. Ждать, что history.pushState(..., "/page") загрузит и покажет новый HTML — метод меняет только URL и историю; контент страницы при этом нужно обновлять в JS.

3. Перепутать порядок аргументов в searchParams.forEach((value, name) => ...) — как и в Map / FormData, первым параметром всегда идёт значение (value), а вторым имя (name).
