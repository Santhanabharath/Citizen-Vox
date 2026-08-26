import { db } from '../firebase/config';
import { collection, addDoc, updateDoc, doc, serverTimestamp, increment } from 'firebase/firestore';

const WORKER_URL = 'http://127.0.0.1:8787/api/community/recalculate';

export const flagService = {
  /**
   * Adds a flag to an issue cluster (incorrect info).
   */
  flagIssue: async (clusterId, userId, reason, note, token) => {
    try {
      // 1. Write flag to Firestore
      const newDoc = await addDoc(collection(db, 'issueFlags'), {
        clusterId,
        reportedBy: userId,
        reason,
        note: note || '',
        status: 'pending',
        createdAt: serverTimestamp()
      });

      // 2. Increment flagCount on cluster document
      const clusterRef = doc(db, 'issueClusters', clusterId);
      await updateDoc(clusterRef, {
        flagCount: increment(1),
        updatedAt: serverTimestamp()
      });

      // 3. Trigger backend to recalculate confidence score
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

      return newDoc.id;
    } catch (error) {
      console.error("Flag Submission Error:", error);
      throw error;
    }
  }
};
