import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBx7qN27P9wFxgbjN7DsReHxkN_4CKxxVs",
  authDomain: "student-learning-portal-5cc54.firebaseapp.com",
  projectId: "student-learning-portal-5cc54",
  storageBucket: "student-learning-portal-5cc54.firebasestorage.app",
  messagingSenderId: "503978609640",
  appId: "1:503978609640:web:2de606b494d8b7e91cb25d",
  measurementId: "G-NBR7X3J0ZD",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// The persistent cache keeps a change that has not reached the server yet
// (offline, or the page moved on too quickly) and sends it on the next visit.
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
});
