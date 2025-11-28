// Centralized Firebase initialization for all pages
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBr4_qrqCMt9xMAVqwj61RvXr863zp0SOU",
  authDomain: "ai--flow.firebaseapp.com",
  projectId: "ai--flow",
  storageBucket: "ai--flow.firebasestorage.app",
  messagingSenderId: "1062635304714",
  appId: "1:1062635304714:web:f353728b976482a7e1ecf3",
  measurementId: "G-451XSKKQVF",
};

const app = initializeApp(firebaseConfig);
getAnalytics(app);

const auth = getAuth(app);
window.FirebaseAuth = {
  auth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
};
