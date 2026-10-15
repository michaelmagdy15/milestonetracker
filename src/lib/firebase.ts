import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

export const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyAUvzDIKoTvtbMEWaP1pDSyNfqpS3_11wI',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'faa-test-guide-v2.firebaseapp.com',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'faa-test-guide-v2',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'faa-test-guide-v2.firebasestorage.app',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '492280162134',
    appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:492280162134:web:87714bf000ca70ea2d98f7',
};

export const firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const firebaseAuth = getAuth(firebaseApp);
export const firestoreDb = getFirestore(firebaseApp);

// Secondary Firebase app instance used by Admins to create new Firebase Auth users
// without signing out the currently logged-in Admin session.
const secondaryApp = getApps().find(a => a.name === 'AdminCreatorApp') || initializeApp(firebaseConfig, 'AdminCreatorApp');
export const secondaryFirebaseAuth = getAuth(secondaryApp);
