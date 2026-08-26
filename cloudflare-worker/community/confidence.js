/**
 * Deterministic Algorithm for Community Confidence
 * 
 * Score components:
 * - Independent Reports (Max 35%)
 * - Confirmations (Max 35%)
 * - Evidence (Max 25%)
 * - Location Consistency (Max 5%)
 * - Flags (Penalty up to -30%)
 */

export function calculateConfidence(data) {
  const {
    reportCount = 0,
    confirmationCount = 0,
    evidenceCount = 0,
    flagCount = 0
  } = data;

  let score = 0;
  const factors = [];

  // 1. Independent Reports (Diminishing returns)
  // 1 report = 15%, 2 = 25%, 3+ = 35%
  let reportScore = 0;
  if (reportCount === 1) reportScore = 15;
  else if (reportCount === 2) reportScore = 25;
  else if (reportCount >= 3) reportScore = 35;
  
  if (reportCount > 0) {
    score += reportScore;
    factors.push(`${reportCount} independent reports`);
  }

  // 2. Confirmations (Diminishing returns)
  // 1 = 10%, 3 = 20%, 5 = 28%, 10+ = 35%
  let confirmScore = 0;
  if (confirmationCount > 0) {
    if (confirmationCount < 3) confirmScore = 10;
    else if (confirmationCount < 5) confirmScore = 20;
    else if (confirmationCount < 10) confirmScore = 28;
    else confirmScore = 35;
    
    score += confirmScore;
    factors.push(`${confirmationCount} community confirmations`);
  }

  // 3. Evidence (Photos)
  // 1 = 15%, 3+ = 25%
  let evScore = 0;
  if (evidenceCount > 0) {
    if (evidenceCount < 3) evScore = 15;
    else evScore = 25;
    
    score += evScore;
    factors.push(`${evidenceCount} evidence photos`);
  }

  // 4. Location Consistency (Bonus for simplicity in MVP)
  if (reportCount > 1 || confirmationCount > 0) {
    score += 5; // Assuming high consistency for demo
    factors.push("High location consistency");
  }

  // 5. Flags (Penalty)
  if (flagCount > 0) {
    const penalty = Math.min(flagCount * 10, 30); // Max 30% penalty
    score -= penalty;
    factors.push(`${flagCount} negative flags reported`);
  }

  // Cap score between 0 and 100
  score = Math.max(0, Math.min(100, score));

  // Determine Level
  let level = "Low Evidence";
  if (score >= 85) level = "Very Strong Evidence";
  else if (score >= 70) level = "Strong Evidence";
  else if (score >= 40) level = "Developing Evidence";

  return {
    score,
    level,
    factors
  };
}
