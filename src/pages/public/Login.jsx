import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../../firebase/config';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, createUserWithEmailAndPassword, updateProfile, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const routeBasedOnRole = async (user) => {
    try {
      const userDoc = await getDoc(doc(auth.app.firestore || (await import('../../firebase/config')).db, 'users', user.uid));
      if (userDoc.exists()) {
        let role = userDoc.data().role;
        
        // On-the-fly migration
        const adminRoles = ['super_admin', 'municipal_admin', 'department_officer', 'authority', 'authority_admin', 'admin_user'];
        if (adminRoles.includes(role)) {
          role = 'admin';
          await setDoc(doc(auth.app.firestore || (await import('../../firebase/config')).db, 'users', user.uid), { role: 'admin' }, { merge: true });
        } else if (role === 'field_worker') {
          role = 'worker';
          await setDoc(doc(auth.app.firestore || (await import('../../firebase/config')).db, 'users', user.uid), { role: 'worker' }, { merge: true });
        }

        if (role === 'worker') navigate('/worker');
        else if (role === 'admin') navigate('/admin');
        else if (role === 'citizen') navigate('/citizen');
        else {
          setError("Account configuration requires administrator attention.");
          await signOut(auth);
        }
      } else {
        // First time Google/Phone sign in -> auto create citizen
        await setDoc(doc(auth.app.firestore || (await import('../../firebase/config')).db, 'users', user.uid), {
          email: user.email || '',
          phone: user.phoneNumber || '',
          name: user.displayName || 'Citizen',
          role: 'citizen',
          createdAt: serverTimestamp()
        });
        navigate('/citizen');
      }
    } catch (e) {
      navigate('/citizen'); // fallback
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    if (!auth) {
      setError("Firebase Auth not initialized.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      await routeBasedOnRole(cred.user);
    } catch (err) {
      setError(err.message || "Failed to sign in.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (!auth) return;
    const provider = new GoogleAuthProvider();
    try {
      const cred = await signInWithPopup(auth, provider);
      await routeBasedOnRole(cred.user);
    } catch (err) {
      setError(err.message || "Failed to sign in with Google.");
    }
  };

  const seedDemoAccounts = async () => {
    if (!auth) return;
    setLoading(true);
    setError(null);
    try {
      const demoAccounts = [
        { email: 'admin@citizenvox.gov', pass: 'Admin123!', role: 'admin', name: 'System Admin', dept: null },
        { email: 'worker1@citizenvox.gov', pass: 'Worker123!', role: 'worker', name: 'Field Worker', dept: 'Roads' },
        { email: 'citizen@citizenvox.gov', pass: 'Citizen123!', role: 'citizen', name: 'Citizen Demo', dept: null }
      ];

      for (const acc of demoAccounts) {
        try {
          const cred = await createUserWithEmailAndPassword(auth, acc.email, acc.pass);
          await updateProfile(cred.user, { displayName: acc.name });
          await setDoc(doc(auth.app.firestore || (await import('../../firebase/config')).db, 'users', cred.user.uid), {
            email: acc.email,
            name: acc.name,
            role: acc.role,
            department: acc.dept,
            createdAt: serverTimestamp()
          });
        } catch (e) {
          console.log(`Account ${acc.email} might already exist:`, e.message);
        }
      }
      
      await signOut(auth);
      alert("Demo accounts created successfully! You can now log in with any of them.");
    } catch (err) {
      setError("Failed to seed accounts: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '400px', paddingTop: '4rem' }}>
      <div style={{ background: 'var(--surface)', padding: '2rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)' }}>
        <h2 className="text-h2" style={{ textAlign: 'center', marginBottom: '2rem' }}>Welcome Back</h2>
        
        {error && <div style={{ background: 'var(--danger)', color: 'white', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</div>}

        <form onSubmit={handleEmailLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label className="text-small" style={{ fontWeight: '500' }}>Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com" 
              required
              style={{ padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', outline: 'none' }} 
            />
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <div className="flex justify-between">
              <label className="text-small" style={{ fontWeight: '500' }}>Password</label>
              <Link to="/forgot-password" className="text-small" style={{ color: 'var(--accent)' }}>Forgot?</Link>
            </div>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" 
              required
              style={{ padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', outline: 'none' }} 
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            style={{ padding: '0.75rem', marginTop: '1rem', background: 'var(--text-primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: '500', cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? 'Signing in...' : 'Sign In with Email'}
          </button>
        </form>
        
        <div style={{ textAlign: 'center', margin: '1.5rem 0' }} className="text-small text-muted">OR CONTINUE WITH</div>
            
            <button 
              type="button" 
              onClick={handleGoogleLogin}
              style={{ width: '100%', padding: '0.75rem', background: 'var(--surface-soft)', color: 'var(--text-primary)', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path></svg>
              Google
            </button>

        
        <p className="text-small" style={{ textAlign: 'center', marginTop: '2rem' }}>
          Don't have an account? <Link to="/register" style={{ color: 'var(--accent)' }}>Sign up</Link>
        </p>

        {/* Temporary Seed Button */}
        <button 
          onClick={seedDemoAccounts}
          disabled={loading}
          style={{ width: '100%', padding: '0.5rem', marginTop: '1rem', background: 'var(--surface-soft)', color: 'var(--text-secondary)', border: '1px dashed var(--border)', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', cursor: 'pointer' }}
        >
          {loading ? 'Generating...' : '🛠 Auto-Generate Demo Accounts'}
        </button>
      </div>
    </div>
  );
};

export default Login;
