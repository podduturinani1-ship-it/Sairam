import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Truck, CheckCircle, Navigation, Phone, Navigation2, User, Save, History, BarChart2, Package, Shield, Search, Activity, Star, TrendingUp, Info } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';

const DeliveryDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('available'); // 'available', 'active', 'history', 'analytics', 'profile'
  const { user, updateUserState, logout } = useAuth();
  const navigate = useNavigate();

  // Profile Form State
  const [profileData, setProfileData] = useState({
    name: '',
    phone: '',
    emergencyContact: '',
    dateOfBirth: '',
    vehicleType: 'Bike',
    vehicleBrand: '',
    vehicleModel: '',
    insuranceStatus: 'None',
    licenseNumber: ''
  });

  // History Filter State
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!user || (user.role !== 'driver' && user.role !== 'boss')) {
      toast.error('Unauthorized access');
      navigate('/');
      return;
    }
    
    setProfileData({
      name: user.name || '',
      phone: user.phone || '',
      emergencyContact: user.emergencyContact || '',
      dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : '',
      vehicleType: user.vehicleType || 'Bike',
      vehicleBrand: user.vehicleBrand || '',
      vehicleModel: user.vehicleModel || '',
      insuranceStatus: user.insuranceStatus || 'None',
      licenseNumber: user.licenseNumber || ''
    });

    fetchOrders();

    const socket = io(import.meta.env.VITE_API_URL.replace('/api', ''));
    socket.on('orderStatusUpdated', (updatedOrder) => {
      if (updatedOrder.orderType !== 'Delivery') return;
      
      setOrders(prev => {
        const existing = prev.find(o => o._id === updatedOrder._id);
        if (existing) {
          return prev.map(o => o._id === updatedOrder._id ? updatedOrder : o);
        } else {
          return [...prev, updatedOrder];
        }
      });
    });

    return () => socket.disconnect();
  }, [user, navigate]);

  const fetchOrders = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/orders`, config);
      setOrders(res.data);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to load orders');
      setLoading(false);
    }
  };

  const updateDeliveryStatus = async (orderId, newStatus) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`${import.meta.env.VITE_API_URL}/orders/${orderId}/status`, { 
        deliveryStatus: newStatus,
        assignedDriver: user._id
      }, config);
      toast.success(`Order marked as: ${newStatus}`);
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  const toggleOnlineStatus = async () => {
    try {
      const newStatus = !user.isOnline;
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const res = await axios.put(`${import.meta.env.VITE_API_URL}/users/profile`, { isOnline: newStatus }, config);
      updateUserState(res.data);
      if (newStatus) {
        fetchOrders();
      }
      toast.success(newStatus ? 'You are now Online & Ready for deliveries' : 'You are now Offline');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change online status');
    }
  };

  const updateProfile = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const res = await axios.put(`${import.meta.env.VITE_API_URL}/users/profile`, profileData, config);
      updateUserState(res.data);
      toast.success('Driver Profile & Vehicle Info Updated Successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  };

  const openGoogleMaps = (address) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`, '_blank');
  };

  if (loading) return <div style={{ color: '#FFF', textAlign: 'center', padding: '4rem' }}>Loading Driver Portal...</div>;

  const availableOrders = orders.filter(o => 
    (!o.assignedDriver || o.assignedDriver === null) && 
    (o.deliveryStatus === 'Pending' || o.deliveryStatus === 'Ready For Pickup') && 
    o.status !== 'Cancelled'
  );

  const myActiveOrders = orders.filter(o => 
    o.assignedDriver && o.assignedDriver._id === user._id && 
    o.deliveryStatus !== 'Delivered' && 
    o.status !== 'Cancelled'
  );

  const myCompletedOrders = orders.filter(o => 
    o.assignedDriver && o.assignedDriver._id === user._id && 
    o.deliveryStatus === 'Delivered'
  );

  const today = new Date().toDateString();
  const deliveriesToday = myCompletedOrders.filter(o => new Date(o.updatedAt).toDateString() === today).length;
  
  // Analytics Calculations
  const mockDeliveryFee = 50;
  const todayEarnings = deliveriesToday * mockDeliveryFee;
  const totalEarnings = myCompletedOrders.length * mockDeliveryFee;
  
  // Real Analytics
  const totalAssigned = myActiveOrders.length + myCompletedOrders.length;
  const successRate = totalAssigned > 0 ? Math.round((myCompletedOrders.length / totalAssigned) * 100) : 0;

  // History Filter Logic
  const filteredHistory = myCompletedOrders.filter(order => {
    const matchesSearch = order._id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (order.userId?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div style={{ backgroundColor: '#121212', minHeight: '100vh', color: '#FFF' }}>
      
      {/* Top Navigation Header */}
      <header style={{ backgroundColor: '#1A1A1A', borderBottom: '1px solid #333', padding: '1rem 2rem', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ backgroundColor: 'var(--primary)', color: '#FFF', width: '40px', height: '40px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Navigation2 size={24} />
            </div>
            <div>
              <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', color: '#FFF', margin: 0, lineHeight: 1 }}>Driver Partner</h1>
              <p style={{ color: '#AAA', margin: 0, fontSize: '0.8rem' }}>ID: {user._id.slice(-6).toUpperCase()}</p>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button 
              onClick={toggleOnlineStatus}
              className="btn"
              style={{ 
                backgroundColor: user.isOnline ? 'rgba(76, 175, 80, 0.1)' : 'rgba(239, 83, 80, 0.1)', 
                border: `1px solid ${user.isOnline ? '#4CAF50' : '#EF5350'}`,
                padding: '8px 16px', 
                borderRadius: '20px', 
                color: user.isOnline ? '#4CAF50' : '#EF5350',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontWeight: 'bold',
                transition: 'all 0.3s ease'
              }}
            >
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: user.isOnline ? '#4CAF50' : '#EF5350', boxShadow: `0 0 8px ${user.isOnline ? '#4CAF50' : '#EF5350'}` }}></div>
              {user.isOnline ? 'ONLINE' : 'OFFLINE'}
            </button>
            <button onClick={() => setActiveTab('profile')} className="btn btn-outline" style={{ display: 'flex', gap: '8px', alignItems: 'center', padding: '8px 16px', border: activeTab === 'profile' ? '1px solid var(--secondary)' : '1px solid #333' }}>
              <User size={16} /> Profile
            </button>
          </div>
        </div>
      </header>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        
        {/* Main Tab Navigation */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid #333', paddingBottom: '1rem', overflowX: 'auto' }}>
          <button onClick={() => setActiveTab('available')} style={{ background: 'none', border: 'none', color: activeTab === 'available' ? 'var(--secondary)' : '#AAA', fontWeight: activeTab === 'available' ? 'bold' : 'normal', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '8px', borderBottom: activeTab === 'available' ? '2px solid var(--secondary)' : '2px solid transparent' }}>
            <Package size={18} /> Available ({availableOrders.length})
          </button>
          <button onClick={() => setActiveTab('active')} style={{ background: 'none', border: 'none', color: activeTab === 'active' ? 'var(--secondary)' : '#AAA', fontWeight: activeTab === 'active' ? 'bold' : 'normal', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '8px', borderBottom: activeTab === 'active' ? '2px solid var(--secondary)' : '2px solid transparent' }}>
            <Navigation size={18} /> My Deliveries ({myActiveOrders.length})
          </button>
          <button onClick={() => setActiveTab('history')} style={{ background: 'none', border: 'none', color: activeTab === 'history' ? 'var(--secondary)' : '#AAA', fontWeight: activeTab === 'history' ? 'bold' : 'normal', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '8px', borderBottom: activeTab === 'history' ? '2px solid var(--secondary)' : '2px solid transparent' }}>
            <History size={18} /> History
          </button>
          <button onClick={() => setActiveTab('analytics')} style={{ background: 'none', border: 'none', color: activeTab === 'analytics' ? 'var(--secondary)' : '#AAA', fontWeight: activeTab === 'analytics' ? 'bold' : 'normal', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '8px', borderBottom: activeTab === 'analytics' ? '2px solid var(--secondary)' : '2px solid transparent' }}>
            <BarChart2 size={18} /> Analytics & Earnings
          </button>
        </div>

        <AnimatePresence mode="wait">
          
          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <motion.div key="profile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
                
                {/* Left Column - Overview & Security */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                  
                  {/* Driver Overview Card */}
                  <div style={{ backgroundColor: '#1E1E1E', padding: '2rem', borderRadius: '12px', border: '1px solid #333', textAlign: 'center' }}>
                    <div style={{ width: '100px', height: '100px', borderRadius: '50%', backgroundColor: '#2A2A2A', margin: '0 auto 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '3px solid var(--primary)' }}>
                      <User size={48} color="#AAA" />
                    </div>
                    <h2 style={{ fontSize: '1.8rem', margin: '0 0 5px' }}>{user.name}</h2>
                    <p style={{ color: '#AAA', margin: '0 0 1rem' }}>Employee ID: {user._id.slice(-6).toUpperCase()}</p>
                    
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1rem' }}>
                      <span style={{ backgroundColor: 'rgba(76, 175, 80, 0.1)', color: '#4CAF50', padding: '4px 12px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                        {user.isOnline ? 'Active on Field' : 'Currently Offline'}
                      </span>
                    </div>
                  </div>

                  {/* Security & System Info */}
                  <div style={{ backgroundColor: '#1E1E1E', padding: '2rem', borderRadius: '12px', border: '1px solid #333' }}>
                    <h3 style={{ borderBottom: '1px solid #333', paddingBottom: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Shield size={20} color="var(--primary)" /> Account Security
                    </h3>
                    <div style={{ color: '#AAA', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Last Login:</span>
                        <span style={{ color: '#FFF' }}>{user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Just now'}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Device Info:</span>
                        <span style={{ color: '#FFF', maxWidth: '60%', textAlign: 'right', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={user.deviceInfo}>
                          {user.deviceInfo || 'Secure Device'}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #333', paddingTop: '12px', marginTop: '4px' }}>
                        <span>Account Role:</span>
                        <span style={{ color: '#FFF', textTransform: 'uppercase' }}>{user.role}</span>
                      </div>
                    </div>
                    <button onClick={logout} className="btn btn-outline" style={{ width: '100%', marginTop: '1.5rem', color: '#EF5350', borderColor: '#EF5350' }}>
                      Logout Device
                    </button>
                  </div>
                </div>

                {/* Right Column - Edit Forms */}
                <div style={{ backgroundColor: '#1E1E1E', padding: '2rem', borderRadius: '12px', border: '1px solid #333' }}>
                  <form onSubmit={updateProfile}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid #333', paddingBottom: '1rem' }}>
                      <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Info size={24} color="var(--primary)" /> Professional Details
                      </h2>
                      <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Save size={18} /> Save Changes
                      </button>
                    </div>

                    <h3 style={{ color: '#AAA', fontSize: '1rem', marginBottom: '1rem' }}>Personal Information</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: '#888' }}>Full Name</label>
                        <input type="text" className="input-elegant" value={profileData.name} onChange={e => setProfileData({...profileData, name: e.target.value})} required />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: '#888' }}>Phone Number</label>
                        <input type="text" className="input-elegant" value={profileData.phone} onChange={e => setProfileData({...profileData, phone: e.target.value})} required />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: '#888' }}>Emergency Contact (Family/Friend)</label>
                        <input type="text" className="input-elegant" value={profileData.emergencyContact} onChange={e => setProfileData({...profileData, emergencyContact: e.target.value})} placeholder="+91..." />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: '#888' }}>Date of Birth</label>
                        <input type="date" className="input-elegant" value={profileData.dateOfBirth} onChange={e => setProfileData({...profileData, dateOfBirth: e.target.value})} />
                      </div>
                    </div>

                    <h3 style={{ color: '#AAA', fontSize: '1rem', marginBottom: '1rem', borderTop: '1px solid #333', paddingTop: '2rem' }}>Vehicle Information</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: '#888' }}>Vehicle Type</label>
                        <select className="input-elegant" value={profileData.vehicleType} onChange={e => setProfileData({...profileData, vehicleType: e.target.value})}>
                          <option value="Bike">Bike</option>
                          <option value="Scooter">Scooter</option>
                          <option value="Car">Car</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: '#888' }}>License Number</label>
                        <input type="text" className="input-elegant" value={profileData.licenseNumber} onChange={e => setProfileData({...profileData, licenseNumber: e.target.value})} placeholder="MH-12-..." />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: '#888' }}>Vehicle Brand & Model</label>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <input type="text" className="input-elegant" value={profileData.vehicleBrand} onChange={e => setProfileData({...profileData, vehicleBrand: e.target.value})} placeholder="Honda" style={{ flex: 1 }} />
                          <input type="text" className="input-elegant" value={profileData.vehicleModel} onChange={e => setProfileData({...profileData, vehicleModel: e.target.value})} placeholder="Activa" style={{ flex: 1 }} />
                        </div>
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', color: '#888' }}>Insurance Status</label>
                        <select className="input-elegant" value={profileData.insuranceStatus} onChange={e => setProfileData({...profileData, insuranceStatus: e.target.value})}>
                          <option value="Active">Active (Verified)</option>
                          <option value="Expired">Expired</option>
                          <option value="None">None</option>
                        </select>
                      </div>
                    </div>

                  </form>
                </div>

              </div>
            </motion.div>
          )}

          {/* AVAILABLE TAB */}
          {activeTab === 'available' && (
            <motion.div key="available" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              {!user.isOnline ? (
                <div style={{ backgroundColor: 'rgba(239, 83, 80, 0.1)', border: '1px solid #EF5350', padding: '4rem', borderRadius: '12px', textAlign: 'center', color: '#EF5350' }}>
                  <Truck size={64} style={{ margin: '0 auto 1.5rem', opacity: 0.5 }} />
                  <h2 style={{ margin: '0 0 10px', fontSize: '2rem' }}>You are currently Offline</h2>
                  <p style={{ fontSize: '1.2rem' }}>Go online to start receiving delivery requests.</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                  {availableOrders.map(order => (
                    <div key={order._id} style={{ backgroundColor: '#1E1E1E', padding: '1.5rem', borderRadius: '12px', border: '1px solid #333' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <span style={{ fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--secondary)' }}>#{order._id.slice(-4).toUpperCase()}</span>
                        <span style={{ fontSize: '0.8rem', color: '#AAA', backgroundColor: '#333', padding: '2px 8px', borderRadius: '10px' }}>{order.deliveryStatus || 'Pending'}</span>
                      </div>
                      <div style={{ marginBottom: '1rem', color: '#FFF' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                          <User size={14} color="#AAA" /> <span>{order.userId?.name || 'Guest Customer'}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                          <MapPin size={14} color="#AAA" style={{ marginTop: '4px' }}/> 
                          <span style={{ fontSize: '0.9rem', lineHeight: '1.4' }}>{order.deliveryAddress}</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderTop: '1px solid #333', paddingTop: '1rem' }}>
                        <span style={{ color: '#AAA', fontSize: '0.9rem' }}>{order.items.reduce((acc, curr) => acc + curr.quantity, 0)} Items</span>
                        <span style={{ fontWeight: 'bold', color: '#4CAF50' }}>₹{order.totalAmount}</span>
                      </div>
                      <button onClick={() => updateDeliveryStatus(order._id, 'Driver Assigned')} className="btn btn-primary" style={{ width: '100%', padding: '12px' }}>
                        Accept Delivery
                      </button>
                    </div>
                  ))}
                  {availableOrders.length === 0 && (
                    <div style={{ color: '#666', gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', backgroundColor: '#1A1A1A', borderRadius: '12px' }}>
                      <Package size={48} style={{ margin: '0 auto 1rem', opacity: 0.2 }} />
                      <p>No available orders waiting for pickup.</p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* ACTIVE DELIVERIES TAB */}
          {activeTab === 'active' && (
            <motion.div key="active" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {myActiveOrders.map(order => (
                  <div key={order._id} style={{ backgroundColor: '#1A1A1A', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--primary)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #333', paddingBottom: '1rem' }}>
                      <span style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#FFF' }}>Order #{order._id.slice(-4).toUpperCase()}</span>
                      <span style={{ backgroundColor: 'var(--primary)', color: '#FFF', padding: '6px 16px', borderRadius: '20px', fontSize: '0.9rem', fontWeight: 'bold' }}>
                        {order.deliveryStatus}
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                      <div style={{ backgroundColor: '#222', padding: '1rem', borderRadius: '8px' }}>
                        <div style={{ color: 'var(--secondary)', marginBottom: '8px', fontSize: '0.8rem', letterSpacing: '1px' }}>DELIVER TO</div>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: '#FFF' }}>
                          <MapPin size={18} style={{ flexShrink: 0, marginTop: '2px', color: '#AAA' }} />
                          <span style={{ lineHeight: '1.5' }}>{order.deliveryAddress}</span>
                        </div>
                        <button onClick={() => openGoogleMaps(order.deliveryAddress)} className="btn btn-outline" style={{ marginTop: '1rem', width: '100%', fontSize: '0.85rem', display: 'flex', justifyContent: 'center', gap: '8px', padding: '8px' }}>
                          <Navigation2 size={16} /> Open in Google Maps
                        </button>
                      </div>
                      
                      <div style={{ backgroundColor: '#222', padding: '1rem', borderRadius: '8px' }}>
                        <div style={{ color: 'var(--secondary)', marginBottom: '8px', fontSize: '0.8rem', letterSpacing: '1px' }}>CUSTOMER CONTACT</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#FFF', fontWeight: 'bold', fontSize: '1.1rem' }}>
                          <User size={16} color="#AAA" /> {order.userId?.name || 'Guest'}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#AAA' }}>
                          <Phone size={16} /> {order.userId?.phone || 'No phone provided'}
                        </div>
                        <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #333', display: 'flex', justifyContent: 'space-between', color: '#FFF' }}>
                          <span>Total Amount:</span>
                          <span style={{ fontWeight: 'bold', color: '#4CAF50' }}>₹{order.totalAmount}</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', borderTop: '1px solid #333', paddingTop: '1.5rem' }}>
                      {order.deliveryStatus === 'Driver Assigned' && (
                        <button onClick={() => updateDeliveryStatus(order._id, 'Picked Up')} className="btn" style={{ flex: 1, backgroundColor: '#FF9800', color: '#FFF', padding: '12px', fontSize: '1.1rem' }}>
                          <Package size={20} style={{ marginRight: '8px', display: 'inline' }}/> Mark as Picked Up
                        </button>
                      )}
                      {order.deliveryStatus === 'Picked Up' && (
                        <button onClick={() => updateDeliveryStatus(order._id, 'Out For Delivery')} className="btn" style={{ flex: 1, backgroundColor: '#42A5F5', color: '#FFF', padding: '12px', fontSize: '1.1rem' }}>
                          <Truck size={20} style={{ marginRight: '8px', display: 'inline' }}/> Start Navigation (Out For Delivery)
                        </button>
                      )}
                      {order.deliveryStatus === 'Out For Delivery' && (
                        <button onClick={() => updateDeliveryStatus(order._id, 'Delivered')} className="btn" style={{ flex: 1, backgroundColor: '#66BB6A', color: '#FFF', padding: '12px', fontSize: '1.1rem' }}>
                          <CheckCircle size={20} style={{ marginRight: '8px', display: 'inline' }}/> Handed to Customer (Delivered)
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {myActiveOrders.length === 0 && (
                  <div style={{ color: '#666', textAlign: 'center', padding: '4rem', backgroundColor: '#1A1A1A', borderRadius: '12px' }}>
                    <Navigation size={48} style={{ margin: '0 auto 1rem', opacity: 0.2 }} />
                    <p>You have no active deliveries. Check the Available tab.</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* HISTORY TAB */}
          {activeTab === 'history' && (
            <motion.div key="history" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'center' }}>
                <div style={{ position: 'relative', width: '300px' }}>
                  <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
                  <input 
                    type="text" 
                    placeholder="Search Order ID or Customer..." 
                    className="input-elegant" 
                    style={{ paddingLeft: '40px', margin: 0 }}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ backgroundColor: '#1E1E1E', borderRadius: '12px', border: '1px solid #333', overflow: 'hidden' }}>
                <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#2A2A2A', borderBottom: '1px solid #333' }}>
                      <th style={{ padding: '1rem', color: '#AAA' }}>Order ID</th>
                      <th style={{ padding: '1rem', color: '#AAA' }}>Date Completed</th>
                      <th style={{ padding: '1rem', color: '#AAA' }}>Customer</th>
                      <th style={{ padding: '1rem', color: '#AAA', textAlign: 'right' }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredHistory.map(order => (
                      <tr key={order._id} style={{ borderBottom: '1px solid #333' }}>
                        <td style={{ padding: '1rem', color: '#FFF', fontWeight: 'bold' }}>#{order._id.slice(-4).toUpperCase()}</td>
                        <td style={{ padding: '1rem', color: '#AAA' }}>{new Date(order.updatedAt).toLocaleString()}</td>
                        <td style={{ padding: '1rem', color: '#FFF' }}>{order.userId?.name || 'Guest'}</td>
                        <td style={{ padding: '1rem', color: '#4CAF50', textAlign: 'right', fontWeight: 'bold' }}>₹{order.totalAmount}</td>
                      </tr>
                    ))}
                    {filteredHistory.length === 0 && (
                      <tr>
                        <td colSpan="4" style={{ padding: '3rem', textAlign: 'center', color: '#666' }}>No deliveries found matching your search.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* ANALYTICS TAB */}
          {activeTab === 'analytics' && (
            <motion.div key="analytics" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                
                {/* Earnings Card */}
                <div style={{ backgroundColor: '#1E1E1E', padding: '2rem', borderRadius: '12px', border: '1px solid #333' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)', marginBottom: '1.5rem' }}>
                    <TrendingUp size={24} />
                    <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Earnings Dashboard</h3>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #333', paddingBottom: '1rem' }}>
                      <div>
                        <div style={{ color: '#AAA', fontSize: '0.9rem', marginBottom: '4px' }}>Today's Earnings</div>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#4CAF50' }}>₹{todayEarnings}</div>
                      </div>
                      <div style={{ backgroundColor: 'rgba(76, 175, 80, 0.1)', color: '#4CAF50', padding: '8px 16px', borderRadius: '20px', fontSize: '0.9rem' }}>
                        {deliveriesToday} trips
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ color: '#AAA', fontSize: '0.9rem', marginBottom: '4px' }}>Total Lifetime Earnings</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#FFF' }}>₹{totalEarnings}</div>
                      </div>
                      <div style={{ color: '#666', fontSize: '0.9rem' }}>
                        Based on ₹{mockDeliveryFee}/trip
                      </div>
                    </div>
                  </div>
                </div>

                {/* Performance Card */}
                <div style={{ backgroundColor: '#1E1E1E', padding: '2rem', borderRadius: '12px', border: '1px solid #333' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--secondary)', marginBottom: '1.5rem' }}>
                    <Activity size={24} />
                    <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Driver Performance</h3>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                    <div style={{ backgroundColor: '#222', padding: '1.5rem', borderRadius: '8px', textAlign: 'center' }}>
                      <Star size={32} color="var(--secondary)" style={{ margin: '0 auto 10px', opacity: 0.5 }} />
                      <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#FFF' }}>No Ratings Yet</div>
                      <div style={{ color: '#AAA', fontSize: '0.8rem', textTransform: 'uppercase' }}>Customer Rating</div>
                    </div>
                    
                    <div style={{ backgroundColor: '#222', padding: '1.5rem', borderRadius: '8px', textAlign: 'center' }}>
                      <CheckCircle size={32} color={totalAssigned > 0 ? "#4CAF50" : "#666"} style={{ margin: '0 auto 10px' }} />
                      <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#FFF' }}>{totalAssigned > 0 ? `${successRate}%` : 'N/A'}</div>
                      <div style={{ color: '#AAA', fontSize: '0.8rem', textTransform: 'uppercase' }}>Success Rate</div>
                    </div>
                  </div>
                  <p style={{ color: '#666', fontSize: '0.8rem', textAlign: 'center', marginTop: '1.5rem', margin: '1.5rem 0 0' }}>Deliveries Completed: {myCompletedOrders.length} / Assigned: {totalAssigned}</p>
                </div>
              </div>

            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
};

export default DeliveryDashboard;
