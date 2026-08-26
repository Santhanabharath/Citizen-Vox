import React from 'react';

const AdminDashboard = () => {
  return (
    <div className="dashboard">
      <h1 className="text-h2" style={{ marginBottom: '1.5rem' }}>System Administration</h1>
      
      <div style={{ background: 'var(--surface)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', minHeight: '300px' }}>
        <h3 className="text-h3" style={{ marginBottom: '1rem' }}>System Health & Metrics</h3>
        <div className="text-muted text-small" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '200px' }}>
          Metrics placeholder
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
