import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const NotFound = () => {
  return (
    <div className="section text-center" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
      <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
        <h1 style={{ fontSize: '6rem', color: 'var(--primary)', marginBottom: '1rem', fontFamily: 'var(--font-serif)' }}>404</h1>
        <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Page Not Found</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem', fontSize: '1.1rem', maxWidth: '500px' }}>
          We're sorry, but the page you are looking for doesn't exist or has been moved.
        </p>
        <Link to="/" className="btn btn-primary" style={{ padding: '12px 32px' }}>
          Return to Home
        </Link>
      </motion.div>
    </div>
  );
};

export default NotFound;
