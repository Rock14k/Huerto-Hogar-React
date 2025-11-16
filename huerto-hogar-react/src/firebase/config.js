import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';
import { getFirestore } from 'firebase/firestore';

// Configuración de Firebase (proporcionada por el usuario)
const firebaseConfig = {
  apiKey: "AIzaSyAFykGrmHNx7CFMsD4sodBk-MkYkI31krk",
  authDomain: "huertohogar-integral.firebaseapp.com",
  projectId: "huertohogar-integral",
  storageBucket: "huertohogar-integral.firebasestorage.app",
  messagingSenderId: "872490891505",
  appId: "1:872490891505:web:28cb8dff750dd08a675150",
  measurementId: "G-B4JWZQED6Y"
};

// aca estamos nicializando Firebase
const app = initializeApp(firebaseConfig);

// Inicializar servicios
export const auth = getAuth(app);
export const storage = getStorage(app);
export const db = getFirestore(app);

// Analytics (solo en contextos compatibles: https y con measurementId)
try {
  if (typeof window !== 'undefined' && window.isSecureContext && firebaseConfig.measurementId) {
    getAnalytics(app);
  }
} catch (e) {
  // No bloquear la app si analytics falla en dev
  // console.warn('Analytics no inicializado:', e);
}

export default app;
