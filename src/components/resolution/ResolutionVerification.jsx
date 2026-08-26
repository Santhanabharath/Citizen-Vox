import React, { useState } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import BeforeAfterViewer from './BeforeAfterViewer';
import ResolutionFeedback from './ResolutionFeedback';
import Button from '../common/Button';
import { resolutionService } from '../../services/resolutionService';
import { useAuth } from '../../hooks/useAuth';

const ResolutionVerification = ({ issue, onVerificationComplete }) => {
  const { user } = useAuth();
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!user) return null;

  const handleVerify = async () => {
    setLoading(true);
    setError('');
    try {
      await resolutionService.submitVerification(
        issue.issueClusterId || issue.id, 
        user.uid, 
        issue.completedBy,
        issue.verificationCycle || 1
      );
      if (onVerificationComplete) onVerificationComplete();
    } catch (err) {
      setError(err.message || "Failed to submit verification.");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async (reason, note, media) => {
    setLoading(true);
    setError('');
    try {
      await resolutionService.submitRejection(
        issue.issueClusterId || issue.id, 
        user.uid, 
        issue.completedBy,
        issue.verificationCycle || 1,
        reason,
        note,
        media
      );
      setShowFeedbackForm(false);
      if (onVerificationComplete) onVerificationComplete();
    } catch (err) {
      setError(err.message || "Failed to submit feedback.");
    } finally {
      setLoading(false);
    }
  };

  if (issue.completedBy === user.uid) {
    return (
      <div style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', textAlign: 'center' }}>
        <p className="text-small text-muted" style={{ margin: 0 }}>You cannot verify your own work completion.</p>
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--primary)', borderTop: '4px solid var(--primary)' }}>
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <h3 className="text-h2" style={{ margin: '0 0 0.5rem 0', color: 'var(--primary-dark)' }}>Verify Resolution</h3>
        <p className="text-body" style={{ margin: 0, color: 'var(--text-secondary)' }}>
          Work has been reported as completed. Please check the evidence below and verify if the issue is actually resolved.
        </p>
      </div>

      <BeforeAfterViewer 
        beforeEvidence={issue.beforeEvidence} 
        afterEvidence={issue.afterEvidence} 
        workDescription={issue.workDescription} 
      />

      {error && <div style={{ background: 'var(--danger)', color: 'white', padding: '0.75rem', borderRadius: '4px', fontSize: '0.875rem', marginTop: '1.5rem', textAlign: 'center' }}>{error}</div>}

      <div style={{ marginTop: '2rem' }}>
        {!showFeedbackForm ? (
          <div>
            <h4 className="text-h3" style={{ textAlign: 'center', marginBottom: '1rem' }}>Has this issue been resolved?</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <Button 
                variant="primary" 
                onClick={handleVerify} 
                disabled={loading}
                style={{ width: '100%', padding: '1rem', fontSize: '1.125rem', display: 'flex', justifyContent: 'center', gap: '8px', background: 'var(--success)', borderColor: 'var(--success)' }}
              >
                <CheckCircle size={20} />
                {loading ? 'Submitting...' : "Yes, it's resolved"}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => setShowFeedbackForm(true)} 
                disabled={loading}
                style={{ width: '100%', padding: '1rem', fontSize: '1.125rem', display: 'flex', justifyContent: 'center', gap: '8px', color: 'var(--danger)', borderColor: 'var(--danger)' }}
              >
                <XCircle size={20} />
                No, the problem remains
              </Button>
            </div>
          </div>
        ) : (
          <ResolutionFeedback 
            onSubmit={handleReject} 
            onCancel={() => setShowFeedbackForm(false)} 
            loading={loading} 
          />
        )}
      </div>
    </div>
  );
};

export default ResolutionVerification;
