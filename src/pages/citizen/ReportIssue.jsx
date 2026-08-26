import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, MapPin, ArrowLeft, Send, Mic, Activity, Droplet, Trash2, Zap, AlertTriangle, MessageSquare } from 'lucide-react';
import { issueService } from '../../services/issueService';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/common/Button';

const CATEGORIES = [
  { id: 'road_damage', label: 'Road Damage', icon: <Activity size={24} /> },
  { id: 'garbage', label: 'Garbage', icon: <Trash2 size={24} /> },
  { id: 'water_leakage', label: 'Water Leakage', icon: <Droplet size={24} /> },
  { id: 'drainage', label: 'Drainage', icon: <AlertTriangle size={24} /> },
  { id: 'street_light', label: 'Street Light', icon: <Zap size={24} /> },
  { id: 'other', label: 'Other', icon: <MessageSquare size={24} /> },
];

const ReportIssue = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    category: '',
    title: '',
    description: '',
    location: null,
    images: []
  });

  const [voiceMode, setVoiceMode] = useState(false);
  const [listening, setListening] = useState(false);

  // Simplified navigation for this demo
  const nextStep = () => setStep(s => Math.min(s + 1, 4));
  const prevStep = () => {
    if (voiceMode) setVoiceMode(false);
    else setStep(s => Math.max(s - 1, 1));
  };

  const handleCategorySelect = (id) => {
    setFormData({ ...formData, category: id });
  };

  const submitReport = async () => {
    setLoading(true);
    try {
      const mockLocation = { latitude: 20.5937, longitude: 78.9629, address: 'Demo Address' };
      await issueService.createIssue({
        ...formData,
        location: mockLocation,
        userId: user.uid,
        userName: user.displayName || 'Citizen'
      });
      navigate('/citizen/issues');
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  // --- Voice UI Overlay ---
  if (voiceMode) {
    return (
      <div style={{ background: 'var(--near-black)', minHeight: '100vh', color: 'var(--white)', padding: '24px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
          <button onClick={() => setVoiceMode(false)} style={{ background: 'none', border: 'none', color: 'var(--white)', padding: '8px', cursor: 'pointer' }}>
            <ArrowLeft size={24} />
          </button>
          <span style={{ fontSize: '1rem', fontWeight: 600, marginLeft: '1rem' }}>Describe the issue</span>
        </div>
        
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ 
            width: '160px', height: '160px', borderRadius: '50%', 
            background: listening ? 'var(--primary-green)' : 'rgba(143,234,99,0.1)', 
            border: `2px solid ${listening ? 'var(--primary-green)' : 'rgba(143,234,99,0.3)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: listening ? '0 0 40px rgba(143,234,99,0.4)' : 'none',
            color: listening ? 'var(--near-black)' : 'var(--primary-green)',
            transition: 'all 0.3s ease', cursor: 'pointer'
          }} onClick={() => setListening(!listening)}>
            <Mic size={64} />
          </div>
          <p style={{ marginTop: '2rem', fontSize: '1.25rem', fontWeight: 600 }}>{listening ? 'Listening...' : 'Tap to speak'}</p>
          {listening && (
            <div style={{ display: 'flex', gap: '4px', alignItems: 'center', height: '24px', marginTop: '1rem' }}>
              {/* Fake waveform */}
              {[1, 3, 2, 4, 2, 3, 1].map((h, i) => (
                <div key={i} style={{ width: '4px', background: 'var(--primary-green)', borderRadius: '2px', height: `${h * 8}px`, animation: 'pulse 1s infinite alternate', animationDelay: `${i * 0.1}s` }}></div>
              ))}
            </div>
          )}
        </div>
        
        <div style={{ padding: '24px 0' }}>
          <Button variant="primary" style={{ width: '100%', padding: '16px' }} onClick={() => { setVoiceMode(false); nextStep(); }}>Done</Button>
        </div>
      </div>
    );
  }

  // --- Normal UI ---
  return (
    <div style={{ paddingBottom: '80px', maxWidth: '600px', margin: '0 auto', background: 'var(--off-white)', minHeight: '100vh' }}>
      
      {/* Header */}
      <div style={{ background: 'var(--near-black)', padding: '24px 24px 32px', color: 'var(--white)', borderRadius: '0 0 24px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
          <button onClick={() => { if(step > 1) prevStep(); else navigate('/citizen'); }} style={{ background: 'none', border: 'none', color: 'var(--white)', padding: '4px', cursor: 'pointer' }}>
            <ArrowLeft size={24} />
          </button>
          <span style={{ flex: 1, textAlign: 'center', fontSize: '1rem', fontWeight: 600, marginRight: '32px' }}>Report an issue</span>
        </div>
        
        {/* Progress Tracker */}
        <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', maxWidth: '300px', margin: '0 auto' }}>
          <div style={{ position: 'absolute', top: '14px', left: '0', right: '0', height: '2px', background: 'rgba(255,255,255,0.1)', zIndex: 0 }}></div>
          <div style={{ position: 'absolute', top: '14px', left: '0', width: `${((step - 1) / 3) * 100}%`, height: '2px', background: 'var(--primary-green)', zIndex: 0, transition: 'width 0.3s ease' }}></div>
          
          {[1, 2, 3, 4].map(num => (
            <div key={num} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, gap: '8px' }}>
              <div style={{ 
                width: '28px', height: '28px', borderRadius: '50%', 
                background: step >= num ? 'var(--primary-green)' : 'var(--near-black)',
                border: `2px solid ${step >= num ? 'var(--primary-green)' : 'rgba(255,255,255,0.2)'}`,
                color: step >= num ? 'var(--near-black)' : 'var(--text-secondary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700
              }}>
                {num}
              </div>
              <span style={{ fontSize: '0.65rem', color: step >= num ? 'var(--white)' : 'var(--text-secondary)' }}>
                {['Category', 'Details', 'Location', 'Review'][num-1]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '24px' }}>
        
        {step === 1 && (
          <div>
            <h2 className="text-h3" style={{ textAlign: 'center', marginBottom: '24px' }}>What kind of issue is it?</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {CATEGORIES.map(cat => {
                const isSelected = formData.category === cat.id;
                return (
                  <div key={cat.id} 
                    onClick={() => handleCategorySelect(cat.id)}
                    style={{ 
                      background: isSelected ? 'rgba(143,234,99,0.1)' : 'var(--white)',
                      border: `1px solid ${isSelected ? 'var(--primary-green)' : 'var(--border-light)'}`,
                      borderRadius: '16px', padding: '24px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', cursor: 'pointer', transition: 'all 0.2s ease',
                      boxShadow: isSelected ? '0 0 0 1px var(--primary-green)' : 'var(--shadow-sm)'
                    }}
                  >
                    <div style={{ color: isSelected ? 'var(--primary-green)' : 'var(--text-secondary)' }}>{cat.icon}</div>
                    <span style={{ fontSize: '0.875rem', fontWeight: isSelected ? 600 : 500, color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{cat.label}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-h3" style={{ marginBottom: '24px' }}>Provide details</h2>
            <div className="card-premium" style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px', borderStyle: 'dashed' }}>
              <div style={{ textAlign: 'center', cursor: 'pointer' }}>
                <Camera size={32} style={{ color: 'var(--text-secondary)', margin: '0 auto 12px' }} />
                <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Take a Photo</span>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
              <button onClick={() => setVoiceMode(true)} style={{ flex: 1, background: 'var(--near-black)', color: 'var(--white)', border: 'none', padding: '16px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 600, cursor: 'pointer' }}>
                <Mic size={20} /> Use Voice
              </button>
            </div>

            <input 
              type="text" 
              placeholder="Issue title" 
              value={formData.title} 
              onChange={e => setFormData({...formData, title: e.target.value})}
              style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-light)', marginBottom: '16px', fontSize: '1rem', background: 'var(--white)' }}
            />
            <textarea 
              placeholder="Description (optional)" 
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-light)', fontSize: '1rem', background: 'var(--white)', minHeight: '120px' }}
            />
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="text-h3" style={{ marginBottom: '24px' }}>Confirm location</h2>
            <div className="card-premium" style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#e5e5e5' }}>
              <MapPin size={40} color="var(--primary-green)" />
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <h2 className="text-h3" style={{ marginBottom: '24px' }}>Review & Submit</h2>
            <div className="card-premium" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Category</span>
                <p style={{ fontWeight: 600, marginTop: '4px' }}>{formData.category || 'Road Damage'}</p>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Title</span>
                <p style={{ fontWeight: 600, marginTop: '4px' }}>{formData.title || 'Pothole on main road'}</p>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>Location</span>
                <p style={{ fontWeight: 600, marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={16}/> Demo Address</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Action */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, padding: '16px 24px 32px', background: 'var(--off-white)', borderTop: '1px solid var(--border-light)' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', gap: '16px' }}>
          {step > 1 && (
            <Button variant="outline" style={{ flex: 1, padding: '16px' }} onClick={prevStep}>Back</Button>
          )}
          <Button 
            variant="primary" 
            style={{ flex: 2, padding: '16px', fontSize: '1.125rem' }} 
            onClick={step === 4 ? submitReport : nextStep}
            disabled={loading || (step === 1 && !formData.category)}
          >
            {loading ? 'Submitting...' : step === 4 ? 'Submit Report' : 'Next'}
          </Button>
        </div>
      </div>

    </div>
  );
};

export default ReportIssue;
