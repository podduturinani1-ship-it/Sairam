import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Home, Utensils, ShoppingBag, Calendar, Heart, Star, User as UserIcon, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('orders');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) {
    return (
      <div className="container section text-center" style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <UserIcon size={64} color="#ccc" style={{ marginBottom: '1rem' }} />
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', marginBottom: '1rem' }}>Authentication Required</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Please login to access your personal dashboard.</p>
        <button className="btn btn-primary" onClick={() => navigate('/login')}>Login to Account</button>
      </div>
    );
  }

  const SIDEBAR_LINKS = [
    { id: 'profile', label: 'Account Profile', icon: <UserIcon size={18} />, action: () => setActiveTab('profile') },
    { id: 'orders', label: 'My Orders', icon: <ShoppingBag size={18} />, action: () => navigate('/my-orders') },
    { id: 'reservations', label: 'My Reservations', icon: <Calendar size={18} />, action: () => setActiveTab('reservations') },
  ];

  const [reservations, setReservations] = useState([]);
  const [loadingRes, setLoadingRes] = useState(false);

  React.useEffect(() => {
    if (activeTab === 'reservations' && user) {
      setLoadingRes(true);
      fetch(`${import.meta.env.VITE_API_URL}/reservations/myreservations`, {
        headers: { Authorization: `Bearer ${user.token}` }
      })
      .then(res => res.json())
      .then(data => {
        setReservations(data);
        setLoadingRes(false);
      })
      .catch(() => setLoadingRes(false));
    }
  }, [activeTab, user]);

  return (
    <div style={{ backgroundColor: 'var(--bg-color)', minHeight: '100vh', padding: '100px 0 4rem' }}>
      <div className="container">
        
        <div className="grid md:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="card" style={{ padding: '2rem 1rem', height: 'fit-content' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '1px solid #EEE' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'var(--secondary)', color: 'var(--surface-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 'bold', margin: '0 auto 1rem' }}>
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <h3 style={{ margin: 0, fontFamily: 'var(--font-serif)', fontSize: '1.5rem' }}>{user.name || 'Valued Guest'}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{user.email}</p>
            </div>
            
            <ul style={{ listStyle: 'none' }}>
              {SIDEBAR_LINKS.map(link => (
                <li key={link.id} className="mb-2">
                  <button 
                    onClick={link.action}
                    className={`btn ${activeTab === link.id ? 'btn-primary' : 'btn-outline'}`}
                    style={{ width: '100%', justifyContent: 'flex-start', padding: '12px 20px', border: activeTab === link.id ? 'none' : '1px solid transparent', color: activeTab === link.id ? '' : 'var(--text-secondary)' }}
                  >
                    <span style={{ marginRight: '12px' }}>{link.icon}</span> {link.label}
                  </button>
                </li>
              ))}
              <li style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid #EEE' }}>
                <button 
                  onClick={handleLogout}
                  className="btn"
                  style={{ width: '100%', justifyContent: 'flex-start', padding: '12px 20px', color: 'var(--primary)', fontWeight: 'bold' }}
                >
                  <span style={{ marginRight: '12px' }}><LogOut size={18} /></span> Logout
                </button>
              </li>
            </ul>
          </div>
          
          {/* Main Content Area */}
          <div className="md:col-span-3">
            <AnimatePresence mode="wait">

              {activeTab === 'reservations' && (
                <motion.div key="reservations" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="card" style={{ padding: '2.5rem' }}>
                  <div className="flex justify-between items-center mb-6" style={{ borderBottom: '2px solid var(--secondary)', paddingBottom: '1rem' }}>
                    <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', margin: 0 }}>My Reservations</h2>
                    <button className="btn btn-primary" onClick={() => navigate('/booking')} style={{ padding: '8px 16px' }}>Book New Table</button>
                  </div>
                  
                  {loadingRes ? (
                     <p>Loading reservations...</p>
                  ) : reservations.length === 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 0', color: 'var(--text-secondary)' }}>
                      <Calendar size={64} style={{ color: '#E0E0E0', marginBottom: '1rem' }} />
                      <p style={{ fontSize: '1.2rem' }}>You don't have any upcoming reservations.</p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {reservations.map(res => (
                        <div key={res._id} style={{ padding: '1.5rem', border: '1px solid #EEE', borderRadius: '8px' }}>
                          <h4 style={{ margin: '0 0 10px 0' }}>Table {res.tableNumber} on {res.floor}</h4>
                          <p style={{ margin: 0, color: 'var(--text-secondary)' }}>{res.date} at {res.time} • {res.numberOfGuests} Guests</p>
                          <span style={{ display: 'inline-block', marginTop: '10px', padding: '4px 12px', borderRadius: '20px', backgroundColor: res.status === 'Confirmed' ? '#E8F5E9' : '#FFF3E0', color: res.status === 'Confirmed' ? '#2E7D32' : '#EF6C00', fontSize: '0.85rem', fontWeight: 'bold' }}>{res.status}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
              
              {activeTab === 'profile' && (
                <motion.div key="profile" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="card" style={{ padding: '2.5rem' }}>
                  <div className="flex justify-between items-center mb-6" style={{ borderBottom: '2px solid var(--secondary)', paddingBottom: '1rem' }}>
                    <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', margin: 0 }}>Account Details</h2>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '4px' }}>Full Name</label>
                      <div style={{ fontSize: '1.1rem', fontWeight: 500, padding: '12px', backgroundColor: '#FAFAFA', borderRadius: '4px', border: '1px solid #EEE' }}>{user.name || 'Not provided'}</div>
                    </div>
                    <div>
                      <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '4px' }}>Email Address</label>
                      <div style={{ fontSize: '1.1rem', fontWeight: 500, padding: '12px', backgroundColor: '#FAFAFA', borderRadius: '4px', border: '1px solid #EEE' }}>{user.email}</div>
                    </div>
                    <div>
                      <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '4px' }}>Phone Number</label>
                      <div style={{ fontSize: '1.1rem', fontWeight: 500, padding: '12px', backgroundColor: '#FAFAFA', borderRadius: '4px', border: '1px solid #EEE' }}>{user.phone || 'Not provided'}</div>
                    </div>
                    <div>
                      <label style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '4px' }}>Account Type</label>
                      <div style={{ fontSize: '1.1rem', fontWeight: 500, padding: '12px', backgroundColor: '#FAFAFA', borderRadius: '4px', border: '1px solid #EEE', textTransform: 'capitalize' }}>{user.role}</div>
                    </div>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
