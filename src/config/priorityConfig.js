export const PRIORITY_CONFIG = {
  // Weights must sum to 1.0 (100%)
  WEIGHTS: {
    severity: 0.30,
    communityEvidence: 0.20,
    reportVolume: 0.15,
    locationRisk: 0.15,
    duration: 0.10,
    recurrence: 0.10
  },
  
  // Severity value mapping
  SEVERITY_SCORES: {
    'critical': 100,
    'high': 75,
    'medium': 50,
    'low': 25,
    'unknown': 25
  },

  // Priority level thresholds
  THRESHOLDS: {
    critical: 75,
    high: 50,
    medium: 30,
    low: 0
  },

  // AI Adjustment Bounds
  AI_ADJUSTMENT_MAX: 10,
  AI_ADJUSTMENT_MIN: -10,

  // Location Risk Keywords (MVP)
  HIGH_RISK_KEYWORDS: [
    'school', 'hospital', 'college', 'clinic', 'railway', 'station', 'bus stop', 'highway', 'market', 'mall'
  ],
  MEDIUM_RISK_KEYWORDS: [
    'park', 'residential', 'road', 'street', 'apartment'
  ]
};
