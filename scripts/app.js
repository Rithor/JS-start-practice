"use strict"


let habbits = [];
const HABBIT_KEY = 'HABBIT_KEY';

// page ------------------------------------------------------------------------------------------------
const page = {
    sidebarNav: document.querySelector('.sidebar__nav'),
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
};

function renderData(activeHabbit) {
    for (const habbit of habbits) {
        if (!document.querySelector(`[habbit-id="${habbit.id}"]`)) {
            renderSideBar(habbit);
            // set  active habbit
            if (activeHabbit?.id === habbit.id) {
                document.querySelector(`[habbit-id="${habbit.id}"]`).classList.add('sidebar__button_active');
            }
        }
    }
};

// render ------------------------------------------------------------------------------------------------
function renderSideBar(habbit) {
    const sidebarButton = document.createElement('button');
    sidebarButton.setAttribute('habbit-id', habbit.id);
    sidebarButton.classList.add('sidebar__button');
    sidebarButton.innerHTML = `<img src="./imgs/${habbit.icon}.svg" alt="${habbit.icon} icon">`;
    page.sidebarNav.appendChild(sidebarButton);
    sidebarButton.addEventListener('click', () => setActive(habbit));
}

// init ------------------------------------------------------------------------------------------------
(() => {
    loadData();
    renderData(habbits[0]);
})();

