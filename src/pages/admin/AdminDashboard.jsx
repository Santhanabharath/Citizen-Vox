import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, AlertTriangle, CheckCircle, PieChart, Clock } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        if (!user) return;
        
        const { analyticsService } = await import('../../services/analyticsService');
        const data = await analyticsService.getAdminDashboardMetrics(
          user.municipalityId, 
          user.departmentId
        );
        
        setMetrics(data);
      } catch (err) {
        console.error("Failed to load admin stats:", err);
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

  if (!metrics) return null;

  return (
    <div className="dashboard-container" style={{ padding: '2rem' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 className="text-h1" style={{ color: 'var(--text-primary)' }}>CivicPulse Command Center</h1>
        <p className="text-muted">Global Platform Governance & Intelligence</p>
      </header>

      <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        
        {/* KPI Cards */}
        <StatCard icon={<Activity />} label="Total Issues" value={metrics.total || 0} />
        <StatCard icon={<Activity />} label="Active Issues" value={metrics.active || 0} />
        <StatCard icon={<AlertTriangle color="var(--danger)" />} label="Critical Issues" value={metrics.critical || 0} />
        <StatCard icon={<CheckCircle color="var(--success)" />} label="Resolved Issues" value={metrics.resolved || 0} />
        <StatCard icon={<PieChart />} label="Resolution Rate" value={`${metrics.resolutionRate || 0}%`} />
        <StatCard icon={<Clock />} label="Avg Resolution Time" value={`${metrics.avgResolutionDays || 0} Days`} />

      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* Category Breakdown */}
        <div style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
          <h3 className="text-h3" style={{ marginBottom: '1.5rem' }}>Category Breakdown</h3>
          {Object.keys(metrics.categories).length === 0 ? (
             <p className="text-muted">No data available.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {Object.entries(metrics.categories)
                .sort(([,a], [,b]) => b - a)
                .map(([category, count]) => {
                  const percentage = Math.round((count / metrics.total) * 100);
                  return (
                    <div key={category}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                        <span style={{ fontSize: '0.875rem', fontWeight: 500, textTransform: 'capitalize' }}>{category.replace(/_/g, ' ')}</span>
                        <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{count} ({percentage}%)</span>
                      </div>
                      <div style={{ width: '100%', height: '8px', background: 'var(--bg-main)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${percentage}%`, height: '100%', background: 'var(--primary-green)' }}></div>
                      </div>
                    </div>
                  );
              })}
            </div>
          )}
        </div>

        {/* Department Workload */}
        <div style={{ background: 'var(--surface)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
          <h3 className="text-h3" style={{ marginBottom: '1.5rem' }}>Department Workload</h3>
          {Object.keys(metrics.departments).length === 0 ? (
             <p className="text-muted">No data available.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {Object.entries(metrics.departments)
                .sort(([,a], [,b]) => b - a)
                .map(([dept, count]) => {
                  const percentage = Math.round((count / metrics.total) * 100);
                  return (
                    <div key={dept}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                        <span style={{ fontSize: '0.875rem', fontWeight: 500, textTransform: 'capitalize' }}>{dept.replace(/_/g, ' ')}</span>
                        <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{count} ({percentage}%)</span>
                      </div>
                      <div style={{ width: '100%', height: '8px', background: 'var(--bg-main)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${percentage}%`, height: '100%', background: 'var(--accent)' }}></div>
                      </div>
                    </div>
                  );
              })}
            </div>
          )}
        </div>
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
