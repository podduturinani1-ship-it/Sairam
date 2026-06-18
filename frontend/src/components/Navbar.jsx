import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu as MenuIcon, User, ShoppingCart, Home, Calendar } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';

const Navbar = () => {
  const { offlineCartItems: cartItems, onlineCartItems } = useCart();
  const { user, logout } = useAuth();
  const location = useLocation();
  const cartItemCount = cartItems ? cartItems.reduce((acc, item) => acc + item.qty, 0) : 0;
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Desktop Navbar */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.8, 0.25, 1] }}
        className="desktop-nav glass"
        style={{
          position: 'fixed', top: 0, width: '100%', zIndex: 100, 
          padding: scrolled ? '0.8rem 0' : '1.2rem 0',
          backgroundColor: 'rgba(253, 251, 247, 0.95)',
          borderBottom: '1px solid rgba(212, 175, 55, 0.3)',
          transition: 'var(--transition-smooth)',
          boxShadow: scrolled ? 'var(--shadow-subtle)' : 'none'
        }}
      >
        <div className="container flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <span style={{ fontSize: '2rem', fontWeight: 700, fontFamily: 'var(--font-serif)', color: 'var(--primary)', letterSpacing: '2px', textTransform: 'uppercase' }}>Sai Ram</span>
          </Link>
          <ul className="flex gap-8 items-center" style={{ listStyle: 'none' }}>
            <li><Link to="/" style={{ color: location.pathname === '/' ? 'var(--primary)' : 'var(--text-primary)', fontWeight: location.pathname === '/' ? 700 : 500, letterSpacing: '1px', transition: 'color 0.3s' }} onMouseOver={e=>e.target.style.color='var(--primary)'} onMouseOut={e=>e.target.style.color=location.pathname === '/' ? 'var(--primary)' : 'var(--text-primary)'}>Home</Link></li>
            <li><Link to="/about" style={{ color: location.pathname === '/about' ? 'var(--primary)' : 'var(--text-primary)', fontWeight: location.pathname === '/about' ? 700 : 500, letterSpacing: '1px', transition: 'color 0.3s' }} onMouseOver={e=>e.target.style.color='var(--primary)'} onMouseOut={e=>e.target.style.color=location.pathname === '/about' ? 'var(--primary)' : 'var(--text-primary)'}>About</Link></li>
            <li><Link to="/menu" style={{ color: location.pathname === '/menu' ? 'var(--primary)' : 'var(--text-primary)', fontWeight: location.pathname === '/menu' ? 700 : 500, letterSpacing: '1px', transition: 'color 0.3s' }} onMouseOver={e=>e.target.style.color='var(--primary)'} onMouseOut={e=>e.target.style.color=location.pathname === '/menu' ? 'var(--primary)' : 'var(--text-primary)'}>Menu</Link></li>
            
            <li className="nav-dropdown-container">
              <span style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-primary)', transition: 'color 0.3s' }} onMouseOver={e=>e.currentTarget.style.color='var(--primary)'} onMouseOut={e=>e.currentTarget.style.color='var(--text-primary)'}>
                <ShoppingCart size={24} /> Cart
                {(cartItems.length > 0 || onlineCartItems.length > 0) && (
                  <span style={{ backgroundColor: 'var(--secondary)', color: 'var(--surface-dark)', borderRadius: '50%', padding: '2px 8px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                    {cartItems.reduce((a,c)=>a+c.qty,0) + onlineCartItems.reduce((a,c)=>a+c.qty,0)}
                  </span>
                )}
              </span>
              <div className="nav-dropdown">
                <Link to="/cart">Dine-In Cart ({cartItems.length})</Link>
                <Link to="/online-cart">Delivery Cart ({onlineCartItems.length})</Link>
              </div>
            </li>
            
            <li className="nav-dropdown-container">
              <span style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-primary)', transition: 'color 0.3s' }} onMouseOver={e=>e.currentTarget.style.color='var(--primary)'} onMouseOut={e=>e.currentTarget.style.color='var(--text-primary)'}>
                <User size={24} /> Account
              </span>
              <div className="nav-dropdown">
                {user ? (
                  <>
                    <Link to="/profile">My Profile</Link>
                    <Link to="/my-orders">My Orders</Link>
                    {user.role === 'boss' && <Link to="/boss" style={{ color: 'var(--secondary)' }}>Boss Dashboard</Link>}
                    {user.role === 'admin' && <Link to="/admin" style={{ color: 'var(--secondary)' }}>Admin Dashboard</Link>}
                    {user.role === 'driver' && <Link to="/driver" style={{ color: 'var(--secondary)' }}>Driver Dashboard</Link>}
                    {user.role === 'kitchen' && <Link to="/kitchen" style={{ color: 'var(--secondary)' }}>Kitchen Dashboard</Link>}
                    <button onClick={logout} style={{ color: '#EF5350' }}>Logout</button>
                  </>
                ) : (
                  <>
                    <Link to="/login">Login</Link>
                    <Link to="/register">Create Account</Link>
                  </>
                )}
              </div>
            </li>

            <li className="flex gap-4">
              <Link to="/online-menu" className="btn btn-secondary" style={{ padding: '10px 24px', boxShadow: 'var(--shadow-elegant)' }}>Order Online</Link>
              <Link to="/booking" className="btn btn-primary" style={{ padding: '10px 24px', boxShadow: 'var(--shadow-elegant)' }}>Book Table</Link>
            </li>
          </ul>
        </div>
      </motion.nav>

      {/* Mobile Bottom Navigation */}
      <nav className="mobile-nav">
        <Link to="/" className={`mobile-nav-item ${location.pathname === '/' ? 'active' : ''}`}>
          <Home size={24} color={location.pathname === '/' ? 'var(--primary)' : 'var(--text-secondary)'} />
          <span>Home</span>
        </Link>
        <Link to="/menu" className={`mobile-nav-item ${location.pathname === '/menu' ? 'active' : ''}`}>
          <MenuIcon size={24} color={location.pathname === '/menu' ? 'var(--primary)' : 'var(--text-secondary)'} />
          <span>Menu</span>
        </Link>
        <Link to="/booking" className={`mobile-nav-item ${location.pathname === '/booking' ? 'active' : ''}`}>
          <Calendar size={24} color={location.pathname === '/booking' ? 'var(--primary)' : 'var(--text-secondary)'} />
          <span>Reserve</span>
        </Link>
        <Link to="/cart" className={`mobile-nav-item ${location.pathname === '/cart' ? 'active' : ''}`} style={{ position: 'relative' }}>
          <ShoppingCart size={24} color={location.pathname === '/cart' ? 'var(--primary)' : 'var(--text-secondary)'} />
          {cartItemCount > 0 && (
            <span style={{ position: 'absolute', top: '-8px', right: '-8px', backgroundColor: 'var(--secondary)', color: 'var(--surface-dark)', borderRadius: '50%', padding: '2px 6px', fontSize: '0.7rem', fontWeight: 'bold' }}>
              {cartItemCount}
            </span>
          )}
          <span>Cart</span>
        </Link>
        <Link to="/profile" className={`mobile-nav-item ${location.pathname === '/profile' ? 'active' : ''}`}>
          <User size={24} color={location.pathname === '/profile' ? 'var(--primary)' : 'var(--text-secondary)'} />
          <span>Account</span>
        </Link>
      </nav>
    </>
  );
};

export default Navbar;
