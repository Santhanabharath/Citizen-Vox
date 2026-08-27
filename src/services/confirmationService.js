import { db } from '../firebase/config';
import { collection, addDoc, updateDoc, doc, serverTimestamp, increment, query, where, getDocs } from 'firebase/firestore';

import { gamificationService } from './gamificationService';

const WORKER_URL = 'http://127.0.0.1:8787/api/community/recalculate';

export const confirmationService = {
  /**
   * Adds a confirmation from a citizen for a specific cluster.
   */
  confirmIssue: async (clusterId, userId, token) => {
    try {
      // 1. Check if user already confirmed (Double check on client side)
      const q = query(
        collection(db, 'issueConfirmations'),
        where('clusterId', '==', clusterId),
        where('userId', '==', userId)
      );
      
      const snap = await getDocs(q);
      if (!snap.empty) {
        throw new Error('You have already confirmed this issue.');
      }

      // 2. Write confirmation to Firestore
      await addDoc(collection(db, 'issueConfirmations'), {
        clusterId,
        userId,
        createdAt: serverTimestamp()
      });

      // 3. Increment confirmationCount on cluster document
      const clusterRef = doc(db, 'issueClusters', clusterId);
      await updateDoc(clusterRef, {
        confirmationCount: increment(1),
        updatedAt: serverTimestamp()
      });

      // 4. Award Gamification XP for verifying
      await gamificationService.addXp(userId, 20);
      await gamificationService.awardBadge(userId, 2); // Assuming 2 is "Truth Seeker" badge

      // 5. Trigger backend to recalculate confidence score
      if (token) {
        fetch(WORKER_URL, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
          },
          body: JSON.stringify({ clusterId })
        }).catch(err => console.warn('Confidence recalculation ping failed:', err));
      }

      return true;
    } catch (error) {
      console.error("Confirmation Error:", error);
      throw error;
    }
  },

  /**
   * Checks if a user has already confirmed an issue cluster.
   */
  hasConfirmed: async (clusterId, userId) => {
    try {
      const q = query(
        collection(db, 'issueConfirmations'),
        where('clusterId', '==', clusterId),
        where('userId', '==', userId)
      );
      const snap = await getDocs(q);
      return !snap.empty;
    } catch (error) {
      console.error("Check confirmation error:", error);
      return false;
    }
  }
};
