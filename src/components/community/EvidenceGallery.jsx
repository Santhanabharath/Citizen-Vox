import React, { useState, useEffect } from 'react';
import { evidenceService } from '../../services/evidenceService';

const EvidenceGallery = ({ clusterId }) => {
  const [evidenceItems, setEvidenceItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvidence = async () => {
      if (!clusterId) return;
      const items = await evidenceService.getEvidenceForCluster(clusterId);
      setEvidenceItems(items);
      setLoading(false);
    };
    fetchEvidence();
  }, [clusterId]);

  if (loading) return <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Loading evidence...</div>;
  
  const allMedia = evidenceItems.flatMap(item => item.media || []);

  if (allMedia.length === 0) return null;

  return (
    <div style={{ marginTop: '1.5rem' }}>
      <h4 style={{ fontSize: '0.9375rem', color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
        Community Photos
      </h4>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', 
        gap: '0.5rem' 
      }}>
        {allMedia.map((media, idx) => (
          <div key={idx} style={{ 
            aspectRatio: '1', 
            borderRadius: '8px', 
            overflow: 'hidden',
            border: '1px solid var(--border)'
          }}>
            <img 
              src={media.url} 
              alt="Community Evidence" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default EvidenceGallery;
