import React, { useCallback, useState } from 'react';
import { UploadCloud, X } from 'lucide-react';
import { CloudinaryService } from '../../services/cloudinary';

export const MediaUploader = ({ media, setMedia }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setIsUploading(true);
    setError(null);
    
    const newMedia = [...media];

    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        setError('Please upload only images.');
        continue;
      }

      try {
        const uploadedImage = await CloudinaryService.uploadImage(file);
        newMedia.push({
          url: uploadedImage.url,
          publicId: uploadedImage.publicId,
          type: 'image'
        });
      } catch (err) {
        setError('Failed to upload image. Please try again.');
        console.error(err);
      }
    }

    setMedia(newMedia);
    setIsUploading(false);
  };

  const removeMedia = (index) => {
    const updated = media.filter((_, i) => i !== index);
    setMedia(updated);
  };

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
        {media.map((item, idx) => (
          <div key={idx} style={{ position: 'relative', width: '100%', paddingBottom: '100%', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border)' }}>
            <img src={item.url} alt="upload preview" style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'cover' }} />
            <button
              type="button"
              onClick={() => removeMedia(idx)}
              style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              <X size={14} />
            </button>
          </div>
        ))}

        {media.length < 3 && (
          <label style={{
            position: 'relative',
            width: '100%',
            paddingBottom: '100%',
            borderRadius: 'var(--radius-md)',
            border: '2px dashed var(--border)',
            backgroundColor: 'var(--surface-soft)',
            cursor: isUploading ? 'wait' : 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{ position: 'absolute', top: '0', left: '0', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
              {isUploading ? (
                <span className="text-small">Uploading...</span>
              ) : (
                <>
                  <UploadCloud size={24} style={{ marginBottom: '0.5rem' }} />
                  <span className="text-small">Add Image</span>
                </>
              )}
            </div>
            <input 
              type="file" 
              accept="image/*" 
              multiple 
              onChange={handleFileChange} 
              disabled={isUploading}
              style={{ display: 'none' }} 
            />
          </label>
        )}
      </div>
      {error && <p className="text-small" style={{ color: 'var(--danger)' }}>{error}</p>}
    </div>
  );
};

export default MediaUploader;
