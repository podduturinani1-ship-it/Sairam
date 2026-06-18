import React from 'react';
import { useCart } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const Cart = () => {
  const { offlineCartItems: cartItems, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handlePlaceOfflineOrder = async () => {
    if (!user) {
      toast.info('Please login to place an order');
      return navigate('/login?redirect=/cart');
    }

    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const foodTotal = getCartTotal(false);
      const tax = Math.round(foodTotal * 0.05);
      const finalTotal = foodTotal + tax;

      const orderPayload = {
        items: cartItems.map(i => ({ menuItemId: i._id, quantity: i.qty, price: i.price })),
        totalAmount: finalTotal,
        paymentMethod: 'Pay at Counter',
        paymentStatus: 'Pending',
        transactionId: 'DINE_IN_' + Date.now(),
        orderType: 'Dine-In',
        deliveryAddress: 'In-Store',
        status: 'Accepted' // Instantly push to KDS
      };

      await axios.post(`${import.meta.env.VITE_API_URL}/orders`, orderPayload, config);
      toast.success('Order placed! Kitchen is preparing your food.');
      clearCart(false);
      navigate('/my-orders');
    } catch (err) {
      console.error(err.response?.data || err);
      toast.error(err.response?.data?.error || err.response?.data?.message || 'Failed to place order');
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="container section text-center">
        <h1 className="section-title">Your Dine-In Cart is Empty</h1>
        <p className="mb-4">Looks like you haven't added anything to your cart yet.</p>
        <Link to="/menu" className="btn btn-primary">Browse Menu</Link>
      </div>
    );
  }

  return (
    <div className="container section">
      <h1 className="section-title">Your Dine-In Cart</h1>
      
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          {cartItems.map(item => (
            <div key={item._id} className="card flex items-center justify-between p-4 mb-4" style={{ padding: '1rem' }}>
              <div className="flex items-center gap-4">
                <div style={{ width: '80px', height: '80px', backgroundColor: '#eee', borderRadius: '8px', overflow: 'hidden' }}>
                  {item.imageUrl && <img src={item.imageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{item.name}</h3>
                  <p style={{ color: 'var(--primary)', fontWeight: 'bold' }}>₹{item.price}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 glass-dark" style={{ borderRadius: 'var(--radius-full)', padding: '4px 8px' }}>
                  <button onClick={() => updateQuantity(item._id, item.qty - 1, false)} style={{ color: 'white' }}><Minus size={16} /></button>
                  <span style={{ color: 'white', width: '20px', textAlign: 'center' }}>{item.qty}</span>
                  <button onClick={() => updateQuantity(item._id, item.qty + 1, false)} style={{ color: 'white' }}><Plus size={16} /></button>
                </div>
                <button onClick={() => removeFromCart(item._id, false)} style={{ color: 'var(--accent)' }}>
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <div>
          <div className="card" style={{ padding: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>Order Summary</h3>
            <div className="flex justify-between mb-2">
              <span>Subtotal</span>
              <span>₹{getCartTotal(false)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span>Taxes (5%)</span>
              <span>₹{Math.round(getCartTotal(false) * 0.05)}</span>
            </div>
            <div className="flex justify-between mt-4" style={{ borderTop: '1px solid #eee', paddingTop: '1rem', fontWeight: 'bold', fontSize: '1.2rem' }}>
              <span>Total</span>
              <span style={{ color: 'var(--primary)' }}>₹{getCartTotal(false) + Math.round(getCartTotal(false) * 0.05)}</span>
            </div>
            
            <button onClick={handlePlaceOfflineOrder} className="btn btn-primary" style={{ width: '100%', marginTop: '2rem', display: 'block', textAlign: 'center' }}>
              Place Order (Pay at Counter)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;

