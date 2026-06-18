import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer style={{ backgroundColor: 'var(--surface-dark)', color: 'var(--text-inverse)', padding: '6rem 0 3rem', borderTop: '5px solid var(--primary)' }}>
      <div className="container grid md:grid-cols-4 gap-12" style={{ marginBottom: '4rem' }}>
        
        {/* Brand Section */}
        <div className="md:col-span-1">
          <h2 style={{ fontFamily: 'var(--font-serif)', color: 'var(--secondary)', fontSize: '2.5rem', marginBottom: '1.5rem', letterSpacing: '2px', textTransform: 'uppercase' }}>Sai Ram</h2>
          <p style={{ color: '#AAAAAA', fontSize: '1rem', marginBottom: '2rem', lineHeight: '1.6' }}>
            A legacy of taste in Nirmal, Telangana. Bringing families together with premium dining experiences and authentic flavors.
          </p>
          <div className="flex gap-4">
            <div style={{ width: '40px', height: '40px', border: '1px solid var(--secondary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--secondary)', cursor: 'pointer', transition: 'all 0.3s' }} onMouseOver={e => {e.currentTarget.style.backgroundColor='var(--secondary)'; e.currentTarget.style.color='var(--surface-dark)'}} onMouseOut={e => {e.currentTarget.style.backgroundColor='transparent'; e.currentTarget.style.color='var(--secondary)'}}>FB</div>
            <div style={{ width: '40px', height: '40px', border: '1px solid var(--secondary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--secondary)', cursor: 'pointer', transition: 'all 0.3s' }} onMouseOver={e => {e.currentTarget.style.backgroundColor='var(--secondary)'; e.currentTarget.style.color='var(--surface-dark)'}} onMouseOut={e => {e.currentTarget.style.backgroundColor='transparent'; e.currentTarget.style.color='var(--secondary)'}}>IG</div>
            <div style={{ width: '40px', height: '40px', border: '1px solid var(--secondary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--secondary)', cursor: 'pointer', transition: 'all 0.3s' }} onMouseOver={e => {e.currentTarget.style.backgroundColor='var(--secondary)'; e.currentTarget.style.color='var(--surface-dark)'}} onMouseOut={e => {e.currentTarget.style.backgroundColor='transparent'; e.currentTarget.style.color='var(--secondary)'}}>TW</div>
          </div>
        </div>
        
        {/* Quick Links */}
        <div>
          <h3 style={{ color: 'var(--text-inverse)', marginBottom: '1.5rem', fontSize: '1.3rem', letterSpacing: '1px' }}>Quick Links</h3>
          <ul style={{ listStyle: 'none', color: '#AAAAAA', padding: 0 }}>
            <li className="mb-3"><Link to="/menu" style={{ transition: 'color 0.3s', textDecoration: 'none', color: 'inherit' }} onMouseOver={e => e.target.style.color='var(--secondary)'} onMouseOut={e => e.target.style.color='#AAAAAA'}>Our Menu</Link></li>
            <li className="mb-3"><Link to="/booking" style={{ transition: 'color 0.3s', textDecoration: 'none', color: 'inherit' }} onMouseOver={e => e.target.style.color='var(--secondary)'} onMouseOut={e => e.target.style.color='#AAAAAA'}>Table Reservations</Link></li>
            <li className="mb-3"><Link to="/cart" style={{ transition: 'color 0.3s', textDecoration: 'none', color: 'inherit' }} onMouseOver={e => e.target.style.color='var(--secondary)'} onMouseOut={e => e.target.style.color='#AAAAAA'}>Order Online</Link></li>
            <li className="mb-3"><Link to="/profile" style={{ transition: 'color 0.3s', textDecoration: 'none', color: 'inherit' }} onMouseOver={e => e.target.style.color='var(--secondary)'} onMouseOut={e => e.target.style.color='#AAAAAA'}>My Account</Link></li>
          </ul>
        </div>
        
        {/* Contact Info */}
        <div>
          <h3 style={{ color: 'var(--text-inverse)', marginBottom: '1.5rem', fontSize: '1.3rem', letterSpacing: '1px' }}>Visit Us</h3>
          <p style={{ color: '#AAAAAA', marginBottom: '1rem', display: 'flex', gap: '10px' }}>
            <span style={{ color: 'var(--secondary)' }}>📍</span> 
            <span>Main Road, Nirmal,<br/>Telangana 504106,<br/>India</span>
          </p>
          <p style={{ color: '#AAAAAA', marginBottom: '1rem', display: 'flex', gap: '10px' }}>
            <span style={{ color: 'var(--secondary)' }}>📞</span> 
            <span style={{ color: 'var(--secondary)', fontSize: '1.1rem' }}>+91 98765 43210</span>
          </p>
          <p style={{ color: '#AAAAAA', display: 'flex', gap: '10px' }}>
            <span style={{ color: 'var(--secondary)' }}>🕒</span> 
            <span>Mon-Sun: 11:00 AM - 11:30 PM</span>
          </p>
        </div>

        {/* Map */}
        <div>
          <h3 style={{ color: 'var(--text-inverse)', marginBottom: '1.5rem', fontSize: '1.3rem', letterSpacing: '1px' }}>Location</h3>
          <div style={{ width: '100%', height: '150px', backgroundColor: '#333', borderRadius: '8px', overflow: 'hidden' }}>
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15115.029410141973!2d78.336148!3d19.098492!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bd0034a74794e77%3A0xc0fb1e582e666993!2sNirmal%2C%20Telangana%20504106!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin" 
              width="100%" height="100%" style={{ border: 0 }} allowFullScreen="" loading="lazy" referrerPolicy="no-referrer-when-downgrade">
            </iframe>
          </div>
        </div>
      </div>
      
      <div className="container">
        <div style={{ borderTop: '1px solid rgba(212, 175, 55, 0.2)', paddingTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', color: '#888', fontSize: '0.9rem' }}>
          <p>&copy; {new Date().getFullYear()} Sai Ram Restaurant. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <Link to="/admin/login" style={{ color: '#888', textDecoration: 'none', transition: 'color 0.3s' }} onMouseOver={e=>e.target.style.color='var(--secondary)'} onMouseOut={e=>e.target.style.color='#888'}>Admin Portal</Link>
            <Link to="/login" style={{ color: '#888', textDecoration: 'none', transition: 'color 0.3s' }} onMouseOver={e=>e.target.style.color='var(--secondary)'} onMouseOut={e=>e.target.style.color='#888'}>Staff Login</Link>
            <span style={{ cursor: 'pointer', transition: 'color 0.3s' }} onMouseOver={e=>e.target.style.color='var(--secondary)'} onMouseOut={e=>e.target.style.color='#888'}>Privacy Policy</span>
            <span style={{ cursor: 'pointer', transition: 'color 0.3s' }} onMouseOver={e=>e.target.style.color='var(--secondary)'} onMouseOut={e=>e.target.style.color='#888'}>Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
