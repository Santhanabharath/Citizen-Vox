import React from 'react';
import { CheckCircle } from 'lucide-react';

const ConfidenceBreakdown = ({ factors = [] }) => {
  if (!factors || factors.length === 0) return null;

  return (
    <div style={{ marginTop: '1.5rem' }}>
      <h4 style={{ fontSize: '0.9375rem', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
        Why this confidence?
      </h4>
      <div style={{ 
        background: 'var(--surface-soft)', 
        borderRadius: '12px', 
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem'
      }}>
        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
          Supported by:
        </div>
        {factors.map((factor, index) => (
          <div key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-primary)' }}>
            <CheckCircle size={16} color="var(--success-dark)" style={{ marginTop: '2px', flexShrink: 0 }} />
            <span>{factor}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConfidenceBreakdown;
