// js/firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDQJm06tkdKYzB_aocChuKqpNajrtmLElc",
  authDomain: "crmfinal-e0848.firebaseapp.com",
  projectId: "crmfinal-e0848",
  storageBucket: "crmfinal-e0848.firebasestorage.app",
  messagingSenderId: "97201851725",
  appId: "1:97201851725:web:103764e4ffada53b657b04"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);