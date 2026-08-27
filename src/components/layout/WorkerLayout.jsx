import React, { useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { ClipboardList, Map, User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import '../layout/Layout.css';

const WorkerLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'worker')) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  if (loading) return <div>Loading...</div>;
  if (!user || user.role !== 'worker') return null;

  return (
    <div className="app-layout citizen-layout" style={{ background: 'var(--off-white)', minHeight: '100vh' }}>
      
      <main className="app-main citizen-main" style={{ paddingBottom: '80px' }}>
        <Outlet />
      </main>

      {/* Mobile bottom navigation */}
      <nav className="mobile-nav">
        <Link to="/worker/tasks" className={`mobile-nav-item ${location.pathname === '/worker/tasks' ? 'active' : ''}`}>
          <ClipboardList size={24} />
          <span className="nav-label">Tasks</span>
        </Link>
        <Link to="/worker/map" className={`mobile-nav-item ${location.pathname === '/worker/map' ? 'active' : ''}`}>
          <Map size={24} />
          <span className="nav-label">Map</span>
        </Link>
        <Link to="/worker/profile" className={`mobile-nav-item ${location.pathname === '/worker/profile' ? 'active' : ''}`}>
          <User size={24} />
          <span className="nav-label">Profile</span>
        </Link>
      </nav>
    </div>
  );
};

export default WorkerLayout;
