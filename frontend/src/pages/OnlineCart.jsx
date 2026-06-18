import React from 'react';
import { useCart } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const OnlineCart = () => {
  const { onlineCartItems: cartItems, removeFromCart, updateQuantity, getCartTotal } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (cartItems.length === 0) {
    return (
      <div className="container section text-center">
        <h1 className="section-title">Your Delivery Cart is Empty</h1>
        <p className="mb-4">Looks like you haven't added anything to your cart yet.</p>
        <Link to="/online-menu" className="btn btn-primary">Browse Delivery Menu</Link>
      </div>
    );
  }

  return (
    <div className="container section">
      <h1 className="section-title">Your Delivery Cart</h1>
      
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
                  <button onClick={() => updateQuantity(item._id, item.qty - 1, true)} style={{ color: 'white' }}><Minus size={16} /></button>
                  <span style={{ color: 'white', width: '20px', textAlign: 'center' }}>{item.qty}</span>
                  <button onClick={() => updateQuantity(item._id, item.qty + 1, true)} style={{ color: 'white' }}><Plus size={16} /></button>
                </div>
                <button onClick={() => removeFromCart(item._id, true)} style={{ color: 'var(--accent)' }}>
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
              <span>₹{getCartTotal(true)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span>Taxes (5%)</span>
              <span>₹{Math.round(getCartTotal(true) * 0.05)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span>Delivery Charge</span>
              <span>₹50</span>
            </div>
            <div className="flex justify-between mt-4" style={{ borderTop: '1px solid #eee', paddingTop: '1rem', fontWeight: 'bold', fontSize: '1.2rem' }}>
              <span>Total</span>
              <span style={{ color: 'var(--primary)' }}>₹{getCartTotal(true) + Math.round(getCartTotal(true) * 0.05) + 50}</span>
            </div>
            
            <Link to="/checkout" className="btn btn-primary" style={{ width: '100%', marginTop: '2rem', display: 'block', textAlign: 'center' }}>
              Proceed to Delivery Checkout
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnlineCart;
