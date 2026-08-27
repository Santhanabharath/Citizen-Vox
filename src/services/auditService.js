import { db } from '../firebase/config';
import { collection, addDoc, serverTimestamp, query, orderBy, limit, getDocs } from 'firebase/firestore';

export const auditService = {
  /**
   * Log an administrative action securely to Firestore
   * @param {string} actorId User UID performing action
   * @param {string} actorRole User role (e.g., admin)
   * @param {string} action Description of action (e.g., 'ASSIGN_TASK', 'CREATE_WORKER')
   * @param {string} resourceType Type of resource affected (e.g., 'issue', 'user')
   * @param {string} resourceId ID of the resource
   * @param {Object} metadata Additional context (e.g., { previousWorker: 'uid1', newWorker: 'uid2' })
   */
  logAction: async (actorId, actorRole, action, resourceType, resourceId, metadata = {}) => {
    try {
      await addDoc(collection(db, 'audit_logs'), {
        actorId,
        actorRole,
        action,
        resourceType,
        resourceId,
        timestamp: serverTimestamp(),
        metadata
      });
      return true;
    } catch (error) {
      console.error("Failed to log audit action:", error);
      return false; // Fail silently so it doesn't break workflows
    }
  },

  /**
   * Get recent audit logs (Admin only)
   */
  getRecentLogs: async (count = 50) => {
    try {
      const q = query(
        collection(db, 'audit_logs'),
        orderBy('timestamp', 'desc'),
        limit(count)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("Failed to fetch audit logs:", error);
      return [];
    }
  }
};
