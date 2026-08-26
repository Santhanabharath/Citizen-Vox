import React, { useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp, Info, Activity } from 'lucide-react';
import { PRIORITY_CONFIG } from '../../config/priorityConfig';
import Button from '../common/Button';

const PriorityCard = ({ priority, onRefresh, loading }) => {
  const [showDetails, setShowDetails] = useState(false);

  if (!priority) return null;

  const { finalScore = 0, level = 'Unknown', factors = [], aiContext = '' } = priority;

  // Determine colors based on level
  let color = 'var(--text-muted)';
  let bg = 'var(--surface-soft)';
  
  if (level === 'Critical') {
    color = 'var(--danger)'; // e.g., red/orange
    bg = 'rgba(239, 68, 68, 0.1)';
  } else if (level === 'High') {
    color = 'var(--warning-dark)'; // e.g., orange
    bg = 'rgba(249, 115, 22, 0.1)';
  } else if (level === 'Medium') {
    color = '#d97706'; // e.g., amber
    bg = 'rgba(245, 158, 11, 0.1)';
  } else if (level === 'Low') {
    color = 'var(--success-dark)'; // e.g., green/neutral
    bg = 'rgba(16, 185, 129, 0.1)';
  }

  return (
    <div style={{ 
      background: 'var(--surface)', 
      borderRadius: 'var(--radius-lg)', 
      border: `1px solid ${bg}`, 
      boxShadow: 'var(--shadow-sm)',
      overflow: 'hidden',
      marginBottom: '2rem'
    }}>
      {/* Header section */}
      <div style={{ padding: '1.5rem', background: bg, borderBottom: '1px solid rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '700', color: color, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <Activity size={16} /> CIVIC PRIORITY
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
            <h2 style={{ margin: 0, fontSize: '2rem', fontWeight: '800', color: 'var(--text-primary)' }}>{level.toUpperCase()}</h2>
            <span style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--text-secondary)' }}>{finalScore} <span style={{ fontSize: '0.875rem', fontWeight: 'normal' }}>/ 100</span></span>
          </div>
        </div>
        
        {onRefresh && (
          <Button variant="outline" size="small" onClick={onRefresh} disabled={loading} style={{ background: 'white' }}>
            {loading ? 'Analyzing...' : 'Refresh AI Priority'}
          </Button>
        )}
      </div>

      {/* Body section */}
      <div style={{ padding: '1.5rem' }}>
        <h4 style={{ margin: '0 0 12px 0', fontSize: '0.9375rem', color: 'var(--text-primary)' }}>Why this matters</h4>
        <ul style={{ margin: 0, padding: '0 0 0 1.25rem', color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: '1.6' }}>
          {factors.map((factor, idx) => (
            <li key={idx} style={{ marginBottom: '4px' }}>{factor}</li>
          ))}
        </ul>

        {aiContext && (
          <div style={{ 
            marginTop: '1.25rem', 
            padding: '1rem', 
            background: 'var(--surface-soft)', 
            borderRadius: '8px', 
            fontSize: '0.875rem',
            borderLeft: `4px solid ${color}`
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px' }}>
              <Info size={16} /> AI Context
            </div>
            <p style={{ margin: 0, color: 'var(--text-secondary)' }}>{aiContext}</p>
          </div>
        )}

        {/* Toggle details */}
        <div style={{ marginTop: '1.5rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
          <button 
            onClick={() => setShowDetails(!showDetails)}
            style={{ 
              background: 'none', border: 'none', padding: 0, 
              display: 'flex', alignItems: 'center', gap: '6px', 
              color: 'var(--primary)', fontSize: '0.875rem', fontWeight: '500', cursor: 'pointer'
            }}
          >
            {showDetails ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            {showDetails ? 'Hide scoring details' : 'View scoring details'}
          </button>
          
          {showDetails && (
            <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--surface-hover)', borderRadius: '8px', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>Deterministic Base Score:</span>
                <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{priority.baseScore}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>AI Contextual Adjustment:</span>
                <span style={{ fontWeight: '600', color: priority.aiAdjustment > 0 ? 'var(--danger)' : (priority.aiAdjustment < 0 ? 'var(--success-dark)' : 'var(--text-primary)') }}>
                  {priority.aiAdjustment > 0 ? '+' : ''}{priority.aiAdjustment || 0}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '8px', marginTop: '8px' }}>
                <span>Final Clamped Score:</span>
                <span style={{ fontWeight: '700', color: 'var(--text-primary)' }}>{finalScore}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PriorityCard;
