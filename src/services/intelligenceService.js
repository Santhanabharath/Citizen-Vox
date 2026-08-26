import { db } from '../firebase/config';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';

/**
 * Deterministically rounds coordinates to roughly ~300m grids
 * 1 degree latitude ~ 111km
 * 0.003 degrees ~ 333 meters
 */
const roundCoord = (coord, precision = 3) => {
  return Number(coord).toFixed(precision);
};

export const intelligenceService = {
  /**
   * Fetches clusters for a specific time period
   */
  async getClustersByDateRange(startDate, endDate = new Date()) {
    if (!db) return [];
    try {
      const q = query(
        collection(db, 'issueClusters'),
        where('createdAt', '>=', startDate),
        where('createdAt', '<=', endDate)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e) {
      console.error("Failed to fetch intelligence clusters:", e);
      return [];
    }
  },

  /**
   * Generates Hotspots based on density and priority
   */
  calculateHotspots(clusters) {
    if (!clusters || clusters.length === 0) return [];

    const cells = {};

    // Group into geographic cells
    clusters.forEach(cluster => {
      if (!cluster.latitude || !cluster.longitude) return;

      const latCell = roundCoord(cluster.latitude);
      const lngCell = roundCoord(cluster.longitude);
      const cellId = `${latCell},${lngCell}`;

      if (!cells[cellId]) {
        cells[cellId] = {
          id: cellId,
          lat: parseFloat(latCell),
          lng: parseFloat(lngCell),
          issues: [],
          categories: {},
          totalPriority: 0,
          issueCount: 0,
          hotspotScore: 0,
          level: 'Normal',
        };
      }

      cells[cellId].issues.push(cluster);
      cells[cellId].issueCount++;
      
      const category = cluster.category || 'other';
      cells[cellId].categories[category] = (cells[cellId].categories[category] || 0) + 1;
      
      // Assume priority is 0-100 score
      const priorityScore = cluster.priority?.finalScore || 50; 
      cells[cellId].totalPriority += priorityScore;
    });

    // Calculate score
    const hotspots = Object.values(cells).map(cell => {
      // Very simple deterministic weighting
      const densityScore = Math.min(cell.issueCount * 15, 100); // 15 pts per issue
      const avgPriority = cell.totalPriority / cell.issueCount;
      const priorityWeight = avgPriority * 0.4;
      
      let score = Math.round((densityScore * 0.6) + priorityWeight);
      if (score > 100) score = 100;

      let level = 'Normal';
      if (score >= 75) level = 'Critical Hotspot';
      else if (score >= 50) level = 'Hotspot';
      else if (score >= 30) level = 'Emerging';

      // Find top category
      let topCategory = 'other';
      let maxCount = 0;
      Object.entries(cell.categories).forEach(([cat, count]) => {
        if (count > maxCount) {
          maxCount = count;
          topCategory = cat;
        }
      });

      return {
        ...cell,
        hotspotScore: score,
        level,
        topCategory
      };
    });

    // Sort by score descending
    return hotspots.sort((a, b) => b.hotspotScore - a.hotspotScore);
  },

  /**
   * Group clusters into Recurrence Groups
   */
  calculateRecurrence(clusters) {
    if (!clusters || clusters.length === 0) return [];
    
    const groups = {};

    clusters.forEach(cluster => {
      if (!cluster.latitude || !cluster.longitude || !cluster.createdAt) return;

      const latCell = roundCoord(cluster.latitude);
      const lngCell = roundCoord(cluster.longitude);
      const category = cluster.category || 'other';
      const cellId = `${latCell},${lngCell}-${category}`; // Specific to area AND category

      if (!groups[cellId]) {
        groups[cellId] = {
          id: cellId,
          lat: parseFloat(latCell),
          lng: parseFloat(lngCell),
          category: category,
          issues: [],
          occurrenceCount: 0,
        };
      }
      groups[cellId].issues.push(cluster);
      groups[cellId].occurrenceCount++;
    });

    return Object.values(groups)
      .filter(g => g.occurrenceCount > 1) // Only recurring
      .map(group => {
        // Sort issues by date
        const sorted = group.issues.sort((a, b) => {
          const aDate = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
          const bDate = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
          return aDate - bDate;
        });

        const first = sorted[0].createdAt?.toDate ? sorted[0].createdAt.toDate() : new Date(sorted[0].createdAt);
        const latest = sorted[sorted.length - 1].createdAt?.toDate ? sorted[sorted.length - 1].createdAt.toDate() : new Date(sorted[sorted.length - 1].createdAt);
        
        const spanMs = latest.getTime() - first.getTime();
        const spanDays = spanMs / (1000 * 60 * 60 * 24);
        const avgInterval = spanDays > 0 ? spanDays / (group.occurrenceCount - 1) : 0;

        let score = Math.min((group.occurrenceCount * 20), 100);
        let level = 'Occasional';
        if (score >= 75) level = 'Persistent Problem';
        else if (score >= 50) level = 'Recurring';
        else if (score >= 30) level = 'Emerging Pattern';

        return {
          ...group,
          firstOccurrence: first,
          latestOccurrence: latest,
          averageIntervalDays: avgInterval,
          recurrenceScore: score,
          level
        };
      })
      .sort((a, b) => b.recurrenceScore - a.recurrenceScore);
  },

  /**
   * Summarize generic metrics
   */
  calculateMetrics(clusters) {
    const total = clusters.length;
    let critical = 0;
    const categories = {};
    let resolved = 0;
    let verificationStage = 0;

    clusters.forEach(c => {
      if (c.priority?.level === 'Critical' || c.severity === 'critical') critical++;
      const cat = c.category || 'other';
      categories[cat] = (categories[cat] || 0) + 1;

      // Check resolution rate based on Phase 10 logic
      if (c.status === 'Verified Resolved') resolved++;
      if (c.status === 'Verified Resolved' || c.status === 'Awaiting Verification' || c.status === 'Reopened') {
        verificationStage++; // Issues that reached the end of workflow
      }
    });

    const resolutionRate = verificationStage > 0 ? (resolved / verificationStage) * 100 : null;

    return {
      totalIssues: total,
      criticalIssues: critical,
      categories,
      resolutionRate
    };
  }
};
