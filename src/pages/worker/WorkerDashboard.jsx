import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Navigation, Clock, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { taskService } from '../../services/taskService';
import Button from '../../components/common/Button';

const WorkerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [completedCount, setCompletedCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, [user]);

  const fetchTasks = async () => {
    if (!user) return;
    try {
      const allTasks = await taskService.getWorkerTasks(user.uid);
      const activeTasks = allTasks.filter(t => t.currentStatus !== 'Awaiting Verification' && t.currentStatus !== 'Verified Resolved');
      const completedTasks = allTasks.filter(t => t.currentStatus === 'Awaiting Verification' || t.currentStatus === 'Verified Resolved');
      
      setTasks(activeTasks.slice(0, 3));
      setCompletedCount(completedTasks.length);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ paddingBottom: '80px', maxWidth: '600px', margin: '0 auto', background: 'var(--off-white)', minHeight: '100vh' }}>
      
      {/* Dark Header */}
      <div style={{ padding: '24px 24px 32px', background: 'var(--near-black)', color: 'var(--white)', borderRadius: '0 0 24px 24px', marginBottom: '24px' }}>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Field Operations,</p>
        <h1 className="text-h2" style={{ marginBottom: '8px' }}>{user?.displayName || 'Worker'}</h1>
        
        <div style={{ display: 'flex', gap: '16px', marginTop: '24px' }}>
          <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '16px', border: '1px solid var(--border-dark)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Active Tasks</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '4px' }}>{tasks.length}</div>
          </div>
          <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '16px', border: '1px solid var(--border-dark)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>Completed</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '4px', color: 'var(--success)' }}>{completedCount}</div>
          </div>
        </div>
      </div>

      <div style={{ padding: '0 24px' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 className="text-h4">Current Assignment</h3>
          <Link to="/worker/tasks" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}>
            View All <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Loading tasks...</div>
        ) : tasks.length === 0 ? (
          <div className="card-premium" style={{ textAlign: 'center', padding: '2rem' }}>
            <CheckCircle size={40} style={{ color: 'var(--success)', margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '8px' }}>All caught up!</h3>
            <p className="text-small text-muted">You have no active tasks assigned.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {tasks.map(task => {
              const priority = task.priority?.level || 'Medium';
              const isCritical = priority.toLowerCase() === 'critical';
              
              return (
                <div key={task.id} className="card-premium" style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <span style={{ 
                      background: isCritical ? 'var(--danger-soft)' : 'var(--warning-light)', 
                      color: isCritical ? 'var(--danger-dark)' : 'var(--warning-dark)', 
                      padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 700 
                    }}>
                      {priority.toUpperCase()}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, background: 'var(--surface-soft)', padding: '4px 8px', borderRadius: '4px' }}>
                      {task.status || 'Assigned'}
                    </span>
                  </div>
                  
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '8px', lineHeight: 1.3 }}>{task.issueTitle || 'Assigned Task'}</h3>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '20px' }}>
                    <MapPin size={16} /> {task.location?.address || 'Location provided'}
                  </div>

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <Button variant="outline" style={{ flex: 1, padding: '12px' }}>
                       <Navigation size={18} />
                    </Button>
                    <Button variant="primary" style={{ flex: 3, padding: '12px' }} onClick={() => navigate(`/worker/tasks/${task.id}`)}>
                       View Details
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};

export default WorkerDashboard;
