import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../../firebase/config';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

const Register = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Backdoor role selection for testing
  const [role, setRole] = useState('citizen');
  const [department, setDepartment] = useState('');
  
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!auth) {
      setError("Firebase Auth not initialized.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
      
      // Save user role and department to Firestore
      await setDoc(doc(auth.app.firestore || (await import('../../firebase/config')).db, 'users', userCredential.user.uid), {
        email: email,
        name: name,
        role: role,
        department: (role === 'department_officer' || role === 'field_worker') ? department : null,
        createdAt: serverTimestamp()
      });

      if (role === 'field_worker') {
        navigate('/worker');
      } else if (role !== 'citizen') {
        navigate('/authority');
      } else {
        navigate('/citizen');
      }
    } catch (err) {
      setError(err.message || "Failed to create account.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '400px', paddingTop: '4rem' }}>
      <div style={{ background: 'var(--surface)', padding: '2rem', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)' }}>
        <h2 className="text-h2" style={{ textAlign: 'center', marginBottom: '2rem' }}>Create Account</h2>
        
        {error && <div style={{ background: 'var(--danger)', color: 'white', padding: '0.75rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</div>}

        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label className="text-small" style={{ fontWeight: '500' }}>Full Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe" 
              required
              style={{ padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', outline: 'none' }} 
            />
          </div>

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
            <label className="text-small" style={{ fontWeight: '500' }}>Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" 
              required
              style={{ padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', outline: 'none' }} 
            />
          </div>

          {/* Test Role Selection */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '1rem', padding: '1rem', background: 'var(--surface-hover)', borderRadius: 'var(--radius-md)' }}>
            <label className="text-small" style={{ fontWeight: '600' }}>Account Type (Testing Only)</label>
            <select 
              value={role} 
              onChange={e => setRole(e.target.value)}
              style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}
            >
              <option value="citizen">Citizen</option>
              <option value="field_worker">Field Worker</option>
              <option value="department_officer">Department Officer</option>
              <option value="municipal_admin">Municipal Admin</option>
              <option value="super_admin">Super Admin</option>
            </select>
            
            {(role === 'department_officer' || role === 'field_worker') && (
              <select 
                value={department} 
                onChange={e => setDepartment(e.target.value)}
                style={{ padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', marginTop: '0.5rem' }}
                required
              >
                <option value="">Select Department...</option>
                <option value="Roads">Roads</option>
                <option value="Sanitation">Sanitation</option>
                <option value="Water">Water</option>
                <option value="Drainage">Drainage</option>
                <option value="Electrical">Electrical</option>
                <option value="Environment">Environment</option>
                <option value="Public Safety">Public Safety</option>
              </select>
            )}
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            style={{ padding: '0.75rem', marginTop: '1rem', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', fontWeight: '500', cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        
        <p className="text-small" style={{ textAlign: 'center', marginTop: '2rem' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--text-primary)', fontWeight: '600' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
