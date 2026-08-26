import React, { useState } from 'react';
import { Camera, Loader, AlertTriangle } from 'lucide-react';
import { CloudinaryService } from '../../services/cloudinary';
import Button from '../common/Button';

const ResolutionFeedback = ({ onSubmit, onCancel, loading }) => {
  const [reason, setReason] = useState('');
  const [note, setNote] = useState('');
  const [photo, setPhoto] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [media, setMedia] = useState(null);
  const [error, setError] = useState('');

  const REASONS = [
    "Problem was not fixed at all",
    "Only partially fixed",
    "Problem returned quickly",
    "Wrong issue was repaired",
    "New related problem caused",
    "Other"
  ];

  const handlePhotoCapture = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setError('');
    const previewUrl = URL.createObjectURL(file);
    setPhoto(previewUrl);
    setUploading(true);

    try {
      const cloudinaryResult = await CloudinaryService.uploadImage(file);
      setMedia({
        url: cloudinaryResult.url,
        publicId: cloudinaryResult.publicId,
        type: 'rejection_evidence'
      });
    } catch (err) {
      setError("Failed to upload photo. Please try again.");
      setPhoto(null);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = () => {
    if (!reason) {
      setError("Please select a reason.");
      return;
    }
    onSubmit(reason, note, media);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', background: 'var(--surface-soft)', padding: '1.25rem', borderRadius: 'var(--radius-lg)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--danger)', fontWeight: '600' }}>
        <AlertTriangle size={20} />
        Report Unresolved Issue
      </div>
      
      {error && <div style={{ background: 'var(--danger)', color: 'white', padding: '0.75rem', borderRadius: '4px', fontSize: '0.875rem' }}>{error}</div>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <label className="text-small" style={{ fontWeight: '600' }}>What is still wrong? *</label>
        <select 
          value={reason} 
          onChange={e => setReason(e.target.value)}
          style={{ padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}
        >
          <option value="">Select a reason...</option>
          {REASONS.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <label className="text-small" style={{ fontWeight: '600' }}>Additional Details (Optional)</label>
        <textarea 
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="Please describe what still needs to be done..."
          style={{ padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', minHeight: '80px', resize: 'vertical' }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <label className="text-small" style={{ fontWeight: '600' }}>Evidence Photo (Optional)</label>
        {!photo ? (
          <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', height: '100px', background: 'white', border: '2px dashed var(--border)', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>
            <Camera size={20} color="var(--text-secondary)" />
            <span className="text-small text-muted">Take Photo</span>
            <input 
              type="file" 
              accept="image/*" 
              capture="environment" 
              style={{ display: 'none' }} 
              onChange={handlePhotoCapture}
            />
          </label>
        ) : (
          <div style={{ position: 'relative', height: '120px', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
            <img src={photo} alt="Current condition" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            {uploading && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                <Loader className="animate-spin" />
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
        <Button variant="outline" onClick={onCancel} style={{ flex: 1 }} disabled={loading || uploading}>
          Cancel
        </Button>
        <Button 
          variant="primary" 
          onClick={handleSubmit} 
          disabled={!reason || loading || uploading} 
          style={{ flex: 2, background: 'var(--danger)', borderColor: 'var(--danger)' }}
        >
          {loading ? 'Submitting...' : 'Reopen Issue'}
        </Button>
      </div>

    </div>
  );
};

export default ResolutionFeedback;
