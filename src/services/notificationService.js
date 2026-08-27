import { db } from '../firebase/config';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  onSnapshot,
  updateDoc,
  doc
} from 'firebase/firestore';

export const notificationService = {
  /**
   * Send a notification to a specific user
   */
  notifyUser: async (userId, title, body, type = 'info', link = null) => {
    if (!db) return false;
    try {
      await addDoc(collection(db, 'notifications'), {
        userId,
        title,
        body,
        type,
        link,
        read: false,
        createdAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error("Error sending notification:", error);
      return false;
    }
  },

  /**
   * Subscribe to unread notifications for a user
   */
  subscribeToNotifications: (userId, callback) => {
    if (!db) return () => {};
    
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      where('read', '==', false),
      orderBy('createdAt', 'desc')
    );
    
    return onSnapshot(q, (snapshot) => {
      const notifications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(notifications);
    });
  },

  /**
   * Mark a notification as read
   */
  markAsRead: async (notificationId) => {
    if (!db) return false;
    try {
      await updateDoc(doc(db, 'notifications', notificationId), {
        read: true,
        readAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error("Error marking notification read:", error);
      return false;
    }
  }
};
