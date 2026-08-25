// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBx7qN27P9wFxgbjN7DsReHxkN_4CKxxVs",
  authDomain: "student-learning-portal-5cc54.firebaseapp.com",
  projectId: "student-learning-portal-5cc54",
  storageBucket: "student-learning-portal-5cc54.firebasestorage.app",
  messagingSenderId: "503978609640",
  appId: "1:503978609640:web:2de606b494d8b7e91cb25d",
  measurementId: "G-NBR7X3J0ZD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);