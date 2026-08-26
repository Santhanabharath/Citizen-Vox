import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ArrowRight, ShieldCheck, FileText } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { issueService } from '../../services/issueService';
import IssueCard from '../../components/citizen/IssueCard';
import Button from '../../components/common/Button';

const CitizenDashboard = () => {
  const { user } = useAuth();
  const [myIssues, setMyIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;
    try {
      // Just fetch user's recent issues
      const issues = await issueService.getUserIssues(user.uid);
      setMyIssues(issues.slice(0, 3)); // Only show top 3 on dashboard
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ paddingBottom: '80px', maxWidth: '600px', margin: '0 auto' }}>
      
      {/* Greeting Area */}
      <div style={{ padding: '24px 24px 16px', background: 'var(--near-black)', color: 'var(--white)', borderRadius: '0 0 24px 24px', marginBottom: '24px' }}>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>Good morning,</p>
        <h1 className="text-h2" style={{ marginBottom: '24px' }}>{user?.displayName || 'Citizen'} 👋</h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--white)', marginBottom: '16px' }}>Let's make our city better today.</p>
        
        <Link to="/citizen/report" style={{ textDecoration: 'none', display: 'block' }}>
          <Button variant="primary" style={{ width: '100%', padding: '16px', fontSize: '1.125rem', display: 'flex', justifyContent: 'center', gap: '8px' }}>
            <FileText size={20} /> Report an Issue
          </Button>
        </Link>
      </div>

      <div style={{ padding: '0 24px' }}>
        
        {/* My Active Issues */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 className="text-h4" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              My Active Issues
              {myIssues.length > 0 && (
                <span style={{ background: 'var(--danger-soft)', color: 'var(--danger-dark)', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600 }}>{myIssues.length}</span>
              )}
            </h3>
            <Link to="/citizen/issues" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
              View All <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Loading...</div>
          ) : myIssues.length === 0 ? (
            <div className="card-premium" style={{ textAlign: 'center', padding: '2rem' }}>
              <ShieldCheck size={32} style={{ color: 'var(--primary-green)', margin: '0 auto 12px' }} />
              <p style={{ fontWeight: 600 }}>No active issues</p>
              <p className="text-small text-muted" style={{ marginTop: '4px' }}>You haven't reported anything recently.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {myIssues.map(issue => (
                <IssueCard key={issue.id} issue={issue} />
              ))}
            </div>
          )}
        </div>

        {/* Community Highlight */}
        <div className="card-premium" style={{ background: 'var(--near-black)', color: 'var(--white)', border: 'none' }}>
          <h3 className="text-h4" style={{ marginBottom: '8px' }}>CivicPulse Map</h3>
          <p className="text-small" style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>See verified issues in your neighborhood.</p>
          <Link to="/citizen/map" style={{ textDecoration: 'none' }}>
            <Button variant="outline" style={{ width: '100%', borderColor: 'rgba(255,255,255,0.2)', color: 'var(--white)' }}>Explore Map</Button>
          </Link>
        </div>

      </div>
    </div>
  );
};

export default CitizenDashboard;
