import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { db } from '../../firebase/config';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { ClipboardList, MapPin, Clock } from 'lucide-react';

const WorkerDashboard = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        if (!user) return;
        const q = query(
          collection(db, 'issueClusters'),
          where('assignedWorker', '==', user.uid)
        );
        const snapshot = await getDocs(q);
        const fetchedTasks = [];
        snapshot.forEach(doc => fetchedTasks.push({ id: doc.id, ...doc.data() }));
        
        // Sort in memory to avoid needing complex composite indexes for MVP
        fetchedTasks.sort((a, b) => b.priority?.finalScore - a.priority?.finalScore);
        
        setTasks(fetchedTasks);
      } catch (err) {
        console.error("Failed to load worker tasks:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="spinner" style={{ width: '40px', height: '40px', border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
      </div>
    );
  }

  return (
    <div style={{ padding: '1rem', maxWidth: '600px', margin: '0 auto', paddingBottom: '5rem' }}>
      <header style={{ marginBottom: '1.5rem' }}>
        <h1 className="text-h2">My Work Orders</h1>
        <p className="text-muted text-small">Assigned by {user?.department || 'Department'}</p>
      </header>

      {tasks.length === 0 ? (
        <div style={{ padding: '3rem 1rem', textAlign: 'center', background: 'var(--surface)', borderRadius: 'var(--radius-lg)' }}>
          <ClipboardList size={40} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
          <h3 className="text-h3">No pending tasks</h3>
          <p className="text-muted text-small mt-1">You currently have no active work orders assigned to you.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {tasks.map(task => (
            <Link 
              key={task.id} 
              to={`/worker/tasks/${task.id}`}
              style={{ 
                display: 'block', 
                background: 'var(--surface)', 
                padding: '1.25rem', 
                borderRadius: 'var(--radius-lg)', 
                textDecoration: 'none', 
                color: 'inherit',
                border: '1px solid var(--border)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <span style={{ 
                  padding: '0.2rem 0.6rem', 
                  borderRadius: 'var(--radius-full)', 
                  fontSize: '0.7rem', 
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  background: task.currentStatus === 'In Progress' ? 'var(--warning)' : 'var(--surface-soft)',
                  color: task.currentStatus === 'In Progress' ? 'black' : 'var(--text-primary)'
                }}>
                  {task.currentStatus || 'Assigned'}
                </span>
                <span className="text-small text-muted" style={{ fontWeight: '600', color: task.priority?.level === 'Critical' ? 'var(--danger)' : 'inherit' }}>
                  {task.priority?.level || 'Normal'}
                </span>
              </div>
              
              <h3 className="text-body" style={{ fontWeight: '600', marginBottom: '0.5rem', lineHeight: '1.3' }}>{task.title}</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <span className="text-small text-muted" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <MapPin size={12} /> {task.locationName || 'Location pending'}
                </span>
                <span className="text-small text-muted" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Clock size={12} /> {new Date(task.createdAt?.seconds * 1000).toLocaleDateString()}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default WorkerDashboard;
