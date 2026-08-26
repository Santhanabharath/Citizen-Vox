import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ArrowRight } from 'lucide-react';

const IssueCard = ({ issue, showConfidence = false }) => {
  // Use mock or real priority
  const priority = issue.priority?.level || 'Medium';
  const confidence = issue.confidenceScore || 0;
  
  const getPriorityStyle = (level) => {
    switch(level?.toLowerCase()) {
      case 'critical': return { bg: 'var(--danger-soft)', color: 'var(--danger-dark)', border: 'var(--danger-light)' };
      case 'high': return { bg: 'var(--warning-light)', color: 'var(--warning-dark)', border: 'var(--warning)' };
      default: return { bg: 'var(--surface-soft)', color: 'var(--text-secondary)', border: 'var(--border)' };
    }
  };

  const pStyle = getPriorityStyle(priority);

  return (
    <Link to={`/citizen/issues/${issue.id}`} style={{ textDecoration: 'none' }}>
      <div className="card-premium" style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '16px' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {/* Type Icon */}
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--near-black)', color: 'var(--primary-green)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '1.25rem' }}>📍</span>
            </div>
            
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--near-black)', marginBottom: '2px', lineHeight: 1.2 }}>
                {issue.title || 'Civic Issue'}
              </h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                <MapPin size={12} /> {issue.location?.address || 'Location unknown'}
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px', paddingTop: '12px', borderTop: '1px solid var(--border-light)' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <span style={{ background: pStyle.bg, color: pStyle.color, border: `1px solid ${pStyle.border}`, padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>
              {priority}
            </span>
            <span style={{ background: 'var(--surface-soft)', color: 'var(--text-secondary)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 500 }}>
              {issue.status || 'Reported'}
            </span>
          </div>

          <div style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}>
             <ArrowRight size={16} />
          </div>
        </div>

      </div>
    </Link>
  );
};

export default IssueCard;
