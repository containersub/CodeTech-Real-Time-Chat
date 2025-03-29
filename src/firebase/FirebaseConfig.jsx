import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBB20Crm-SuxZ9Zz3nDrV3Gj9XIEgBaUIc",
  authDomain: "chat-app-2e0ca.firebaseapp.com",
  projectId: "chat-app-2e0ca",
  storageBucket: "chat-app-2e0ca.firebasestorage.app",
  messagingSenderId: "727212700819",
  appId: "1:727212700819:web:30696f4515d84c8da3c966",
  measurementId: "G-TEJXRLZT0Q", // Ensure this is correct if used
};

let app;

if (getApps().length === 0) {
  try {
    app = initializeApp(firebaseConfig);
  } catch (error) {
    console.error("Firebase initialization error:", error);
    // Handle the error appropriately (e.g., show an error message)
  }
} else {
  app = getApps()[0]; // Use the existing app
}

const fireDB = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { app, fireDB, auth, storage };