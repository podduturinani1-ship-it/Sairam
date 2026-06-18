import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { LayoutDashboard, Users, UserCog, Settings, ShoppingBag, Calendar, UtensilsCrossed, Star, LogOut, Activity, DollarSign } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

// Reusing Admin components for the Boss to see everything
import AdminOrders from '../components/admin/AdminOrders';
import AdminMenu from '../components/admin/AdminMenu';
import AdminReservations from '../components/admin/AdminReservations';
import AdminCustomers from '../components/admin/AdminCustomers';

const BossOverview = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/analytics`, config);
        setData(res.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching boss analytics:', err);
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [user]);

  if (loading) return <div style={{ padding: '2rem', color: '#FFF' }}>Loading Company Analytics...</div>;
  if (!data) return <div style={{ padding: '2rem', color: '#EF5350' }}>Failed to load analytics data.</div>;

  return (
    <div style={{ padding: '2rem', color: '#FFF' }}>
      <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', marginBottom: '2rem' }}>Boss Command Center</h2>
      
      {/* Financials & Growth */}
      <h3 style={{ color: 'var(--secondary)', marginBottom: '1rem', borderBottom: '1px solid #333', paddingBottom: '0.5rem' }}>Financial & Growth Metrics</h3>
      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="card" style={{ backgroundColor: '#1E1E1E', padding: '1.5rem', borderLeft: '4px solid #4CAF50' }}>
          <h3 style={{ color: '#AAA', fontSize: '0.9rem', textTransform: 'uppercase' }}>Total Revenue</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '10px 0 0' }}>₹{data.revenue.total}</p>
        </div>
        <div className="card" style={{ backgroundColor: '#1E1E1E', padding: '1.5rem', borderLeft: '4px solid #8BC34A' }}>
          <h3 style={{ color: '#AAA', fontSize: '0.9rem', textTransform: 'uppercase' }}>Today's Revenue</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '10px 0 0' }}>₹{data.revenue.today}</p>
        </div>
        <div className="card" style={{ backgroundColor: '#1E1E1E', padding: '1.5rem', borderLeft: '4px solid var(--secondary)' }}>
          <h3 style={{ color: '#AAA', fontSize: '0.9rem', textTransform: 'uppercase' }}>Average Order Value</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '10px 0 0' }}>₹{data.revenue.avgOrderValue}</p>
        </div>
        <div className="card" style={{ backgroundColor: '#1E1E1E', padding: '1.5rem', borderLeft: '4px solid #9C27B0' }}>
          <h3 style={{ color: '#AAA', fontSize: '0.9rem', textTransform: 'uppercase' }}>Total Customers</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '10px 0 0' }}>{data.customers.total}</p>
          <p style={{ fontSize: '0.8rem', color: '#4CAF50', margin: '5px 0 0' }}>+{data.customers.thisMonth} this month</p>
        </div>
      </div>

      {/* Operations & Logistics */}
      <h3 style={{ color: '#2196F3', marginBottom: '1rem', borderBottom: '1px solid #333', paddingBottom: '0.5rem' }}>Operations & Logistics</h3>
      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="card" style={{ backgroundColor: '#1E1E1E', padding: '1.5rem', borderLeft: '4px solid #2196F3' }}>
          <h3 style={{ color: '#AAA', fontSize: '0.9rem', textTransform: 'uppercase' }}>Orders Today</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '10px 0 0' }}>{data.orders.today}</p>
          <p style={{ fontSize: '0.8rem', color: '#AAA', margin: '5px 0 0' }}>{data.orders.total} all time</p>
        </div>
        <div className="card" style={{ backgroundColor: '#1E1E1E', padding: '1.5rem', borderLeft: '4px solid #FF9800' }}>
          <h3 style={{ color: '#AAA', fontSize: '0.9rem', textTransform: 'uppercase' }}>Active Drivers</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '10px 0 0' }}>{data.staff.activeDrivers}</p>
          <p style={{ fontSize: '0.8rem', color: data.staff.pendingDeliveries > 0 ? '#FF9800' : '#4CAF50', margin: '5px 0 0' }}>{data.staff.pendingDeliveries} pending deliveries</p>
        </div>
        <div className="card" style={{ backgroundColor: '#1E1E1E', padding: '1.5rem', borderLeft: '4px solid #E91E63' }}>
          <h3 style={{ color: '#AAA', fontSize: '0.9rem', textTransform: 'uppercase' }}>Kitchen Output Today</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '10px 0 0' }}>{data.staff.kitchenPreparedToday}</p>
          <p style={{ fontSize: '0.8rem', color: '#AAA', margin: '5px 0 0' }}>Dishes prepared</p>
        </div>
        <div className="card" style={{ backgroundColor: '#1E1E1E', padding: '1.5rem', borderLeft: '4px solid #00BCD4' }}>
          <h3 style={{ color: '#AAA', fontSize: '0.9rem', textTransform: 'uppercase' }}>Reservations Today</h3>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: '10px 0 0' }}>{data.reservations.today}</p>
          <p style={{ fontSize: '0.8rem', color: '#AAA', margin: '5px 0 0' }}>{data.reservations.upcomingWeek} upcoming this week</p>
        </div>
      </div>
    </div>
  );
};

const StaffManagement = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '', role: 'kitchen' });

  const fetchStaff = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/users`, config);
      // Filter out customers, show only staff
      setStaff(data.filter(u => u.role !== 'customer'));
      setLoading(false);
    } catch (error) {
      toast.error('Failed to load staff');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post(`${import.meta.env.VITE_API_URL}/users/staff`, formData, config);
      toast.success(`${formData.role} created successfully!`);
      setFormData({ name: '', email: '', password: '', phone: '', role: 'kitchen' });
      fetchStaff();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error creating staff');
    }
  };

  const toggleDisable = async (id, currentStatus) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`${import.meta.env.VITE_API_URL}/users/${id}`, { isDisabled: !currentStatus }, config);
      toast.success(`Staff account ${!currentStatus ? 'disabled' : 'enabled'}`);
      fetchStaff();
    } catch (error) {
      toast.error('Failed to toggle status');
    }
  };

  const deleteUser = async (id) => {
    if (window.confirm('Are you sure you want to completely delete this staff member?')) {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        await axios.delete(`${import.meta.env.VITE_API_URL}/users/${id}`, config);
        toast.success('Staff deleted');
        fetchStaff();
      } catch (error) {
        toast.error('Failed to delete staff');
      }
    }
  };

  return (
    <div style={{ padding: '2rem', color: '#FFF' }}>
      <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', marginBottom: '2rem' }}>Staff Management</h2>
      
      <div className="card" style={{ backgroundColor: '#1E1E1E', padding: '2rem', marginBottom: '2rem' }}>
        <h3 style={{ marginBottom: '1.5rem', fontSize: '1.2rem', color: 'var(--secondary)' }}>Hire New Staff</h3>
        <form onSubmit={handleCreateStaff} className="grid grid-cols-2 gap-4">
          <input type="text" placeholder="Full Name" className="input-elegant" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
          <input type="email" placeholder="Email Address" className="input-elegant" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
          <input type="text" placeholder="Phone Number" className="input-elegant" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required />
          <input type="password" placeholder="Temporary Password" className="input-elegant" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required />
          <select className="input-elegant" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} required>
            <option value="admin">Admin</option>
            <option value="kitchen">Kitchen Staff</option>
            <option value="driver">Delivery Driver</option>
          </select>
          <button type="submit" className="btn btn-primary">Create Staff Account</button>
        </form>
      </div>

      <div className="card" style={{ backgroundColor: '#1E1E1E', overflow: 'hidden' }}>
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#2A2A2A', borderBottom: '1px solid #333' }}>
              <th style={{ padding: '1rem' }}>Name</th>
              <th style={{ padding: '1rem' }}>Role</th>
              <th style={{ padding: '1rem' }}>Email / Phone</th>
              <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? <tr><td colSpan="4" style={{ padding: '1rem', textAlign: 'center' }}>Loading...</td></tr> : 
              staff.map(s => (
                <tr key={s._id} style={{ borderBottom: '1px solid #333', opacity: s.isDisabled ? 0.5 : 1 }}>
                  <td style={{ padding: '1rem', fontWeight: 'bold' }}>{s.name}</td>
                  <td style={{ padding: '1rem', textTransform: 'capitalize', color: 'var(--secondary)' }}>{s.role}</td>
                  <td style={{ padding: '1rem' }}>{s.email} <br/><small style={{ color: '#888' }}>{s.phone}</small></td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    {s.role !== 'boss' && (
                      <>
                        <button onClick={() => toggleDisable(s._id, s.isDisabled)} className="btn btn-outline" style={{ padding: '4px 10px', fontSize: '0.8rem', marginRight: '10px', borderColor: s.isDisabled ? '#4CAF50' : '#FF9800', color: s.isDisabled ? '#4CAF50' : '#FF9800' }}>
                          {s.isDisabled ? 'Enable' : 'Disable'}
                        </button>
                        <button onClick={() => deleteUser(s._id)} className="btn btn-outline" style={{ padding: '4px 10px', fontSize: '0.8rem', borderColor: '#EF5350', color: '#EF5350' }}>
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>
    </div>
  );
};

const BossDashboard = () => {
  const { logout } = useAuth();
  const location = useLocation();

  const menuItems = [
    { path: '/boss', icon: <LayoutDashboard size={20} />, label: 'Overview' },
    { path: '/boss/staff', icon: <UserCog size={20} />, label: 'Staff Management' },
    { path: '/boss/orders', icon: <ShoppingBag size={20} />, label: 'All Orders' },
    { path: '/boss/reservations', icon: <Calendar size={20} />, label: 'Reservations' },
    { path: '/boss/menu', icon: <UtensilsCrossed size={20} />, label: 'Menu' },
    { path: '/boss/customers', icon: <Users size={20} />, label: 'Customers' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#121212' }}>
      {/* Boss Sidebar */}
      <div style={{ width: '280px', backgroundColor: '#1E1E1E', borderRight: '1px solid #333', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '2rem', borderBottom: '1px solid #333' }}>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', color: 'var(--secondary)', margin: 0, letterSpacing: '2px' }}>SAI RAM</h1>
          <p style={{ color: '#888', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '5px' }}>Boss Terminal</p>
        </div>
        
        <nav style={{ padding: '1.5rem 1rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '5px' }}>
          {menuItems.map(item => (
            <Link 
              key={item.path} 
              to={item.path} 
              style={{ 
                display: 'flex', alignItems: 'center', gap: '15px', padding: '12px 20px', 
                borderRadius: '8px', textDecoration: 'none', transition: 'all 0.2s',
                backgroundColor: location.pathname === item.path ? 'rgba(212, 175, 55, 0.1)' : 'transparent',
                color: location.pathname === item.path ? 'var(--secondary)' : '#AAA',
                fontWeight: location.pathname === item.path ? 'bold' : 'normal'
              }}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>
        
        <div style={{ padding: '2rem', borderTop: '1px solid #333' }}>
          <button 
            onClick={logout} 
            style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#EF5350', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', width: '100%', padding: '10px', borderRadius: '8px', transition: 'background 0.2s' }}
            onMouseOver={e => e.currentTarget.style.backgroundColor = 'rgba(239, 83, 80, 0.1)'}
            onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <LogOut size={20} />
            Secure Logout
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <Routes>
          <Route path="/" element={<BossOverview />} />
          <Route path="/staff" element={<StaffManagement />} />
          <Route path="/orders" element={<AdminOrders />} />
          <Route path="/reservations" element={<AdminReservations />} />
          <Route path="/menu" element={<AdminMenu />} />
          <Route path="/customers" element={<AdminCustomers />} />
          <Route path="*" element={<Navigate to="/boss" replace />} />
        </Routes>
      </div>
    </div>
  );
};

export default BossDashboard;
