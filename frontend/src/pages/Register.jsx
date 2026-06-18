import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const getPasswordStrength = () => {
    let score = 0;
    if (!password) return score;
    if (password.length > 6) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    return score;
  };

  const strength = getPasswordStrength();
  const strengthColors = ['#E0E0E0', '#EF5350', '#FFCA28', '#66BB6A', '#2E7D32'];
  const strengthColor = strengthColors[strength];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }
    if (strength < 2) {
      toast.error("Please choose a stronger password.");
      return;
    }

    setIsLoading(true);
    const res = await register(name, email, password, phone);
    setIsLoading(false);
    
    if (res.success) {
      toast.success('Account Created Successfully');
      navigate('/');
    } else {
      toast.error(res.message);
    }
  };

  return (
    <div className="container section" style={{ display: 'flex', justifyContent: 'center' }}>
      <div className="card" style={{ padding: '3rem', width: '100%', maxWidth: '450px' }}>
        <h2 className="section-title" style={{ fontSize: '2rem', marginBottom: '2rem' }}>Create Account</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Full Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="input-elegant" />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="input-elegant" />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Phone Number</label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required className="input-elegant" />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="input-elegant" />
            <div style={{ marginTop: '8px', height: '6px', borderRadius: '3px', backgroundColor: '#E0E0E0', overflow: 'hidden' }}>
              <div style={{ width: `${(strength / 4) * 100}%`, height: '100%', backgroundColor: strengthColor, transition: 'all 0.3s' }} />
            </div>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Confirm Password</label>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="input-elegant" style={{ borderColor: confirmPassword && password !== confirmPassword ? '#EF5350' : '' }} />
          </div>
          <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }} disabled={isLoading}>
            {isLoading ? 'Processing...' : 'Register'}
          </button>
        </form>
        <p style={{ marginTop: '1.5rem', textAlign: 'center' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Login</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
