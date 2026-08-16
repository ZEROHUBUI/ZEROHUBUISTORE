import { db, auth } from "../config.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { doc, getDoc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Гирифтани ID-и барнома аз URL (масалан: app.html?id=XYZ)
const urlParams = new URLSearchParams(window.location.search);
const appId = urlParams.get('id');

if (!appId) {
    window.location.href = "admin.html";
}

// Санҷиши воридшавӣ
onAuthStateChanged(auth, async (user) => {
    if (!user) {
        window.location.href = "admin.html";
    } else {
        loadAppDetails();
    }
});

// Боргирии маълумоти барнома ва омор
async function loadAppDetails() {
    try {
        const docRef = doc(db, "apps", appId);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            alert("Барнома ёфт нашуд!");
            window.location.href = "admin.html";
            return;
        }

        const app = docSnap.data();

        // Намоиши сарлавҳа ва омори дақиқ
        document.getElementById("app-header-title").innerText = app.title;
        document.getElementById("stat-views").innerText = app.views || 0;
        document.getElementById("stat-downloads").innerText = app.downloads || 0;

        // Пур кардани форма барои таҳрир
        document.getElementById("edit-category").value = app.category;
        document.getElementById("edit-title").value = app.title;
        document.getElementById("edit-developer").value = app.developer || "";
        document.getElementById("edit-icon-url").value = app.icon_url || "";
        document.getElementById("edit-version").value = app.version;
        document.getElementById("edit-download-url").value = app.download_url;
        document.getElementById("edit-embed-video").value = app.embed_video || "";

        const shots = app.screenshots || [];
        document.getElementById("edit-shot-1").value = shots[0] || "";
        document.getElementById("edit-shot-2").value = shots[1] || "";
        document.getElementById("edit-shot-3").value = shots[2] || "";
        document.getElementById("edit-shot-4").value = shots[3] || "";

        document.getElementById("edit-description").value = app.description;

    } catch (error) {
        alert("Хатогӣ ҳангоми боргирӣ: " + error.message);
    }
}

// Сабти тағйирот ва версияи нав
document.getElementById("edit-app-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const shots = [
        document.getElementById("edit-shot-1").value.trim(),
        document.getElementById("edit-shot-2").value.trim(),
        document.getElementById("edit-shot-3").value.trim(),
        document.getElementById("edit-shot-4").value.trim()
    ].filter(url => url !== "");

    const updatedData = {
        category: document.getElementById("edit-category").value,
        title: document.getElementById("edit-title").value,
        developer: document.getElementById("edit-developer").value,
        icon_url: document.getElementById("edit-icon-url").value,
        version: document.getElementById("edit-version").value,
        download_url: document.getElementById("edit-download-url").value,
        embed_video: document.getElementById("edit-embed-video").value,
        screenshots: shots,
        description: document.getElementById("edit-description").value,
        updated_at: new Date().toISOString()
    };

    try {
        await updateDoc(doc(db, "apps", appId), updatedData);
        alert("Барнома ва версияи он бо муваффақият навсозӣ шуд!");
        location.reload();
    } catch (error) {
        alert("Хатогӣ ҳангоми навсозӣ: " + error.message);
    }
});

// Нест кардани барнома
document.getElementById("delete-app-btn").addEventListener("click", async () => {
    if (confirm("Оё боварӣ доред, ки ин барномаро нест кардан мехоҳед?")) {
        try {
            await deleteDoc(doc(db, "apps", appId));
            alert("Барнома нест карда шуд.");
            window.location.href = "admin.html";
        } catch (error) {
            alert("Хатогӣ ҳангоми несткунӣ: " + error.message);
        }
    }
});
