import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, EyeOff, Eye, Trash2, Award } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchReviews = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/reviews`);
      setReviews(res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      setLoading(false);
    } catch (error) {
      toast.error('Failed to load reviews');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const updateReview = async (id, updates) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`${import.meta.env.VITE_API_URL}/reviews/${id}`, updates, config);
      toast.success('Review updated');
      fetchReviews();
    } catch (error) {
      toast.error('Failed to update review');
    }
  };

  const deleteReview = async (id) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        await axios.delete(`${import.meta.env.VITE_API_URL}/reviews/${id}`, config);
        toast.success('Review deleted');
        fetchReviews();
      } catch (error) {
        toast.error('Failed to delete review');
      }
    }
  };

  if (loading) return <div style={{ color: '#FFF' }}>Loading reviews...</div>;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
      <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', marginBottom: '2rem', color: '#FFF' }}>Review Management</h2>
      
      <div style={{ backgroundColor: '#1E1E1E', borderRadius: '12px', border: '1px solid #333', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', color: '#FFF', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#2A2A2A', borderBottom: '1px solid #333' }}>
              <th style={{ padding: '1rem' }}>User / Date</th>
              <th style={{ padding: '1rem' }}>Rating</th>
              <th style={{ padding: '1rem', width: '40%' }}>Comment</th>
              <th style={{ padding: '1rem' }}>Status</th>
              <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map(r => (
              <tr key={r._id} style={{ borderBottom: '1px solid #333', opacity: r.status === 'Hidden' ? 0.6 : 1 }}>
                <td style={{ padding: '1rem' }}>
                  <div style={{ fontWeight: 'bold' }}>{r.user?.name || 'Anonymous'}</div>
                  <div style={{ color: '#AAA', fontSize: '0.8rem' }}>{new Date(r.createdAt).toLocaleDateString()}</div>
                </td>
                <td style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', gap: '2px' }}>
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} fill={i < r.rating ? "var(--secondary)" : "transparent"} color="var(--secondary)" />
                    ))}
                  </div>
                </td>
                <td style={{ padding: '1rem' }}>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: '#DDD' }}>{r.comment}</p>
                </td>
                <td style={{ padding: '1rem' }}>
                  <select 
                    className="input-elegant" 
                    style={{ padding: '4px 8px', width: 'auto', backgroundColor: 'transparent', border: '1px solid #555', color: r.status === 'Approved' ? '#4CAF50' : r.status === 'Hidden' ? '#F44336' : '#FFC107' }}
                    value={r.status}
                    onChange={(e) => updateReview(r._id, { status: e.target.value })}
                  >
                    <option value="Pending" style={{ background: '#121212', color: '#FFF' }}>Pending</option>
                    <option value="Approved" style={{ background: '#121212', color: '#FFF' }}>Approved</option>
                    <option value="Hidden" style={{ background: '#121212', color: '#FFF' }}>Hidden</option>
                  </select>
                </td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>
                  <button 
                    onClick={() => updateReview(r._id, { isFeatured: !r.isFeatured })} 
                    title="Feature this review on Home page"
                    style={{ background: 'none', border: 'none', color: r.isFeatured ? 'var(--secondary)' : '#666', cursor: 'pointer', marginRight: '1rem' }}
                  >
                    <Award size={18} />
                  </button>
                  <button onClick={() => deleteReview(r._id)} style={{ background: 'none', border: 'none', color: '#EF5350', cursor: 'pointer' }}>
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {reviews.length === 0 && (
              <tr>
                <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>No reviews found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default AdminReviews;

