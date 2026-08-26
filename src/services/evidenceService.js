import { db } from '../firebase/config';
import { collection, addDoc, updateDoc, doc, serverTimestamp, increment, query, where, getDocs, orderBy } from 'firebase/firestore';

const WORKER_URL = 'http://127.0.0.1:8787/api/community/recalculate';

export const evidenceService = {
  /**
   * Adds evidence photos/description to a cluster.
   */
  addEvidence: async (clusterId, userId, data, token) => {
    try {
      // 1. Write evidence to Firestore
      const newDoc = await addDoc(collection(db, 'issueEvidence'), {
        clusterId,
        contributedBy: userId,
        media: data.media || [],
        description: data.description || '',
        status: 'active',
        createdAt: serverTimestamp()
      });

      // 2. Increment evidenceCount on cluster document
      const clusterRef = doc(db, 'issueClusters', clusterId);
      await updateDoc(clusterRef, {
        evidenceCount: increment(data.media.length || 1), // Simplification: count items or submission
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
      console.error("Evidence Submission Error:", error);
      throw error;
    }
  },

  /**
   * Fetches evidence for a specific cluster.
   */
  getEvidenceForCluster: async (clusterId) => {
    try {
      const q = query(
        collection(db, 'issueEvidence'),
        where('clusterId', '==', clusterId),
        where('status', '==', 'active'),
        orderBy('createdAt', 'desc')
      );
      const snap = await getDocs(q);
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("Fetch evidence error:", error);
      return [];
    }
  }
};
