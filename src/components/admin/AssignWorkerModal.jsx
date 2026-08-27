import React, { useState, useEffect } from 'react';
import { db } from '../../firebase/config';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { taskService } from '../../services/taskService';
import { motion } from 'framer-motion';

const AssignWorkerModal = ({ issue, adminUser, onClose, onSuccess }) => {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedWorker, setSelectedWorker] = useState('');
  const [departmentId, setDepartmentId] = useState(issue.departmentId || 'roads');
  const [deadline, setDeadline] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWorkers = async () => {
      setLoading(true);
      try {
        let q = query(
          collection(db, 'users'), 
          where('role', '==', 'worker'),
          where('departmentId', '==', departmentId)
        );
        
        if (adminUser.municipalityId) {
          q = query(q, where('municipalityId', '==', adminUser.municipalityId));
        }
        
        const snap = await getDocs(q);
        const fetched = [];
        snap.forEach(doc => {
          if (doc.data().status !== 'inactive') {
             fetched.push({ id: doc.id, ...doc.data() });
          }
        });
        setWorkers(fetched);
      } catch (err) {
        console.error("Failed to load workers:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchWorkers();
  }, [departmentId, adminUser.municipalityId]);

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!selectedWorker) {
      setError("Please select a worker.");
      return;
    }
    
    setAssigning(true);
    setError(null);
    try {
      await taskService.assignTask(
        issue.id, 
        selectedWorker, 
        departmentId, 
        adminUser.municipalityId, 
        adminUser.uid, 
        deadline
      );
      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ background: 'var(--surface)', padding: '2rem', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '500px' }}>
        <h2 className="text-h2" style={{ marginBottom: '1.5rem' }}>Assign Task</h2>
        {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem', padding: '0.75rem', background: 'rgba(239,68,68,0.1)', borderRadius: 'var(--radius-sm)' }}>{error}</div>}
        
        <form onSubmit={handleAssign} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Department</label>
            <select value={departmentId} onChange={e => {setDepartmentId(e.target.value); setSelectedWorker('');}} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--bg-main)' }}>
              <option value="roads">Roads & Transport</option>
              <option value="water">Water Supply</option>
              <option value="sanitation">Sanitation</option>
              <option value="drainage">Drainage</option>
              <option value="electrical">Electrical / Streetlights</option>
            </select>
          </div>
          
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Select Worker</label>
            <select required value={selectedWorker} onChange={e => setSelectedWorker(e.target.value)} disabled={loading} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--bg-main)' }}>
              <option value="">{loading ? 'Loading...' : 'Select a worker'}</option>
              {workers.map(w => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
            {!loading && workers.length === 0 && <p style={{ fontSize: '0.75rem', color: 'var(--danger)', marginTop: '0.25rem' }}>No active workers found in this department.</p>}
          </div>
          
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Deadline (Optional)</label>
            <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--bg-main)' }} />
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button type="button" onClick={onClose} disabled={assigning} style={{ flex: 1, padding: '0.75rem', background: 'transparent', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>Cancel</button>
            <button type="submit" disabled={assigning || !selectedWorker} style={{ flex: 1, padding: '0.75rem', background: 'var(--near-black)', color: 'var(--primary-green)', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 600 }}>{assigning ? 'Assigning...' : 'Assign Task'}</button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default AssignWorkerModal;
