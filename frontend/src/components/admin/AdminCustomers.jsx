import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, User as UserIcon, Trash2, Ban, CheckCircle } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';

const AdminCustomers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const { user } = useAuth();

  const fetchUsers = async (keyword = '', pageNumber = 1) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/users?keyword=${keyword}&page=${pageNumber}`, config);
      setUsers(res.data);
      // Backend does not return pagination currently for users, so default to 1
      setPage(1);
      setPages(1);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to load users');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(searchTerm, page);
    // eslint-disable-next-line
  }, [user, page]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchUsers(searchTerm, 1);
  };

  const updateRole = async (id, newRole) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`${import.meta.env.VITE_API_URL}/users/${id}`, { role: newRole }, config);
      toast.success(`User role updated to ${newRole}`);
      fetchUsers(searchTerm, page);
    } catch (error) {
      toast.error('Failed to update role');
    }
  };

  const toggleDisable = async (id, currentStatus) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`${import.meta.env.VITE_API_URL}/users/${id}`, { isDisabled: !currentStatus }, config);
      toast.success(`User account ${!currentStatus ? 'disabled' : 'enabled'}`);
      fetchUsers(searchTerm, page);
    } catch (error) {
      toast.error('Failed to toggle account status');
    }
  };

  const deleteUser = async (id) => {
    if (window.confirm('Are you sure you want to completely delete this user?')) {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        await axios.delete(`${import.meta.env.VITE_API_URL}/users/${id}`, config);
        toast.success('User deleted');
        fetchUsers(searchTerm, page);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete user');
      }
    }
  };

  if (loading) return <div style={{ color: '#FFF' }}>Loading customers...</div>;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', margin: 0, color: '#FFF' }}>Customer Management</h2>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px' }}>
          <input 
            type="text" 
            placeholder="Search by name or email..." 
            className="input-elegant" 
            style={{ width: '300px' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit" className="btn btn-outline">Search</button>
        </form>
      </div>
      
      <div style={{ backgroundColor: '#1E1E1E', borderRadius: '12px', border: '1px solid #333', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', color: '#FFF', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#2A2A2A', borderBottom: '1px solid #333' }}>
              <th style={{ padding: '1rem' }}>User</th>
              <th style={{ padding: '1rem' }}>Contact</th>
              <th style={{ padding: '1rem' }}>Joined Date</th>
              <th style={{ padding: '1rem' }}>Role</th>
              <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u._id} style={{ borderBottom: '1px solid #333', opacity: u.isDisabled ? 0.5 : 1 }}>
                <td style={{ padding: '1rem' }}>
                  <div style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {u.role === 'admin' ? <Shield size={16} color="var(--secondary)"/> : <UserIcon size={16} color="#AAA"/>}
                    <span style={{ textDecoration: u.isDisabled ? 'line-through' : 'none' }}>{u.name}</span>
                  </div>
                </td>
                <td style={{ padding: '1rem' }}>
                  <div style={{ textDecoration: u.isDisabled ? 'line-through' : 'none' }}>{u.email}</div>
                  {u.phone && <div style={{ color: '#AAA', fontSize: '0.8rem', textDecoration: u.isDisabled ? 'line-through' : 'none' }}>{u.phone}</div>}
                </td>
                <td style={{ padding: '1rem', color: '#AAA' }}>
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>
                <td style={{ padding: '1rem', textTransform: 'capitalize' }}>
                  {u.role}
                </td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>
                  <button onClick={() => toggleDisable(u._id, u.isDisabled)} style={{ background: 'none', border: 'none', color: u.isDisabled ? '#4CAF50' : '#FF9800', cursor: 'pointer', marginRight: '1rem' }} title={u.isDisabled ? "Enable Account" : "Disable Account"}>
                    {u.isDisabled ? <CheckCircle size={18} /> : <Ban size={18} />}
                  </button>
                  <button onClick={() => deleteUser(u._id)} style={{ background: 'none', border: 'none', color: '#EF5350', cursor: 'pointer' }} title="Delete Account">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>No users found.</td>
              </tr>
            )}
          </tbody>
        </table>
        
        {/* Pagination */}
        {pages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '1rem', gap: '8px', borderTop: '1px solid #333' }}>
            {[...Array(pages).keys()].map(x => (
              <button 
                key={x + 1} 
                onClick={() => setPage(x + 1)}
                style={{ 
                  padding: '6px 12px', 
                  borderRadius: '4px', 
                  backgroundColor: x + 1 === page ? 'var(--secondary)' : '#2A2A2A', 
                  color: x + 1 === page ? '#000' : '#FFF', 
                  border: 'none', 
                  cursor: 'pointer' 
                }}
              >
                {x + 1}
              </button>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AdminCustomers;
