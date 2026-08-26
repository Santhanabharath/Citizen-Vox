import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const AIProcessingState = ({ isRetry = false }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '3rem 1rem',
      background: 'var(--surface-soft)',
      borderRadius: 'var(--radius-lg)',
      border: '1px dashed var(--border)',
      textAlign: 'center',
      marginTop: '2rem'
    }}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
        style={{ color: 'var(--accent)', marginBottom: '1rem' }}
      >
        <Loader2 size={32} />
      </motion.div>
      <h3 style={{ fontSize: '1.125rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
        Analyzing Civic Issue
      </h3>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>
        {isRetry ? "Re-evaluating report data..." : "Checking your report to categorize and prioritize it..."}
      </p>
    </div>
  );
};

export default AIProcessingState;
