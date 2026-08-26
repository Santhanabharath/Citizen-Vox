import React from 'react';
import { Sparkles, AlertCircle } from 'lucide-react';
import AIProcessingState from '../ai/AIProcessingState';
import Button from '../common/Button';

const AIInsightCard = ({ insight, loading, onGenerate, error }) => {
  return (
    <div style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <h3 className="text-h3" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={20} color="var(--primary)" /> AI Insights
        </h3>
        {!insight && !loading && (
          <Button variant="primary" onClick={onGenerate} style={{ fontSize: '0.75rem', padding: '6px 12px' }}>
            Generate Insight
          </Button>
        )}
      </div>

      {loading && (
        <div style={{ padding: '2rem 0' }}>
          <AIProcessingState status="analyzing" message="Analyzing civic intelligence metrics..." />
        </div>
      )}

      {error && (
        <div style={{ display: 'flex', gap: '8px', padding: '1rem', background: 'var(--danger-soft)', color: 'var(--danger-dark)', borderRadius: 'var(--radius-md)', fontSize: '0.875rem' }}>
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {insight && !loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p style={{ fontSize: '0.9375rem', lineHeight: 1.6 }}>{insight.summary}</p>
          
          {insight.observations && insight.observations.length > 0 && (
            <div>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Key Observations</h4>
              <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.875rem', color: 'var(--text-primary)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {insight.observations.map((obs, i) => (
                  <li key={i}>{obs}</li>
                ))}
              </ul>
            </div>
          )}

          {insight.limitations && insight.limitations.length > 0 && (
            <div style={{ marginTop: '0.5rem', padding: '0.75rem', background: 'var(--surface-soft)', borderRadius: 'var(--radius-md)' }}>
              <h4 style={{ fontSize: '0.75rem', fontWeight: 600, marginBottom: '0.25rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Limitations</h4>
              <ul style={{ margin: 0, paddingLeft: '1rem', fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {insight.limitations.map((lim, i) => (
                  <li key={i}>{lim}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {!insight && !loading && !error && (
        <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          Click generate to analyze current dashboard metrics with Gemini.
        </div>
      )}
    </div>
  );
};

export default AIInsightCard;
