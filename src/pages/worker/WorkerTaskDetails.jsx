import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Navigation } from 'lucide-react';
import { taskService } from '../../services/taskService';
import { useAuth } from '../../hooks/useAuth';
import TaskStatus from '../../components/worker/TaskStatus';
import PriorityBadge from '../../components/priority/PriorityBadge';
import WorkCompletionForm from '../../components/worker/WorkCompletionForm';
import Button from '../../components/common/Button';

const WorkerTaskDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchTask = async () => {
    setLoading(true);
    try {
      const data = await taskService.getTaskDetails(id);
      if (data) setTask(data);
      else setError("Task not found.");
    } catch (err) {
      setError("Failed to load task.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTask();
  }, [id]);

  const handleAccept = async () => {
    setActionLoading(true);
    try {
      await taskService.acceptTask(id, user.uid);
      await fetchTask();
    } catch (err) {
      setError(err.message || "Failed to accept task. Another worker may have claimed it.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleStart = async () => {
    setActionLoading(true);
    try {
      await taskService.startTask(id, user.uid);
      await fetchTask();
    } catch (err) {
      setError("Failed to start task.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleComplete = async (completionData) => {
    setActionLoading(true);
    try {
      await taskService.completeTask(
        id, 
        user.uid, 
        completionData.workDescription, 
        completionData.beforeEvidence, 
        completionData.afterEvidence
      );
      await fetchTask();
    } catch (err) {
      setError("Failed to submit completion.");
    } finally {
      setActionLoading(false);
    }
  };

  const openDirections = () => {
    if (task?.latitude && task?.longitude) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${task.latitude},${task.longitude}`, '_blank');
    }
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading task...</div>;
  if (error || !task) return <div style={{ padding: '2rem', color: 'var(--danger)' }}>{error || "Task not found."}</div>;

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button onClick={() => navigate('/worker/tasks')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', padding: '0.5rem', margin: '-0.5rem', cursor: 'pointer' }}>
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-h3" style={{ margin: 0, flex: 1 }}>Task Details</h1>
        <TaskStatus status={task.currentStatus} />
      </div>

      {/* Task Info Card */}
      <div style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <span className="text-small text-muted" style={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {task.category?.replace('_', ' ')}
            </span>
            <h2 className="text-h2" style={{ marginTop: '0.25rem', marginBottom: '0.5rem', fontSize: '1.25rem' }}>{task.title}</h2>
          </div>
          {task.priority && <PriorityBadge level={task.priority.level} score={task.priority.finalScore} />}
        </div>
        
        <p className="text-body" style={{ color: 'var(--text-secondary)', margin: 0, whiteSpace: 'pre-wrap' }}>
          {task.description}
        </p>
      </div>

      {/* Location Card */}
      {task.latitude && task.longitude && (
        <div style={{ background: 'var(--surface)', padding: '1.25rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', fontWeight: '500' }}>
            <MapPin size={20} color="var(--primary)" /> View on Map
          </div>
          <Button variant="outline" size="small" onClick={openDirections} style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <Navigation size={14} /> Directions
          </Button>
        </div>
      )}

      {/* Execution Workflow */}
      <div style={{ marginTop: '1rem' }}>
        {task.currentStatus === 'Assigned' && (
          <Button variant="primary" onClick={handleAccept} disabled={actionLoading} style={{ width: '100%', padding: '1rem', fontSize: '1.125rem' }}>
            {actionLoading ? 'Accepting...' : 'Accept Task'}
          </Button>
        )}

        {task.currentStatus === 'Accepted' && (
          <Button variant="primary" onClick={handleStart} disabled={actionLoading} style={{ width: '100%', padding: '1rem', fontSize: '1.125rem' }}>
            {actionLoading ? 'Starting...' : 'Start Work'}
          </Button>
        )}

        {task.currentStatus === 'In Progress' && (
          <WorkCompletionForm workerId={user.uid} onComplete={handleComplete} />
        )}

        {task.currentStatus === 'Completed by Worker' && (
          <div style={{ background: 'var(--success-soft)', color: 'var(--success-dark)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', textAlign: 'center', fontWeight: '600' }}>
            Work completion submitted. Pending verification.
          </div>
        )}
      </div>

    </div>
  );
};

export default WorkerTaskDetails;
