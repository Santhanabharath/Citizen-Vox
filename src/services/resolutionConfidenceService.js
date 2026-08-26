export const resolutionConfidenceService = {
  /**
   * Calculates a deterministic MVP confidence score for a resolution based on community verifications.
   * 
   * @param {Array} verifications - List of verification objects for the current cycle
   * @returns {Object} { score, level, verifiedCount, unresolvedCount }
   */
  calculateConfidence: (verifications) => {
    if (!verifications || verifications.length === 0) {
      return {
        score: 0,
        level: "No Evidence",
        verifiedCount: 0,
        unresolvedCount: 0
      };
    }

    let verifiedCount = 0;
    let unresolvedCount = 0;
    let evidenceBonus = 0;

    // Use a Set to ensure unique verifiers in calculation logic if needed, 
    // though the DB layer should prevent duplicates.
    const uniqueVerifiers = new Set();

    verifications.forEach(v => {
      if (!uniqueVerifiers.has(v.verifiedBy)) {
        uniqueVerifiers.add(v.verifiedBy);
        
        if (v.decision === 'verified') {
          verifiedCount++;
        } else if (v.decision === 'rejected') {
          unresolvedCount++;
          if (v.media) {
            evidenceBonus -= 15; // Strong penalty for photographic proof it's not fixed
          }
        }
      }
    });

    // MVP Bounded Logic:
    // Base 50 points if we have at least 1 verified response.
    // +15 points for every additional verified response.
    // -25 points for every rejected response.
    // + evidence adjustments.
    
    let score = 0;
    if (verifiedCount > 0) {
      score = 50 + ((verifiedCount - 1) * 15);
    }
    
    score -= (unresolvedCount * 25);
    score += evidenceBonus;

    // Clamp score between 0 and 100
    score = Math.max(0, Math.min(100, score));

    // Determine level based on configurable MVP thresholds
    let level = "Insufficient Evidence";
    if (score >= 85) level = "Very Strong Resolution Evidence";
    else if (score >= 70) level = "Strong Resolution Evidence";
    else if (score >= 40) level = "Mixed Results";

    // If there are more rejections than verifications, force a low level
    if (unresolvedCount > verifiedCount) {
       level = "Problem Likely Remains";
       score = Math.min(score, 39);
    }

    return {
      score,
      level,
      verifiedCount,
      unresolvedCount
    };
  }
};
