import { db } from '../firebase/config';
import { collection, query, where, orderBy, getDocs, limit, startAfter, doc, getDoc } from 'firebase/firestore';

export const authorityService = {
  /**
   * Fetches issues for the Authority Dashboard, sorted by Priority finalScore descending.
   */
  getPriorityQueue: async (user, filters = {}, pageSize = 50, lastDoc = null) => {
    try {
      let q = collection(db, 'issueClusters');
      let queryConstraints = [];

      if (user.role === 'admin') {
        if (user.municipalityId) {
          queryConstraints.push(where('municipalityId', '==', user.municipalityId));
        }
        if (user.departmentId) {
          queryConstraints.push(where('departmentId', '==', user.departmentId));
        }
      }

      if (filters.status && filters.status !== 'All') {
        queryConstraints.push(where('currentStatus', '==', filters.status));
      }
      
      if (filters.department && filters.department !== 'All') {
        queryConstraints.push(where('assignedDepartment', '==', filters.department));
      }

      // We want to sort by priority.finalScore DESC
      // Note: Firestore requires an index for ordering on nested fields if combining with where clauses.
      // For MVP without deploying indexes manually, we might just orderBy and do simple where.
      queryConstraints.push(orderBy('priority.finalScore', 'desc'));
      queryConstraints.push(limit(pageSize));
      
      if (lastDoc) {
        queryConstraints.push(startAfter(lastDoc));
      }

      const finalQuery = query(q, ...queryConstraints);
      const snapshot = await getDocs(finalQuery);
      
      const issues = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        
        issues.push({ id: doc.id, ...data });
      });

      return {
        issues,
        lastDoc: snapshot.docs.length > 0 ? snapshot.docs[snapshot.docs.length - 1] : null
      };
    } catch (error) {
      console.error("Error fetching priority queue:", error);
      throw error;
    }
  },

  /**
   * Fetches all raw issues for the admin dashboard.
   */
  getAllIssues: async (user, limitCount = 100) => {
    try {
      let q = collection(db, 'issues');
      let queryConstraints = [orderBy('createdAt', 'desc'), limit(limitCount)];

      if (user.role === 'admin') {
        if (user.municipalityId) {
          queryConstraints.push(where('municipalityId', '==', user.municipalityId));
        }
        if (user.departmentId) {
          queryConstraints.push(where('departmentId', '==', user.departmentId));
        }
      }

      const finalQuery = query(q, ...queryConstraints);
      const snapshot = await getDocs(finalQuery);
      
      const issues = [];
      snapshot.forEach(doc => {
        issues.push({ id: doc.id, ...doc.data() });
      });

      return issues;
    } catch (error) {
      console.error("Error fetching all issues:", error);
      throw error;
    }
  },

  /**
   * Gets specific issue cluster details.
   */
  getIssueDetails: async (issueId) => {
    try {
      // Check issues collection first (primary data store)
      const issueRef = doc(db, 'issues', issueId);
      const issueSnap = await getDoc(issueRef);
      if (issueSnap.exists()) {
        return { id: issueSnap.id, ...issueSnap.data() };
      }

      // Fallback: legacy issueClusters collection
      const clusterRef = doc(db, 'issueClusters', issueId);
      const clusterSnap = await getDoc(clusterRef);
      if (clusterSnap.exists()) {
        return { id: clusterSnap.id, ...clusterSnap.data(), isCluster: true };
      }

      return null;
    } catch (error) {
      console.error("Error fetching issue details:", error);
      throw error;
    }
  },

  /**
   * Fetches KPIs for the dashboard.
   * This is a simplified MVP version. In a real app, you'd use Cloud Functions for aggregations.
   */
  getDashboardKPIs: async (user) => {
    try {
      // For MVP, we'll fetch the last 100 recent active clusters and compute stats.
      // In production, we'd use Firestore Aggregation queries (COUNT(), etc.)
      let queryConstraints = [orderBy('createdAt', 'desc'), limit(500)];
      
      if (user.role === 'admin') {
        if (user.municipalityId) {
          queryConstraints.push(where('municipalityId', '==', user.municipalityId));
        }
        if (user.departmentId) {
          queryConstraints.push(where('departmentId', '==', user.departmentId));
        }
      }

      const q = query(collection(db, 'issueClusters'), ...queryConstraints);
      const snapshot = await getDocs(q);
      
      let total = 0;
      let critical = 0;
      let high = 0;
      let inProgress = 0;
      let resolved = 0;

      snapshot.forEach(doc => {
        const data = doc.data();
        
        total++;
        if (data.priority?.level === 'Critical') critical++;
        if (data.priority?.level === 'High') high++;
        if (data.currentStatus === 'In Progress') inProgress++;
        if (data.currentStatus === 'Resolved') resolved++;
      });

      return {
        totalActive: total - resolved,
        critical,
        high,
        inProgress,
        resolved
      };
    } catch (error) {
      console.error("Error fetching KPIs:", error);
      return { totalActive: 0, critical: 0, high: 0, inProgress: 0, resolved: 0 };
    }
  }
};
