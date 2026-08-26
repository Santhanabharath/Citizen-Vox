import React, { useState } from 'react';
import { motion } from 'framer-motion';
import IssueStatus from '../citizen/IssueStatus';
import { getSeverity } from '../../hooks/useMapIssues';
import './MapStyles.css';

const NearbyIssueList = ({ issues, isMobile, activeIssueId, onIssueHover, onIssueClick }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Split-pane on desktop, draggable bottom sheet on mobile.
  // For MVP, we'll use a simple CSS class toggle for mobile bottom sheet.
  
  const handleToggle = () => {
    if (isMobile) setIsExpanded(!isExpanded);
  };

  const containerClasses = `map-list-pane ${isExpanded ? 'expanded' : ''}`;

  return (
    <div className={containerClasses}>
      {isMobile && (
        <div className="bottom-sheet-handle" onClick={handleToggle} />
      )}
      
      <div className="map-list-header" onClick={handleToggle} style={{ cursor: isMobile ? 'pointer' : 'default' }}>
        <h2 style={{ margin: 0, fontSize: '1.25rem' }}>
          {issues.length} {issues.length === 1 ? 'Issue' : 'Issues'} Nearby
        </h2>
        {isMobile && (
          <p style={{ margin: '4px 0 0 0', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            {isExpanded ? 'Swipe down to close' : 'Tap to view list'}
          </p>
        )}
      </div>

      <div className="map-list-content">
        {issues.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
            <p style={{ fontWeight: '500', marginBottom: '8px', color: 'var(--text-primary)' }}>No civic issues found nearby.</p>
            <p style={{ fontSize: '0.875rem' }}>Your community is looking clear here.</p>
          </div>
        ) : (
          issues.map(issue => (
            <motion.div
              key={issue.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                padding: '1rem',
                border: '1px solid',
                borderColor: activeIssueId === issue.id ? 'var(--accent)' : 'var(--border)',
                borderRadius: '12px',
                background: activeIssueId === issue.id ? 'var(--surface-hover)' : 'var(--surface)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                position: 'relative'
              }}
              onMouseEnter={() => !isMobile && onIssueHover(issue.id)}
              onMouseLeave={() => !isMobile && onIssueHover(null)}
              onClick={() => onIssueClick(issue.id)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: '600', color: 'var(--text-secondary)' }}>
                  {issue.category?.replace(/_/g, ' ')}
                </span>
                
                {issue.distance !== undefined && issue.distance !== null && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {issue.distance < 1 
                      ? `${Math.round(issue.distance * 1000)}m away` 
                      : `${issue.distance.toFixed(1)}km away`
                    }
                  </span>
                )}
              </div>
              
              <h4 style={{ margin: '0 0 8px 0', fontSize: '1rem', color: 'var(--text-primary)' }}>
                {issue.title}
              </h4>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <IssueStatus status={issue.status} />
                <span style={{ 
                  fontSize: '0.75rem', 
                  padding: '2px 8px', 
                  borderRadius: '12px',
                  backgroundColor: `var(--${getSeverity(issue).toLowerCase()}-light, #f3f4f6)`,
                  color: `var(--${getSeverity(issue).toLowerCase()}-dark, #374151)`,
                  fontWeight: '500'
                }}>
                  {getSeverity(issue)}
                </span>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default NearbyIssueList;
