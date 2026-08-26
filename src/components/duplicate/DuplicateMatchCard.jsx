import React from 'react';
import { AlertTriangle, MapPin, CheckCircle, XCircle } from 'lucide-react';
import Button from '../common/Button';

const DuplicateMatchCard = ({ matchData, onConfirmMatch, onRejectMatch }) => {
  if (!matchData || !matchData.potentialMatch || !matchData.matchedCandidate) return null;

  const candidate = matchData.matchedCandidate;
  const scorePercent = Math.round(matchData.matchScore * 100);
  
  let matchLabel = "Possible Match";
  if (scorePercent >= 85) matchLabel = "High Potential Match";
  else if (scorePercent < 65) matchLabel = "Unlikely Match"; // Shouldn't happen based on backend logic, but safe fallback

  return (
    <div style={{
      background: 'var(--surface)',
      borderRadius: '16px',
      border: '1px solid var(--border)',
      boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
      overflow: 'hidden',
      marginBottom: '2rem'
    }}>
      <div style={{
        padding: '1rem 1.5rem',
        background: 'rgba(249, 115, 22, 0.1)', // Soft orange for potential match
        borderBottom: '1px solid rgba(249, 115, 22, 0.2)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        color: 'var(--warning-dark)'
      }}>
        <AlertTriangle size={18} />
        <span style={{ fontWeight: '600', fontSize: '0.875rem' }}>
          Possible Existing Issue Found
        </span>
      </div>

      <div style={{ padding: '1.5rem' }}>
        <p style={{ margin: '0 0 1rem 0', fontSize: '0.9375rem', color: 'var(--text-secondary)' }}>
          We found an existing report that may describe the same problem you just submitted.
        </p>
        
        <div style={{ 
          background: 'var(--surface-soft)', 
          padding: '1.25rem', 
          borderRadius: '12px',
          marginBottom: '1.5rem',
          border: '1px solid var(--border)'
        }}>
          <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '1.125rem', color: 'var(--text-primary)' }}>
            {candidate.title}
          </h4>
          
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <MapPin size={14} /> {candidate.distanceStr} away
            </div>
            <div style={{ padding: '2px 8px', background: 'var(--surface)', borderRadius: '4px', textTransform: 'capitalize' }}>
              {candidate.category.replace('_', ' ')}
            </div>
            <div style={{ fontWeight: '600', color: 'var(--warning-dark)' }}>
              {scorePercent}% {matchLabel}
            </div>
          </div>

          {matchData.reasoning && matchData.reasoning.length > 0 && (
            <div>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '4px', letterSpacing: '0.5px' }}>
                AI Match Reasoning
              </div>
              <ul style={{ margin: 0, paddingLeft: '1.25rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                {matchData.reasoning.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '1rem', flexDirection: 'column' }}>
          <Button 
            variant="primary" 
            style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '8px' }}
            onClick={() => onConfirmMatch(candidate.id, candidate.issueClusterId)}
          >
            <CheckCircle size={18} /> Yes, this is the same issue
          </Button>
          <Button 
            variant="outline" 
            style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '8px' }}
            onClick={onRejectMatch}
          >
            <XCircle size={18} /> No, this is a different issue
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DuplicateMatchCard;
