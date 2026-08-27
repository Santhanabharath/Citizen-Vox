import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { authorityService } from '../../services/authorityService';
import { Activity, Map, AlertTriangle, CheckCircle, ShieldAlert, Bot } from 'lucide-react';
import { Link } from 'react-router-dom';

const MunicipalDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (!user) return;
        const kpis = await authorityService.getDashboardKPIs(user);
        
        // Ensure NO FAKE DATA. If zero, display zero.
        setStats({
          activeIssues: kpis.totalActive || 0,
          criticalIssues: kpis.critical || 0,
          resolvedIssues: kpis.resolved || 0,
          resolutionRate: (kpis.totalActive + kpis.resolved) > 0 ? 
            Math.round((kpis.resolved / (kpis.totalActive + kpis.resolved)) * 100) : 0
        });
      } catch (err) {
        console.error("Failed to load dashboard stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="spinner" style={{ width: '40px', height: '40px', border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
      </div>
    );
  }

  return (
    <div className="dashboard-container" style={{ padding: '2rem' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 className="text-h1" style={{ color: 'var(--text-primary)' }}>Municipal Command Center</h1>
        <p className="text-muted">Real-time overview for {user?.municipality || 'your jurisdiction'}</p>
      </header>

      <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <StatCard icon={<Activity />} label="Active Issues" value={stats?.activeIssues} />
        <StatCard icon={<AlertTriangle color="var(--danger)" />} label="Critical Priorities" value={stats?.criticalIssues} />
        <StatCard icon={<CheckCircle color="var(--success)" />} label="Resolved (30d)" value={stats?.resolvedIssues} />
        <StatCard icon={<Activity />} label="Resolution Rate" value={`${stats?.resolutionRate}%`} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        <section style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 className="text-h3">Priority Action Queue</h2>
            <Link to="/authority/queue" style={{ color: 'var(--accent)', fontSize: '0.875rem', textDecoration: 'none' }}>View All →</Link>
          </div>
          {stats?.activeIssues === 0 ? (
            <div style={{ padding: '3rem', textAlign: 'center', background: 'var(--surface-hover)', borderRadius: 'var(--radius-md)' }}>
              <p className="text-muted">No pending issues require your attention.</p>
            </div>
          ) : (
            <div style={{ padding: '3rem', textAlign: 'center', background: 'var(--surface-hover)', borderRadius: 'var(--radius-md)' }}>
              <p className="text-muted">You have {stats?.activeIssues} active issues. Please check the Priority Queue.</p>
              <Link to="/authority/queue" className="btn-primary" style={{ marginTop: '1rem', display: 'inline-block', textDecoration: 'none' }}>Open Queue</Link>
            </div>
          )}
        </section>

        <section style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ background: 'linear-gradient(135deg, var(--surface) 0%, var(--surface-hover) 100%)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
            <h3 className="text-h3" style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Bot size={18} color="var(--accent)" /> Civic Copilot</h3>
            <p className="text-small text-muted" style={{ marginBottom: '1rem', lineHeight: '1.4' }}>
              Ask questions about your municipality's data and get intelligent, evidence-backed answers.
            </p>
            <Link to="/authority/copilot" className="btn-outline" style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>Launch Copilot</Link>
          </div>
        </section>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value }) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    style={{ 
      background: 'var(--surface)', 
      padding: '1.5rem', 
      borderRadius: 'var(--radius-lg)', 
      border: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      boxShadow: 'var(--shadow-sm)'
    }}
  >
    <div style={{ padding: '1rem', background: 'var(--bg-main)', borderRadius: 'var(--radius-md)', color: 'var(--text-secondary)' }}>
      {icon}
    </div>
    <div>
      <p className="text-small text-muted">{label}</p>
      <p className="text-h2">{value}</p>
    </div>
  </motion.div>
);

export default MunicipalDashboard;
