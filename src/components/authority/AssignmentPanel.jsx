import React, { useState } from 'react';
import { workflowService } from '../../services/workflowService';
import { useAuth } from '../../hooks/useAuth';
import Button from '../common/Button';

const DEPARTMENTS = [
  'Roads', 'Sanitation', 'Water', 'Drainage', 
  'Electrical', 'Environment', 'Public Safety', 'General'
];

// Placeholder for officer fetch. In a real app, query users collection where role=officer & dept=selected
const DUMMY_OFFICERS = {
  'Roads': [{ id: 'off_r1', name: 'Officer A' }, { id: 'off_r2', name: 'Officer B' }],
  'Sanitation': [{ id: 'off_s1', name: 'Officer C' }],
  'Water': [{ id: 'off_w1', name: 'Officer D' }]
};

const AssignmentPanel = ({ issue, onUpdate }) => {
  const { user } = useAuth();
  const [department, setDepartment] = useState(issue?.assignedDepartment || '');
  const [officer, setOfficer] = useState(issue?.assignedOfficer || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAssign = async () => {
    if (!department) {
      setError('Please select a department');
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      await workflowService.assignIssue(issue.id, department, officer, user.uid, issue.isIndependent);
      if (onUpdate) onUpdate();
    } catch (err) {
      setError('Assignment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const officers = department ? (DUMMY_OFFICERS[department] || [{ id: 'dummy', name: 'No officers found' }]) : [];

  return (
    <div style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
      <h3 className="text-h3" style={{ marginBottom: '1rem' }}>Assignment</h3>
      
      {error && <div style={{ color: 'var(--danger)', fontSize: '0.875rem', marginBottom: '1rem' }}>{error}</div>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label className="text-small text-muted" style={{ display: 'block', marginBottom: '0.25rem' }}>Department</label>
          <select 
            value={department} 
            onChange={(e) => { setDepartment(e.target.value); setOfficer(''); }}
            style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}
          >
            <option value="">Select Department...</option>
            {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        <div>
          <label className="text-small text-muted" style={{ display: 'block', marginBottom: '0.25rem' }}>Officer (Optional)</label>
          <select 
            value={officer} 
            onChange={(e) => setOfficer(e.target.value)}
            disabled={!department}
            style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: !department ? 'var(--surface-soft)' : 'white' }}
          >
            <option value="">Select Officer...</option>
            {officers.map(o => <option key={o.id} value={o.name}>{o.name}</option>)}
          </select>
        </div>

        <Button variant="primary" onClick={handleAssign} disabled={loading || !department} style={{ marginTop: '0.5rem' }}>
          {loading ? 'Assigning...' : 'Confirm Assignment'}
        </Button>
      </div>
    </div>
  );
};

export default AssignmentPanel;
