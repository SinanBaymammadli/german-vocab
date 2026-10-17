import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyBP9-GpWLGdZrfyy_2rPKhMszplK9GEUbA',
  authDomain: 'b1-vocabulary.firebaseapp.com',
  projectId: 'b1-vocabulary',
  storageBucket: 'b1-vocabulary.firebasestorage.app',
  messagingSenderId: '133009018636',
  appId: '1:133009018636:web:7098507e73ba4c378f4329',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export { signInWithPopup, signOut, onAuthStateChanged, doc, getDoc, setDoc };
