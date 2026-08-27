import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { analyticsService } from '../../services/analyticsService';
import { workerService } from '../../services/workerService';
import { auditService } from '../../services/auditService';
import { Plus, Edit2, UserX, Activity, CheckCircle, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Workers = () => {
  const { user } = useAuth();
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWorker, setEditingWorker] = useState(null);

  const fetchWorkers = async () => {
    setLoading(true);
    try {
      const data = await analyticsService.getWorkerMetrics(user?.municipalityId);
      setWorkers(data);
    } catch (error) {
      console.error("Failed to load workers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchWorkers();
  }, [user]);

  const handleDeactivate = async (worker) => {
    if (!window.confirm(`Are you sure you want to deactivate ${worker.name}? They will not receive new tasks.`)) return;
    try {
      await workerService.deactivateWorker(worker.id);
      await auditService.logAction(user.uid, user.role, 'DEACTIVATE_WORKER', 'user', worker.id);
      fetchWorkers();
    } catch (err) {
      alert("Failed to deactivate worker.");
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 className="text-h1">Worker Management</h1>
          <p className="text-muted">Manage field workers and view workload metrics.</p>
        </div>
        <button 
          onClick={() => { setEditingWorker(null); setIsModalOpen(true); }}
          style={{ background: 'var(--primary-green)', color: 'var(--near-black)', padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-md)', fontWeight: 600, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Plus size={20} /> Add Worker
        </button>
      </header>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>Loading workers...</div>
      ) : workers.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', background: 'var(--surface)', borderRadius: 'var(--radius-lg)' }}>
          <p className="text-muted">No workers found.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {workers.map(w => (
            <div key={w.id} style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 className="text-h3" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {w.name} 
                  {w.status === 'inactive' && <span style={{ fontSize: '0.75rem', background: 'var(--danger)', color: 'white', padding: '2px 8px', borderRadius: '12px' }}>Inactive</span>}
                </h3>
                <p className="text-small text-muted">{w.email} • {w.departmentId || 'No Department'}</p>
                <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.75rem' }}>
                  <span style={{ fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Clock size={16} /> Active Tasks: {w.activeTasks}</span>
                  <span style={{ fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><CheckCircle size={16} color="var(--success)" /> Completed: {w.completedTasks}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => { setEditingWorker(w); setIsModalOpen(true); }} style={{ padding: '0.5rem', background: 'transparent', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}>
                  <Edit2 size={18} />
                </button>
                {w.status !== 'inactive' && (
                  <button onClick={() => handleDeactivate(w)} style={{ padding: '0.5rem', background: 'transparent', border: '1px solid var(--danger)', color: 'var(--danger)', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}>
                    <UserX size={18} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {isModalOpen && (
          <WorkerModal 
            worker={editingWorker} 
            onClose={() => setIsModalOpen(false)} 
            onSuccess={() => { setIsModalOpen(false); fetchWorkers(); }} 
            adminUser={user} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const WorkerModal = ({ worker, onClose, onSuccess, adminUser }) => {
  const [formData, setFormData] = useState(worker || { name: '', email: '', phone: '', departmentId: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [generatedPassword, setGeneratedPassword] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (worker) {
        await workerService.updateWorker(worker.id, {
          name: formData.name,
          phone: formData.phone,
          departmentId: formData.departmentId
        });
        await auditService.logAction(adminUser.uid, adminUser.role, 'UPDATE_WORKER', 'user', worker.id);
        onSuccess();
      } else {
        const result = await workerService.createWorker({ ...formData, municipalityId: adminUser.municipalityId });
        await auditService.logAction(adminUser.uid, adminUser.role, 'CREATE_WORKER', 'user', result.uid);
        setGeneratedPassword(result.tempPassword);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (generatedPassword) {
    return (
      <ModalOverlay>
        <div style={{ background: 'var(--surface)', padding: '2rem', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '400px' }}>
          <h2 className="text-h2" style={{ color: 'var(--success)', marginBottom: '1rem' }}>Worker Created Successfully</h2>
          <p className="text-muted" style={{ marginBottom: '1rem' }}>Please share this temporary password with the worker securely. They can log in immediately.</p>
          <div style={{ background: 'var(--bg-main)', padding: '1rem', borderRadius: 'var(--radius-md)', fontFamily: 'monospace', fontSize: '1.25rem', textAlign: 'center', marginBottom: '1.5rem', border: '1px solid var(--border)' }}>
            {generatedPassword}
          </div>
          <button onClick={onSuccess} style={{ width: '100%', padding: '0.75rem', background: 'var(--primary-green)', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: 600, cursor: 'pointer' }}>Close</button>
        </div>
      </ModalOverlay>
    );
  }

  return (
    <ModalOverlay>
      <div style={{ background: 'var(--surface)', padding: '2rem', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '500px' }}>
        <h2 className="text-h2" style={{ marginBottom: '1.5rem' }}>{worker ? 'Edit Worker' : 'Add New Worker'}</h2>
        {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{error}</div>}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Full Name *</label>
            <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--bg-main)' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Email Address * {worker && '(Cannot be changed)'}</label>
            <input required type="email" disabled={!!worker} value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--bg-main)' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Phone Number</label>
            <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--bg-main)' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Department ID *</label>
            <input required type="text" placeholder="e.g., roads, water" value={formData.departmentId} onChange={e => setFormData({...formData, departmentId: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--bg-main)' }} />
          </div>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button type="button" onClick={onClose} disabled={loading} style={{ flex: 1, padding: '0.75rem', background: 'transparent', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>Cancel</button>
            <button type="submit" disabled={loading} style={{ flex: 1, padding: '0.75rem', background: 'var(--near-black)', color: 'var(--primary-green)', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer', fontWeight: 600 }}>{loading ? 'Saving...' : 'Save Worker'}</button>
          </div>
        </form>
      </div>
    </ModalOverlay>
  );
};

const ModalOverlay = ({ children }) => (
  <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
      {children}
    </motion.div>
  </div>
);

export default Workers;
