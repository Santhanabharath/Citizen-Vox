import React, { useEffect, useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { issueService } from '../../services/issueService';
import IssueCard from '../../components/citizen/IssueCard';
import { Search, Filter } from 'lucide-react';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

const MyIssues = () => {
  const { user, loading: authLoading } = useAuth();
  const [issues, setIssues] = useState([]);
  const [filteredIssues, setFilteredIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (user) {
      issueService.getUserIssues(user.uid).then(data => {
        setIssues(data);
        setFilteredIssues(data);
        setLoading(false);
      });
    }
  }, [user]);

  useEffect(() => {
    let result = issues;
    if (statusFilter !== 'all') {
      result = result.filter(i => i.status === statusFilter);
    }
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(i => 
        i.title?.toLowerCase().includes(s) || 
        i.category?.toLowerCase().includes(s)
      );
    }
    setFilteredIssues(result);
  }, [search, statusFilter, issues]);

  if (authLoading) return <div className="container" style={{ padding: '2rem' }}>Loading...</div>;

  return (
    <div className="container" style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '2rem' }}>
      <h1 className="text-h2" style={{ marginBottom: '1.5rem' }}>My Reports</h1>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <Input 
            placeholder="Search reports..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--surface)', padding: '0 0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
          <Filter size={16} color="var(--text-secondary)" />
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ border: 'none', outline: 'none', background: 'transparent', padding: '0.5rem', fontFamily: 'var(--font-family)', color: 'var(--text-primary)' }}
          >
            <option value="all">All Statuses</option>
            <option value="submitted">Submitted</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {loading ? (
          <div className="text-center text-muted" style={{ padding: '2rem' }}>Loading your reports...</div>
        ) : filteredIssues.length > 0 ? (
          filteredIssues.map(issue => <IssueCard key={issue.id} issue={issue} />)
        ) : (
          <div className="text-center text-muted" style={{ padding: '3rem', background: 'var(--surface-soft)', borderRadius: 'var(--radius-lg)' }}>
            No reports found.
          </div>
        )}
      </div>
    </div>
  );
};

export default MyIssues;
