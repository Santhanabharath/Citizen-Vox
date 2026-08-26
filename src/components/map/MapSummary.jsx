import React from 'react';
import { getSeverity } from '../../hooks/useMapIssues';
import './MapStyles.css';

const MapSummary = ({ issues }) => {
  const activeCount = issues.length;
  let criticalCount = 0;
  let highCount = 0;
  let mediumCount = 0;

  issues.forEach(issue => {
    const sev = getSeverity(issue);
    if (sev === 'Critical') criticalCount++;
    if (sev === 'High') highCount++;
    if (sev === 'Medium') mediumCount++;
  });

  if (activeCount === 0) {
    return (
      <div className="map-floating-panel map-summary-panel">
        <h4 style={{ margin: '0 0 8px 0', fontSize: '0.875rem' }}>Nearby Civic Issues</h4>
        <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--success)' }}>You're all clear nearby.</p>
      </div>
    );
  }

  return (
    <div className="map-floating-panel map-summary-panel">
      <h4 style={{ margin: '0 0 12px 0', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Nearby Issues</h4>
      
      <div className="summary-stat">
        <span style={{ fontWeight: '500' }}>Active Total</span>
        <span style={{ fontWeight: '600' }}>{activeCount}</span>
      </div>
      
      {criticalCount > 0 && (
        <div className="summary-stat" style={{ color: 'var(--danger)' }}>
          <span>Critical</span>
          <span style={{ fontWeight: '600' }}>{criticalCount}</span>
        </div>
      )}
      
      {highCount > 0 && (
        <div className="summary-stat" style={{ color: 'var(--warning)' }}>
          <span>High</span>
          <span style={{ fontWeight: '600' }}>{highCount}</span>
        </div>
      )}
      
      {mediumCount > 0 && (
        <div className="summary-stat" style={{ color: 'var(--warning-light)' }}>
          <span>Medium</span>
          <span style={{ fontWeight: '600' }}>{mediumCount}</span>
        </div>
      )}
    </div>
  );
};

export default MapSummary;
