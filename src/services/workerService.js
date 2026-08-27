import { app, db } from '../firebase/config';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';

// Reconstruct config for secondary app to prevent Admin logout
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

export const workerService = {
  /**
   * Creates a new worker securely without logging out the Admin.
   * Generates a secure random password if not provided.
   */
  createWorker: async (workerData) => {
    // 1. Initialize secondary app
    const secondaryApp = initializeApp(firebaseConfig, `WorkerCreationApp_${Date.now()}`);
    const secondaryAuth = getAuth(secondaryApp);
    
    // Generate secure password
    const tempPassword = workerData.password || Math.random().toString(36).slice(-8) + 'A1!';

    try {
      // 2. Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, workerData.email, tempPassword);
      const newUid = userCredential.user.uid;

      // 3. Create profile in Firestore users collection
      const userRef = doc(db, 'users', newUid);
      await setDoc(userRef, {
        name: workerData.name,
        email: workerData.email,
        phone: workerData.phone || null,
        role: 'worker', // Strict enforcement
        departmentId: workerData.departmentId,
        municipalityId: workerData.municipalityId || null,
        status: workerData.status || 'active',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // 4. Sign out the secondary app instance
      await secondaryAuth.signOut();
      
      return { success: true, uid: newUid, tempPassword };
    } catch (error) {
      console.error("Worker creation failed:", error);
      throw error;
    }
  },

  updateWorker: async (uid, updates) => {
    try {
      const userRef = doc(db, 'users', uid);
      // Remove any attempt to change role
      delete updates.role;
      updates.updatedAt = serverTimestamp();
      
      await updateDoc(userRef, updates);
      return true;
    } catch (error) {
      console.error("Worker update failed:", error);
      throw error;
    }
  },

  deactivateWorker: async (uid) => {
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, { 
        status: 'inactive',
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error("Worker deactivation failed:", error);
      throw error;
    }
  }
};
