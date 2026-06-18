import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const res = await login(email, password, rememberMe);
    setIsLoading(false);
    
    if (res.success) {
      if (res.user.role === 'boss') {
        navigate('/boss');
      } else if (res.user.role === 'admin') {
        navigate('/admin');
      } else if (res.user.role === 'kitchen') {
        navigate('/kitchen');
      } else if (res.user.role === 'driver') {
        navigate('/driver');
      } else {
        navigate('/');
      }
    } else {
      toast.error(res.message);
    }
  };

  return (
    <div className="container section" style={{ display: 'flex', justifyContent: 'center' }}>
      <div className="card" style={{ padding: '3rem', width: '100%', maxWidth: '400px' }}>
        <h2 className="section-title" style={{ fontSize: '2rem', marginBottom: '2rem' }}>Welcome Back</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="input-elegant" />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="input-elegant" />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input type="checkbox" id="rememberMe" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--secondary)' }} />
            <label htmlFor="rememberMe" style={{ cursor: 'pointer', color: '#888' }}>Remember me</label>
          </div>
          <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }} disabled={isLoading}>
            {isLoading ? 'Processing...' : 'Login'}
          </button>
        </form>
        <p style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          Don't have an account? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Register here</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
