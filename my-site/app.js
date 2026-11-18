'use strict';

/* Находим два пустых контейнера в index.html: для кнопок меню и для текста урока */
const menuEl = document.getElementById('menu');
const contentEl = document.getElementById('content');

/* Состояние (state) нашего приложения: список уроков и id открытого сейчас урока */
const state = {
  lessons: [],
  activeId: null,
};

/* Рисует кнопки меню прямо из массива state.lessons */
function renderMenu() {
  menuEl.innerHTML = '';

  for (const lesson of state.lessons) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = lesson.title;

    if (lesson.id === state.activeId) {
      btn.classList.add('active');
    }

    btn.addEventListener('click', () => {
      openLesson(lesson);
    });

    menuEl.append(btn);
  }
}

/* Загружает и показывает выбранный урок */
async function openLesson(lesson) {
  state.activeId = lesson.id;

  /* 1. Записываем id урока в адресную строку (#lesson-02), если там ещё другой адрес.
        Браузер сам сохранит этот переход в историю для кнопок «Назад / Вперёд». */
  const nextHash = `#${lesson.id}`;
  if (window.location.hash !== nextHash) {
    window.location.hash = nextHash;
  }

  renderMenu();

  /* 2. Скачиваем нужный .md-файл и выводим его HTML на экран */
  const response = await fetch(lesson.file);
  const markdown = await response.text();
  contentEl.innerHTML = marked.parse(markdown);
}

/* Реакция на кнопки «Назад / Вперёд» в браузере (или ручную смену #хэша в URL) */
window.addEventListener('hashchange', () => {
  /* slice(1) отрезает первый символ '#' -> из '#lesson-02' получаем 'lesson-02' */
  const hashId = window.location.hash.slice(1);
  const lesson = state.lessons.find((item) => item.id === hashId);

  /* Открываем урок, только если он найден и ещё не открыт прямо сейчас */
  if (lesson && lesson.id !== state.activeId) {
    openLesson(lesson);
  }
});

/* Точка старта при открытии сайта */
async function init() {
  const response = await fetch('lessons.json');
  state.lessons = await response.json();

  /* Проверяем, есть ли в URL хэш (#lesson-02) при первом открытии или после F5;
     если хэша нет или урок не найден — берём самый первый урок из массива */
  const hashId = window.location.hash.slice(1);
  const startLesson = state.lessons.find((item) => item.id === hashId) || state.lessons[0];

  if (startLesson) {
    openLesson(startLesson);
  }
}

init();
