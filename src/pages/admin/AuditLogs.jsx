import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { auditService } from '../../services/auditService';
import { Shield, Clock, User, Activity } from 'lucide-react';

const AuditLogs = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        if (user?.role === 'admin') {
           const data = await auditService.getRecentLogs(100);
           setLogs(data);
        }
      } catch (err) {
        console.error("Failed to fetch audit logs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [user]);

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading Audit Logs...</div>;

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Shield color="var(--primary-green)" size={32} />
        <div>
          <h1 className="text-h1">Audit Logs</h1>
          <p className="text-muted">Immutable record of administrative actions.</p>
        </div>
      </header>

      {logs.length === 0 ? (
         <div style={{ textAlign: 'center', padding: '3rem', background: 'var(--surface)', borderRadius: 'var(--radius-lg)' }}>
           <p className="text-muted">No audit logs found.</p>
         </div>
      ) : (
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          {logs.map(log => (
            <div key={log.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--surface)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <div style={{ background: 'var(--bg-main)', padding: '0.5rem', borderRadius: '50%' }}>
                <Activity size={16} color="var(--text-secondary)" />
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{log.action.replace(/_/g, ' ')}</h4>
                <p className="text-small text-muted" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                  <User size={12} /> {log.actorRole} ({log.actorId.slice(0, 8)}...) modified {log.resourceType} {log.resourceId.slice(0, 8)}...
                </p>
                {log.metadata && Object.keys(log.metadata).length > 0 && (
                  <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', background: 'var(--bg-main)', padding: '0.5rem', borderRadius: '4px', fontFamily: 'monospace' }}>
                    {JSON.stringify(log.metadata)}
                  </div>
                )}
              </div>
              <div className="text-small text-muted" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                <Clock size={12} /> {log.timestamp ? (log.timestamp.toDate ? log.timestamp.toDate().toLocaleString() : new Date(log.timestamp).toLocaleString()) : 'Just now'}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AuditLogs;
