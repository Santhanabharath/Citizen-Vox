import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { db } from '../../firebase/config';
import { collection, query, getDocs, doc, setDoc } from 'firebase/firestore';
import { Building, Users, Activity, Settings } from 'lucide-react';
import { analyticsService } from '../../services/analyticsService';

const DEFAULT_DEPARTMENTS = [
  { id: 'roads', name: 'Roads & Transport', description: 'Maintains roads, bridges, and traffic signals.' },
  { id: 'sanitation', name: 'Sanitation', description: 'Waste collection and city cleanliness.' },
  { id: 'water', name: 'Water Supply', description: 'Drinking water distribution and pipe maintenance.' },
  { id: 'drainage', name: 'Drainage', description: 'Stormwater and sewage management.' },
  { id: 'electrical', name: 'Electrical', description: 'Streetlights and public electricity.' }
];

const Departments = () => {
  const { user } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDepartments = async () => {
      setLoading(true);
      try {
        // Fetch custom departments if any, otherwise map default ones
        const snap = await getDocs(collection(db, 'departments'));
        const customDepts = [];
        snap.forEach(d => customDepts.push({ id: d.id, ...d.data() }));

        const deptsToUse = customDepts.length > 0 ? customDepts : DEFAULT_DEPARTMENTS;
        
        // Fetch overall stats
        const stats = await analyticsService.getAdminDashboardMetrics(user?.municipalityId);
        
        const enhancedDepts = deptsToUse.map(dept => {
          return {
            ...dept,
            activeIssues: stats.departments[dept.id] || 0
          };
        });

        setDepartments(enhancedDepts);

        // Initialize defaults in Firestore if empty
        if (customDepts.length === 0) {
          for (let d of DEFAULT_DEPARTMENTS) {
            await setDoc(doc(db, 'departments', d.id), d);
          }
        }
      } catch (err) {
        console.error("Failed to load departments:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDepartments();
  }, [user]);

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading Departments...</div>;

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="text-h1">Departments</h1>
          <p className="text-muted">Manage municipal departments and their workloads.</p>
        </div>
        <button style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Settings size={18} /> Manage Structure
        </button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {departments.map(dept => (
          <div key={dept.id} style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <div style={{ background: 'var(--bg-main)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                <Building size={24} color="var(--primary-green)" />
              </div>
              <div>
                <h3 className="text-h3">{dept.name}</h3>
                <p className="text-small text-muted">{dept.id}</p>
              </div>
            </div>
            <p className="text-body text-muted" style={{ marginBottom: '1.5rem', minHeight: '40px' }}>
              {dept.description}
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{dept.activeIssues}</div>
                <div className="text-small text-muted text-uppercase">Assigned Issues</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Departments;
