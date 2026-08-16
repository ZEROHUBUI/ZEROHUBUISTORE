// Импорти модулҳои лозима аз SDK-и Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Конфигуратсияи лоиҳаи ту
const firebaseConfig = {
  apiKey: "AIzaSyDsCIxiDutd5lE3mqZK86qp9QQZvMvKBgw",
  authDomain: "zerohubuistore.firebaseapp.com",
  projectId: "zerohubuistore",
  storageBucket: "zerohubuistore.firebasestorage.app",
  messagingSenderId: "277157047885",
  appId: "1:277157047885:web:16fe90b2b7c38d8524b604",
  measurementId: "G-21HBDFMTJD"
};

// Инициализатсияи Firebase, Firestore ва Auth
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
