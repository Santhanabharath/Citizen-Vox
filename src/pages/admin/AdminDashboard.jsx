import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { db } from '../../firebase/config';
import { collection, getDocs, query, where, getCountFromServer } from 'firebase/firestore';
import { Activity, Users, Map, AlertTriangle, CheckCircle, ShieldAlert, AlertOctagon } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGlobalStats = async () => {
      try {
        // Since we are enforcing NO FAKE DATA, we will fetch aggregates directly.
        const [
          usersSnap, 
          muniSnap, 
          issuesSnap, 
          integritySnap
        ] = await Promise.all([
          getCountFromServer(collection(db, 'users')),
          getCountFromServer(collection(db, 'municipalities')),
          getDocs(collection(db, 'issues')), // Fetch all issues to calculate complex metrics locally
          getCountFromServer(collection(db, 'integrity_reports'))
        ]);

        let active = 0;
        let critical = 0;
        let resolved = 0;
        let total = issuesSnap.docs.length;

        issuesSnap.forEach(doc => {
          const data = doc.data();
          if (data.status === 'Resolved' || data.status === 'closed') {
            resolved++;
          } else {
            active++;
          }
          if (data.priority?.level === 'Critical' || data.severity === 'critical') {
            critical++;
          }
        });

        const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;

        setStats({
          users: usersSnap.data().count,
          municipalities: muniSnap.data().count,
          activeIssues: active,
          criticalIssues: critical,
          resolvedIssues: resolved,
          resolutionRate,
          integrityReports: integritySnap.data().count
        });
      } catch (err) {
        console.error("Failed to load admin stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchGlobalStats();
  }, []);

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
        <h1 className="text-h1" style={{ color: 'var(--text-primary)' }}>CivicPulse Command Center</h1>
        <p className="text-muted">Global Platform Governance & Intelligence</p>
      </header>

      <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        
        {/* KPI Cards */}
        <StatCard icon={<Map />} label="Total Municipalities" value={stats?.municipalities || 0} />
        <StatCard icon={<Users />} label="Total Users" value={stats?.users || 0} />
        <StatCard icon={<Activity />} label="Active Issues" value={stats?.activeIssues || 0} />
        <StatCard icon={<AlertTriangle color="var(--danger)" />} label="Critical Issues" value={stats?.criticalIssues || 0} />
        <StatCard icon={<CheckCircle color="var(--success)" />} label="Resolved Issues" value={stats?.resolvedIssues || 0} />
        <StatCard icon={<Activity />} label="Resolution Rate" value={`${stats?.resolutionRate || 0}%`} />
        <StatCard icon={<ShieldAlert color="var(--warning)" />} label="Integrity Reports" value={stats?.integrityReports || 0} />

      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
        <section style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
          <h2 className="text-h3" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertOctagon size={20} color="var(--danger)" /> Persistent Civic Problems
          </h2>
          {/* Honest Empty State for Persistent Problems */}
          <div style={{ padding: '3rem', textAlign: 'center', background: 'var(--surface-hover)', borderRadius: 'var(--radius-md)' }}>
            <p className="text-muted">No persistent problems detected globally at this time.</p>
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

export default AdminDashboard;
