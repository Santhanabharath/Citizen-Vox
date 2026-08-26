import React from 'react';
import { ShieldAlert, AlertTriangle, AlertCircle, Info, BrainCircuit } from 'lucide-react';

const getSeverityDetails = (severity) => {
  switch(severity.toLowerCase()) {
    case 'critical': return { color: 'var(--danger)', bg: 'rgba(239, 68, 68, 0.1)', icon: <ShieldAlert size={16} /> };
    case 'high': return { color: 'var(--warning)', bg: 'rgba(249, 115, 22, 0.1)', icon: <AlertTriangle size={16} /> };
    case 'medium': return { color: 'var(--warning-light)', bg: 'rgba(245, 158, 11, 0.1)', icon: <AlertCircle size={16} /> };
    default: return { color: 'var(--success)', bg: 'rgba(34, 197, 94, 0.1)', icon: <Info size={16} /> };
  }
};

const AIAnalysisCard = ({ aiAnalysis }) => {
  if (!aiAnalysis) return null;

  const severityDetails = getSeverityDetails(aiAnalysis.severity);
  const confidencePercent = Math.round(aiAnalysis.confidence * 100);

  return (
    <div style={{
      background: 'var(--surface)',
      borderRadius: '16px',
      border: '1px solid var(--border)',
      boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
      overflow: 'hidden',
      marginBottom: '2rem'
    }}>
      <div style={{
        padding: '1rem 1.5rem',
        background: 'var(--surface-hover)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
        <BrainCircuit size={18} color="var(--accent)" />
        <span style={{ fontWeight: '600', fontSize: '0.875rem', letterSpacing: '0.5px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
          AI Civic Analysis
        </span>
      </div>

      <div style={{ padding: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
          
          {/* Category & Severity */}
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>Classification</div>
            <div style={{ fontWeight: '600', fontSize: '1.125rem', textTransform: 'capitalize', marginBottom: '4px' }}>
              {aiAnalysis.category.replace('_', ' ')}
            </div>
            <div style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '4px', 
              padding: '4px 8px', 
              borderRadius: '6px',
              backgroundColor: severityDetails.bg,
              color: severityDetails.color,
              fontSize: '0.75rem',
              fontWeight: '600',
              textTransform: 'uppercase'
            }}>
              {severityDetails.icon}
              {aiAnalysis.severity} Severity
            </div>
          </div>

          {/* Department */}
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>Recommended Dept.</div>
            <div style={{ fontWeight: '500', fontSize: '1rem', textTransform: 'capitalize' }}>
              {aiAnalysis.recommendedDepartment}
            </div>
          </div>

          {/* Confidence */}
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>AI Confidence</div>
            <div style={{ display: 'flex', alignItems: 'end', gap: '4px' }}>
              <span style={{ fontWeight: '600', fontSize: '1.25rem', lineHeight: 1 }}>{confidencePercent}%</span>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', paddingBottom: '2px' }}>
                {confidencePercent > 89 ? 'High' : confidencePercent > 69 ? 'Moderate' : 'Low'}
              </span>
            </div>
          </div>
        </div>

        <div style={{ padding: '1rem', background: 'var(--surface-soft)', borderRadius: '8px', marginBottom: '1.5rem' }}>
          <p style={{ margin: 0, fontSize: '0.9375rem', lineHeight: 1.5, color: 'var(--text-primary)' }}>
            "{aiAnalysis.summary}"
          </p>
        </div>

        {aiAnalysis.reasoning && aiAnalysis.reasoning.length > 0 && (
          <div>
            <h4 style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', fontWeight: '600' }}>
              Why AI classified this:
            </h4>
            <ul style={{ margin: 0, paddingLeft: '1.25rem', color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.6 }}>
              {aiAnalysis.reasoning.map((reason, idx) => (
                <li key={idx}>{reason}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIAnalysisCard;
