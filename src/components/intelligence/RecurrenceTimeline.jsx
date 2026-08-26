import React from 'react';

const RecurrenceTimeline = ({ recurrenceGroup }) => {
  if (!recurrenceGroup || !recurrenceGroup.issues) return null;

  return (
    <div style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <span style={{ background: 'var(--accent-light)', color: 'var(--accent-dark)', border: '1px solid var(--accent)', padding: '4px 8px', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>
          {recurrenceGroup.level}
        </span>
        <h3 className="text-h3" style={{ marginTop: '0.75rem', textTransform: 'capitalize' }}>
          {recurrenceGroup.category?.replace('_', ' ')}
        </h3>
        <p className="text-small text-muted" style={{ marginTop: '0.25rem' }}>
          Area: {recurrenceGroup.lat}, {recurrenceGroup.lng}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', background: 'var(--surface-soft)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Occurrences</div>
          <div style={{ fontSize: '1.125rem', fontWeight: 600 }}>{recurrenceGroup.occurrenceCount}</div>
        </div>
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Avg Interval</div>
          <div style={{ fontSize: '1.125rem', fontWeight: 600 }}>~{Math.round(recurrenceGroup.averageIntervalDays)} days</div>
        </div>
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Score</div>
          <div style={{ fontSize: '1.125rem', fontWeight: 600 }}>{recurrenceGroup.recurrenceScore}</div>
        </div>
      </div>

      <div style={{ position: 'relative', marginTop: '1rem', paddingLeft: '1rem', borderLeft: '2px solid var(--border)' }}>
        {recurrenceGroup.issues.map((issue, idx) => {
          const date = issue.createdAt?.toDate ? issue.createdAt.toDate() : new Date(issue.createdAt);
          return (
            <div key={idx} style={{ position: 'relative', marginBottom: idx === recurrenceGroup.issues.length - 1 ? 0 : '1.5rem' }}>
              <div style={{ position: 'absolute', left: '-1.35rem', top: '0.25rem', width: '12px', height: '12px', borderRadius: '50%', background: 'var(--accent)', border: '2px solid var(--surface)' }}></div>
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{issue.title || "Issue Reported"}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', padding: '4px 8px', background: 'var(--surface-soft)', display: 'inline-block', borderRadius: 'var(--radius-sm)' }}>
                  Status: {issue.status}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecurrenceTimeline;
