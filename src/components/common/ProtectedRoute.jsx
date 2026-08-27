import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { auth } from '../../firebase/config';
import { doc, getDoc } from 'firebase/firestore';

const ProtectedRoute = ({ allowedRoles, redirectPath = '/login' }) => {
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const db = auth.app.firestore ? auth.app.firestore() : (await import('../../firebase/config')).db;
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setUserRole(userDoc.data().role);
          } else {
            setUserRole('citizen'); // fallback default
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
          setUserRole(null);
        }
      } else {
        setUserRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg-main)' }}>
        <div style={{ padding: '2rem', background: 'var(--surface)', borderRadius: 'var(--radius-lg)', textAlign: 'center', boxShadow: 'var(--shadow-sm)' }}>
          <div className="spinner" style={{ width: '40px', height: '40px', border: '3px solid var(--border)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 1rem' }}></div>
          <p className="text-small text-muted">Authenticating...</p>
        </div>
        <style>{`
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  if (!userRole) {
    return <Navigate to={redirectPath} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    // Redirect based on actual role to prevent infinite loops or being stuck
    if (userRole === 'super_admin') return <Navigate to="/admin" replace />;
    if (userRole === 'municipal_admin') return <Navigate to="/authority" replace />;
    if (userRole === 'department_officer') return <Navigate to="/department" replace />;
    if (userRole === 'field_worker') return <Navigate to="/worker" replace />;
    return <Navigate to="/citizen" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
