import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDOSOPX0tTQNwTTSo5FfHMuoscnpmZClyw",
  authDomain: "loansystem-a811e.firebaseapp.com",
  projectId: "loansystem-a811e",
  storageBucket: "loansystem-a811e.firebasestorage.app",
  messagingSenderId: "443544788063",
  appId: "1:443544788063:web:70bd8c791273cfccef0fea",
  measurementId: "G-TX4ZXL4F80"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;