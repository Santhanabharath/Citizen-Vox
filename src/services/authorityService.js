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

      // Role-based filtering: Department Officers only see their department's issues (or unassigned).
      // For MVP, we might show them unassigned OR assigned to their dept.
      // Firestore 'OR' queries exist but let's keep it simple: filter assigned to their department.
      // Wait, if they are unassigned, the department officer still needs to see them to assign them.
      // So perhaps we don't filter at the query level if it's complex, we filter client-side for MVP, 
      // OR we just assume municipal admin can see everything.
      
      if (user.role === 'department_officer' && user.department) {
        // Querying for assignedDepartment == department OR assignedDepartment == null isn't directly supported via single where unless using 'in'.
        // For now, we will fetch the top priority items and filter client side if needed for Department Officers, 
        // OR we can rely on a specific field like `targetDepartment` which doesn't exist yet.
        // Let's just fetch all and filter client side for MVP to ensure they see unassigned ones too.
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
        
        // MVP Client-side role filter for Dept Officers
        if (user.role === 'department_officer' && user.department) {
          if (data.assignedDepartment && data.assignedDepartment !== user.department) {
            return; // Skip issues assigned to other departments
          }
        }
        
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
      const q = query(collection(db, 'issueClusters'), orderBy('createdAt', 'desc'), limit(100));
      const snapshot = await getDocs(q);
      
      let total = 0;
      let critical = 0;
      let high = 0;
      let inProgress = 0;
      let resolved = 0;

      snapshot.forEach(doc => {
        const data = doc.data();
        
        // Apply dept officer filter
        if (user.role === 'department_officer' && user.department) {
          if (data.assignedDepartment && data.assignedDepartment !== user.department) {
            return;
          }
        }
        
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
