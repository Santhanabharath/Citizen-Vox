import React from 'react';

const TaskStatus = ({ status }) => {
  const getStatusColor = () => {
    switch(status) {
      case 'Assigned': return { bg: '#e0e7ff', text: '#3730a3' }; // Indigo
      case 'Accepted': return { bg: '#dbeafe', text: '#1e40af' }; // Blue
      case 'In Progress': return { bg: '#fef3c7', text: '#92400e' }; // Amber
      case 'Completed by Worker': return { bg: '#dcfce7', text: '#166534' }; // Green
      case 'Resolved': return { bg: '#d1fae5', text: '#065f46' }; // Emerald
      default: return { bg: 'var(--surface-soft)', text: 'var(--text-secondary)' };
    }
  };

  const colors = getStatusColor();

  return (
    <span style={{ 
      background: colors.bg, 
      color: colors.text, 
      padding: '4px 8px', 
      borderRadius: '4px', 
      fontSize: '0.75rem', 
      fontWeight: '600',
      display: 'inline-flex',
      alignItems: 'center'
    }}>
      {status || 'Assigned'}
    </span>
  );
};

export default TaskStatus;
