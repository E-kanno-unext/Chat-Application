// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";


const firebaseConfig = {
  apiKey: "AIzaSyDlOWX3Kn0-5TRUhNHGUFhQvApZo4FSGq0",
  authDomain: "chatapplication-with-cha-dbc9e.firebaseapp.com",
  projectId: "chatapplication-with-cha-dbc9e",
  storageBucket: "chatapplication-with-cha-dbc9e.firebasestorage.app",
  messagingSenderId: "877652235905",
  appId: "1:877652235905:web:dee12c8f8fa092c9789f80"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

