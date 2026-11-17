# Урок 11. Объекты (Часть 2): ссылки, копирование, ?. и деструктуризация

Суть урока: Объекты хранятся по ссылке (даже {} === {} даёт false); поверхностно их копируют и объединяют через { ...obj } или Object.assign, от падения на вложенных свойствах спасает ?. + ??, а поля извлекают деструктуризацией с ...rest в конце.

## 1. Ссылочный тип и рекурсивное сравнение объектов (00:24–08:50)

[!] Переменная хранит не сам объект, а ссылку на место в памяти. Сравнение {} === {} всегда false, а const b = a копирует лишь ссылку. Чтобы сравнить содержимое вглубь, проверяют число ключей (Object.keys) и рекурсивно обходят вложенные объекты.

```js
console.log({} === {}); /* false — два разных участка памяти */
const obj1 = { name: "Alex" }; const obj2 = obj1; /* одна ссылка! */

const areObjectsEqual = (object1, object2) => {
  const keys1 = Object.keys(object1);
  const keys2 = Object.keys(object2);
  if (keys1.length !== keys2.length) return false;

  for (const key in object1) {
    const value1 = object1[key];
    const value2 = object2[key];
    const areObjects = value1 !== null && value2 !== null
      && typeof value1 === 'object' && typeof value2 === 'object';
    if (areObjects) {
      if (!areObjectsEqual(value1, value2)) return false; /* не прерывать на 1-м true! */
      continue;
    }
    if (value1 !== value2) return false;
  }
  return true;
};
```

## 2. Копирование, объединение и опциональная цепочка ?. (08:51–19:05)

[+] Поверхностную копию и слияние делают через Object.assign({}, ...) или спред { ...obj1, ...obj2 } (одинаковые поля перезапишет последний). Вложенные объекты при этом НЕ клонируются! Оператор ?. в связке с ?? защищает от падения на undefined/null.

```js
const a = { name: 'Alex', addr: { city: 'Москва' } };
const b = { age: 28 };
const copy = { ...a };                  /* поверхностная копия (addr общий по ссылке!) */
const merged = Object.assign({}, a, b); /* или { ...a, ...b }; дубли затрёт правый */
const deepCopy = structuredClone(a);    /* нативное ГЛУБОКОЕ клонирование (без функций) */

/* Безопасное чтение вложенных данных (например, пришедших с сервера): */
const dateTo = guest.orderInfo?.stayDates?.to ?? 'Не указана'; /* вместо TypeError */
```

## 3. Деструктуризация, переименование, дефолт и ...rest (19:06–29:10)

[+] Деструктуризация извлекает нужные свойства в переменные (удобно и в параметрах функции, когда аргументов больше 2–3). Если нужно переименование И значение по умолчанию — сначала : новоеИмя, потом = дефолт. Остаточный ...rest всегда последний!

```js
const user = { name: 'Alex', age: 28, company: 'VK', role: 'Front' };

/* Переименование (name -> userName), дефолт для city и сбор остатка в ...otherInfo: */
const { name: userName, city: userCity = 'Не указано', ...otherInfo } = user;
/* otherInfo === { company: "VK", role: "Front" }; ...rest ОБЯЗАН быть последним! */

/* Деструктуризация в параметрах (= {} защитит от вызова без аргумента) и вложенная: */
/* const { addr: { city } = {} } = a; -> достанет city, а переменная addr не создастся */
const logAddress = ({ city, street, house = 1 } = {}) => console.log(city, street, house);
logAddress({ street: 'Пушкина', city: 'Москва', house: 10 });
```

## 3 главные ловушки урока (чек-лист для повторения)

1. Написать const copy = obj и менять свойства в copy — так вы скопировали ссылку, и исходный obj тоже изменится.

2. Ждать от { ...obj } или Object.assign({}, obj) глубокого копирования — вложенные объекты и массивы остаются общими ссылками.

3. Перепутать порядок в { city: userCity = "Нет" } (сначала двоеточие, затем =) или поставить ...rest не в самый конец (ошибка Rest element must be last element).
