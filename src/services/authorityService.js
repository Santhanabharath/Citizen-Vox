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

      if (user.role !== 'super_admin') {
        if (user.municipalityId) {
          queryConstraints.push(where('municipalityId', '==', user.municipalityId));
        }
      }

      if (user.role === 'department_officer' && user.departmentId) {
        queryConstraints.push(where('departmentId', '==', user.departmentId));
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
   * Gets specific issue cluster details.
   */
  getIssueDetails: async (clusterId) => {
    try {
      const docRef = doc(db, 'issueClusters', clusterId);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        return { id: snap.id, ...snap.data() };
      }
      
      // Fallback to independent issue
      const issueRef = doc(db, 'issues', clusterId);
      const issueSnap = await getDoc(issueRef);
      if (issueSnap.exists()) {
        return { id: issueSnap.id, ...issueSnap.data(), isIndependent: true };
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
      
      if (user.role !== 'super_admin') {
        if (user.municipalityId) {
          queryConstraints.push(where('municipalityId', '==', user.municipalityId));
        }
      }
      
      if (user.role === 'department_officer' && user.departmentId) {
        queryConstraints.push(where('departmentId', '==', user.departmentId));
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
