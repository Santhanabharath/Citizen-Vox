import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { db } from '../../firebase/config';
import { collection, query, orderBy, getDocs, limit } from 'firebase/firestore';
import { Database, AlertTriangle, Filter, Archive } from 'lucide-react';
import { Link } from 'react-router-dom';

const CivicMemory = () => {
  const { user } = useAuth();
  const [clusters, setClusters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    const fetchClusters = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, 'issueClusters'),
          orderBy('updatedAt', 'desc'),
          limit(100)
        );
        const snap = await getDocs(q);
        const data = [];
        snap.forEach(doc => data.push({ id: doc.id, ...doc.data() }));
        
        // Sort by memory score descending (calculated in memory for now)
        data.sort((a, b) => {
           const aScore = (a.reportCount || 1) + (a.issueIds?.length || 1);
           const bScore = (b.reportCount || 1) + (b.issueIds?.length || 1);
           return bScore - aScore;
        });

        setClusters(data);
      } catch (err) {
        console.error("Failed to load clusters:", err);
      } finally {
        setLoading(false);
      }
    };
    
    if (user) fetchClusters();
  }, [user]);

  const filteredClusters = clusters.filter(c => {
    if (!filter) return true;
    return c.category === filter;
  });

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 className="text-h1" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Database /> Civic Memory
        </h1>
        <p className="text-muted">Long-term tracking of clustered issues and community consensus.</p>
      </header>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', background: 'var(--surface)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', alignItems: 'center' }}>
        <Filter size={20} color="var(--text-muted)" />
        <select value={filter} onChange={e => setFilter(e.target.value)} style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
          <option value="">All Categories</option>
          <option value="road_damage">Road Damage</option>
          <option value="garbage">Garbage</option>
          <option value="water_leakage">Water Leakage</option>
        </select>
      </div>

      {loading ? (
         <div style={{ textAlign: 'center', padding: '3rem' }}>Loading Civic Memory...</div>
      ) : filteredClusters.length === 0 ? (
        <div style={{ padding: '4rem 2rem', textAlign: 'center', background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
          <Archive size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
          <h3 className="text-h3">No Clustered Memory</h3>
          <p className="text-muted" style={{ marginTop: '0.5rem' }}>No historical issue clusters formed yet.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))' }}>
          {filteredClusters.map(cluster => {
            const memoryScore = (cluster.reportCount || 1) * 15; // Simple formula
            
            return (
              <div key={cluster.id} style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--text-secondary)', background: 'var(--surface-hover)', padding: '4px 8px', borderRadius: '4px' }}>
                      {cluster.category?.replace('_', ' ')}
                    </span>
                    <h3 className="text-h3" style={{ marginTop: '0.5rem' }}>{cluster.title || 'Civic Issue Cluster'}</h3>
                  </div>
                  <div style={{ textAlign: 'center', background: 'var(--bg-main)', padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border)', minWidth: '60px' }}>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--primary-green)' }}>{memoryScore}</div>
                    <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Score</div>
                  </div>
                </div>
                
                <p className="text-small text-muted" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {cluster.description}
                </p>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '1rem', marginTop: 'auto' }}>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <span className="text-small" style={{ fontWeight: 600 }}>{cluster.reportCount || 1} Reports</span>
                    <span className="text-small" style={{ color: 'var(--text-muted)' }}>{cluster.currentStatus || 'Open'}</span>
                  </div>
                  <Link to={`/admin/issues/${cluster.id}`} className="text-small" style={{ color: 'var(--primary-green)', fontWeight: 600, textDecoration: 'none' }}>View Details</Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CivicMemory;
