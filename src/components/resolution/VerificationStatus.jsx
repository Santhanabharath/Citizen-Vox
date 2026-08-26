import React from 'react';
import { ShieldCheck, ShieldAlert, AlertCircle } from 'lucide-react';

const VerificationStatus = ({ confidence }) => {
  if (!confidence) return null;

  const { score, level, verifiedCount, unresolvedCount } = confidence;

  const getStyle = () => {
    if (score >= 70) return { bg: 'var(--success-soft)', text: 'var(--success-dark)', icon: <ShieldCheck size={24} /> };
    if (score >= 40) return { bg: 'var(--warning-light)', text: 'var(--warning-dark)', icon: <AlertCircle size={24} /> };
    return { bg: 'var(--danger-soft)', text: 'var(--danger-dark)', icon: <ShieldAlert size={24} /> };
  };

  const style = getStyle();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', background: style.bg, padding: '1.25rem', borderRadius: 'var(--radius-lg)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: style.text, fontWeight: '600' }}>
          {style.icon}
          Resolution Confidence
        </div>
        <div className="text-h2" style={{ margin: 0, color: style.text }}>{score}%</div>
      </div>
      
      <div>
        <p style={{ margin: '0 0 4px 0', fontWeight: '600', color: style.text }}>{level}</p>
        <p style={{ margin: 0, fontSize: '0.875rem', color: style.text, opacity: 0.8 }}>
          Based on {verifiedCount} positive verification(s) and {unresolvedCount} unresolved report(s) in this cycle.
        </p>
      </div>
    </div>
  );
};

export default VerificationStatus;
