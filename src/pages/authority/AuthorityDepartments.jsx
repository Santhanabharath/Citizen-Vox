import React from 'react';
import { Users, AlertCircle, Clock } from 'lucide-react';

const DEPARTMENTS = [
  'Roads', 'Sanitation', 'Water', 'Drainage', 
  'Electrical', 'Environment', 'Public Safety', 'General'
];

const DepartmentCard = ({ name }) => (
  <div style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <h3 className="text-h3" style={{ margin: 0 }}>{name}</h3>
      <div style={{ background: 'var(--surface-soft)', padding: '8px', borderRadius: '8px', color: 'var(--text-secondary)' }}>
        <Users size={20} />
      </div>
    </div>
    
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '0.5rem' }}>
      <div style={{ background: 'var(--surface-soft)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--warning-dark)', marginBottom: '4px' }}>
          <AlertCircle size={14} /> <span style={{ fontSize: '0.75rem', fontWeight: '600' }}>ACTIVE</span>
        </div>
        <div className="text-h2" style={{ margin: 0 }}>—</div>
      </div>
      
      <div style={{ background: 'var(--surface-soft)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--success-dark)', marginBottom: '4px' }}>
          <Clock size={14} /> <span style={{ fontSize: '0.75rem', fontWeight: '600' }}>AVG TIME</span>
        </div>
        <div className="text-small" style={{ margin: 0, fontWeight: '600', color: 'var(--text-muted)' }}>Not enough data</div>
      </div>
    </div>
    
    <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', marginTop: '0.5rem', textAlign: 'center' }}>
      <button style={{ background: 'transparent', border: 'none', color: 'var(--primary)', fontWeight: '500', cursor: 'pointer' }}>
        View Department Queue
      </button>
    </div>
  </div>
);

const AuthorityDepartments = () => {
  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="text-h2">Department Performance</h1>
        <p className="text-muted">Overview of departmental workloads and resolution times.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {DEPARTMENTS.map(dept => (
          <DepartmentCard key={dept} name={dept} />
        ))}
      </div>
    </div>
  );
};

export default AuthorityDepartments;
