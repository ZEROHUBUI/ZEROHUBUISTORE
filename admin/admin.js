import { db, auth } from "../config.js";
import { 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
    collection, 
    addDoc, 
    getDocs, 
    doc, 
    updateDoc, 
    deleteDoc, 
    query, 
    orderBy 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

let allAdminApps = [];

// 1. Санҷиши Воридшавӣ (Auth Listener)
onAuthStateChanged(auth, (user) => {
    const loginScreen = document.getElementById("login-screen");
    const adminPanel = document.getElementById("admin-panel");

    if (user) {
        loginScreen.style.display = "none";
        adminPanel.style.display = "block";
        loadAdminApps();
    } else {
        loginScreen.style.display = "block";
        adminPanel.style.display = "none";
    }
});

// 2. Логин ба Система
document.getElementById("login-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("admin-email").value;
    const password = document.getElementById("admin-password").value;

    try {
        await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
        alert("Хатогӣ ҳангоми воридшавӣ: " + error.message);
    }
});

// 3. Баромад аз Система (Logout)
document.getElementById("logout-btn")?.addEventListener("click", async () => {
    await signOut(auth);
});

// 4. Гузариш байни Табҳо (Add / Manage)
window.switchTab = function(tabName) {
    const sectionAdd = document.getElementById("section-add");
    const sectionManage = document.getElementById("section-manage");
    const tabAdd = document.getElementById("tab-add");
    const tabManage = document.getElementById("tab-manage");

    if (tabName === 'add') {
        sectionAdd.style.display = "block";
        sectionManage.style.display = "none";
        tabAdd.classList.add("active");
        tabManage.classList.remove("active");
    } else {
        sectionAdd.style.display = "none";
        sectionManage.style.display = "block";
        tabAdd.classList.remove("active");
        tabManage.classList.add("active");
        loadAdminApps();
    }
};

// 5. Иловаи Барномаи Нав (Create)
document.getElementById("app-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const shots = [
        document.getElementById("app-shot-1").value.trim(),
        document.getElementById("app-shot-2").value.trim(),
        document.getElementById("app-shot-3").value.trim(),
        document.getElementById("app-shot-4").value.trim()
    ].filter(url => url !== "");

    const appData = {
        category: document.getElementById("app-category").value,
        title: document.getElementById("app-title").value,
        developer: document.getElementById("app-developer").value,
        icon_url: document.getElementById("app-icon-url").value,
        version: document.getElementById("app-version").value,
        download_url: document.getElementById("app-download-url").value,
        embed_video: document.getElementById("app-embed-video").value,
        screenshots: shots,
        description: document.getElementById("app-description").value,
        views: 0,
        downloads: 0,
        updated_at: new Date().toISOString()
    };

    try {
        await addDoc(collection(db, "apps"), appData);
        alert("Барнома бо муваффақият илова шуд!");
        resetForm();
        switchTab('manage');
    } catch (error) {
        alert("Хатогӣ ҳангоми сабт: " + error.message);
    }
});

// 6. Боргирии Рӯйхат аз Firebase
async function loadAdminApps() {
    const listContainer = document.getElementById("admin-apps-list");
    if (!listContainer) return;
    
    listContainer.innerHTML = "<p style='color:#94a3b8;'>Загрузка...</p>";

    try {
        const q = query(collection(db, "apps"), orderBy("updated_at", "desc"));
        const snapshot = await getDocs(q);
        allAdminApps = [];

        snapshot.forEach(docSnap => {
            allAdminApps.push({ id: docSnap.id, ...docSnap.data() });
        });

        renderAdminList(allAdminApps);
    } catch (error) {
        listContainer.innerHTML = `<p style="color:#ef4444;">Хатогӣ: ${error.message}</p>`;
    }
}

// 7. Рендери Рӯйхат ва Гузариш ба Саҳифаи Идоракунӣ (app.html?id=ID)
function renderAdminList(apps) {
    const listContainer = document.getElementById("admin-apps-list");
    if (!listContainer) return;

    if (apps.length === 0) {
        listContainer.innerHTML = "<p style='color:#94a3b8;'>Ҳеҷ барномае ёфт нашуд.</p>";
        return;
    }

    listContainer.innerHTML = apps.map(app => `
        <div class="glass-card" 
             style="display:flex; justify-style:space-between; align-items:center; margin-bottom:10px; padding:12px; cursor:pointer; transition: transform 0.2s;" 
             onclick="window.location.href='app.html?id=${app.id}'">
            <div style="display:flex; align-items:center; gap:12px;">
                <img src="${app.icon_url || 'https://via.placeholder.com/50'}" style="width:48px; height:48px; border-radius:10px; object-fit:cover;">
                <div>
                    <h4 style="margin:0; color:#fff; font-size:15px;">${app.title} <span style="font-size:11px; color:#3b82f6;">v${app.version}</span></h4>
                    <span style="font-size:12px; color:#94a3b8;">${app.developer || 'ZEROHUB'} | ${app.category.toUpperCase()}</span>
                </div>
            </div>
            <div style="display:flex; gap:18px; align-items:center;">
                <span style="font-size:13px; color:#10b981;"><i class="fa-solid fa-download"></i> ${app.downloads || 0}</span>
                <span style="font-size:13px; color:#3b82f6;"><i class="fa-solid fa-eye"></i> ${app.views || 0}</span>
                <i class="fa-solid fa-chevron-right" style="color:#94a3b8; font-size:14px;"></i>
            </div>
        </div>
    `).join("");
}

// 8. Ҷустуҷӯ дар Админка
window.filterAdminApps = function() {
    const q = document.getElementById("admin-search").value.toLowerCase();
    const filtered = allAdminApps.filter(app => 
        app.title.toLowerCase().includes(q) || 
        app.category.toLowerCase().includes(q) ||
        (app.developer && app.developer.toLowerCase().includes(q))
    );
    renderAdminList(filtered);
};

// 9. Тоза кардани Форма
function resetForm() {
    const form = document.getElementById("app-form");
    if (form) form.reset();
    const appIdInput = document.getElementById("app-id");
    if (appIdInput) appIdInput.value = "";
}
