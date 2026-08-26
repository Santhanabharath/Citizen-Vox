import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { taskService } from '../../services/taskService';
import WorkerTaskCard from '../../components/worker/WorkerTaskCard';
import { Filter } from 'lucide-react';

const WorkerTasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('Active'); // Active, All, Completed

  useEffect(() => {
    const fetchTasks = async () => {
      if (user) {
        const result = await taskService.getWorkerTasks(user.uid);
        
        // Sort by Priority DESC as requested
        result.sort((a, b) => {
          const scoreA = a.priority?.finalScore || 0;
          const scoreB = b.priority?.finalScore || 0;
          return scoreB - scoreA;
        });

        setTasks(result);
      }
      setLoading(false);
    };
    fetchTasks();
  }, [user]);

  const filteredTasks = tasks.filter(t => {
    const isCompleted = ['Completed by Worker', 'Awaiting Verification', 'Verified Resolved', 'Resolved'].includes(t.currentStatus);
    
    if (filter === 'All') return true;
    if (filter === 'Completed') return isCompleted;
    // Active
    return !isCompleted;
  });

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading tasks...</div>;

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '0.5rem' }}>
        <h1 className="text-h2" style={{ margin: 0 }}>My Tasks</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--surface)', padding: '4px 8px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
          <Filter size={14} color="var(--text-secondary)" />
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            style={{ border: 'none', background: 'transparent', fontSize: '0.75rem', fontWeight: '500', outline: 'none' }}
          >
            <option value="Active">Active</option>
            <option value="Completed">Completed</option>
            <option value="All">All</option>
          </select>
        </div>
      </div>

      {filteredTasks.length === 0 ? (
        <div style={{ background: 'var(--surface)', padding: '3rem 1.5rem', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--border)', textAlign: 'center' }}>
          <h3 className="text-h3" style={{ marginBottom: '0.5rem' }}>You're all caught up.</h3>
          <p className="text-muted" style={{ margin: 0 }}>No active civic tasks are assigned to you.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredTasks.map(task => (
            <WorkerTaskCard key={task.id} task={task} />
          ))}
        </div>
      )}
    </div>
  );
};

export default WorkerTasks;
