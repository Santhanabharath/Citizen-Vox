import React, { useState } from 'react';
import { Camera, Loader, CheckCircle } from 'lucide-react';
import { taskEvidenceService } from '../../services/taskEvidenceService';

const WorkCompletionForm = ({ workerId, onComplete }) => {
  const [beforePhoto, setBeforePhoto] = useState(null);
  const [afterPhoto, setAfterPhoto] = useState(null);
  const [workDescription, setWorkDescription] = useState('');
  
  const [uploadingBefore, setUploadingBefore] = useState(false);
  const [uploadingAfter, setUploadingAfter] = useState(false);
  
  const [beforeEvidence, setBeforeEvidence] = useState(null);
  const [afterEvidence, setAfterEvidence] = useState(null);

  const [error, setError] = useState('');
  
  const handlePhotoCapture = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    setError('');
    
    // Create local preview immediately
    const previewUrl = URL.createObjectURL(file);
    if (type === 'before') {
      setBeforePhoto(previewUrl);
      setUploadingBefore(true);
    } else {
      setAfterPhoto(previewUrl);
      setUploadingAfter(true);
    }

    try {
      const evidenceData = await taskEvidenceService.uploadEvidence(file, workerId, type);
      if (type === 'before') {
        setBeforeEvidence(evidenceData);
      } else {
        setAfterEvidence(evidenceData);
      }
    } catch (err) {
      setError(`Failed to upload ${type} photo. Please try again.`);
      if (type === 'before') setBeforePhoto(null);
      if (type === 'after') setAfterPhoto(null);
    } finally {
      if (type === 'before') setUploadingBefore(false);
      if (type === 'after') setUploadingAfter(false);
    }
  };

  const isFormValid = beforeEvidence && afterEvidence && workDescription.trim().length > 0;

  const handleSubmit = () => {
    if (isFormValid) {
      onComplete({ workDescription, beforeEvidence, afterEvidence });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', background: 'var(--surface)', padding: '1rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
      {error && <div style={{ color: 'white', background: 'var(--danger)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', fontSize: '0.875rem' }}>{error}</div>}
      
      {/* Before Evidence */}
      <div>
        <h4 className="text-small" style={{ fontWeight: '600', marginBottom: '0.5rem' }}>1. Before Work</h4>
        {!beforePhoto ? (
          <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', height: '120px', background: 'var(--surface-soft)', border: '2px dashed var(--border)', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>
            <Camera size={24} color="var(--text-secondary)" />
            <span className="text-small text-muted">Take Before Photo</span>
            <input 
              type="file" 
              accept="image/*" 
              capture="environment" 
              style={{ display: 'none' }} 
              onChange={(e) => handlePhotoCapture(e, 'before')}
            />
          </label>
        ) : (
          <div style={{ position: 'relative', height: '150px', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
            <img src={beforePhoto} alt="Before" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            {uploadingBefore ? (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                <Loader className="animate-spin" />
              </div>
            ) : (
              <div style={{ position: 'absolute', top: 8, right: 8, background: 'var(--success)', color: 'white', padding: '4px', borderRadius: '50%' }}>
                <CheckCircle size={16} />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Work Notes */}
      <div>
        <h4 className="text-small" style={{ fontWeight: '600', marginBottom: '0.5rem' }}>2. Work Performed</h4>
        <textarea
          value={workDescription}
          onChange={(e) => setWorkDescription(e.target.value)}
          placeholder="e.g., Filled pothole and repaired road surface..."
          style={{ width: '100%', minHeight: '100px', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', resize: 'vertical' }}
        />
      </div>

      {/* After Evidence */}
      <div>
        <h4 className="text-small" style={{ fontWeight: '600', marginBottom: '0.5rem' }}>3. After Work</h4>
        {!afterPhoto ? (
          <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', height: '120px', background: 'var(--surface-soft)', border: '2px dashed var(--border)', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>
            <Camera size={24} color="var(--text-secondary)" />
            <span className="text-small text-muted">Take After Photo</span>
            <input 
              type="file" 
              accept="image/*" 
              capture="environment" 
              style={{ display: 'none' }} 
              onChange={(e) => handlePhotoCapture(e, 'after')}
            />
          </label>
        ) : (
          <div style={{ position: 'relative', height: '150px', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
            <img src={afterPhoto} alt="After" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            {uploadingAfter ? (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                <Loader className="animate-spin" />
              </div>
            ) : (
              <div style={{ position: 'absolute', top: 8, right: 8, background: 'var(--success)', color: 'white', padding: '4px', borderRadius: '50%' }}>
                <CheckCircle size={16} />
              </div>
            )}
          </div>
        )}
      </div>

      <button 
        onClick={handleSubmit} 
        disabled={!isFormValid || uploadingBefore || uploadingAfter}
        style={{ 
          width: '100%', 
          padding: '1rem', 
          background: isFormValid ? 'var(--primary)' : 'var(--surface-soft)', 
          color: isFormValid ? 'white' : 'var(--text-muted)', 
          border: 'none', 
          borderRadius: 'var(--radius-md)', 
          fontWeight: '600', 
          fontSize: '1rem',
          cursor: isFormValid ? 'pointer' : 'not-allowed',
          marginTop: '0.5rem'
        }}
      >
        Submit Completion
      </button>
    </div>
  );
};

export default WorkCompletionForm;
