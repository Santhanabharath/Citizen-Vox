import { db } from '../firebase/config';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';

export const analyticsService = {
  /**
   * Retrieves full issue data for a given admin scope,
   * then computes all derived metrics in memory.
   * This is more flexible than multiple getCountFromServer calls when we need complex metrics.
   */
  getAdminDashboardMetrics: async (municipalityId = null, departmentId = null) => {
    let issuesQuery = collection(db, 'issues');
    let qConstraints = [];
    
    if (municipalityId) {
      qConstraints.push(where('municipalityId', '==', municipalityId));
    }
    if (departmentId) {
      qConstraints.push(where('departmentId', '==', departmentId));
    }

    const q = query(issuesQuery, ...qConstraints);
    const snap = await getDocs(q);
    
    const now = new Date();
    
    let stats = {
      total: 0,
      active: 0,
      resolved: 0,
      critical: 0,
      overdue: 0,
      resolutionRate: 0,
      avgResolutionDays: 0,
      categories: {},
      departments: {}
    };

    let totalResolutionDays = 0;
    let resolvedWithDates = 0;

    snap.forEach(doc => {
      const data = doc.data();
      stats.total++;
      
      const isResolved = data.status === 'Resolved' || data.status === 'closed';
      
      if (isResolved) {
        stats.resolved++;
        
        // Calculate resolution time
        if (data.createdAt && data.closedAt) {
          const created = data.createdAt.toDate();
          const closed = data.closedAt.toDate();
          const days = (closed - created) / (1000 * 60 * 60 * 24);
          if (days > 0) {
            totalResolutionDays += days;
            resolvedWithDates++;
          }
        }
      } else {
        stats.active++;
      }

      if (data.priority?.level === 'Critical' || data.severity === 'critical') {
        stats.critical++;
      }
      
      // Categorical Breakdown
      const cat = data.category || 'other';
      stats.categories[cat] = (stats.categories[cat] || 0) + 1;
      
      const dept = data.departmentId || 'unassigned';
      stats.departments[dept] = (stats.departments[dept] || 0) + 1;
    });

    stats.resolutionRate = stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0;
    stats.avgResolutionDays = resolvedWithDates > 0 ? Number((totalResolutionDays / resolvedWithDates).toFixed(1)) : 0;

    return stats;
  },

  /**
   * Retrieves active workers and their workload stats
   */
  getWorkerMetrics: async (municipalityId = null) => {
    // 1. Get all workers
    let usersQuery = query(collection(db, 'users'), where('role', '==', 'worker'));
    if (municipalityId) {
      usersQuery = query(collection(db, 'users'), where('role', '==', 'worker'), where('municipalityId', '==', municipalityId));
    }
    const usersSnap = await getDocs(usersQuery);
    const workers = [];
    usersSnap.forEach(doc => workers.push({ id: doc.id, ...doc.data(), activeTasks: 0, completedTasks: 0 }));

    // 2. Get all tasks to calculate workload
    let tasksQuery = collection(db, 'tasks');
    if (municipalityId) {
      tasksQuery = query(tasksQuery, where('municipalityId', '==', municipalityId));
    }
    const tasksSnap = await getDocs(tasksQuery);
    
    const workloadMap = {};
    tasksSnap.forEach(doc => {
      const task = doc.data();
      const wid = task.workerId;
      if (!wid) return;
      if (!workloadMap[wid]) workloadMap[wid] = { active: 0, completed: 0 };
      
      if (task.status === 'completed' || task.status === 'verification_pending' || task.status === 'verified') {
        workloadMap[wid].completed++;
      } else {
        workloadMap[wid].active++;
      }
    });

    // Merge
    return workers.map(w => ({
      ...w,
      activeTasks: workloadMap[w.id]?.active || 0,
      completedTasks: workloadMap[w.id]?.completed || 0
    }));
  }
};
