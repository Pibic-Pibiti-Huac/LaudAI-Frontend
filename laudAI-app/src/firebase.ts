import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? 'REPLACE_ME',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? 'REPLACE_ME',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? 'REPLACE_ME',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? 'REPLACE_ME',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? 'REPLACE_ME',
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? 'REPLACE_ME',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID ?? 'REPLACE_ME'
}

// Evita reinicializar o app durante o HMR do Vite
const app = getApps().length ? getApp() : initializeApp(firebaseConfig)

// getAnalytics pode falhar em SSR/ambientes sem window — proteja também
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null

export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()

export const signInWithGoogle = () => signInWithPopup(auth, googleProvider)
export const signOutUser = () => signOut(auth)
export { onAuthStateChanged, type User }