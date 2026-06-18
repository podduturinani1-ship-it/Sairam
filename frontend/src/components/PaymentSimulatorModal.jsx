import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, XCircle, CreditCard, ShieldCheck } from 'lucide-react';

const PaymentSimulatorModal = ({ amount, method, onSuccess, onFailure, onCancel }) => {
  const transactionId = `sim_txn_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
    }}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        style={{
          backgroundColor: '#1E1E1E', width: '100%', maxWidth: '450px',
          borderRadius: '16px', overflow: 'hidden', border: '1px solid #333',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }}
      >
        {/* Header Header */}
        <div style={{ backgroundColor: 'var(--secondary)', color: '#000', padding: '1.5rem', textAlign: 'center', position: 'relative' }}>
          <h2 style={{ margin: 0, fontFamily: 'var(--font-serif)', fontSize: '1.8rem' }}>Sai Ram Restaurant</h2>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '8px', fontSize: '0.9rem', fontWeight: 'bold' }}>
            <ShieldCheck size={16} /> Secure Payment Gateway
          </div>
        </div>

        {/* Warning Banner */}
        <div style={{ backgroundColor: '#FFF3E0', color: '#E65100', padding: '12px 16px', fontSize: '0.85rem', fontWeight: 'bold', display: 'flex', gap: '8px', alignItems: 'center' }}>
          <AlertTriangle size={18} />
          Development/Test Payment Environment - No Real Money Is Transferred.
        </div>

        {/* Payment Details */}
        <div style={{ padding: '2rem 1.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ fontSize: '0.9rem', color: '#AAA', textTransform: 'uppercase', letterSpacing: '1px' }}>Amount to Pay</div>
            <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#FFF' }}>₹{amount}</div>
          </div>

          <div style={{ backgroundColor: '#2A2A2A', borderRadius: '8px', padding: '1rem', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem' }}>
              <span style={{ color: '#AAA' }}>Payment Method</span>
              <span style={{ color: '#FFF', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CreditCard size={14} color="var(--secondary)" /> {method}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
              <span style={{ color: '#AAA' }}>Mock Transaction ID</span>
              <span style={{ color: '#FFF', fontFamily: 'monospace' }}>{transactionId}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button 
              onClick={() => onSuccess(transactionId)}
              className="btn"
              style={{ 
                backgroundColor: '#4CAF50', color: '#FFF', padding: '16px', 
                fontSize: '1.1rem', fontWeight: 'bold', borderRadius: '8px', border: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                cursor: 'pointer', transition: 'all 0.2s'
              }}
            >
              <CheckCircle /> Simulate Payment Success
            </button>

            <button 
              onClick={() => onFailure()}
              className="btn"
              style={{ 
                backgroundColor: 'transparent', color: '#EF5350', padding: '16px', 
                fontSize: '1rem', fontWeight: 'bold', borderRadius: '8px', border: '1px solid #EF5350',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                cursor: 'pointer', transition: 'all 0.2s'
              }}
            >
              <XCircle /> Simulate Payment Failure
            </button>

            <button 
              onClick={onCancel}
              style={{ 
                backgroundColor: 'transparent', color: '#AAA', padding: '12px', 
                fontSize: '0.9rem', border: 'none', marginTop: '8px',
                cursor: 'pointer', textDecoration: 'underline'
              }}
            >
              Cancel & Return to Checkout
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentSimulatorModal;
