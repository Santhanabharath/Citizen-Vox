import { PRIORITY_CONFIG } from '../config/priorityConfig';
import { db } from '../firebase/config';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';

const WORKER_URL = 'http://127.0.0.1:8787/api/analyze-priority';

export const priorityService = {
  /**
   * Calculates the deterministic base priority score (0-100) based on configured weights.
   * @param {Object} clusterData - The cluster object or raw issue object
   * @returns {Object} { baseScore, factors }
   */
  calculateBasePriority: (clusterData) => {
    let score = 0;
    const factors = [];
    
    // 1. Severity (30%)
    const severityLabel = clusterData.aiAnalysis?.severity?.toLowerCase() || 'unknown';
    const severityScore = PRIORITY_CONFIG.SEVERITY_SCORES[severityLabel] || PRIORITY_CONFIG.SEVERITY_SCORES['unknown'];
    score += severityScore * PRIORITY_CONFIG.WEIGHTS.severity;
    factors.push(`Severity: ${severityLabel} (${Math.round(severityScore * PRIORITY_CONFIG.WEIGHTS.severity)} pts)`);

    // 2. Community Evidence (20%)
    const communityScore = clusterData.communityConfidence?.score || 0;
    score += communityScore * PRIORITY_CONFIG.WEIGHTS.communityEvidence;
    if (communityScore > 0) {
      factors.push(`Community Evidence: ${communityScore}% (${Math.round(communityScore * PRIORITY_CONFIG.WEIGHTS.communityEvidence)} pts)`);
    }

    // 3. Report Volume (15%) - Diminishing Returns
    // 1=20, 3=50, 10=80, 25+=100
    const reportCount = clusterData.reportCount || 1;
    let volumeScore = 0;
    if (reportCount >= 25) volumeScore = 100;
    else if (reportCount >= 10) volumeScore = 80;
    else if (reportCount >= 3) volumeScore = 50;
    else if (reportCount > 0) volumeScore = 20;
    
    score += volumeScore * PRIORITY_CONFIG.WEIGHTS.reportVolume;
    factors.push(`${reportCount} Reports (${Math.round(volumeScore * PRIORITY_CONFIG.WEIGHTS.reportVolume)} pts)`);

    // 4. Location Risk (15%) - MVP Keyword matching on description/title
    const textTarget = `${clusterData.title || ''} ${clusterData.description || ''}`.toLowerCase();
    let locationScore = 20; // Base score
    const hasHighRisk = PRIORITY_CONFIG.HIGH_RISK_KEYWORDS.some(k => textTarget.includes(k));
    const hasMedRisk = PRIORITY_CONFIG.MEDIUM_RISK_KEYWORDS.some(k => textTarget.includes(k));
    
    if (hasHighRisk) locationScore = 100;
    else if (hasMedRisk) locationScore = 60;

    score += locationScore * PRIORITY_CONFIG.WEIGHTS.locationRisk;
    if (hasHighRisk) factors.push(`High Location Risk (${Math.round(locationScore * PRIORITY_CONFIG.WEIGHTS.locationRisk)} pts)`);
    else factors.push(`Standard Location Risk (${Math.round(locationScore * PRIORITY_CONFIG.WEIGHTS.locationRisk)} pts)`);

    // 5. Duration (10%) - Diminishing returns based on age
    let durationScore = 0;
    if (clusterData.createdAt) {
      const createdDate = clusterData.createdAt.toDate ? clusterData.createdAt.toDate() : new Date(clusterData.createdAt);
      const daysOld = Math.max(0, (Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysOld >= 30) durationScore = 100;
      else if (daysOld >= 14) durationScore = 75;
      else if (daysOld >= 7) durationScore = 50;
      else if (daysOld >= 3) durationScore = 25;
    }
    score += durationScore * PRIORITY_CONFIG.WEIGHTS.duration;
    factors.push(`Duration (${Math.round(durationScore * PRIORITY_CONFIG.WEIGHTS.duration)} pts)`);

    // 6. Recurrence (10%) - MVP Placeholder
    // Assume a base score of 20 for MVP until geospatial history is implemented
    const recurrenceScore = 20;
    score += recurrenceScore * PRIORITY_CONFIG.WEIGHTS.recurrence;
    factors.push(`Recurrence baseline (${Math.round(recurrenceScore * PRIORITY_CONFIG.WEIGHTS.recurrence)} pts)`);

    const finalBaseScore = Math.max(0, Math.min(100, Math.round(score)));

    return {
      baseScore: finalBaseScore,
      factors
    };
  },

  /**
   * Get the string level based on a 0-100 score
   */
  getPriorityLevel: (score) => {
    if (score >= PRIORITY_CONFIG.THRESHOLDS.critical) return 'Critical';
    if (score >= PRIORITY_CONFIG.THRESHOLDS.high) return 'High';
    if (score >= PRIORITY_CONFIG.THRESHOLDS.medium) return 'Medium';
    return 'Low';
  },

  /**
   * Synchronously recalculates and updates base priority in Firestore if AI isn't needed.
   * Useful when report counts or community confidence change.
   */
  updateBasePriority: async (docId, data, isCluster = true) => {
    if (!docId || !data) return;
    
    const { baseScore, factors } = priorityService.calculateBasePriority(data);
    
    // Preserve existing AI adjustment if it exists
    const aiAdjustment = data.priority?.aiAdjustment || 0;
    const aiContext = data.priority?.aiContext || null;
    
    const finalScore = Math.max(0, Math.min(100, baseScore + aiAdjustment));
    const level = priorityService.getPriorityLevel(finalScore);

    const priorityObj = {
      baseScore,
      aiAdjustment,
      finalScore,
      level,
      factors,
      aiContext,
      updatedAt: serverTimestamp()
    };

    const collectionName = isCluster ? 'issueClusters' : 'issues';
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, { priority: priorityObj });
    return priorityObj;
  },

  /**
   * Calls the Cloudflare Worker to perform AI Priority Analysis.
   */
  requestAIAnalysis: async (docId, data, token, isCluster = true) => {
    if (!token) throw new Error("Auth token required");
    
    const response = await fetch(WORKER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ clusterId: docId, issueData: data, isCluster })
    });

    if (!response.ok) {
      throw new Error(`Priority AI failed: ${await response.text()}`);
    }

    return await response.json();
  }
};
