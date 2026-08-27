import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { issueService } from '../../services/issueService';
import IssueCard from '../../components/citizen/IssueCard';
import { Search, Filter, ChevronDown } from 'lucide-react';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';

const MyIssues = () => {
  const { user, loading: authLoading } = useAuth();
  const [issues, setIssues] = useState([]);
  const [filteredIssues, setFilteredIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const statuses = [
    { id: 'all', label: 'All Statuses' },
    { id: 'submitted', label: 'Submitted' },
    { id: 'in_progress', label: 'In Progress' },
    { id: 'resolved', label: 'Resolved' }
  ];

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
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <div 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--surface)', padding: '12px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', cursor: 'pointer', height: '100%', minWidth: '160px', justifyContent: 'space-between' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Filter size={18} color="var(--text-secondary)" />
              <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-primary)' }}>{statuses.find(s => s.id === statusFilter)?.label}</span>
            </div>
            <ChevronDown size={16} color="var(--text-secondary)" />
          </div>
          
          <AnimatePresence>
            {dropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, background: 'var(--white)', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', overflow: 'hidden', zIndex: 50, minWidth: '100%', border: '1px solid var(--border-light)' }}
              >
                {statuses.map(s => (
                  <div 
                    key={s.id}
                    onClick={() => { setStatusFilter(s.id); setDropdownOpen(false); }}
                    style={{ padding: '12px 16px', fontSize: '0.9375rem', fontWeight: 500, cursor: 'pointer', background: statusFilter === s.id ? 'rgba(143,234,99,0.1)' : 'transparent', color: statusFilter === s.id ? 'var(--primary-green)' : 'var(--near-black)', borderBottom: '1px solid #f1f5f9' }}
                  >
                    {s.label}
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
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
