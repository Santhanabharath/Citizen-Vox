import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../../firebase/config';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!auth) {
      setError("Firebase Auth not initialized.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/citizen');
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
      await signInWithPopup(auth, provider);
      navigate('/citizen');
    } catch (err) {
      setError(err.message || "Failed to sign in with Google.");
    }
  };

  return (
    <div className="container" style={{ maxWidth: '400px', paddingTop: '4rem' }}>
      <div style={{ background: 'var(--surface)', padding: '2rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)' }}>
        <h2 className="text-h2" style={{ textAlign: 'center', marginBottom: '2rem' }}>Welcome Back</h2>
        
        {error && <div style={{ background: 'var(--danger)', color: 'white', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</div>}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
          
          <div style={{ textAlign: 'center', margin: '1rem 0' }} className="text-small text-muted">OR</div>
          
          <button 
            type="button" 
            onClick={handleGoogleLogin}
            style={{ padding: '0.75rem', background: 'var(--surface-soft)', color: 'var(--text-primary)', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: '500', cursor: 'pointer' }}>
            Sign in with Google
          </button>
        </form>
        
        <p className="text-small" style={{ textAlign: 'center', marginTop: '2rem' }}>
          Don't have an account? <Link to="/register" style={{ color: 'var(--accent)' }}>Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
