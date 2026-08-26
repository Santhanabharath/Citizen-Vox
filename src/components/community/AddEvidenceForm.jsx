import React, { useState } from 'react';
import MediaUploader from '../citizen/MediaUploader';
import Button from '../common/Button';
import { evidenceService } from '../../services/evidenceService';
import { useAuth } from '../../hooks/useAuth';

const AddEvidenceForm = ({ clusterId, onEvidenceAdded }) => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [media, setMedia] = useState([]);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (media.length === 0) return;
    setIsSubmitting(true);
    
    try {
      const token = await user.getIdToken();
      await evidenceService.addEvidence(clusterId, user.uid, { media, description }, token);
      
      setMedia([]);
      setDescription('');
      setIsOpen(false);
      if (onEvidenceAdded) onEvidenceAdded();
    } catch (err) {
      console.error(err);
      alert('Failed to submit evidence');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    return (
      <Button variant="outline" onClick={() => setIsOpen(true)} style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
        Add Evidence Photo
      </Button>
    );
  }

  return (
    <div style={{ background: 'var(--surface-soft)', padding: '1rem', borderRadius: 'var(--radius-md)', marginTop: '1rem' }}>
      <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.9375rem' }}>Upload Photo Evidence</h4>
      
      <MediaUploader media={media} setMedia={setMedia} />
      
      <div style={{ marginTop: '1rem' }}>
        <input 
          type="text" 
          placeholder="Optional description..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{ width: '100%', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border)', outline: 'none' }}
        />
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
        <Button variant="ghost" style={{ flex: 1 }} onClick={() => setIsOpen(false)} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button variant="primary" style={{ flex: 1 }} onClick={handleSubmit} disabled={isSubmitting || media.length === 0}>
          {isSubmitting ? 'Uploading...' : 'Submit'}
        </Button>
      </div>
    </div>
  );
};

export default AddEvidenceForm;
