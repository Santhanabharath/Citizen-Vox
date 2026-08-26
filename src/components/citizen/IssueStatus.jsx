import React from 'react';
import Badge from '../common/Badge';

export const IssueStatus = ({ status }) => {
  const getStatusProps = (s) => {
    switch (s?.toLowerCase()) {
      case 'submitted':
        return { variant: 'info', label: 'Submitted' };
      case 'in progress':
      case 'in_progress':
        return { variant: 'warning', label: 'In Progress' };
      case 'resolved':
        return { variant: 'success', label: 'Resolved' };
      case 'under review':
      case 'under_review':
        return { variant: 'default', label: 'Under Review' };
      default:
        return { variant: 'default', label: s || 'Unknown' };
    }
  };

  const { variant, label } = getStatusProps(status);

  return <Badge variant={variant}>{label}</Badge>;
};

export default IssueStatus;
