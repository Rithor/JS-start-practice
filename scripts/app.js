"use strict"


let habbits = [];
let globalActivHabbit;
const HABBIT_KEY = 'HABBIT_KEY';
const HABBIT_KEY_EX = 'HABBIT_KEY_EX';

// page ------------------------------------------------------------------------------------------------
const page = {
    sidebarMenu: document.querySelector('.sidebar__menu'),
    contentHead: {
        title: document.querySelector('.content__name'),
        progresPercent: document.querySelector('.progressBar__percent'),
        progresCoverBar: document.querySelector('.progressBar__coverBar'),
    },
    contentBody: {
        dayDone: document.querySelector('.content__dayDone'),
        newDayName: document.querySelector('.content__newDayName'),
        newDayComm: document.querySelector('.content__input'),
        removeDayBtn: document.querySelector('.removeHabbitBtn'),
    },
    popUp: {
        nameInput: document.querySelector('.popUp__name'),
        targetInput: document.querySelector('.popUp__target'),
    },
};

// utils ------------------------------------------------------------------------------------------------
function loadData() {
    const habbitsString = localStorage.getItem(HABBIT_KEY);
    // нужна проверка
    const habbitsArr = JSON.parse(habbitsString);
    if (habbitsArr.length === 0) {
        return false;
    }
    if (Array.isArray(habbitsArr)) {
        habbits = habbitsArr;
    }
    return true;
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
    if (!activeHabbit) {
        showExPage();
        return;
    }

    document.location.replace(document.location.pathname + '#' + activeHabbit.id);
    globalActivHabbit = activeHabbit;
    renderSideBar(activeHabbit);
    renderContentHead(activeHabbit);
    renderContentBody(activeHabbit);
};

function initRenderData() {
    const hashId = +document.location.hash.replace('#', '');
    const hashHabbit = habbits.find(habbit => habbit.id === hashId);
    if (hashId && hashHabbit) {
        renderData(hashHabbit);
    } else {
        renderData(habbits[0]);
    }
};

function calcPercent(activeHabbit) {
    const percent = activeHabbit.days.length / activeHabbit.target > 1
        ? 100
        : activeHabbit.days.length / activeHabbit.target * 100;
    return percent;
};

function togglePopUp() {
    page.popUp.nameInput.value = '';
    page.popUp.targetInput.value = '';
    document.querySelector('.popUp').classList.toggle('popUp_hidden');
};

function validateAndGetFormData(form, fields) {
    const formData = new FormData(form);
    const res = {};
    for (const field of fields) {
        form.addEventListener('keydown', () => form[field].classList.remove('input_error'));
        const fieldValue = formData.get(field);
        form[field].classList.remove('input_error');
        if (!fieldValue) {
            form[field].classList.add('input_error');
        }
        res[field] = fieldValue;
    }

    let isValid = true;
    for (const field of fields) {
        if (!res[field]) {
            isValid = false;
        }
    }
    if (!isValid) {
        return;
    }
    return res;
};

function resetForm(form, fields) {
    for (const field of fields) {
        form[field].value = '';
    }
};

// work with days ------------------------------------------------------------------------------------------------
function addDay(event) {
    event.preventDefault();

    const data = validateAndGetFormData(event.target, ['comm']);
    if (!data) {
        return;
    }

    habbits.map(habbit => {
        if (habbit.id === globalActivHabbit.id) {
            habbit.days.push({ comment: data.comm });
        }
    });

    resetForm(event.target, ['comm']);
    renderData(globalActivHabbit);
    saveData();
};

function removeDay(index) {
    globalActivHabbit.days.splice(index, 1);
    renderData(globalActivHabbit);
    saveData();
};

// work with habbits ------------------------------------------------------------------------------------------------
function setIcon(context, icon) {
    document.querySelector('.setIcon').value = icon;
    document.querySelector('.popUp__icon.popUp__icon_active').classList.remove('popUp__icon_active');
    context.classList.add('popUp__icon_active');
};

function addHabbit(event) {
    event.preventDefault();

    const data = validateAndGetFormData(event.target, ['name', 'icon', 'target']);
    if (!data) {
        return;
    }

    habbits.push(getNewHabbit(data));
    resetForm(event.target, ['name', 'target']);
    saveData();
    renderData(habbits[habbits.length - 1]);
    page.contentBody.removeDayBtn.style.display = "block";
    togglePopUp();
};

function getNewHabbit(data) {
    const newHabbit = {
        id: (habbits.reduce((maxId, habbit) => {
            if (maxId < habbit.id) {
                maxId = habbit.id
            }
            return maxId;
        }, 0)) + 1,
        icon: data.icon,
        name: data.name,
        target: data.target,
        days: [],
    };
    return newHabbit;
};

function removeHabbit() {
    for (const index in habbits) {
        if (habbits[index].id === globalActivHabbit.id) {
            habbits.splice(index, 1);
        };
    };
    saveData();
    page.sidebarMenu.innerHTML = '';
    renderData(habbits[habbits.length - 1]);
};

// render ------------------------------------------------------------------------------------------------
function renderSideBarItem(habbit) {
    const sidebarButton = document.createElement('button');
    sidebarButton.setAttribute('habbit-id', habbit.id);
    sidebarButton.classList.add('sidebar__button');
    sidebarButton.innerHTML = `<img src="./imgs/${habbit.icon}.svg" alt="${habbit.icon} icon">`;
    page.sidebarMenu.appendChild(sidebarButton);
    sidebarButton.addEventListener('click', () => setActive(habbit));
};

function renderSideBar(activeHabbit) {
    for (const habbit of habbits) {
        document.querySelector(`[habbit-id="${habbit.id}"]`)?.classList.remove('sidebar__button_active');
        if (!document.querySelector(`[habbit-id="${habbit.id}"]`)) {
            renderSideBarItem(habbit);
        }
        // set active habbit
        if (activeHabbit?.id === habbit.id) {
            document.querySelector(`[habbit-id="${habbit.id}"]`).classList.add('sidebar__button_active');
        }
    }
};

function renderContentHead(activeHabbit) {
    page.contentHead.title.innerText = activeHabbit.name;
    const percent = calcPercent(activeHabbit).toFixed(0);
    page.contentHead.progresPercent.innerText = `${percent}%`;
    page.contentHead.progresCoverBar.style.width = `${percent}%`;
};

function renderContentBody(activeHabbit) {
    page.contentBody.dayDone.innerHTML = '';
    page.contentBody.newDayComm.value = '';

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

function showExPage() {
    // нужна проверка
    const habbitsArr = JSON.parse(localStorage.getItem(HABBIT_KEY_EX));
    if (habbitsArr.length === 0) {
        return false;
    }
    if (Array.isArray(habbitsArr)) {
        habbits = habbitsArr;
    }
    renderData(habbits[0]);
    page.contentBody.removeDayBtn.style.display = 'none';
};

// init ------------------------------------------------------------------------------------------------
(() => {
    loadData();
    initRenderData();
})();