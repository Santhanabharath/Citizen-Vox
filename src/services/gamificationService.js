import { db } from '../firebase/config';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  increment, 
  onSnapshot,
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  getCountFromServer,
  where
} from 'firebase/firestore';

export const gamificationService = {
  /**
   * Subscribe to a user's real-time gamification profile
   */
  subscribeToProfile: (userId, callback) => {
    if (!db || !userId) return () => {};
    
    const docRef = doc(db, 'gamificationProfiles', userId);
    
    return onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        callback(docSnap.data());
      } else {
        // Initialize default profile if it doesn't exist
        const defaultProfile = { xp: 0, badges: [] };
        setDoc(docRef, defaultProfile);
        callback(defaultProfile);
      }
    });
  },

  /**
   * Award XP to a user
   */
  addXp: async (userId, amount) => {
    if (!db || !userId) return;
    
    const docRef = doc(db, 'gamificationProfiles', userId);
    
    try {
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        await updateDoc(docRef, {
          xp: increment(amount)
        });
      } else {
        await setDoc(docRef, {
          xp: amount,
          badges: []
        });
      }
    } catch (error) {
      console.error("Error adding XP:", error);
    }
  },

  /**
   * Award a badge to a user
   */
  awardBadge: async (userId, badgeId) => {
    if (!db || !userId) return;
    
    const docRef = doc(db, 'gamificationProfiles', userId);
    
    try {
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (!data.badges?.includes(badgeId)) {
          await updateDoc(docRef, {
            badges: [...(data.badges || []), badgeId]
          });
        }
      } else {
        await setDoc(docRef, {
          xp: 0,
          badges: [badgeId]
        });
      }
    } catch (error) {
      console.error("Error awarding badge:", error);
    }
  },

  /**
   * Fetch the leaderboard (top users by XP)
   */
  getLeaderboard: async (limitCount = 10) => {
    if (!db) return [];
    
    try {
      const profilesRef = collection(db, 'gamificationProfiles');
      const q = query(profilesRef, orderBy('xp', 'desc'), limit(limitCount));
      const querySnapshot = await getDocs(q);
      
      const leaderboard = [];
      let rank = 1;
      
      for (const document of querySnapshot.docs) {
        const data = document.data();
        let name = "Citizen";
        let avatar = "C";
        
        // Fetch user data for name
        try {
          const userDoc = await getDoc(doc(db, 'users', document.id));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            name = userData.name || userData.displayName || name;
            avatar = name.charAt(0).toUpperCase();
          }
        } catch (e) {
          console.error("Error fetching user data for leaderboard:", e);
        }
        
        leaderboard.push({
          id: document.id,
          rank: rank++,
          name,
          avatar,
          xp: data.xp || 0
        });
      }
      
      return leaderboard;
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      return [];
    }
  },

  /**
   * Get actual global rank based on XP
   */
  getUserRank: async (userXp) => {
    if (!db) return 0;
    try {
      const profilesRef = collection(db, 'gamificationProfiles');
      const q = query(profilesRef, where('xp', '>', userXp || 0));
      const snapshot = await getCountFromServer(q);
      return snapshot.data().count + 1;
    } catch (error) {
      console.error("Error fetching rank:", error);
      return 0;
    }
  }
};
