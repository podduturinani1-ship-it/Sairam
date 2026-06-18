import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Clock, Check, Utensils, Search, ThumbsUp, AlertCircle, MapPin, Hash, User, Navigation, X, ArrowLeft, Send } from 'lucide-react';

const getElapsedTime = (createdAt) => {
  const mins = Math.floor((new Date() - new Date(createdAt)) / 60000);
  return mins;
};

const getPriorityColor = (createdAt) => {
  const mins = getElapsedTime(createdAt);
  if (mins >= 20) return '#EF5350'; 
  if (mins >= 10) return '#FFA726'; 
  return '#66BB6A'; 
};

const getPriorityLabel = (createdAt) => {
  const mins = getElapsedTime(createdAt);
  if (mins >= 20) return 'Urgent';
  if (mins >= 10) return 'High';
  return 'Normal';
};

// Moved OUTSIDE to prevent React re-render unmounting bugs!
const OrderCard = ({ order, currentColumn, updateStatus }) => {
  const elapsed = getElapsedTime(order.createdAt);
  const borderColor = getPriorityColor(order.createdAt);
  const priorityLabel = getPriorityLabel(order.createdAt);
  
  return (
    <div 
      style={{ backgroundColor: '#2A2A2A', borderRadius: '12px', borderLeft: `6px solid ${borderColor}`, boxShadow: '0 4px 6px rgba(0,0,0,0.3)', marginBottom: '1rem', display: 'flex', flexDirection: 'column' }}
    >
      <div style={{ padding: '1rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#FFF' }}>Order ID: #{order._id.slice(-4).toUpperCase()}</span>
            <span style={{ fontWeight: 'bold', color: borderColor, fontSize: '0.9rem', backgroundColor: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '12px' }}>Priority {priorityLabel}</span>
          </div>
          <div style={{ color: '#FFF' }}>Customer Name: <span style={{ color: '#AAA' }}>{order.userId?.name || 'Guest'}</span></div>
          <div style={{ color: '#FFF' }}>Order Type: <span style={{ color: '#AAA', fontWeight: 'bold' }}>{order.orderType}</span></div>
          <div style={{ color: '#FFF' }}>Time Ordered: <span style={{ color: '#AAA' }}>Ordered {elapsed} minutes ago</span></div>
        </div>

        <div style={{ backgroundColor: '#1E1E1E', padding: '10px', borderRadius: '6px', marginBottom: '12px' }}>
          <div style={{ color: '#FFF', fontSize: '0.9rem', marginBottom: '6px', borderBottom: '1px solid #333', paddingBottom: '4px', fontWeight: 'bold' }}>
            Items ({order.items.reduce((acc, i) => acc + i.quantity, 0)})
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {order.items.map((item, idx) => (
              <li key={idx} style={{ display: 'flex', justifyContent: 'flex-start', gap: '10px', marginBottom: '6px', fontSize: '1rem', color: '#FFF' }}>
                <span style={{ fontWeight: 'bold', color: 'var(--secondary)' }}>{item.quantity}x</span>
                <span style={{ flex: 1, color: '#AAA' }}>{item.menuItemId?.name}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* DYNAMIC ACTION BUTTON PANELS */}
        
        {/* 1. New Orders Panel */}
        {['Waiting For Approval', 'Accepted'].includes(order.status) && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '15px' }}>
            <button onClick={() => updateStatus(order, 'Preparing')} className="btn" style={{ backgroundColor: '#4CAF50', color: 'white', padding: '12px', fontWeight: 'bold', display: 'flex', justifyContent: 'center', gap: '8px', border: 'none', borderRadius: '6px' }}>
              <Check size={18} /> Accept Order
            </button>
            <button onClick={() => updateStatus(order, 'Cancelled')} className="btn" style={{ backgroundColor: '#EF5350', color: 'white', padding: '12px', fontWeight: 'bold', display: 'flex', justifyContent: 'center', gap: '8px', border: 'none', borderRadius: '6px' }}>
              <X size={18} /> Reject Order
            </button>
          </div>
        )}

        {/* 2. Preparing Panel */}
        {order.status === 'Preparing' && (
          <div style={{ display: 'flex', flexDirection: 'column', marginTop: '15px' }}>
            <button onClick={() => updateStatus(order, 'Quality Check')} className="btn" style={{ backgroundColor: '#2196F3', color: 'white', padding: '15px', fontWeight: 'bold', display: 'flex', justifyContent: 'center', gap: '8px', border: 'none', borderRadius: '6px', fontSize: '1.1rem' }}>
              <Send size={20} /> Mark Quality Check
            </button>
          </div>
        )}

        {/* 3. Quality Check Panel */}
        {order.status === 'Quality Check' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '15px' }}>
            <button onClick={() => updateStatus(order, 'Ready')} className="btn" style={{ backgroundColor: '#4CAF50', color: 'white', padding: '15px', fontWeight: 'bold', display: 'flex', justifyContent: 'center', gap: '8px', border: 'none', borderRadius: '6px', fontSize: '1.1rem' }}>
              <ThumbsUp size={20} /> Approve Food
            </button>
            <button onClick={() => updateStatus(order, 'Preparing')} className="btn" style={{ backgroundColor: 'transparent', color: '#FFA726', border: '2px solid #FFA726', padding: '10px', fontWeight: 'bold', display: 'flex', justifyContent: 'center', gap: '8px', borderRadius: '6px' }}>
              <ArrowLeft size={18} /> Return To Kitchen
            </button>
          </div>
        )}

        {/* 4. Ready For Pickup Panel (Context Aware) */}
        {order.status === 'Ready' && (
          <div style={{ display: 'flex', flexDirection: 'column', marginTop: '15px' }}>
            {order.orderType === 'Delivery' && (
              <button onClick={() => updateStatus(order, 'FinalizeDelivery')} className="btn" style={{ backgroundColor: '#FF9800', color: 'white', padding: '15px', fontWeight: 'bold', display: 'flex', justifyContent: 'center', gap: '8px', border: 'none', borderRadius: '6px', fontSize: '1.1rem' }}>
                <Navigation size={20} /> Notify Driver
              </button>
            )}
            {order.orderType === 'Dine-In' && (
              <button onClick={() => updateStatus(order, 'FinalizeDineIn')} className="btn" style={{ backgroundColor: '#42A5F5', color: 'white', padding: '15px', fontWeight: 'bold', display: 'flex', justifyContent: 'center', gap: '8px', border: 'none', borderRadius: '6px', fontSize: '1.1rem' }}>
                <Hash size={20} /> Notify Waiter (Serve Table)
              </button>
            )}
            {order.orderType === 'Takeaway' && (
              <button onClick={() => updateStatus(order, 'FinalizeTakeaway')} className="btn" style={{ backgroundColor: '#9C27B0', color: 'white', padding: '15px', fontWeight: 'bold', display: 'flex', justifyContent: 'center', gap: '8px', border: 'none', borderRadius: '6px', fontSize: '1.1rem' }}>
                <Check size={20} /> Mark Collected
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

// Moved OUTSIDE to prevent React re-render unmounting bugs!
const Column = ({ title, statusIcon, items, updateStatus }) => (
  <div style={{ flex: '1', minWidth: '320px', backgroundColor: '#1A1A1A', borderRadius: '12px', border: '1px solid #333', display: 'flex', flexDirection: 'column', height: '100%' }}>
    <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #333', backgroundColor: '#222', borderTopLeftRadius: '12px', borderTopRightRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <h2 style={{ fontFamily: 'var(--font-serif)', margin: 0, fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '8px', color: '#FFF' }}>
        {statusIcon} {title}
      </h2>
      <div style={{ backgroundColor: 'var(--secondary)', color: '#000', padding: '2px 10px', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.9rem' }}>
        {items.length}
      </div>
    </div>
    
    <div style={{ padding: '1rem', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
      {items.map(order => (
        <OrderCard key={order._id} order={order} currentColumn={title} updateStatus={updateStatus} />
      ))}
      
      {items.length === 0 && (
        <div style={{ textAlign: 'center', color: '#555', marginTop: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
          <Check size={32} style={{ opacity: 0.3 }} />
          <span style={{ fontWeight: 'bold' }}>No Orders Currently Waiting</span>
        </div>
      )}
    </div>
  </div>
);

const KitchenDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const { user } = useAuth();
  const navigate = useNavigate();

  const [audio] = useState(new Audio('https://www.soundjay.com/buttons/sounds/button-09.mp3'));

  useEffect(() => {
    if (!user || (user.role !== 'kitchen' && user.role !== 'boss')) {
      toast.error('Unauthorized access to Kitchen Dashboard');
      navigate('/');
      return;
    }

    fetchActiveOrders();

    const socket = io(import.meta.env.VITE_API_URL.replace('/api', ''));
    
    socket.on('newOrderReceived', (newOrder) => {
      audio.play().catch(e => console.log('Audio play blocked by browser', e));
      setOrders(prev => [newOrder, ...prev]);
    });

    socket.on('orderStatusUpdated', (updatedOrder) => {
      setOrders(prev => {
        const existing = prev.find(o => o._id === updatedOrder._id);
        if (existing) {
          if (['Out For Delivery', 'Delivered', 'Cancelled', 'Completed', 'Waiting For Driver'].includes(updatedOrder.status)) {
            return prev.filter(o => o._id !== updatedOrder._id);
          }
          return prev.map(o => o._id === updatedOrder._id ? updatedOrder : o);
        } else {
          if (['Waiting For Approval', 'Accepted', 'Preparing', 'Quality Check', 'Ready'].includes(updatedOrder.status)) {
            return [...prev, updatedOrder];
          }
          return prev;
        }
      });
    });

    return () => socket.disconnect();
  }, [user, navigate, audio]);

  const fetchActiveOrders = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/orders`, config); 
      const active = res.data.filter(o => ['Waiting For Approval', 'Accepted', 'Preparing', 'Quality Check', 'Ready'].includes(o.status));
      setOrders(active);
    } catch (error) {
      toast.error('Failed to fetch kitchen orders');
    }
  };

  const updateStatus = async (order, newStatus) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const payload = { status: newStatus };
      
      // Handle the contextual Ready For Pickup final actions
      if (newStatus === 'FinalizeDelivery') {
        payload.status = 'Waiting For Driver';
        payload.deliveryStatus = 'Ready For Pickup';
      } else if (newStatus === 'FinalizeDineIn' || newStatus === 'FinalizeTakeaway') {
        payload.status = 'Completed';
      }

      await axios.put(`${import.meta.env.VITE_API_URL}/orders/${order._id}/status`, payload, config);
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const todayStart = new Date();
  todayStart.setHours(0,0,0,0);
  const todaysOrders = orders.filter(o => new Date(o.createdAt) >= todayStart);

  const newOrdersCount = todaysOrders.filter(o => ['Waiting For Approval', 'Accepted'].includes(o.status)).length;
  const preparingCount = todaysOrders.filter(o => o.status === 'Preparing').length;
  const readyCount = todaysOrders.filter(o => ['Quality Check', 'Ready'].includes(o.status)).length;
  const delayedCount = todaysOrders.filter(o => getElapsedTime(o.createdAt) >= 20).length;
  
  const avgPrepTime = todaysOrders.length > 0 
    ? Math.round(todaysOrders.reduce((acc, o) => acc + getElapsedTime(o.createdAt), 0) / todaysOrders.length) 
    : 0;

  let filteredOrders = orders;
  if (filterType !== 'All') {
    filteredOrders = filteredOrders.filter(o => o.orderType === filterType);
  }
  if (searchTerm) {
    filteredOrders = filteredOrders.filter(o => 
      o._id.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (o.userId?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  const columnNew = filteredOrders.filter(o => ['Waiting For Approval', 'Accepted'].includes(o.status)).sort((a,b) => new Date(a.createdAt) - new Date(b.createdAt));
  const columnPreparing = filteredOrders.filter(o => o.status === 'Preparing').sort((a,b) => new Date(a.createdAt) - new Date(b.createdAt));
  const columnQuality = filteredOrders.filter(o => o.status === 'Quality Check').sort((a,b) => new Date(a.createdAt) - new Date(b.createdAt));
  const columnReady = filteredOrders.filter(o => o.status === 'Ready').sort((a,b) => new Date(a.createdAt) - new Date(b.createdAt));

  return (
    <div style={{ backgroundColor: '#121212', height: '100vh', color: '#FFF', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      
      <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #333', backgroundColor: '#1A1A1A' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', margin: '0 0 5px 0', color: 'var(--secondary)' }}>Kitchen Display System</h1>
            <div style={{ color: '#AAA', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '8px', height: '8px', backgroundColor: '#4CAF50', borderRadius: '50%', boxShadow: '0 0 8px #4CAF50' }}></div>
              Live WebSocket Active
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <select className="input-elegant" style={{ width: 'auto', margin: 0 }} value={filterType} onChange={e => setFilterType(e.target.value)}>
              <option value="All">All Order Types</option>
              <option value="Dine-In">🍽 Dine-In</option>
              <option value="Delivery">🛵 Delivery</option>
              <option value="Takeaway">📦 Takeaway</option>
            </select>
            <div style={{ position: 'relative', width: '250px' }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
              <input 
                type="text" 
                placeholder="Search ID or Name..." 
                className="input-elegant" 
                style={{ paddingLeft: '40px', margin: 0 }}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem' }}>
          {[
            { label: 'New Orders', value: newOrdersCount, color: '#42A5F5' },
            { label: 'Preparing', value: preparingCount, color: '#FFA726' },
            { label: 'Ready', value: readyCount, color: '#66BB6A' },
            { label: 'Avg Prep Time', value: `${avgPrepTime}m`, color: '#AB47BC' },
            { label: 'Delayed (>20m)', value: delayedCount, color: '#EF5350' },
          ].map((stat, i) => (
            <div key={i} style={{ backgroundColor: '#222', borderLeft: `4px solid ${stat.color}`, borderRadius: '8px', padding: '1rem' }}>
              <div style={{ color: '#AAA', fontSize: '0.8rem', textTransform: 'uppercase', marginBottom: '4px', fontWeight: 'bold' }}>{stat.label}</div>
              <div style={{ fontSize: '1.8rem', color: '#FFF', fontWeight: 'bold' }}>{stat.value}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', flex: 1, overflowX: 'auto', padding: '2rem' }}>
        <Column 
          title="New Orders" 
          statusIcon={<AlertCircle size={18} color="#42A5F5" />} 
          items={columnNew} 
          updateStatus={updateStatus}
        />
        <Column 
          title="Preparing" 
          statusIcon={<Utensils size={18} color="#FFA726" />} 
          items={columnPreparing} 
          updateStatus={updateStatus}
        />
        <Column 
          title="Quality Check" 
          statusIcon={<ThumbsUp size={18} color="#AB47BC" />} 
          items={columnQuality} 
          updateStatus={updateStatus}
        />
        <Column 
          title="Ready For Pickup" 
          statusIcon={<Check size={18} color="#66BB6A" />} 
          items={columnReady} 
          updateStatus={updateStatus}
        />
      </div>
    </div>
  );
};

export default KitchenDashboard;
