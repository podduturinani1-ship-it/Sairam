import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Truck, MapPin, CheckCircle, Clock, UserCheck } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';

const AdminDelivery = () => {
  const [orders, setOrders] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchData = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      
      const ordersRes = await axios.get(`${import.meta.env.VITE_API_URL}/orders`, config);
      const deliveryOrders = ordersRes.data.filter(o => o.orderType === 'Delivery');
      setOrders(deliveryOrders);

      const usersRes = await axios.get(`${import.meta.env.VITE_API_URL}/users`, config);
      const deliveryDrivers = usersRes.data.filter(u => u.role === 'delivery_partner');
      setDrivers(deliveryDrivers);

      setLoading(false);
    } catch (error) {
      toast.error('Failed to load delivery data');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const assignDriver = async (orderId, driverId) => {
    if (!driverId) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`${import.meta.env.VITE_API_URL}/orders/${orderId}/status`, { 
        deliveryStatus: 'Driver Assigned',
        assignedDriver: driverId
      }, config);
      toast.success('Driver assigned successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to assign driver');
    }
  };

  if (loading) return <div style={{ color: '#FFF' }}>Loading delivery module...</div>;

  const readyOrders = orders.filter(o => o.status === 'Ready' && (!o.deliveryStatus || o.deliveryStatus === 'Pending' || o.deliveryStatus === 'Ready For Pickup'));
  const assignedOrders = orders.filter(o => o.deliveryStatus === 'Driver Assigned');
  const outForDelivery = orders.filter(o => o.deliveryStatus === 'Out For Delivery');
  const delivered = orders.filter(o => o.deliveryStatus === 'Delivered');

  const Column = ({ title, items, renderAction }) => (
    <div style={{ flex: 1, minWidth: '280px', backgroundColor: '#1A1A1A', borderRadius: '12px', border: '1px solid #333', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '1rem', borderBottom: '1px solid #333', backgroundColor: '#222', borderTopLeftRadius: '12px', borderTopRightRadius: '12px' }}>
        <h3 style={{ margin: 0, color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>{title} ({items.length})</h3>
      </div>
      <div style={{ padding: '1rem', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <AnimatePresence>
          {items.map(order => (
            <motion.div key={order._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ backgroundColor: '#2A2A2A', padding: '1rem', borderRadius: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontWeight: 'bold', color: '#FFF' }}>#{order._id.slice(-4).toUpperCase()}</span>
              </div>
              <div style={{ color: '#AAA', fontSize: '0.9rem', marginBottom: '12px' }}>
                <MapPin size={14} style={{ display: 'inline', marginRight: '4px' }}/>
                {order.deliveryAddress || 'No Address Provided'}
              </div>
              {order.assignedDriver && (
                <div style={{ color: '#4CAF50', fontSize: '0.85rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <UserCheck size={14} /> Driver: {order.assignedDriver.name || 'Unknown'}
                </div>
              )}
              {renderAction(order)}
            </motion.div>
          ))}
          {items.length === 0 && <div style={{ color: '#666', textAlign: 'center', marginTop: '2rem' }}>Empty</div>}
        </AnimatePresence>
      </div>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', marginBottom: '2rem', color: '#FFF' }}>Delivery Management</h2>
      <div style={{ display: 'flex', gap: '1.5rem', flex: 1, overflowX: 'auto', paddingBottom: '1rem' }}>
        
        <Column 
          title="Ready For Pickup" 
          items={readyOrders}
          renderAction={(order) => (
            <select 
              className="input-elegant" 
              style={{ width: '100%', padding: '8px', fontSize: '0.9rem' }}
              onChange={(e) => assignDriver(order._id, e.target.value)}
              defaultValue=""
            >
              <option value="" disabled>Assign Driver</option>
              {drivers.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
            </select>
          )}
        />
        
        <Column 
          title="Assigned / Waiting" 
          items={assignedOrders}
          renderAction={() => <div style={{ color: '#FFA726', fontSize: '0.9rem' }}>Waiting for driver to start trip</div>}
        />

        <Column 
          title="Out For Delivery" 
          items={outForDelivery}
          renderAction={() => <div style={{ color: '#42A5F5', fontSize: '0.9rem' }}><Truck size={14} style={{ display: 'inline', marginRight: '4px' }}/> In Transit</div>}
        />

        <Column 
          title="Delivered" 
          items={delivered}
          renderAction={() => <div style={{ color: '#66BB6A', fontSize: '0.9rem' }}><CheckCircle size={14} style={{ display: 'inline', marginRight: '4px' }}/> Completed</div>}
        />

      </div>
    </motion.div>
  );
};

export default AdminDelivery;

