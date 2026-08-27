import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/config';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { taskService } from '../../services/taskService';
import { auditService } from '../../services/auditService';
import { useAuth } from '../../hooks/useAuth';
import Button from '../common/Button';

const DEPARTMENTS = [
  { id: 'roads', name: 'Roads & Transport' },
  { id: 'sanitation', name: 'Sanitation' },
  { id: 'water', name: 'Water Supply' },
  { id: 'drainage', name: 'Drainage' },
  { id: 'electrical', name: 'Electrical / Streetlights' },
];

const AssignmentPanel = ({ issue, onUpdate }) => {
  const { user } = useAuth();
  const [department, setDepartment] = useState(issue?.assignedDepartmentId || issue?.departmentId || '');
  const [worker, setWorker] = useState(issue?.assignedWorkerId || '');
  const [workersList, setWorkersList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingWorkers, setLoadingWorkers] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchWorkers = async () => {
      if (!department) {
        setWorkersList([]);
        return;
      }
      setLoadingWorkers(true);
      try {
        let q = query(
          collection(db, 'users'), 
          where('role', '==', 'worker'),
          where('departmentId', '==', department)
        );
        if (user?.municipalityId) {
          q = query(q, where('municipalityId', '==', user.municipalityId));
        }
        
        const snap = await getDocs(q);
        const fetched = [];
        snap.forEach(doc => {
          if (doc.data().status !== 'inactive') {
            fetched.push({ id: doc.id, ...doc.data() });
          }
        });
        setWorkersList(fetched);
      } catch (err) {
        console.error("Failed to fetch workers:", err);
      } finally {
        setLoadingWorkers(false);
      }
    };

    fetchWorkers();
  }, [department, user?.municipalityId]);

  const handleAssign = async () => {
    if (!department || !worker) {
      setError('Please select both department and worker');
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      await taskService.assignTask(issue.id, worker, department, user.municipalityId, user.uid);
      await auditService.logAction(user.uid, user.role, 'ASSIGN_TASK', 'issue', issue.id, { workerId: worker });
      if (onUpdate) onUpdate();
    } catch (err) {
      setError('Assignment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
      <h3 className="text-h3" style={{ marginBottom: '1rem' }}>Assignment</h3>
      
      {error && <div style={{ color: 'var(--danger)', fontSize: '0.875rem', marginBottom: '1rem' }}>{error}</div>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label className="text-small text-muted" style={{ display: 'block', marginBottom: '0.25rem' }}>Department</label>
          <select 
            value={department} 
            onChange={(e) => { setDepartment(e.target.value); setWorker(''); }}
            style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--bg-main)' }}
          >
            <option value="">Select Department...</option>
            {DEPARTMENTS.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>

        <div>
          <label className="text-small text-muted" style={{ display: 'block', marginBottom: '0.25rem' }}>Worker</label>
          <select 
            value={worker} 
            onChange={(e) => setWorker(e.target.value)}
            disabled={!department || loadingWorkers}
            style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: (!department || loadingWorkers) ? 'var(--surface-soft)' : 'var(--bg-main)' }}
          >
            <option value="">{loadingWorkers ? 'Loading workers...' : 'Select Worker...'}</option>
            {workersList.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
          </select>
          {!loadingWorkers && department && workersList.length === 0 && (
            <p style={{ fontSize: '0.75rem', color: 'var(--danger)', marginTop: '0.25rem' }}>No active workers found in this department.</p>
          )}
        </div>

        <Button variant="primary" onClick={handleAssign} disabled={loading || !department || !worker} style={{ marginTop: '0.5rem' }}>
          {loading ? 'Assigning...' : 'Confirm Assignment'}
        </Button>
      </div>
    </div>
  );
};

export default AssignmentPanel;
