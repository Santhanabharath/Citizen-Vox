import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Placeholder configuration using environment variables
const firebaseConfig = {
  apiKey: "AIzaSyAN2iOeWDDLmJJvzEe718Cp5mLixLqZC2w",
  authDomain: "citizenvox-91c1a.firebaseapp.com",
  projectId: "citizenvox-91c1a",
  storageBucket: "citizenvox-91c1a.firebasestorage.app",
  messagingSenderId: "908991488065",
  appId: "1:908991488065:web:c0b69fe53465db57e2e6c0",
  measurementId: "G-3NJLF6SCFJ"
};

// Initialize Firebase only if the config is provided (prevents crashing in initial setup phase)
let app, auth, db, storage;

if (firebaseConfig.apiKey && firebaseConfig.apiKey !== 'your_api_key') {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
} else {
  console.warn("Firebase configuration is missing or using placeholder values. Firebase services are not initialized.");
}

export { app, auth, db, storage };
