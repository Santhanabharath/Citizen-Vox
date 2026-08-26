import React, { useState, useEffect } from 'react';
import { Check } from 'lucide-react';
import Button from '../common/Button';
import { confirmationService } from '../../services/confirmationService';
import { useAuth } from '../../hooks/useAuth';

const ConfirmIssueButton = ({ clusterId, reporterId, onConfirmSuccess }) => {
  const { user } = useAuth();
  const [hasConfirmed, setHasConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReporter, setIsReporter] = useState(false);

  useEffect(() => {
    if (!user) return;
    
    if (user.uid === reporterId) {
      setIsReporter(true);
      return;
    }

    const checkStatus = async () => {
      const status = await confirmationService.hasConfirmed(clusterId, user.uid);
      setHasConfirmed(status);
    };
    checkStatus();
  }, [clusterId, user, reporterId]);

  const handleConfirm = async () => {
    if (!user || hasConfirmed || isReporter || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const token = await user.getIdToken();
      await confirmationService.confirmIssue(clusterId, user.uid, token);
      setHasConfirmed(true);
      if (onConfirmSuccess) onConfirmSuccess();
    } catch (error) {
      console.error("Failed to confirm issue:", error);
      alert(error.message || "Failed to confirm issue. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return null;

  if (isReporter) {
    return (
      <div style={{ padding: '0.75rem', background: 'var(--surface-soft)', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center' }}>
        You reported this issue. Your report is counted as evidence.
      </div>
    );
  }

  if (hasConfirmed) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success-dark)', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', fontWeight: '500' }}>
        <Check size={18} /> You confirmed this issue
      </div>
    );
  }

  return (
    <Button 
      variant="primary" 
      onClick={handleConfirm} 
      disabled={isSubmitting}
      style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '0.5rem' }}
    >
      {isSubmitting ? 'Confirming...' : 'Confirm this issue'}
    </Button>
  );
};

export default ConfirmIssueButton;
