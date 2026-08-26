import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar } from 'lucide-react';
import PriorityBadge from '../priority/PriorityBadge';
import TaskStatus from './TaskStatus';

const WorkerTaskCard = ({ task }) => {
  const navigate = useNavigate();
  
  const dateStr = task.assignedAt?.toDate 
    ? new Date(task.assignedAt.toDate()).toLocaleDateString()
    : (task.createdAt?.toDate ? new Date(task.createdAt.toDate()).toLocaleDateString() : 'N/A');

  return (
    <div 
      onClick={() => navigate(`/worker/tasks/${task.id}`)}
      style={{ 
        background: 'var(--surface)', 
        padding: '1.25rem', 
        borderRadius: 'var(--radius-lg)', 
        border: '1px solid var(--border)', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '0.75rem',
        boxShadow: 'var(--shadow-sm)',
        cursor: 'pointer',
        WebkitTapHighlightColor: 'transparent'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <PriorityBadge level={task.priority?.level} score={task.priority?.finalScore} />
        <TaskStatus status={task.currentStatus} />
      </div>

      <div style={{ marginTop: '0.25rem' }}>
        <h3 className="text-h3" style={{ margin: '0 0 4px 0', fontSize: '1.125rem' }}>{task.title}</h3>
        <span className="text-small text-muted" style={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {task.category?.replace('_', ' ')}
        </span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', paddingTop: '0.75rem', borderTop: '1px dashed var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
          <MapPin size={14} /> Location Evidence
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
          <Calendar size={14} /> {dateStr}
        </div>
      </div>
    </div>
  );
};

export default WorkerTaskCard;
