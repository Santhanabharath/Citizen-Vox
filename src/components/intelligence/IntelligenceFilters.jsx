import React from 'react';

const IntelligenceFilters = ({ timeFilter, setTimeFilter }) => {
  return (
    <div style={{ display: 'flex', gap: '1rem', background: 'var(--surface)', padding: '1rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', marginBottom: '2rem' }}>
      <div style={{ flex: 1 }}>
        <label className="text-small text-secondary" style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>Time Period</label>
        <select 
          value={timeFilter} 
          onChange={(e) => setTimeFilter(parseInt(e.target.value))}
          style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--background)' }}
        >
          <option value={7}>Last 7 Days</option>
          <option value={30}>Last 30 Days</option>
          <option value={90}>Last 90 Days</option>
          <option value={365}>Last Year</option>
        </select>
      </div>
      
      {/* Mock category filter for UI layout purposes - MVP mostly focuses on Time */}
      <div style={{ flex: 1 }}>
        <label className="text-small text-secondary" style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>Category Focus</label>
        <select disabled style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--surface-soft)' }}>
          <option>All Categories</option>
        </select>
      </div>
    </div>
  );
};

export default IntelligenceFilters;
