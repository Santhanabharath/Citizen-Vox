import React from 'react';

const TrendChart = ({ categories }) => {
  if (!categories || Object.keys(categories).length === 0) {
    return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Not enough data</div>;
  }

  const sortedCategories = Object.entries(categories)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5); // Top 5

  const max = Math.max(...sortedCategories.map(c => c[1]));

  return (
    <div style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
      <h3 className="text-h3" style={{ marginBottom: '1.5rem' }}>Top Category Distribution</h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {sortedCategories.map(([cat, count]) => {
          const percentage = Math.round((count / max) * 100);
          return (
            <div key={cat}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 500, textTransform: 'capitalize' }}>{cat.replace('_', ' ')}</span>
                <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{count}</span>
              </div>
              <div style={{ width: '100%', height: '8px', background: 'var(--surface-soft)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${percentage}%`, height: '100%', background: 'var(--accent)', borderRadius: '4px' }}></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TrendChart;
