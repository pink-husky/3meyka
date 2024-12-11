import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
// import { getAnalytics } from "firebase/analytics";
import { getFirestore } from 'firebase/firestore';
// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCFbvDwlCL1L_bLCkzG7zQRqmhzlbOfIO8",
    authDomain: "meyka-681b5.firebaseapp.com",
    projectId: "meyka-681b5",
    storageBucket: "meyka-681b5.firebasestorage.app",
    messagingSenderId: "120637203469",
    appId: "1:120637203469:web:8dd50b8ed8163b8f582144",
    measurementId: "G-E17X1EHWRE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and Google Provider
export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();