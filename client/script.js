import { db } from "../config.js";
import { collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

let allApps = [];
let currentCategory = 'all';
let currentLang = 'ru';

const langTexts = {
    ru: { search: "Поиск приложения или разработчика...", main: "Главный", soft: "Софт", games: "Игры", moding: "Модинг", dev: "Разработчик:" },
    en: { search: "Search app or developer...", main: "Home", soft: "Apps", games: "Games", moding: "Modding", dev: "Developer:" }
};

document.addEventListener("DOMContentLoaded", () => {
    loadApps();
});

async function loadApps() {
    try {
        const q = query(collection(db, "apps"), orderBy("updated_at", "desc"));
        const snapshot = await getDocs(q);
        allApps = [];
        snapshot.forEach(docSnap => allApps.push({ id: docSnap.id, ...docSnap.data() }));

        renderUI();
    } catch (e) {
        console.error(e);
    }
}

function renderUI() {
    const filtered = currentCategory === 'all' 
        ? allApps 
        : allApps.filter(a => a.category === currentCategory);

    // Нишон додани трейлер танҳо дар саҳифаи Главный
    const trailerBox = document.getElementById("hero-trailer-box");
    if (currentCategory === 'all' && allApps.length > 0 && allApps[0].embed_video) {
        trailerBox.style.display = "block";
        document.getElementById("trailer-iframe-wrapper").innerHTML = allApps[0].embed_video;
    } else {
        trailerBox.style.display = "none";
    }

    // Рендери барномаҳо
    const grid = document.getElementById("apps-grid");
    const t = langTexts[currentLang];

    grid.innerHTML = filtered.map(app => `
        <div class="app-card glass-card" onclick="location.href='app.html?id=${app.id}'">
            <img src="${(app.screenshots && app.screenshots[0]) || 'https://via.placeholder.com/150'}" class="app-icon-img">
            <div class="app-title-bold">${app.title}</div>
            <div style="font-size: 11px; color: #94a3b8;">${t.dev} <span style="color: #f59e0b;">${app.developer || 'ZEROHUB'}</span></div>
        </div>
    `).join("");
}

window.filterUserApps = function() {
    const q = document.getElementById("user-search").value.toLowerCase();
    const filtered = allApps.filter(a => 
        (currentCategory === 'all' || a.category === currentCategory) &&
        (a.title.toLowerCase().includes(q) || (a.developer && a.developer.toLowerCase().includes(q)))
    );
    
    document.getElementById("apps-grid").innerHTML = filtered.map(app => `
        <div class="app-card glass-card" onclick="location.href='app.html?id=${app.id}'">
            <img src="${(app.screenshots && app.screenshots[0]) || 'https://via.placeholder.com/150'}" class="app-icon-img">
            <div class="app-title-bold">${app.title}</div>
        </div>
    `).join("");
};

window.switchCategory = function(cat, btn) {
    currentCategory = cat;
    document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    // Иваз кардани ранги фон мувофиқи бахш
    document.body.className = `theme-${cat}`;
    renderUI();
};

window.toggleLanguage = function() {
    currentLang = currentLang === 'ru' ? 'en' : 'ru';
    document.getElementById("lang-btn").innerText = currentLang === 'ru' ? 'EN' : 'RU';
    document.getElementById("user-search").placeholder = langTexts[currentLang].search;
    renderUI();
};
