import React from 'react';
import { ShieldCheck, ShieldAlert, Shield } from 'lucide-react';

const CommunityConfidence = ({ score = 0, level = "Low Evidence" }) => {
  let color = 'var(--text-muted)';
  let bg = 'var(--surface-soft)';
  let Icon = Shield;

  if (score >= 85) {
    color = 'var(--success-dark)';
    bg = 'rgba(16, 185, 129, 0.1)';
    Icon = ShieldCheck;
  } else if (score >= 70) {
    color = 'var(--primary)';
    bg = 'rgba(59, 130, 246, 0.1)';
    Icon = ShieldCheck;
  } else if (score >= 40) {
    color = 'var(--warning-dark)';
    bg = 'rgba(249, 115, 22, 0.1)';
    Icon = ShieldAlert;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
      <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.5px', fontWeight: '600' }}>
        Community Confidence
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <span style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--text-primary)', lineHeight: 1 }}>
          {score}%
        </span>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '4px', 
          padding: '4px 10px', 
          borderRadius: '16px', 
          background: bg, 
          color: color,
          fontSize: '0.875rem',
          fontWeight: '600'
        }}>
          <Icon size={16} />
          {level}
        </div>
      </div>
    </div>
  );
};

export default CommunityConfidence;
