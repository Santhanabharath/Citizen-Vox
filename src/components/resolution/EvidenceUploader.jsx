import React, { useState, useRef } from 'react';
import { UploadCloud, CheckCircle, XCircle } from 'lucide-react';
import { CloudinaryService } from '../../services/cloudinary';

const EvidenceUploader = ({ label, onUpload, defaultImage = null }) => {
  const [image, setImage] = useState(defaultImage);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError("Please select a valid image file.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await CloudinaryService.uploadImage(file);
      setImage(result.url);
      onUpload(result.url);
    } catch (err) {
      console.error(err);
      setError("Failed to upload image.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <label className="text-body" style={{ fontWeight: '600', display: 'block', marginBottom: '0.75rem' }}>
        {label}
      </label>
      
      {image ? (
        <div style={{ position: 'relative', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border)', height: '200px' }}>
          <img src={image} alt="Evidence" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <button 
            type="button"
            onClick={() => {
              setImage(null);
              onUpload(null);
            }}
            style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', borderRadius: '50%', padding: '0.25rem', cursor: 'pointer', display: 'flex' }}
          >
            <XCircle size={20} />
          </button>
          <div style={{ position: 'absolute', bottom: '0.5rem', left: '0.5rem', background: 'var(--success)', color: 'black', padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <CheckCircle size={14} /> Uploaded
          </div>
        </div>
      ) : (
        <div 
          onClick={() => fileInputRef.current?.click()}
          style={{ 
            border: '2px dashed var(--border)', 
            borderRadius: 'var(--radius-md)', 
            padding: '3rem 1rem', 
            textAlign: 'center',
            cursor: loading ? 'wait' : 'pointer',
            background: 'var(--surface-hover)',
            transition: 'border-color 0.2s'
          }}
          onMouseEnter={(e) => !loading && (e.currentTarget.style.borderColor = 'var(--text-primary)')}
          onMouseLeave={(e) => !loading && (e.currentTarget.style.borderColor = 'var(--border)')}
        >
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
              <div className="spinner" style={{ width: '24px', height: '24px', border: '2px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
              <p className="text-small text-muted">Uploading...</p>
            </div>
          ) : (
            <>
              <UploadCloud size={32} color="var(--text-muted)" style={{ margin: '0 auto 0.5rem' }} />
              <p className="text-body" style={{ color: 'var(--text-secondary)' }}>Click to upload {label.toLowerCase()}</p>
            </>
          )}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*" 
            style={{ display: 'none' }} 
            disabled={loading}
          />
        </div>
      )}
      {error && <p style={{ color: 'var(--danger)', fontSize: '0.875rem', marginTop: '0.5rem' }}>{error}</p>}
    </div>
  );
};

export default EvidenceUploader;
