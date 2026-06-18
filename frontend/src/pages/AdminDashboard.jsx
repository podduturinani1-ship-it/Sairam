import React, { useState, useEffect } from 'react';
import { Users, Utensils, Calendar, ShoppingBag, TrendingUp, LogOut, Star, Settings, Truck } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// Import Admin Subcomponents
import AdminAnalytics from '../components/admin/AdminAnalytics';
import AdminMenu from '../components/admin/AdminMenu';
import AdminOrders from '../components/admin/AdminOrders';
import AdminReservations from '../components/admin/AdminReservations';
import AdminCustomers from '../components/admin/AdminCustomers';
import AdminReviews from '../components/admin/AdminReviews';
import AdminSettings from '../components/admin/AdminSettings';
import AdminDelivery from '../components/admin/AdminDelivery';
import KitchenDashboard from './KitchenDashboard';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('analytics');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Redirect if not admin
  useEffect(() => {
    if (!user || (user.role !== 'admin' && user.role !== 'boss')) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const SIDEBAR_LINKS = [
    { id: 'analytics', label: 'Analytics', icon: <TrendingUp size={18} /> },
    { id: 'orders', label: 'Order Management', icon: <ShoppingBag size={18} /> },
    { id: 'reservations', label: 'Floor Management', icon: <Calendar size={18} /> },
    { id: 'menu', label: 'Menu Items', icon: <Utensils size={18} /> },
    { id: 'customers', label: 'Customers', icon: <Users size={18} /> },
    { id: 'reviews', label: 'Reviews', icon: <Star size={18} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={18} /> },
  ];

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'analytics': return <AdminAnalytics />;
      case 'orders': return <AdminOrders />;
      case 'reservations': return <AdminReservations />;
      case 'menu': return <AdminMenu />;
      case 'customers': return <AdminCustomers />;
      case 'reviews': return <AdminReviews />;
      case 'settings': return <AdminSettings />;
      default: return <AdminAnalytics />;
    }
  };

  return (
    <div style={{ backgroundColor: '#121212', minHeight: '100vh', display: 'flex' }}>
      {/* Sidebar */}
      <div style={{ width: '280px', backgroundColor: '#1E1E1E', color: 'white', display: 'flex', flexDirection: 'column', borderRight: '1px solid #333' }}>
        <div style={{ padding: '2rem 1.5rem', borderBottom: '1px solid #333' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--secondary)', fontSize: '1.8rem', margin: 0 }}>Sai Ram Admin</h2>
          <p style={{ color: '#888', fontSize: '0.8rem', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>Management Portal</p>
        </div>
        
        <div style={{ padding: '1.5rem', flex: 1, overflowY: 'auto' }}>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {SIDEBAR_LINKS.map(link => (
              <li key={link.id} className="mb-2">
                <button 
                  onClick={() => setActiveTab(link.id)}
                  style={{ 
                    width: '100%', display: 'flex', alignItems: 'center', padding: '14px 16px', 
                    borderRadius: '8px', cursor: 'pointer', border: 'none', transition: 'all 0.3s',
                    backgroundColor: activeTab === link.id ? 'rgba(212, 175, 55, 0.1)' : 'transparent',
                    color: activeTab === link.id ? 'var(--secondary)' : '#AAA'
                  }}
                >
                  <span style={{ marginRight: '12px' }}>{link.icon}</span> {link.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
        
        <div style={{ padding: '1.5rem', borderTop: '1px solid #333' }}>
          <button onClick={handleLogout} style={{ width: '100%', display: 'flex', alignItems: 'center', padding: '14px 16px', borderRadius: '8px', cursor: 'pointer', border: 'none', background: 'transparent', color: '#ff6b6b' }}>
            <span style={{ marginRight: '12px' }}><LogOut size={18} /></span> Logout
          </button>
        </div>
      </div>
      
      {/* Main Content */}
      <div style={{ flex: 1, padding: '2rem', overflowY: 'auto', height: '100vh' }}>
        <AnimatePresence mode="wait">
          {renderActiveComponent()}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdminDashboard;
