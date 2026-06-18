import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Lock } from 'lucide-react';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const res = await login(email, password);
    setIsLoading(false);
    
    if (res.success) {
      if (res.user && res.user.role === 'admin') {
        toast.success('Admin Login Successful');
        navigate('/admin');
      } else {
        toast.error('Unauthorized. Admin access only.');
        // logout immediately or just redirect
        navigate('/');
      }
    } else {
      toast.error(res.message);
    }
  };

  return (
    <div style={{ backgroundColor: '#121212', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF' }}>
      <div style={{ backgroundColor: '#1E1E1E', padding: '3rem', borderRadius: '12px', width: '100%', maxWidth: '400px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', border: '1px solid #333' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
          <div style={{ backgroundColor: 'rgba(212, 175, 55, 0.1)', padding: '16px', borderRadius: '50%', marginBottom: '1rem' }}>
            <Lock size={32} color="var(--secondary)" />
          </div>
          <h2 style={{ fontSize: '1.8rem', margin: 0, fontFamily: 'var(--font-serif)', letterSpacing: '1px' }}>Admin Portal</h2>
          <p style={{ color: '#888', marginTop: '0.5rem', fontSize: '0.9rem' }}>Secure Login for Staff Only</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#BBB', fontSize: '0.9rem' }}>Email</label>
            <input 
              type="email" value={email} onChange={(e) => setEmail(e.target.value)} required 
              style={{ width: '100%', padding: '12px', backgroundColor: '#2A2A2A', border: '1px solid #444', color: '#FFF', borderRadius: '6px', outline: 'none' }}
              onFocus={e => e.target.style.borderColor = 'var(--secondary)'}
              onBlur={e => e.target.style.borderColor = '#444'}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#BBB', fontSize: '0.9rem' }}>Password</label>
            <input 
              type="password" value={password} onChange={(e) => setPassword(e.target.value)} required 
              style={{ width: '100%', padding: '12px', backgroundColor: '#2A2A2A', border: '1px solid #444', color: '#FFF', borderRadius: '6px', outline: 'none' }}
              onFocus={e => e.target.style.borderColor = 'var(--secondary)'}
              onBlur={e => e.target.style.borderColor = '#444'}
            />
          </div>
          <button 
            type="submit" 
            style={{ marginTop: '1rem', padding: '14px', backgroundColor: 'var(--secondary)', color: '#000', fontWeight: 'bold', border: 'none', borderRadius: '6px', cursor: 'pointer', transition: 'opacity 0.3s' }}
            disabled={isLoading}
            onMouseOver={e=>e.currentTarget.style.opacity = '0.8'}
            onMouseOut={e=>e.currentTarget.style.opacity = '1'}
          >
            {isLoading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
