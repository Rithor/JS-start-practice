"use strict"


let habbits = [];
let globalActivHabbit;
const HABBIT_KEY = 'HABBIT_KEY';

// page ------------------------------------------------------------------------------------------------
const page = {
    sidebarNav: document.querySelector('.sidebar__nav'),
    contentHead: {
        title: document.querySelector('.content__name'),
        progresPercent: document.querySelector('.progressBar__percent'),
        progresCoverBar: document.querySelector('.progressBar__coverBar'),
    },
    contentBody: {
        dayDone: document.querySelector('.content__dayDone'),
        newDayName: document.querySelector('.content__newDayName'),
    },
};

// utils ------------------------------------------------------------------------------------------------
function loadData() {
    const habbitsString = localStorage.getItem(HABBIT_KEY);
    // нужна проверка
    const habbitsArr = JSON.parse(habbitsString);
    if (Array.isArray(habbitsArr)) {
        habbits = habbitsArr;
    }
};

function saveData() {
    localStorage.setItem(HABBIT_KEY, JSON.stringify(habbits));
};

function setActive(activeHabbit) {
    document.querySelector('.sidebar__button_active')?.classList.remove('sidebar__button_active');
    document.querySelector(`[habbit-id="${activeHabbit.id}"]`).classList.add('sidebar__button_active');
    renderData(activeHabbit);
};

function renderData(activeHabbit) {
    globalActivHabbit = activeHabbit;
    for (const habbit of habbits) {
        // rednder sideBar
        if (!document.querySelector(`[habbit-id="${habbit.id}"]`)) {
            renderSideBar(habbit);
            // set active habbit
            if (activeHabbit?.id === habbit.id) {
                document.querySelector(`[habbit-id="${habbit.id}"]`).classList.add('sidebar__button_active');
            }
        }
    }
    renderContentHead(activeHabbit);
    renderContentBody(activeHabbit);
};

function calcPercent(activeHabbit) {
    const percent = activeHabbit.days.length / activeHabbit.target > 1
        ? 100
        : activeHabbit.days.length / activeHabbit.target * 100;
    return percent;
};

// work with days ------------------------------------------------------------------------------------------------
function addDay(event) {
    const form = event.target; // ссылка на объект, который был инициатором события

    event.preventDefault(); // предотвращает повидение по умолчанию

    const data = new FormData(form); // создаёт новые объект FormData, если проще - HTML-форму. (form) Существующая HTML-форма, на основе которой будет создана новая. Если ничего не указано, будет создана пустая форма.

    const comment = data.get('comm'); // Возвращает первое значение ассоциированное с переданным ключом из объекта FormData. Тут это значение value поля input с атрибутом name="comm"

    form['comm'].classList.remove('content__input_error'); // form['comm'] тоже самое что querySelector("input[name=comm]") или querySelector(".content__input")

    form.addEventListener('keydown', () => form['comm'].classList.remove('content__input_error'));
    if (!comment) {
        form['comm'].classList.add('content__input_error');
        return;
    };
    habbits.map(habbit => {
        if (habbit.id === globalActivHabbit.id) {
            habbit.days.push({ comment: `${comment}` });
        }
    });
    form['comm'].value = '';
    renderData(globalActivHabbit);
    saveData();
};

function removeDay(index) {
    globalActivHabbit.days.splice(index, 1);
    renderData(globalActivHabbit);
    saveData();
};

// render ------------------------------------------------------------------------------------------------
function renderSideBar(habbit) {
    const sidebarButton = document.createElement('button');
    sidebarButton.setAttribute('habbit-id', habbit.id);
    sidebarButton.classList.add('sidebar__button');
    sidebarButton.innerHTML = `<img src="./imgs/${habbit.icon}.svg" alt="${habbit.icon} icon">`;
    page.sidebarNav.appendChild(sidebarButton);
    sidebarButton.addEventListener('click', () => setActive(habbit));
};

function renderContentHead(activeHabbit) {
    page.contentHead.title.innerText = activeHabbit.name;
    const percent = calcPercent(activeHabbit).toFixed(0);
    page.contentHead.progresPercent.innerText = `${percent}%`;
    page.contentHead.progresCoverBar.style.width = `${percent}%`;
};

function renderContentBody(activeHabbit) {
    page.contentBody.dayDone.innerHTML = '';

    activeHabbit.days.forEach((day, index) => {

        const dayContent = document.createElement('div');
        dayContent.classList.add('content__day');
        dayContent.innerHTML = `<div class="content__dayName">День ${index + 1}</div>
    <div class="content__dayBody">
        <div class="content__dayText">${day.comment}</div>
        <button class="content__dayRemoveIcon">
            <img src="./imgs/delete.svg" alt="delete icon">
        </button>
    </div>`;

        page.contentBody.dayDone.appendChild(dayContent);

        dayContent.querySelector('button').addEventListener('click', () => {
            removeDay(index);
        });
    });
    page.contentBody.newDayName.innerText = `День ${activeHabbit.days.length + 1}`;
};

// init ------------------------------------------------------------------------------------------------
(() => {
    loadData();
    renderData(habbits[0]);
})();

