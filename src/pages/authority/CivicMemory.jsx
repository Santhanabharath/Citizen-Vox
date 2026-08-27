import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { db } from '../../firebase/config';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { Archive, MapPin, Activity, ShieldAlert, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const CivicMemory = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMemory = async () => {
      try {
        if (!user) return;
        let q = collection(db, 'issueClusters');
        let queryConstraints = [orderBy('createdAt', 'desc'), limit(100)];

        // Enforce data scoping
        if (user.role === 'municipal_admin' && user.municipalityId) {
          queryConstraints.push(where('municipalityId', '==', user.municipalityId));
        } else if (user.role === 'department_officer' && user.departmentId) {
          queryConstraints.push(where('departmentId', '==', user.departmentId));
        }

        const snapshot = await getDocs(query(q, ...queryConstraints));
        
        // We look for resolved or historical issues for Civic Memory
        const fetchedHistory = [];
        snapshot.forEach(doc => {
          const data = doc.data();
          if (data.currentStatus === 'Resolved' || data.currentStatus === 'closed' || data.reportCount > 3) {
            fetchedHistory.push({ id: doc.id, ...data });
          }
        });
        
        setHistory(fetchedHistory);
      } catch (err) {
        console.error("Failed to load civic memory:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMemory();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="spinner" style={{ width: '40px', height: '40px', border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h1 className="text-h1">Civic Memory</h1>
        <p className="text-muted">Historical data and resolution durability tracking.</p>
      </header>

      {history.length === 0 ? (
        <div style={{ padding: '4rem 2rem', textAlign: 'center', background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
          <Archive size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem' }} />
          <h3 className="text-h3">No Historical Data</h3>
          <p className="text-muted" style={{ marginTop: '0.5rem' }}>Insufficient data to calculate historical metrics or resolution durability.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {history.map((record) => {
            // Fake calculation of durability for demo purposes, based on real data fields
            const durability = record.reportCount > 5 ? 'LOW' : record.reportCount > 2 ? 'MEDIUM' : 'HIGH';
            const durabilityColor = durability === 'LOW' ? 'var(--danger)' : durability === 'MEDIUM' ? 'var(--warning)' : 'var(--success)';

            return (
              <div key={record.id} style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span className="text-small text-muted" style={{ textTransform: 'uppercase' }}>{record.category?.replace('_', ' ')}</span>
                    <span className="text-small text-muted" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Activity size={14} /> Status: {record.currentStatus}
                    </span>
                  </div>
                  
                  <h3 className="text-h3" style={{ marginBottom: '0.5rem' }}>{record.title}</h3>
                  
                  <div style={{ display: 'flex', gap: '1.5rem' }}>
                    <span className="text-small text-muted" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <MapPin size={14} /> {record.locationName || 'Unknown location'}
                    </span>
                    <span className="text-small text-muted" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Archive size={14} /> Total Reports: {record.reportCount || 1}
                    </span>
                    <span className="text-small text-muted" style={{ color: durabilityColor, fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <ShieldAlert size={14} /> Resolution Durability: {durability}
                    </span>
                  </div>
                </div>

                <div>
                  <Link 
                    to={user.role === 'department_officer' ? `/department/issues/${record.id}` : `/authority/issues/${record.id}`}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', border: '1px solid var(--border)', color: 'var(--text-primary)', borderRadius: 'var(--radius-md)', textDecoration: 'none', fontWeight: '500' }}
                  >
                    View Details <ArrowUpRight size={16} />
                  </Link>
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
