# Урок 42. Location API, History API и работа с URLSearchParams

Суть урока:

- **`window.location`:** читает части URL и управляет переходами (`reload`, `assign`, `replace`).
- **`window.history`:** листает историю вкладки и меняет URL без перезагрузки страницы (`pushState`, `replaceState`).
- **`URLSearchParams`:** удобно собирает и парсит GET-параметры.

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

## Вопросы для закрепления

**1. В чём разница между `window.location.assign('/login')` и `window.location.replace('/login')` для пользователя? И что попадёт в `window.location.search`, если в адресе случайно написать `https://site.ru/shop#top?page=2`?**

<details>
<summary>Показать ответ</summary>

`assign()` добавляет новую запись в историю вкладки — пользователь сможет вернуться на прежнюю страницу кнопкой «Назад». `replace()` перезаписывает текущую запись — вернуться назад на неё уже не получится (полезно после авторизации или редиректа). Во втором вопросе `window.location.search` окажется **пустой строкой `''`**, потому что по стандарту URL хэш `#` всегда должен идти *после* query-параметров: всё, что написано после первого `#` (`#top?page=2`), браузер считает частью `window.location.hash`.

</details>

**2. После вызова `window.history.pushState({ tab: 'info' }, '', '/product?tab=info')` загрузит ли браузер новый HTML, сработает ли событие `popstate`, и что будет, если передать URL на чужой домен (`https://example.com`)?**

<details>
<summary>Показать ответ</summary>

Браузер **не** перезагрузит страницу и не скачает новый HTML — `pushState` меняет лишь адрес в строке браузера и добавляет запись в историю вкладки (разметку нужно обновить в JS). Событие `popstate` при вызове `pushState` или `replaceState` **не срабатывает** — оно возникает только когда пользователь нажимает «Назад» / «Вперёд» (или код вызывает `history.back()` / `history.forward()` / `history.go()`). Передать чужой `origin` запрещено политикой безопасности — браузер выбросит `SecurityError`.

</details>

**3. Почему обращение к `window.location.searchParams` даёт `undefined`, и в чём главный подвох метода `searchParams.forEach(...)`?**

<details>
<summary>Показать ответ</summary>

У встроенного объекта `window.location` нет свойства `searchParams` — для работы с параметрами нужно либо создать `new URLSearchParams(window.location.search)`, либо обернуть адрес в `new URL(window.location.href)` и читать `url.searchParams`. Подвох `forEach` в том, что первым аргументом в коллбэк передаётся **значение (`value`)**, а вторым — **имя параметра (`name`)**, точно так же, как в `Map` и `FormData`.

</details>

## Задачи

**Задача 1. Обновление query-параметров в произвольном URL с помощью `new URL` и `URLSearchParams`**

Напиши функцию `updateQueryParams(urlString, updates)`:
1) Принимает строку полного URL `urlString` и объект `updates` (например, `{ page: 2, sort: 'price', discount: null, query: '' }`).
2) Создаёт объект `new URL(urlString)`.
3) Перебирает `Object.entries(updates)`: если значение равно `null`, `undefined` или пустой строке `''` — удаляет этот параметр (`delete`), иначе записывает его строковое значение (`set`).
4) Возвращает итоговый URL в виде строки (`url.toString()`), сохранив исходные путь и `#hash`.

```js
'use strict';

/* Твоё решение: */

console.log(
  updateQueryParams('https://shop.test/catalog?page=1&discount=10#list', {
    page: 2,
    sort: 'price',
    discount: null,
    query: '',
  })
);
/* Ожидается: 'https://shop.test/catalog?page=2&sort=price#list' */
```

<details>
<summary>Подсказка и решение</summary>

```js
'use strict';

function updateQueryParams(urlString, updates) {
  /* Конструктор URL сразу разбирает строку на origin, pathname, searchParams и hash,
     поэтому при изменении параметров якорь (#hash) не потеряется и не уедет перед '?': */
  const url = new URL(urlString);

  for (const [key, value] of Object.entries(updates)) {
    /* Пустые фильтры (null, undefined, '') удаляем из URL, чтобы не плодить '?query=': */
    if (value === null || value === undefined || value === '') {
      url.searchParams.delete(key);
    } else {
      /* set перезаписывает существующий ключ или добавляет новый, приводя значение к строке: */
      url.searchParams.set(key, String(value));
    }
  }

  return url.toString();
}

console.log(
  updateQueryParams('https://shop.test/catalog?page=1&discount=10#list', {
    page: 2,
    sort: 'price',
    discount: null,
    query: '',
  })
);
/* 'https://shop.test/catalog?page=2&sort=price#list' */
```

</details>

**Задача 2. Синхронизация формы фильтров с URL (пустые поля, чекбоксы и сторонние параметры вроде `utm_source`)**

Напиши две функции для формы фильтрации с полями `<input name="query">`, `<select name="category">` и `<input type="checkbox" name="inStock">`:
1) `syncFormToUrl(form)` — читает данные через `new FormData(form)`, отбрасывает поля с пустым значением `''`, собирает query-строку через `URLSearchParams` и обновляет адрес через `window.history.replaceState` без перезагрузки страницы (сохраняя `pathname` и `hash`, а если параметров не осталось — не оставляет лишний символ `?`).
2) `restoreFormFromUrl(form)` — сначала сбрасывает форму (`form.reset()`), затем перебирает `new URLSearchParams(window.location.search)` через `forEach`: если в форме нет поля с таким именем (например, `?utm_source=tg`), безопасно пропускает его; для `checkbox` обновляет `.checked`, для остальных полей — `.value`.

```html
<!-- Пример разметки:
<form data-js-filter-form>
  <input name="query" placeholder="Поиск" />
  <select name="category">
    <option value="">Все</option>
    <option value="books">Книги</option>
    <option value="courses">Курсы</option>
  </select>
  <label><input type="checkbox" name="inStock" /> В наличии</label>
</form>
-->
```

```js
'use strict';

const filterForm = document.querySelector('[data-js-filter-form]');

/* Твоё решение: */
```

<details>
<summary>Подсказка и решение</summary>

```js
'use strict';

const filterForm = document.querySelector('[data-js-filter-form]');

function syncFormToUrl(form) {
  const params = new URLSearchParams();

  /* FormData автоматически пропускает снятые чекбоксы и добавляет отмеченные со значением 'on': */
  for (const [name, value] of new FormData(form)) {
    /* Пропускаем пустые текстовые/выпадающие поля, чтобы URL оставался чистым: */
    if (String(value).trim() === '') continue;
    params.append(name, String(value));
  }

  const queryString = params.toString();
  /* Если параметры есть — добавляем '?', если пусто — не оставляем висячий '?' в конце пути;
     также обязательно сохраняем текущий window.location.hash: */
  const nextUrl =
    window.location.pathname +
    (queryString ? `?${queryString}` : '') +
    window.location.hash;

  /* replaceState обновляет URL без создания лишней записи в истории на каждый чих фильтра: */
  window.history.replaceState(window.history.state, '', nextUrl);
}

function restoreFormFromUrl(form) {
  /* Сначала возвращаем форму к исходным значениям (очистит поля, которых больше нет в URL): */
  form.reset();

  const searchParams = new URLSearchParams(window.location.search);

  /* ВНИМАНИЕ: в URLSearchParams.forEach первым идёт value, вторым — name: */
  searchParams.forEach((value, name) => {
    const field = form.elements[name];
    /* Защита от посторонних GET-параметров вроде ?utm_source=... — без проверки будет TypeError: */
    if (!field) return;

    if (field.type === 'checkbox') {
      field.checked = value === 'on' || value === 'true';
    } else {
      field.value = value;
    }
  });
}

if (filterForm) {
  restoreFormFromUrl(filterForm);
  filterForm.addEventListener('change', () => syncFormToUrl(filterForm));
}
```

</details>

**Задача 3. Мини-роутер вкладок через `history.pushState` и событие `popstate`**

Реализуй переключение вкладок с сохранением активной вкладки в URL (`?tab=...`) так, чтобы работали и прямой переход по ссылке, и кнопки браузера «Назад» / «Вперёд»:
1) Напиши функцию `renderActiveTab(tabName)`: если панели с `data-tab-panel` для `tabName` нет, берётся имя первой панели (`'profile'`). У кнопок `[data-tab-btn]` и панелей `[data-tab-panel]` переключается класс `'is-active'`, а функция возвращает реально активированное имя вкладки.
2. При старте страницы прочитай `tab` из `window.location.search`, вызови `renderActiveTab(...)`, синхронизируй параметр `startUrl.searchParams.set('tab', initialTab)` и запиши стартовое состояние через `window.history.replaceState({ tab: initialTab }, '', startUrl.toString())` (чтобы при битом `?tab=` в URL сразу стояла реальная вкладка, а в `event.state` не было `null`).
3) По делегированию на `[data-tabs]` обрабатывай клик по `[data-tab-btn]`: если вкладка изменилась — обнови `?tab=` через `new URL(window.location.href)`, добавь запись через `window.history.pushState({ tab: nextTab }, '', nextUrl.toString())` и вызови `renderActiveTab(nextTab)`.
4) На `window` слушай событие `'popstate'` и синхронизируй вкладку через `renderActiveTab(event.state?.tab ?? new URLSearchParams(window.location.search).get('tab'))`.

```html
<!-- Пример разметки:
<div data-tabs>
  <button type="button" data-tab-btn="profile">Профиль</button>
  <button type="button" data-tab-btn="orders">Заказы</button>
  <button type="button" data-tab-btn="settings">Настройки</button>

  <section data-tab-panel="profile">Контент профиля</section>
  <section data-tab-panel="orders">Список заказов</section>
  <section data-tab-panel="settings">Настройки аккаунта</section>
</div>
-->
```

```js
'use strict';

const tabsRoot = document.querySelector('[data-tabs]');

/* Твоё решение: */
```

<details>
<summary>Подсказка и решение</summary>

```js
'use strict';

const tabsRoot = document.querySelector('[data-tabs]');

if (tabsRoot) {
  const buttons = [...tabsRoot.querySelectorAll('[data-tab-btn]')];
  const panels = [...tabsRoot.querySelectorAll('[data-tab-panel]')];
  const fallbackTab = panels[0]?.dataset.tabPanel ?? 'profile';

  function renderActiveTab(tabName) {
    /* Проверяем, существует ли панель с таким именем — иначе подставляем безопасный fallback: */
    const hasPanel = panels.some((panel) => panel.dataset.tabPanel === tabName);
    const activeTab = hasPanel ? tabName : fallbackTab;

    buttons.forEach((btn) => {
      btn.classList.toggle('is-active', btn.dataset.tabBtn === activeTab);
    });
    panels.forEach((panel) => {
      panel.classList.toggle('is-active', panel.dataset.tabPanel === activeTab);
    });

    return activeTab;
  }

  /* 1. Инициализация при открытии страницы (учитываем переданный ?tab=... в URL): */
  const startUrl = new URL(window.location.href);
  const initialTab = renderActiveTab(startUrl.searchParams.get('tab'));
  /* Синхронизируем ?tab= на случай пустого или битого параметра в URL: */
  startUrl.searchParams.set('tab', initialTab);
  /* Сохраняем state для первой записи истории, чтобы кнопка Назад знала вкладку: */
  window.history.replaceState({ tab: initialTab }, '', startUrl.toString());

  /* 2. Переключение по клику (делегирование на контейнере вкладок): */
  tabsRoot.addEventListener('click', (event) => {
    const button = event.target.closest('[data-tab-btn]');
    if (!button) return;

    const nextTab = button.dataset.tabBtn;
    const currentTab = new URL(window.location.href).searchParams.get('tab') ?? fallbackTab;
    /* Повторный клик по уже открытой вкладке не должен плодить дубли в истории: */
    if (nextTab === currentTab) return;

    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.set('tab', nextTab);

    /* pushState меняет URL и добавляет шаг в историю без перезагрузки страницы: */
    window.history.pushState({ tab: nextTab }, '', nextUrl.toString());
    renderActiveTab(nextTab);
  });

  /* 3. Реакция на кнопки Назад/Вперёд (pushState сам по себе popstate не вызывает): */
  window.addEventListener('popstate', (event) => {
    const tabFromUrl = new URLSearchParams(window.location.search).get('tab');
    renderActiveTab(event.state?.tab ?? tabFromUrl);
  });
}
```

</details>
