
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBx7qN27P9wFxgbjN7DsReHxkN_4CKxxVs",
    authDomain: "student-learning-portal-5cc54.firebaseapp.com",
    projectId: "student-learning-portal-5cc54",
    storageBucket: "student-learning-portal-5cc54.firebasestorage.app",
    messagingSenderId: "503978609640",
    appId: "1:503978609640:web:2de606b494d8b7e91cb25d",
    measurementId: "G-NBR7X3J0ZD"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export { app };