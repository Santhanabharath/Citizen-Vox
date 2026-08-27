import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../../firebase/config';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Phone Auth State
  const [authMethod, setAuthMethod] = useState('email'); // 'email' or 'phone'
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const routeBasedOnRole = async (user) => {
    try {
      const userDoc = await getDoc(doc(auth.app.firestore || (await import('../../firebase/config')).db, 'users', user.uid));
      if (userDoc.exists()) {
        const role = userDoc.data().role;
        if (role === 'field_worker') navigate('/worker');
        else if (role !== 'citizen') navigate('/authority');
        else navigate('/citizen');
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

  const setupRecaptcha = () => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible'
      });
    }
  };

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    if (!auth) return;
    setLoading(true);
    setError(null);
    try {
      setupRecaptcha();
      const appVerifier = window.recaptchaVerifier;
      // Format phone number to E.164
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;
      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      setConfirmationResult(confirmation);
    } catch (err) {
      setError(err.message || "Failed to send OTP.");
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!confirmationResult) return;
    setLoading(true);
    setError(null);
    try {
      const cred = await confirmationResult.confirm(otp);
      await routeBasedOnRole(cred.user);
    } catch (err) {
      setError("Invalid OTP code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '400px', paddingTop: '4rem' }}>
      <div style={{ background: 'var(--surface)', padding: '2rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)' }}>
        <h2 className="text-h2" style={{ textAlign: 'center', marginBottom: '2rem' }}>Welcome Back</h2>
        
        {error && <div style={{ background: 'var(--danger)', color: 'white', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</div>}

        {/* Auth Method Toggle */}
        {!confirmationResult && (
          <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem', background: 'var(--surface-hover)', padding: '4px', borderRadius: '8px' }}>
            <button 
              onClick={() => setAuthMethod('email')}
              style={{ flex: 1, padding: '8px', border: 'none', background: authMethod === 'email' ? 'var(--surface)' : 'transparent', borderRadius: '4px', fontWeight: 600, boxShadow: authMethod === 'email' ? 'var(--shadow-sm)' : 'none', cursor: 'pointer' }}
            >Email</button>
            <button 
              onClick={() => setAuthMethod('phone')}
              style={{ flex: 1, padding: '8px', border: 'none', background: authMethod === 'phone' ? 'var(--surface)' : 'transparent', borderRadius: '4px', fontWeight: 600, boxShadow: authMethod === 'phone' ? 'var(--shadow-sm)' : 'none', cursor: 'pointer' }}
            >Phone</button>
          </div>
        )}

        {authMethod === 'email' ? (
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
        ) : (
          !confirmationResult ? (
            <form onSubmit={handleRequestOTP} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <label className="text-small" style={{ fontWeight: '500' }}>Phone Number</label>
                <input 
                  type="tel" 
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="e.g. 9876543210" 
                  required
                  style={{ padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', outline: 'none' }} 
                />
              </div>
              
              <div id="recaptcha-container"></div>
              
              <button 
                type="submit" 
                disabled={loading}
                style={{ padding: '0.75rem', marginTop: '1rem', background: 'var(--text-primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: '500', cursor: loading ? 'not-allowed' : 'pointer' }}>
                {loading ? 'Sending OTP...' : 'Send Login Code'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <label className="text-small" style={{ fontWeight: '500' }}>Enter Verification Code</label>
                <input 
                  type="text" 
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="123456" 
                  required
                  style={{ padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', outline: 'none', textAlign: 'center', letterSpacing: '0.5em', fontSize: '1.25rem', fontWeight: 600 }} 
                />
              </div>
              
              <button 
                type="submit" 
                disabled={loading}
                style={{ padding: '0.75rem', marginTop: '1rem', background: 'var(--primary-green)', color: 'var(--near-black)', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer' }}>
                {loading ? 'Verifying...' : 'Verify & Sign In'}
              </button>
            </form>
          )
        )}
        
        {!confirmationResult && (
          <>
            <div style={{ textAlign: 'center', margin: '1.5rem 0' }} className="text-small text-muted">OR CONTINUE WITH</div>
            
            <button 
              type="button" 
              onClick={handleGoogleLogin}
              style={{ width: '100%', padding: '0.75rem', background: 'var(--surface-soft)', color: 'var(--text-primary)', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path></svg>
              Google
            </button>
          </>
        )}
        
        <p className="text-small" style={{ textAlign: 'center', marginTop: '2rem' }}>
          Don't have an account? <Link to="/register" style={{ color: 'var(--accent)' }}>Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
