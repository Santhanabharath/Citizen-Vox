import React from 'react';
import { MapPin, AlertTriangle } from 'lucide-react';
import Button from '../common/Button';

const HotspotCard = ({ hotspot, onClick }) => {
  const isCritical = hotspot.hotspotScore >= 75;
  const isHotspot = hotspot.hotspotScore >= 50;
  
  const getBadgeStyle = () => {
    if (isCritical) return { bg: 'var(--danger-soft)', color: 'var(--danger-dark)', border: 'var(--danger-light)' };
    if (isHotspot) return { bg: 'var(--warning-light)', color: 'var(--warning-dark)', border: 'var(--warning)' };
    return { bg: '#fef08a', color: '#854d0e', border: '#fde047' }; // Yellow
  };

  const badge = getBadgeStyle();

  return (
    <div style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <span style={{ background: badge.bg, color: badge.color, border: `1px solid ${badge.border}`, padding: '4px 8px', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
            {hotspot.level}
          </span>
          <h3 className="text-h3" style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <MapPin size={16} /> Area: {hotspot.lat}, {hotspot.lng}
          </h3>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: badge.color, lineHeight: 1 }}>{hotspot.hotspotScore}</div>
          <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-secondary)', fontWeight: 600 }}>Score</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
        <div style={{ background: 'var(--surface-soft)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{hotspot.issueCount}</div>
          <div className="text-small text-muted">Civic Issues</div>
        </div>
        <div style={{ background: 'var(--surface-soft)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, textTransform: 'capitalize' }}>{hotspot.topCategory?.replace('_', ' ')}</div>
          <div className="text-small text-muted">Top Category</div>
        </div>
      </div>

      {isCritical && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--danger-dark)', fontSize: '0.875rem', fontWeight: 500 }}>
          <AlertTriangle size={16} /> High concentration of urgent issues.
        </div>
      )}

      {/* onClick passed from parent if they want to drill down */}
      <Button variant="outline" style={{ width: '100%', marginTop: 'auto' }} onClick={onClick}>
        View Details
      </Button>
    </div>
  );
};

export default HotspotCard;
