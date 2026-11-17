# Урок 19. Классы в JavaScript: constructor, get/set, #, static, extends и super

Суть урока: класс — это шаблон (чертёж) для создания однотипных объектов (экземпляров) через new и удобной организации кода (слайдеры, модалки, валидаторы).

## 1. Синтаксис class, constructor, свойства, методы и экземпляры (00:56 – 06:42)

```js
/* Имя класса пишется с ЗАГЛАВНОЙ буквы. Внутри класса запятые между полями/методами НЕ ставят! */
class Student {
  /* 1. Свойства в теле класса (без let/const!): если значение известно заранее для всех: */
  planet = 'Земля';
  region; // Без присвоения будет undefined

  /* 2. constructor — запускается АВТОМАТИЧЕСКИ при каждом вызове new Student(...): */
  constructor(name, age) {
    /* this указывает на конкретный создаваемый экземпляр (firstStudent или secondStudent): */
    this.name = name;
    this.age = age;
  }

  /* 3. Методы класса (пишутся без слова function): */
  logAge() {
    /* Внутри методов к свойствам экземпляра ОБЯЗАТЕЛЬНО обращаемся через this: */
    console.log(this.age); // Просто age даст ошибку: age is not defined!
  }

  /* 4. Потеря this в колбэках (setTimeout/клик): обычный метод потеряет this (undefined!).
     Стрелка в теле класса НАМЕРТВО привязывает this к экземпляру: */
  logAgeBound = () => console.log(this.age);
}

/* Под капотом: typeof Student === 'function'; класс не всплывает (TDZ), без new не вызвать,
   а внутри класса ВСЕГДА автоматически включён строгий режим ('use strict'). */
const firstStudent = new Student('Вася', 20);
const secondStudent = new Student('Петя', 22);
firstStudent.logAge(); // 20  |  secondStudent.name -> 'Петя'
```

## 2. Геттеры/сеттеры (get / set) и приватность: _ против # (06:43 – 13:57)

```js
/* Геттер (get) перехватывает чтение, сеттер (set) — запись, чтобы добавить свою логику.
   Внутри класса данные хранят в приватном поле, а снаружи работают через имя геттера/сеттера.
   - Префикс '_' (_city) — просто старое соглашение ('не трогай снаружи', но доступ открыт).
   - Префикс '#' (#city) — ЖЁСТКАЯ приватность: JS запретит доступ снаружи (выбросит ошибку)! */
class Profile {
  #city = null; // Приватное поле с # ОБЯЗАТЕЛЬНО объявить в теле класса заранее!

  constructor(city) {
    this.city = city;        // Вызовет сеттер set city()
    this.#someSecretAction(); // Вызвать приватный метод # внутри класса — можно
  }

  set city(value) { // Срабатывает при присвоении: profile.city = 'москва'
    const firstLetter = value[0].toUpperCase();
    const restLetters = value.slice(1).toLowerCase();
    this.#city = `${firstLetter}${restLetters}`; // 'Москва'
  }

  get city() {      // Срабатывает при чтении: profile.city (вызывается БЕЗ скобок ()!)
    return `г. ${this.#city}`;
  }

  #someSecretAction() { /* Скрытый внутренний метод */ }
}
const p = new Profile('москва');
p.city; // 'г. Москва'  |  p.#city или p.#someSecretAction() снаружи -> SyntaxError!
/* Важно: #поля и #методы скрыты даже от дочерних классов-наследников (доступ лишь в Profile). */
```

## 3. Статические свойства и методы — static (13:58 – 15:18)

```js
class Helper {
  static country = 'Россия';
  static logInfo() {
    /* Внутри static-метода НЕЛЬЗЯ использовать this экземпляра (this.name/this.age -> ошибка)! */
    console.log('Общий метод класса, без привязки к конкретному экземпляру');
  }
}
/* К static обращаются НАПРЯМУЮ через ИмяКласса, а НЕ через экземпляр (new Helper()): */
Helper.country;   // 'Россия' (static-свойства и методы также наследуются через extends!)
Helper.logInfo(); // Работает  |  (new Helper()).logInfo() -> TypeError (не функция!)
```

## 4. Наследование (extends), переопределение методов и super (15:19 – 21:11)

```js
class Person {
  constructor(name, age) { this.name = name; this.age = age; }
  eat()   { console.log(`${this.name} кушает`); }
  sleep() { console.log(`${this.name} спит`); }
}

/* extends наследует ВСЕ свойства и методы родителя Person (можно строить цепочки A -> B -> C): */
class Developer extends Person {
  /* Если переопределяем constructor у наследника — ПЕРВОЙ строкой ОБЯЗАТЕЛЕН super(...)! */
  constructor(name, age, experience) {
    super(name, age); // Вызывает constructor родителя Person (БЕЗ него this выдаст ошибку!)
    this.experience = experience;
  }

  writeCode() { console.log(`${this.name} пишет код`); } // Новый метод (у Person его нет)
  sleep()     { console.log('Не спит, кодит!'); }         // Полное переопределение sleep()

  eat() { // Расширение родительского метода без копирования его кода:
    super.eat(); // Вызывает eat() из Person
    console.log('...и смотрит уроки по JS');
  }
}
const dev = new Developer('Саша', 28, 5);
dev.eat(); // 'Саша кушает' -> '...и смотрит уроки по JS'
/* Оператор instanceof проверяет, принадлежит ли объект классу (и любому его родителю!): */
dev instanceof Developer; // true  |  dev instanceof Person -> тоже true!
```

## 5. Практика во фронтенде: классы для структуры и запуск без переменной (21:12)

```js
/* Во фронтенде классы используют не только как 'штамповку' объектов, но и для порядка в коде
   (FormValidation, Modals, Gallery — каждый компонент отвечает за свой блок интерфейса): */
class Modals {
  constructor() { /* Автоматически находит модалки и вешает события при старте страницы */ }
  static closeAllModals() { /* Закрывает все открытые модалки */ }
}
new Modals();            // Иногда экземпляр даже не сохраняют в переменную — нужен лишь запуск!
Modals.closeAllModals(); // А вспомогательные действия вызывают напрямую через static-метод
```

## 3 главные ловушки урока (чек-лист для повторения)

1. Забыть super(...) в constructor наследника — в классе с extends нельзя писать this.field до вызова super(...), сразу упадёт ошибка.

2. Путать static с методами экземпляра и забывать # в теле — static вызывают только на ИмяКласса.метод(), а #поле нужно обязательно объявить в классе заранее.

3. Бесконечная рекурсия в сеттере и отсутствие this. — если в set city(v) написать this.city = v вместо this.#city = v, сеттер зациклится; а без this внутри метода свойства не видны.

## Итог: как представлять и зачем нужны (очень кратко)

• Образ: class — чертёж/форма, new Class() — готовый независимый объект с данными и методами.

• Как работает new: 1) создаёт {} со связью методов -> 2) запускает constructor с this -> 3) возвращает объект.

• Зачем нужны: порядок в коде (модули UI), наследование без дублей (extends + super) и защита данных (#, get/set).
