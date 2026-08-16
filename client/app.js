import { db } from "../config.js";
import { 
    doc, 
    getDoc, 
    updateDoc, 
    increment 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

let currentLang = 'ru';
let appData = null;
let currentAppId = null;

const langTexts = {
    ru: {
        back: "Назад",
        developer: "Разработчик:",
        version: "Версия:",
        category: "Категория:",
        views: "Просмотры:",
        downloads: "Загрузки:",
        downloadBtn: "Скачать с Telegram",
        trailerTitle: "Видео-трейлер",
        screenshotsTitle: "Скриншоты",
        descTitle: "Описание",
        notFound: "Приложение не найдено!",
        error: "Ошибка при загрузке:"
    },
    en: {
        back: "Back",
        developer: "Developer:",
        version: "Version:",
        category: "Category:",
        views: "Views:",
        downloads: "Downloads:",
        downloadBtn: "Download via Telegram",
        trailerTitle: "Video Trailer",
        screenshotsTitle: "Screenshots",
        descTitle: "Description",
        notFound: "App not found!",
        error: "Error loading data:"
    }
};

document.addEventListener("DOMContentLoaded", () => {
    loadAppDetails();
});

// Ходани ID аз URL ва сабти омори аниқи просмотр (+1)
async function loadAppDetails() {
    const container = document.getElementById("app-details-container");
    const urlParams = new URLSearchParams(window.location.search);
    currentAppId = urlParams.get('id');

    if (!currentAppId) {
        container.innerHTML = `<div class="glass-card"><p style="color: #ef4444;">ID не указан!</p></div>`;
        return;
    }

    try {
        const docRef = doc(db, "apps", currentAppId);

        // 1. Иловаи аниқи просмотр ба Firestore (+1)
        await updateDoc(docRef, {
            views: increment(1)
        }).catch(() => {}); // Агар аввал майдон набошад, хатогӣ намедиҳад

        // 2. Гирифтани маълумоти навсозишуда
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            container.innerHTML = `<div class="glass-card"><p style="color: #ef4444;">${langTexts[currentLang].notFound}</p></div>`;
            return;
        }

        appData = docSnap.data();
        renderDetails();
    } catch (error) {
        container.innerHTML = `<div class="glass-card"><p style="color: #ef4444;">${langTexts[currentLang].error} ${error.message}</p></div>`;
    }
}

// Рендери пурраи маълумоти барнома ва омор
function renderDetails() {
    if (!appData) return;

    const container = document.getElementById("app-details-container");
    const t = langTexts[currentLang];

    // Рендери скриншотҳо
    let screenshotsHTML = "";
    if (appData.screenshots && appData.screenshots.length > 0) {
        const validShots = appData.screenshots.filter(url => url && url.trim() !== "");
        if (validShots.length > 0) {
            screenshotsHTML = `
                <div class="glass-card" style="margin-top: 12px;">
                    <h3 style="font-size: 14px; margin-top: 0; color: #3b82f6;"><i class="fa-solid fa-images"></i> ${t.screenshotsTitle}</h3>
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px;">
                        ${validShots.map(shot => `
                            <img src="${shot}" style="width: 100%; height: 100px; object-fit: cover; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); cursor: pointer;" onclick="window.open('${shot}', '_blank')">
                        `).join("")}
                    </div>
                </div>
            `;
        }
    }

    // Рендери Видео-трейлер
    let trailerHTML = "";
    if (appData.embed_video && appData.embed_video.trim() !== "") {
        trailerHTML = `
            <div class="glass-card" style="margin-top: 12px;">
                <h3 style="font-size: 14px; margin-top: 0; color: #3b82f6;"><i class="fa-solid fa-circle-play"></i> ${t.trailerTitle}</h3>
                <div class="trailer-container" style="margin-bottom: 0;">
                    ${appData.embed_video}
                </div>
            </div>
        `;
    }

    container.innerHTML = `
        <!-- Блоки Асосии Информатсия -->
        <div class="glass-card">
            <h2 style="margin: 0 0 10px 0; font-size: 18px; color: #fff;">${appData.title}</h2>
            
            <div style="font-size: 12px; color: #94a3b8; line-height: 1.8;">
                <p style="margin: 2px 0;">${t.developer} <strong style="color: #f59e0b;">${appData.developer || 'ZEROHUB'}</strong></p>
                <p style="margin: 2px 0;">${t.version} <strong style="color: #fff;">v${appData.version}</strong></p>
                <p style="margin: 2px 0;">${t.category} <strong style="color: #3b82f6;">${appData.category.toUpperCase()}</strong></p>
            </div>

            <!-- БЛОКИ ОМОРИ ДАҚИҚ БАРОИ КОРБАР -->
            <div style="display: flex; gap: 10px; margin-top: 12px; background: rgba(255,255,255,0.03); padding: 8px 12px; border-radius: 8px;">
                <span style="font-size: 12px; color: #3b82f6;"><i class="fa-solid fa-eye"></i> ${t.views} <strong>${(appData.views || 0) + 1}</strong></span>
                <span style="font-size: 12px; color: #10b981; margin-left: auto;"><i class="fa-solid fa-download"></i> ${t.downloads} <strong id="downloads-count-display">${appData.downloads || 0}</strong></span>
            </div>

            <!-- ТУГМАИ ЗЕРКАШИ БО ҲИСОБИ СКАЧИВАНИЕ (+1) -->
            <button onclick="handleDownload('${appData.download_url}')" class="real-btn" style="width: 100%; padding: 12px; margin-top: 14px; background: linear-gradient(145deg, #2563eb, #1d4ed8); font-size: 14px; display: flex; justify-content: center; align-items: center; gap: 8px; cursor: pointer;">
                <i class="fa-paper-plane fa-solid"></i> ${t.downloadBtn}
            </button>
        </div>

        <!-- Трейлер -->
        ${trailerHTML}

        <!-- Скриншотҳо -->
        ${screenshotsHTML}

        <!-- Тавсиф (Описание) -->
        <div class="glass-card" style="margin-top: 12px;">
            <h3 style="font-size: 14px; margin-top: 0; color: #3b82f6;"><i class="fa-solid fa-file-lines"></i> ${t.descTitle}</h3>
            <p style="font-size: 13px; color: #cbd5e1; white-space: pre-line; margin-bottom: 0; line-height: 1.5;">${appData.description}</p>
        </div>
    `;
}

// Ҳисоби аниқи зеркашиҳо (+1) ҳангоми пахши тугма
window.handleDownload = async function(downloadUrl) {
    if (currentAppId) {
        try {
            const docRef = doc(db, "apps", currentAppId);
            await updateDoc(docRef, {
                downloads: increment(1)
            });
            
            // Навсозии визуалии рақами зеркашиҳо
            const countDisplay = document.getElementById("downloads-count-display");
            if (countDisplay) {
                countDisplay.innerText = parseInt(countDisplay.innerText || 0) + 1;
            }
        } catch (err) {
            console.error("Хатогии ҳисоби омор:", err);
        }
    }
    
    // Гузариш ба линки Telegram
    window.open(downloadUrl, '_blank');
};

// Ивази забон дар саҳифаи муфассал
window.toggleAppLanguage = function() {
    currentLang = currentLang === 'ru' ? 'en' : 'ru';
    document.getElementById("lang-btn-app").innerText = currentLang === 'ru' ? 'EN' : 'RU';
    document.getElementById("back-txt").innerText = langTexts[currentLang].back;
    renderDetails();
};
