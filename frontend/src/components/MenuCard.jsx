import React from 'react';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';
import { Star, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

const MenuCard = ({ item, isOnline = false }) => {
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart(item, 1, isOnline);
    toast.success(`${item.name} added to ${isOnline ? 'Delivery' : 'Dine-In'} cart!`, {
      icon: '🛒',
      style: { backgroundColor: 'var(--surface-dark)', color: 'var(--secondary)' }
    });
  };

  return (
    <motion.div 
      whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}
      className="card" 
      style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative', overflow: 'hidden', border: 'none', borderRadius: '16px', backgroundColor: 'var(--surface)' }}
    >
      {/* Availability Badge */}
      <div style={{
        position: 'absolute', top: '15px', right: '15px', zIndex: 10,
        backgroundColor: item.isAvailable !== false ? 'rgba(46, 125, 50, 0.9)' : 'rgba(198, 40, 40, 0.9)',
        color: 'white', padding: '4px 12px', borderRadius: 'var(--radius-full)',
        fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '1px', backdropFilter: 'blur(4px)'
      }}>
        {item.isAvailable !== false ? 'AVAILABLE' : 'SOLD OUT'}
      </div>

      {/* Image Section */}
      <div style={{ height: '280px', backgroundColor: '#e0e0e0', overflow: 'hidden', position: 'relative' }}>
        {item.imageUrl ? (
          <img 
            src={item.imageUrl} 
            alt={item.name} 
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.6s cubic-bezier(0.25, 0.8, 0.25, 1)' }} 
            onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'} 
            onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', background: 'linear-gradient(45deg, #f3f3f3, #e0e0e0)' }}>
            Sai Ram Special
          </div>
        )}
        
        {/* Price Overlay */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)',
          padding: '3rem 1.5rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end'
        }}>
          <div style={{ color: 'var(--secondary)', fontWeight: 'bold', fontSize: '1.6rem', fontFamily: 'var(--font-serif)' }}>
            ₹{item.price}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: 'rgba(0,0,0,0.5)', padding: '4px 8px', borderRadius: '12px', color: '#FFD700', fontSize: '0.9rem', backdropFilter: 'blur(4px)' }}>
            <Star size={14} fill="#FFD700" /> 4.8
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
          <h3 style={{ fontSize: '1.4rem', margin: '0', color: 'var(--text-primary)', fontFamily: 'var(--font-serif)' }}>{item.name}</h3>
          {item.category === 'Biryanis' && <span style={{ fontSize: '0.7rem', backgroundColor: '#FFF3E0', color: '#E65100', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold', textTransform: 'uppercase' }}>Popular</span>}
        </div>
        
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1.5rem', flex: 1, lineHeight: '1.6' }}>{item.description}</p>
        
        <button 
          className="btn btn-primary" 
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', borderRadius: '8px', fontWeight: 'bold', fontSize: '1rem', transition: 'all 0.3s' }} 
          onClick={handleAddToCart}
          disabled={item.isAvailable === false}
        >
          <Plus size={18} /> Quick Add
        </button>
      </div>
    </motion.div>
  );
};

export default MenuCard;
