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
    renderSideBar(activeHabbit);
    renderContentHead(activeHabbit);
    renderContentBody(activeHabbit);
};

function calcPercent(activeHabbit) {
    const percent = activeHabbit.days.length / activeHabbit.target > 1
        ? 100
        : activeHabbit.days.length / activeHabbit.target * 100;
    return percent;
};

function togglePopUp() {
    checkPopUpInput()
    document.querySelector('.popUp').classList.toggle('popUp_hidden');
};

function validateAndGetFormData(form, fields) {
    const formData = new FormData(form);
    const res = {};
    for (const field of fields) {
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
}

// work with days ------------------------------------------------------------------------------------------------
function addDay(event) {
    event.preventDefault();

    const form = event.target;
    const data = new FormData(form);
    const comment = data.get('comm');
    form['comm'].classList.remove('input_error');
    form.addEventListener('keydown', () => form['comm'].classList.remove('input_error'));
    if (!comment) {
        form['comm'].classList.add('input_error');
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

// work with habbits ------------------------------------------------------------------------------------------------
function setIcon(context, icon) {
    document.querySelector('.setIcon').value = icon;
    document.querySelector('.popUp__icon.popUp__icon_active').classList.remove('popUp__icon_active');
    context.classList.add('popUp__icon_active');
};

function addHabbit(event) {
    event.preventDefault();

    const data = new FormData(event.target);
    const name = data.get('name');
    const target = data.get('target');

    checkPopUpInput(name, target);
    if (!validPopUpInput(name, target)) {
        return;
    };

    habbits.push(getNewHabbit(data));
    saveData();
    renderData(habbits[habbits.length - 1]);
    togglePopUp();
};

function checkPopUpInput(nameValue, targetValue) {
    page.popUp.nameInput.value = nameValue ? nameValue : '';
    page.popUp.targetInput.value = targetValue ? targetValue : '';
    page.popUp.nameInput.classList.remove('input_error');
    page.popUp.targetInput.classList.remove('input_error');
};

function validPopUpInput(nameValue, targetValue) {
    page.popUp.nameInput.addEventListener('keydown', checkPopUpInput(nameValue, targetValue));
    if (!nameValue) {
        page.popUp.nameInput.classList.add('input_error');
        return false;
    };
    if (!targetValue) {
        page.popUp.targetInput.classList.add('input_error');
        return false;
    };
    return true;
};

function getNewHabbit(data) {
    const newHabbit = {
        id: (habbits.reduce((maxId, habbit) => {
            if (maxId < habbit.id) {
                maxId = habbit.id
            }
            return maxId;
        }, 0)) + 1,
        icon: data.get('icon'),
        name: data.get('name'),
        target: data.get('target'),
        days: [],
    };
    console.log(newHabbit.id);
    return newHabbit;
};

function removeHabbit(event) {
    for (const index in habbits) {
        if (habbits[index].id === globalActivHabbit.id) {
            habbits.splice(index, 1);
        };
    };
    saveData();
    page.sidebarNav.innerHTML = '';
    renderData(habbits[0]);
};

// render ------------------------------------------------------------------------------------------------
function renderSideBarItem(habbit) {
    const sidebarButton = document.createElement('button');
    sidebarButton.setAttribute('habbit-id', habbit.id);
    sidebarButton.classList.add('sidebar__button');
    sidebarButton.innerHTML = `<img src="./imgs/${habbit.icon}.svg" alt="${habbit.icon} icon">`;
    page.sidebarNav.appendChild(sidebarButton);
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

