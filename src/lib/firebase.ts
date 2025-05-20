// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const FIREBASE_APP_NAME = '[DEFAULT]'; // Or a custom name like 'MyNextApp'

// Your web app's Firebase configuration
// Replace with your actual Firebase config
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

console.log("Firebase Config to be Used:", firebaseConfig);

let app;

if (!getApps().find(existingApp => existingApp.name === FIREBASE_APP_NAME)) {
  console.log(`Initializing Firebase app with name: ${FIREBASE_APP_NAME}`)
  app = initializeApp(firebaseConfig, FIREBASE_APP_NAME);
} else {
  console.log(`Getting existing Firebase app with name: ${FIREBASE_APP_NAME}`)
  app = getApp(FIREBASE_APP_NAME);
}

export const auth = getAuth(app);
export const db = getFirestore(app);

export default app; 