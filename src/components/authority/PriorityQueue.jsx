import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authorityService } from '../../services/authorityService';
import { useAuth } from '../../hooks/useAuth';
import PriorityBadge from '../priority/PriorityBadge';
import IssueStatus from '../citizen/IssueStatus';

const PriorityQueue = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQueue = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const result = await authorityService.getPriorityQueue(user, {}, 25);
        setIssues(result.issues);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchQueue();
  }, [user]);

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading Priority Queue...</div>;

  if (issues.length === 0) {
    return (
      <div style={{ padding: '3rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>
        No issues require attention at this time.
      </div>
    );
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid var(--border)', color: 'var(--text-secondary)' }}>
            <th style={{ padding: '1rem', fontWeight: '600' }}>Priority</th>
            <th style={{ padding: '1rem', fontWeight: '600' }}>Issue</th>
            <th style={{ padding: '1rem', fontWeight: '600' }}>Community</th>
            <th style={{ padding: '1rem', fontWeight: '600' }}>Reports</th>
            <th style={{ padding: '1rem', fontWeight: '600' }}>Status</th>
            <th style={{ padding: '1rem', fontWeight: '600' }}>Department</th>
            <th style={{ padding: '1rem', fontWeight: '600' }}>Age</th>
          </tr>
        </thead>
        <tbody>
          {issues.map(issue => {
            const dateStr = issue.createdAt?.toDate ? 
              new Date(issue.createdAt.toDate()).toLocaleDateString() : 'N/A';
              
            return (
              <tr 
                key={issue.id} 
                onClick={() => navigate(`/authority/issues/${issue.id}`)}
                style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer', transition: 'background 0.2s ease' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-hover)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <td style={{ padding: '1rem' }}>
                  <PriorityBadge level={issue.priority?.level} score={issue.priority?.finalScore} />
                </td>
                <td style={{ padding: '1rem' }}>
                  <div style={{ fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px' }}>
                    {issue.title}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                    {issue.category?.replace('_', ' ')}
                  </div>
                </td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ fontWeight: '600', color: issue.communityConfidence?.score >= 70 ? 'var(--success-dark)' : 'var(--text-secondary)' }}>
                    {issue.communityConfidence?.score || 0}%
                  </span>
                </td>
                <td style={{ padding: '1rem' }}>{issue.reportCount || 1}</td>
                <td style={{ padding: '1rem' }}><IssueStatus status={issue.currentStatus || issue.status} /></td>
                <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{issue.assignedDepartment || 'Unassigned'}</td>
                <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{dateStr}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default PriorityQueue;
