import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  // ನಿಮ್ಮ Firebase ಕಾನ್ಫಿಗರೇಶನ್ ಇಲ್ಲಿ ಸೇರಿಸಿ
  apiKey: "AIzaSyBC8Y4hTjtX4v1ME8ul7nKEC8lRFmvvMyA",
  authDomain: "people-management-3c099.firebaseapp.com",
  projectId: "people-management-3c099",
  storageBucket: "people-management-3c099.firebasestorage.app",
  messagingSenderId: "623735882262",
  appId: "1:623735882262:web:ddddd74f67cbf40d28ab37"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app); 