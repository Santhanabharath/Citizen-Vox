import React, { useState, useEffect } from 'react';
import { Mic, Square, AlertCircle, Edit2, CheckCircle, RotateCcw } from 'lucide-react';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { useLanguage } from '../../hooks/useLanguage';
import Button from '../common/Button';

const VoiceInput = ({ onConfirm, onCancel, initialText = '' }) => {
  const { languageConfig, t } = useLanguage();
  const { 
    isSupported, 
    isListening, 
    transcript, 
    error, 
    startListening, 
    stopListening,
    setTranscript
  } = useSpeechRecognition(languageConfig.speechLocale);
  
  const [view, setView] = useState('idle'); // idle, listening, reviewing, editing

  useEffect(() => {
    if (initialText && view === 'idle') {
      setTranscript(initialText);
      setView('reviewing');
    }
  }, [initialText]);

  // Handle errors
  useEffect(() => {
    if (error) {
      stopListening();
      setView('idle');
    }
  }, [error, stopListening]);

  if (!isSupported) {
    return (
      <div style={{ background: 'var(--surface-soft)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', textAlign: 'center', border: '1px dashed var(--border)' }}>
        <AlertCircle size={32} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
        <p className="text-body" style={{ color: 'var(--text-secondary)' }}>{t('voice.unsupported')}</p>
        <Button variant="outline" onClick={onCancel} style={{ marginTop: '1rem' }}>{t('action.back')}</Button>
      </div>
    );
  }

  const handleStart = () => {
    startListening();
    setView('listening');
  };

  const handleStop = () => {
    stopListening();
    setView('reviewing');
  };

  const handleConfirm = () => {
    if (transcript.trim()) {
      onConfirm(transcript.trim());
    }
  };

  const getErrorMessage = () => {
    if (!error) return null;
    switch (error) {
      case 'denied': return t('voice.denied');
      case 'noSpeech': return t('voice.noSpeech');
      case 'limit': return t('voice.limit');
      default: return t('voice.unsupported');
    }
  };

  return (
    <div style={{ background: 'var(--surface-soft)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
      
      {error && (
        <div style={{ background: 'var(--danger-soft)', color: 'var(--danger-dark)', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem' }}>
          <AlertCircle size={16} />
          {getErrorMessage()}
        </div>
      )}

      {view === 'idle' && (
        <div style={{ textAlign: 'center', padding: '2rem 0' }}>
          <button 
            onClick={handleStart}
            aria-label="Start voice recording"
            style={{ 
              width: '80px', height: '80px', borderRadius: '50%', background: 'var(--primary)', 
              color: 'white', border: 'none', cursor: 'pointer', display: 'flex', 
              alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
            }}
          >
            <Mic size={32} />
          </button>
          <h3 className="text-h3" style={{ margin: '0 0 0.5rem' }}>{t('voice.tapToSpeak')}</h3>
          <p className="text-small text-muted" style={{ margin: 0 }}>Language: {languageConfig.label}</p>
          
          <Button variant="ghost" onClick={onCancel} style={{ marginTop: '1.5rem' }}>
            {t('action.back')}
          </Button>
        </div>
      )}

      {view === 'listening' && (
        <div style={{ textAlign: 'center', padding: '2rem 0' }}>
          <div style={{ position: 'relative', width: '80px', height: '80px', margin: '0 auto 1rem' }}>
            <div style={{ position: 'absolute', inset: -10, borderRadius: '50%', background: 'var(--primary)', opacity: 0.2, animation: 'pulse 1.5s infinite' }} />
            <button 
              onClick={handleStop}
              aria-label="Stop voice recording"
              style={{ 
                position: 'relative', width: '80px', height: '80px', borderRadius: '50%', 
                background: 'var(--danger)', color: 'white', border: 'none', cursor: 'pointer', 
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)', zIndex: 2
              }}
            >
              <Square size={24} fill="currentColor" />
            </button>
          </div>
          
          <h3 className="text-h3" style={{ margin: '0 0 1rem', color: 'var(--primary)' }}>{t('voice.listening')}</h3>
          
          <div style={{ minHeight: '60px', background: 'white', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', textAlign: 'left', fontStyle: 'italic', color: 'var(--text-secondary)' }}>
            {transcript || "..."}
          </div>
        </div>
      )}

      {view === 'reviewing' && (
        <div>
          <h3 className="text-h3" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            Review Transcription
            <button onClick={() => setView('editing')} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.875rem' }}>
              <Edit2 size={14} /> Edit
            </button>
          </h3>
          
          <div style={{ background: 'white', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', marginBottom: '1.5rem', minHeight: '80px' }}>
            {transcript || <span style={{ color: 'var(--text-muted)' }}>No speech captured.</span>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Button variant="outline" onClick={() => { setTranscript(''); setView('idle'); }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <RotateCcw size={18} /> {t('voice.tryAgain')}
            </Button>
            <Button variant="primary" onClick={handleConfirm} disabled={!transcript.trim()} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <CheckCircle size={18} /> {t('voice.useThis')}
            </Button>
          </div>
        </div>
      )}

      {view === 'editing' && (
        <div>
          <h3 className="text-h3" style={{ marginBottom: '1rem' }}>Edit Transcription</h3>
          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            style={{ width: '100%', minHeight: '120px', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--primary)', outline: 'none', marginBottom: '1.5rem', fontFamily: 'inherit', resize: 'vertical' }}
            autoFocus
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Button variant="outline" onClick={() => setView('reviewing')}>Cancel</Button>
            <Button variant="primary" onClick={() => setView('reviewing')}>Save Edits</Button>
          </div>
        </div>
      )}
      
      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.2); opacity: 0.1; }
          100% { transform: scale(1); opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export default VoiceInput;
