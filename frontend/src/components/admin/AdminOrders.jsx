import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Clock, Truck, ChefHat } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchOrders = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/orders`, config);
      // Sort by newest first
      setOrders(res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      setLoading(false);
    } catch (error) {
      toast.error('Failed to load orders');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [user]);

  const updateStatus = async (id, newStatus) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`${import.meta.env.VITE_API_URL}/orders/${id}/status`, { status: newStatus }, config);
      toast.success(`Order marked as ${newStatus}`);
      fetchOrders();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending': return <span style={{ backgroundColor: 'rgba(255, 193, 7, 0.2)', color: '#FFC107', padding: '4px 12px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold' }}><Clock size={12} style={{ display: 'inline', marginRight: '4px' }}/> Pending</span>;
      case 'Preparing': return <span style={{ backgroundColor: 'rgba(33, 150, 243, 0.2)', color: '#2196F3', padding: '4px 12px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold' }}><ChefHat size={12} style={{ display: 'inline', marginRight: '4px' }}/> Preparing</span>;
      case 'Ready': return <span style={{ backgroundColor: 'rgba(76, 175, 80, 0.2)', color: '#4CAF50', padding: '4px 12px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold' }}><CheckCircle size={12} style={{ display: 'inline', marginRight: '4px' }}/> Ready</span>;
      case 'Delivered': return <span style={{ backgroundColor: 'rgba(156, 39, 176, 0.2)', color: '#9C27B0', padding: '4px 12px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold' }}><Truck size={12} style={{ display: 'inline', marginRight: '4px' }}/> Delivered</span>;
      case 'Cancelled': return <span style={{ backgroundColor: 'rgba(244, 67, 54, 0.2)', color: '#F44336', padding: '4px 12px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold' }}><XCircle size={12} style={{ display: 'inline', marginRight: '4px' }}/> Cancelled</span>;
      default: return null;
    }
  };

  if (loading) return <div style={{ color: '#FFF' }}>Loading orders...</div>;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
      <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', marginBottom: '2rem', color: '#FFF' }}>Order Management</h2>
      
      <div style={{ backgroundColor: '#1E1E1E', borderRadius: '12px', border: '1px solid #333', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', color: '#FFF', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#2A2A2A', borderBottom: '1px solid #333' }}>
              <th style={{ padding: '1rem' }}>Order ID / Date</th>
              <th style={{ padding: '1rem' }}>Customer</th>
              <th style={{ padding: '1rem', width: '25%' }}>Items</th>
              <th style={{ padding: '1rem' }}>Total / Payment</th>
              <th style={{ padding: '1rem' }}>Status</th>
              <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order._id} style={{ borderBottom: '1px solid #333' }}>
                <td style={{ padding: '1rem' }}>
                  <div style={{ fontWeight: 'bold', fontFamily: 'monospace' }}>#{order._id.substring(order._id.length - 6).toUpperCase()}</div>
                  <div style={{ color: '#AAA', fontSize: '0.8rem' }}>{new Date(order.createdAt).toLocaleString()}</div>
                </td>
                <td style={{ padding: '1rem' }}>
                  <div>{order.userId ? order.userId.name : 'Guest'}</div>
                  {order.deliveryAddress && <div style={{ color: '#AAA', fontSize: '0.8rem' }}>{order.deliveryAddress}</div>}
                </td>
                <td style={{ padding: '1rem' }}>
                  <ul style={{ margin: 0, paddingLeft: '1rem', color: '#AAA', fontSize: '0.9rem' }}>
                    {order.items.map((item, i) => (
                      <li key={i}>{item.qty}x {item.menuItemId?.name || 'Unknown Item'}</li>
                    ))}
                  </ul>
                </td>
                <td style={{ padding: '1rem' }}>
                  <div style={{ fontWeight: 'bold', color: 'var(--secondary)' }}>₹{order.totalAmount}</div>
                  <div style={{ fontSize: '0.8rem', color: order.paymentStatus === 'Paid' ? '#66BB6A' : '#EF5350' }}>
                    {order.paymentMethod || 'N/A'} ({order.paymentStatus || 'Pending'})
                  </div>
                  {order.transactionId && (
                    <div style={{ fontSize: '0.7rem', color: '#888', fontFamily: 'monospace', marginTop: '4px' }}>TXN: {order.transactionId}</div>
                  )}
                </td>
                <td style={{ padding: '1rem' }}>{getStatusBadge(order.status)}</td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>
                  {order.status === 'Pending' && (
                    <button onClick={() => updateStatus(order._id, 'Preparing')} className="btn btn-outline" style={{ padding: '4px 8px', fontSize: '0.8rem', marginRight: '8px' }}>Accept</button>
                  )}
                  {order.status === 'Preparing' && (
                    <button onClick={() => updateStatus(order._id, 'Ready')} className="btn btn-primary" style={{ padding: '4px 8px', fontSize: '0.8rem', marginRight: '8px' }}>Mark Ready</button>
                  )}
                  {order.status === 'Ready' && (
                    <button onClick={() => updateStatus(order._id, 'Delivered')} className="btn btn-primary" style={{ padding: '4px 8px', fontSize: '0.8rem', marginRight: '8px' }}>Deliver</button>
                  )}
                  {(order.status === 'Pending' || order.status === 'Preparing') && (
                    <button onClick={() => updateStatus(order._id, 'Cancelled')} style={{ background: 'none', border: 'none', color: '#F44336', cursor: 'pointer', fontSize: '0.8rem' }}>Cancel</button>
                  )}
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>No orders found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default AdminOrders;

