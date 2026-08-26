import { db } from '../firebase/config';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';

const WORKER_URL = 'http://127.0.0.1:8787/api/check-duplicates';

// Haversine formula to calculate distance between two lat/lng points in meters
function getDistanceInMeters(lat1, lon1, lat2, lon2) {
  const R = 6371e3; // Earth radius in meters
  const p1 = lat1 * Math.PI / 180;
  const p2 = lat2 * Math.PI / 180;
  const dp = (lat2 - lat1) * Math.PI / 180;
  const dl = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(dp / 2) * Math.sin(dp / 2) +
            Math.cos(p1) * Math.cos(p2) *
            Math.sin(dl / 2) * Math.sin(dl / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export const duplicateService = {
  /**
   * Finds potential duplicate reports for a newly submitted issue.
   * Step 1: Fetches recent issues from Firestore.
   * Step 2: Filters locally by distance (e.g., within 200m).
   * Step 3: Sends candidates to Cloudflare Worker AI for semantic matching.
   */
  checkDuplicates: async (newIssueId, newIssueData) => {
    try {
      if (!newIssueData.location || !newIssueData.location.lat || !newIssueData.location.lng) {
        return { potentialMatch: false };
      }

      // Step 1: Fetch recent issues (Max 50 to keep it lightweight client-side)
      // In production, we'd use GeoQueries (e.g., Geohashes), but this is fine for the prototype.
      const q = query(
        collection(db, 'issues'),
        orderBy('createdAt', 'desc'),
        limit(50)
      );

      const snapshot = await getDocs(q);
      const candidates = [];

      snapshot.forEach(doc => {
        if (doc.id === newIssueId) return; // Skip the new issue itself
        
        const data = doc.data();
        if (data.location && data.location.lat && data.location.lng) {
          const distance = getDistanceInMeters(
            newIssueData.location.lat, newIssueData.location.lng,
            data.location.lat, data.location.lng
          );
          
          // Step 2: Geographic filtering (e.g., within 200 meters)
          if (distance <= 200) {
            candidates.push({
              id: doc.id,
              title: data.title || '',
              category: data.category || '',
              description: data.description || '',
              distanceMeters: Math.round(distance),
              distanceStr: `${Math.round(distance)}m`,
              issueClusterId: data.issueClusterId || null
            });
          }
        }
      });

      if (candidates.length === 0) {
        return { potentialMatch: false };
      }

      // Step 3: Semantic AI Comparison
      const response = await fetch(WORKER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newReport: {
            title: newIssueData.title,
            category: newIssueData.category,
            description: newIssueData.description
          },
          candidates: candidates
        })
      });

      if (!response.ok) {
        throw new Error('Duplicate check backend failed.');
      }

      const responseData = await response.json();
      if (!responseData.success || !responseData.result) {
        throw new Error('Invalid response from AI duplicate checker.');
      }

      const result = responseData.result;
      
      // Attach the full candidate data to the result if matched
      if (result.potentialMatch && result.matchedCandidateId) {
        result.matchedCandidate = candidates.find(c => c.id === result.matchedCandidateId);
      }

      return result;

    } catch (error) {
      console.error("Duplicate Service Error:", error);
      throw error;
    }
  }
};
