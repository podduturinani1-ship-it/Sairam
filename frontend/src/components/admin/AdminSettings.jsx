import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    restaurantName: '',
    phoneNumber: '',
    email: '',
    address: '',
    openingHours: '',
    deliveryCharges: 0,
    taxPercentage: 0,
    facebookLink: '',
    instagramLink: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/settings`);
        if (res.data) setSettings(res.data);
        setLoading(false);
      } catch (error) {
        toast.error('Failed to load settings');
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`${import.meta.env.VITE_API_URL}/settings`, settings, config);
      toast.success('Settings updated successfully!');
      setSaving(false);
    } catch (error) {
      toast.error('Failed to update settings');
      setSaving(false);
    }
  };

  if (loading) return <div style={{ color: '#FFF' }}>Loading settings...</div>;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
      <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', marginBottom: '2rem', color: '#FFF' }}>Restaurant Settings</h2>
      
      <div style={{ backgroundColor: '#1E1E1E', borderRadius: '12px', border: '1px solid #333', padding: '2rem' }}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="grid md:grid-cols-2 gap-6">
            
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#AAA', fontSize: '0.9rem' }}>Restaurant Name</label>
              <input type="text" name="restaurantName" value={settings.restaurantName} onChange={handleChange} className="input-elegant" required />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#AAA', fontSize: '0.9rem' }}>Contact Email</label>
              <input type="email" name="email" value={settings.email} onChange={handleChange} className="input-elegant" required />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#AAA', fontSize: '0.9rem' }}>Phone Number</label>
              <input type="text" name="phoneNumber" value={settings.phoneNumber} onChange={handleChange} className="input-elegant" required />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#AAA', fontSize: '0.9rem' }}>Opening Hours</label>
              <input type="text" name="openingHours" value={settings.openingHours} onChange={handleChange} className="input-elegant" required />
            </div>

          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#AAA', fontSize: '0.9rem' }}>Address</label>
            <input type="text" name="address" value={settings.address} onChange={handleChange} className="input-elegant" required />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#AAA', fontSize: '0.9rem' }}>Delivery Charge (₹)</label>
              <input type="number" name="deliveryCharges" value={settings.deliveryCharges} onChange={handleChange} className="input-elegant" required />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#AAA', fontSize: '0.9rem' }}>Tax Percentage (%)</label>
              <input type="number" name="taxPercentage" value={settings.taxPercentage} onChange={handleChange} className="input-elegant" required />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#AAA', fontSize: '0.9rem' }}>Facebook Link</label>
              <input type="url" name="facebookLink" value={settings.facebookLink} onChange={handleChange} className="input-elegant" placeholder="https://facebook.com/..." />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#AAA', fontSize: '0.9rem' }}>Instagram Link</label>
              <input type="url" name="instagramLink" value={settings.instagramLink} onChange={handleChange} className="input-elegant" placeholder="https://instagram.com/..." />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '16px', marginTop: '1rem' }} disabled={saving}>
            <Save size={18} /> {saving ? 'Saving Changes...' : 'Save Settings'}
          </button>
        </form>
      </div>
    </motion.div>
  );
};

export default AdminSettings;

