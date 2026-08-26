import React from 'react';

const PriorityBadge = ({ level, score }) => {
  if (!level) return null;

  let color = 'var(--text-muted)';
  let bg = 'var(--surface-soft)';
  
  if (level === 'Critical') {
    color = 'var(--danger)';
    bg = 'rgba(239, 68, 68, 0.1)';
  } else if (level === 'High') {
    color = 'var(--warning-dark)';
    bg = 'rgba(249, 115, 22, 0.1)';
  } else if (level === 'Medium') {
    color = '#d97706';
    bg = 'rgba(245, 158, 11, 0.1)';
  } else if (level === 'Low') {
    color = 'var(--success-dark)';
    bg = 'rgba(16, 185, 129, 0.1)';
  }

  return (
    <span style={{
      fontSize: '0.75rem',
      fontWeight: '700',
      padding: '2px 8px',
      background: bg,
      color: color,
      borderRadius: '12px',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px'
    }}>
      {level.toUpperCase()}
      {score !== undefined && <span style={{ opacity: 0.8, fontWeight: '500' }}>{score}</span>}
    </span>
  );
};

export default PriorityBadge;
