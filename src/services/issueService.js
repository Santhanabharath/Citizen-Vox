import { db } from '../firebase/config';
import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc, 
  doc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  limit
} from 'firebase/firestore';

export const issueService = {
  /**
   * Create a new civic issue report
   */
  createIssue: async (issueData, userId) => {
    if (!db) throw new Error("Firestore not initialized");

    const issuesRef = collection(db, 'issues');
    
    const newIssue = {
      title: issueData.title || '',
      description: issueData.description,
      category: issueData.category,
      status: 'submitted',
      latitude: issueData.location.lat,
      longitude: issueData.location.lng,
      reportedBy: userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      media: issueData.media || [], // [{ url, type, publicId }]
      verificationCount: 0,
      priorityScore: null,
      confidenceScore: null,
      inputMethod: issueData.inputMethod || 'text',
      language: issueData.language || 'en-IN'
    };

    const docRef = await addDoc(issuesRef, newIssue);
    return docRef.id;
  },

  /**
   * Get issues reported by a specific user
   */
  getUserIssues: async (userId) => {
    if (!db) return [];
    
    try {
      const q = query(
        collection(db, 'issues'),
        where('reportedBy', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("Error fetching user issues:", error);
      return [];
    }
  },

  /**
   * Get a single issue by ID
   */
  getIssueById: async (issueId) => {
    if (!db) return null;
    
    try {
      const docRef = doc(db, 'issues', issueId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      return null;
    } catch (error) {
      console.error("Error fetching issue:", error);
      return null;
    }
  },

  /**
   * Simple MVP approach for nearby issues: just fetch recent active issues
   * In a real production environment, we would use GeoFirestore or calculate distance
   */
  getNearbyIssues: async () => {
    if (!db) return [];
    
    try {
      // Fetching 200 most recent issues for MVP client-side filtering
      const q = query(
        collection(db, 'issues'),
        orderBy('createdAt', 'desc'),
        limit(200)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error("Error fetching nearby issues:", error);
      return [];
    }
  }
};
