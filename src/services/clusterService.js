import { db } from '../firebase/config';
import { collection, doc, addDoc, updateDoc, increment, getDoc, serverTimestamp } from 'firebase/firestore';

export const clusterService = {
  /**
   * Add a newly submitted report to an existing cluster or create a new cluster 
   * grouping both the candidate report and the new report.
   */
  joinCluster: async (newReportId, newReportData, candidateId, candidateClusterId = null) => {
    try {
      let finalClusterId = candidateClusterId;

      // If the candidate doesn't belong to a cluster yet, create one
      if (!finalClusterId) {
        // Fetch candidate data to seed the cluster
        const candidateRef = doc(db, 'issues', candidateId);
        const candidateSnap = await getDoc(candidateRef);
        
        if (!candidateSnap.exists()) throw new Error("Candidate issue not found");
        const candidateData = candidateSnap.data();

        const newClusterRef = await addDoc(collection(db, 'issueClusters'), {
          title: candidateData.title || newReportData.title,
          category: candidateData.category || newReportData.category,
          severity: candidateData.aiAnalysis?.severity || newReportData.aiAnalysis?.severity || 'medium',
          latitude: candidateData.location?.lat,
          longitude: candidateData.location?.lng,
          status: candidateData.status || 'under_review',
          reportCount: 2, // Candidate + new report
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          lastReportedAt: serverTimestamp(),
          representativeReportId: candidateId
        });

        finalClusterId = newClusterRef.id;

        // Update the candidate to point to this new cluster
        await updateDoc(candidateRef, { issueClusterId: finalClusterId });
      } else {
        // Increment report count on existing cluster
        const clusterRef = doc(db, 'issueClusters', finalClusterId);
        await updateDoc(clusterRef, {
          reportCount: increment(1),
          updatedAt: serverTimestamp(),
          lastReportedAt: serverTimestamp()
        });
      }

      // Update the newly submitted report to point to the cluster
      const newReportRef = doc(db, 'issues', newReportId);
      await updateDoc(newReportRef, { issueClusterId: finalClusterId });

      return finalClusterId;

    } catch (error) {
      console.error("Cluster Service Error:", error);
      throw error;
    }
  },

  /**
   * Explicitly sets a report as a standalone cluster (if needed)
   * or simply ensures it's unclustered.
   */
  keepIndependent: async (newReportId) => {
    // In our data model, an issue without an `issueClusterId` is implicitly independent.
    // We could create a cluster of 1, but for simplicity, leaving issueClusterId null works well.
    return null;
  }
};
