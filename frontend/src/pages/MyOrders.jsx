import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { Clock, CheckCircle, ChefHat, Package, Truck, XCircle } from 'lucide-react';

const DELIVERY_STAGES = [
  { id: 'Confirmed', label: 'Confirmed', icon: <CheckCircle size={20} /> },
  { id: 'Preparing', label: 'Preparing', icon: <ChefHat size={20} /> },
  { id: 'Ready', label: 'Ready', icon: <Package size={20} /> },
  { id: 'Out For Delivery', label: 'Out For Delivery', icon: <Truck size={20} /> },
  { id: 'Delivered', label: 'Delivered', icon: <CheckCircle size={20} /> },
];

const DINE_IN_STAGES = [
  { id: 'Confirmed', label: 'Confirmed', icon: <CheckCircle size={20} /> },
  { id: 'Preparing', label: 'Preparing', icon: <ChefHat size={20} /> },
  { id: 'Ready', label: 'Served/Ready', icon: <Package size={20} /> },
  { id: 'Completed', label: 'Completed', icon: <CheckCircle size={20} /> },
];

const DeliveryProgressBar = ({ order }) => {
  let currentIndex = 0;
  
  if (order.status === 'Completed' || order.status === 'Delivered' || order.deliveryStatus === 'Delivered') currentIndex = 4;
  else if (order.status === 'Out For Delivery' || order.deliveryStatus === 'Out For Delivery') currentIndex = 3;
  else if (['Ready', 'Waiting For Driver'].includes(order.status) || ['Ready For Pickup', 'Driver Assigned', 'Picked Up'].includes(order.deliveryStatus)) currentIndex = 2;
  else if (['Preparing', 'Quality Check'].includes(order.status)) currentIndex = 1;

  return <ProgressBar stages={DELIVERY_STAGES} currentIndex={currentIndex} />;
};

const DineInProgressBar = ({ order }) => {
  let currentIndex = 0;
  
  if (order.status === 'Completed') currentIndex = 3;
  else if (['Ready'].includes(order.status)) currentIndex = 2;
  else if (['Preparing', 'Quality Check'].includes(order.status)) currentIndex = 1;

  return <ProgressBar stages={DINE_IN_STAGES} currentIndex={currentIndex} />;
};

const ProgressBar = ({ stages, currentIndex }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem', position: 'relative' }}>
    <div style={{ position: 'absolute', top: '24px', left: '10%', right: '10%', height: '4px', backgroundColor: '#333', zIndex: 0 }}></div>
    <div style={{ position: 'absolute', top: '24px', left: '10%', width: `${Math.max(0, currentIndex) * (100 / (stages.length - 1))}%`, height: '4px', backgroundColor: 'var(--secondary)', zIndex: 0, transition: 'width 0.5s ease' }}></div>

    {stages.map((stage, idx) => {
      const isActive = idx <= currentIndex;
      const isCurrent = idx === currentIndex;
      return (
        <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, width: `${100/stages.length}%` }}>
          <div style={{ 
            width: '50px', height: '50px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            backgroundColor: isActive ? 'var(--secondary)' : '#1E1E1E',
            border: `2px solid ${isActive ? 'var(--secondary)' : '#555'}`,
            color: isActive ? '#000' : '#555',
            transition: 'all 0.3s ease',
            transform: isCurrent ? 'scale(1.1)' : 'scale(1)',
            boxShadow: isCurrent ? '0 0 15px rgba(212,175,55,0.4)' : 'none'
          }}>
            {stage.icon}
          </div>
          <div style={{ marginTop: '8px', fontSize: '0.8rem', color: isActive ? '#FFF' : '#666', textAlign: 'center', fontWeight: isCurrent ? 'bold' : 'normal' }}>
            {stage.label}
          </div>
        </div>
      );
    })}
  </div>
);

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { addToCart, addToOnlineCart } = useCart();
  const navigate = useNavigate();

  const handleReorder = (order) => {
    order.items.forEach(item => {
      if(item.menuItemId) {
        if(order.orderType === 'Delivery') {
          for(let i=0; i<item.quantity; i++) addToOnlineCart(item.menuItemId);
        } else {
          for(let i=0; i<item.quantity; i++) addToCart(item.menuItemId);
        }
      }
    });
    toast.success('Items added to cart!');
    navigate(order.orderType === 'Delivery' ? '/online-cart' : '/cart');
  };

  useEffect(() => {
    if (!user) {
      toast.info('Please log in to view your orders');
      navigate('/login');
      return;
    }
    fetchOrders();

    // Setup Socket.IO connection
    const socket = io(import.meta.env.VITE_API_URL.replace('/api', ''));
    
    socket.on('orderStatusUpdated', (updatedOrder) => {
      setOrders(prevOrders => prevOrders.map(order => 
        order._id === updatedOrder._id ? updatedOrder : order
      ));
    });

    return () => socket.disconnect();
  }, [user]);

  const fetchOrders = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/orders/myorders`, config);
      setOrders(res.data);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to load orders');
      setLoading(false);
    }
  };



  if (loading) return <div style={{ color: '#FFF', padding: '4rem', textAlign: 'center' }}>Loading your orders...</div>;

  return (
    <div style={{ padding: '4rem 2rem', maxWidth: '1000px', margin: '0 auto', color: '#FFF' }}>
      <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '3rem', marginBottom: '3rem', textAlign: 'center' }}>My Orders</h1>
      
      {orders.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#888' }}>You have no orders yet.</div>
      ) : (
        <div className="flex flex-col gap-6">
          {orders.map(order => {
            return (
              <motion.div key={order._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ backgroundColor: '#1E1E1E', borderRadius: '12px', border: '1px solid #333', padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '1px solid #333', paddingBottom: '1rem' }}>
                  <div>
                    <div style={{ color: '#AAA', fontSize: '0.9rem' }}>Order ID: #{order._id.slice(-6).toUpperCase()}</div>
                    <div style={{ fontSize: '0.8rem', color: '#666' }}>{new Date(order.createdAt).toLocaleString()}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--secondary)' }}>₹{order.totalAmount}</div>
                    <div style={{ fontSize: '0.8rem', color: '#AAA', textTransform: 'uppercase', marginBottom: '4px' }}>{order.paymentMethod} • {order.paymentStatus}</div>
                    {order.transactionId && (
                      <div style={{ fontSize: '0.75rem', color: '#666', fontFamily: 'monospace', marginBottom: '0.5rem' }}>TXN: {order.transactionId}</div>
                    )}
                    <button 
                      className="btn btn-outline" 
                      style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                      onClick={() => handleReorder(order)}
                    >
                      Re-order
                    </button>
                  </div>
                </div>

                <div className="mb-6">
                  {order.items.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                      <span style={{ color: '#AAA' }}>{item.quantity}x</span>
                      <span>{item.menuItemId?.name || 'Unknown Item'}</span>
                    </div>
                  ))}
                </div>

                {order.status === 'Cancelled' ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#EF5350', fontWeight: 'bold', padding: '1rem', backgroundColor: 'rgba(239, 83, 80, 0.1)', borderRadius: '8px' }}>
                    <XCircle /> Order Cancelled
                  </div>
                ) : (
                  <>
                    {order.orderType === 'Delivery' ? (
                      <DeliveryProgressBar order={order} />
                    ) : (
                      <DineInProgressBar order={order} />
                    )}
                  </>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyOrders;

