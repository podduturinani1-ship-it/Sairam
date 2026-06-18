import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, X, FolderPlus } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';

const AdminMenu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    subcategory: '',
    imageUrl: '',
    isAvailable: true
  });

  const fetchData = async () => {
    try {
      const [menuRes, catRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/menu`),
        axios.get(`${import.meta.env.VITE_API_URL}/categories`)
      ]);
      setMenuItems(menuRes.data);
      setCategories(catRes.data);
      if (catRes.data.length > 0 && !formData.category) {
        setFormData(prev => ({ ...prev, category: catRes.data[0].name }));
      }
    } catch (error) {
      toast.error('Failed to load menu data');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    const uploadData = new FormData();
    uploadData.append('image', file);
    setUploading(true);

    try {
      const config = { headers: { 'Content-Type': 'multipart/form-data' } };
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/upload`, uploadData, config);
      setFormData({ ...formData, imageUrl: data });
      setUploading(false);
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error(error);
      setUploading(false);
      toast.error('Image upload failed');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.category) return toast.error('Please select a category first');
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      if (editingId) {
        await axios.put(`${import.meta.env.VITE_API_URL}/menu/${editingId}`, formData, config);
        toast.success('Menu item updated');
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/menu`, formData, config);
        toast.success('Menu item added');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error saving menu item');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this dish?')) {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        await axios.delete(`${import.meta.env.VITE_API_URL}/menu/${id}`, config);
        toast.success('Menu item deleted');
        fetchData();
      } catch (error) {
        toast.error('Error deleting menu item');
      }
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post(`${import.meta.env.VITE_API_URL}/categories`, { name: newCategoryName }, config);
      toast.success('Category added');
      setNewCategoryName('');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error adding category');
    }
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        await axios.delete(`${import.meta.env.VITE_API_URL}/categories/${id}`, config);
        toast.success('Category deleted');
        fetchData();
      } catch (error) {
        toast.error('Error deleting category');
      }
    }
  };

  const openModal = (item = null) => {
    if (item) {
      setEditingId(item._id);
      setFormData({
        name: item.name,
        description: item.description,
        price: item.price,
        category: item.category,
        subcategory: item.subcategory || '',
        imageUrl: item.imageUrl,
        isAvailable: item.isAvailable
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '', description: '', price: '', category: categories.length > 0 ? categories[0].name : '', subcategory: '', imageUrl: '', isAvailable: true
      });
    }
    setIsModalOpen(true);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.5rem', margin: 0, color: '#FFF' }}>Menu Management</h2>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => setIsCategoryModalOpen(true)} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FolderPlus size={18} /> Manage Categories
          </button>
          <button onClick={() => openModal()} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={18} /> Add New Dish
          </button>
        </div>
      </div>
      
      <div style={{ backgroundColor: '#1E1E1E', borderRadius: '12px', border: '1px solid #333', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', color: '#FFF', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#2A2A2A', borderBottom: '1px solid #333' }}>
              <th style={{ padding: '1rem' }}>Item</th>
              <th style={{ padding: '1rem' }}>Category</th>
              <th style={{ padding: '1rem' }}>Price</th>
              <th style={{ padding: '1rem' }}>Status</th>
              <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {menuItems.map(item => (
              <tr key={item._id} style={{ borderBottom: '1px solid #333' }}>
                <td style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <img src={item.imageUrl} alt={item.name} style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} onError={(e) => e.target.style.display = 'none'} onLoad={(e) => e.target.style.display = 'block'} />
                  <span style={{ fontWeight: 'bold' }}>{item.name}</span>
                </td>
                <td style={{ padding: '1rem', color: '#AAA' }}>{item.category}</td>
                <td style={{ padding: '1rem' }}>₹{item.price}</td>
                <td style={{ padding: '1rem' }}>
                  <span style={{ backgroundColor: item.isAvailable !== false ? 'rgba(46, 125, 50, 0.2)' : 'rgba(198, 40, 40, 0.2)', color: item.isAvailable !== false ? '#4CAF50' : '#EF5350', padding: '4px 12px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                    {item.isAvailable !== false ? 'Active' : 'Out of Stock'}
                  </span>
                </td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>
                  <button onClick={() => openModal(item)} style={{ background: 'none', border: 'none', color: 'var(--secondary)', cursor: 'pointer', marginRight: '1rem' }}><Edit size={18} /></button>
                  <button onClick={() => handleDelete(item._id)} style={{ background: 'none', border: 'none', color: '#EF5350', cursor: 'pointer' }}><Trash2 size={18} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Item Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} style={{ backgroundColor: '#1E1E1E', padding: '2rem', borderRadius: '12px', width: '100%', maxWidth: '500px', border: '1px solid #333' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ color: '#FFF', fontSize: '1.5rem', margin: 0 }}>{editingId ? 'Edit Dish' : 'Add New Dish'}</h3>
                <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: '#AAA', cursor: 'pointer' }}><X size={24} /></button>
              </div>
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div>
                  <label style={{ color: '#AAA', fontSize: '0.85rem' }}>Name</label>
                  <input type="text" className="input-elegant" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                </div>
                <div>
                  <label style={{ color: '#AAA', fontSize: '0.85rem' }}>Description</label>
                  <textarea className="input-elegant" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows="2" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label style={{ color: '#AAA', fontSize: '0.85rem' }}>Price (₹)</label>
                    <input type="number" className="input-elegant" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required />
                  </div>
                  <div>
                    <label style={{ color: '#AAA', fontSize: '0.85rem' }}>Category</label>
                    <select className="input-elegant" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} required>
                      {categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label style={{ color: '#AAA', fontSize: '0.85rem' }}>Image URL</label>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <input type="url" className="input-elegant" style={{ flex: 1 }} placeholder="Paste image link here" value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} required />
                    {formData.imageUrl && <img src={formData.imageUrl} alt="preview" style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} onError={(e) => e.target.style.display = 'none'} onLoad={(e) => e.target.style.display = 'block'} />}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '1rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#FFF' }}>
                    <input type="checkbox" checked={formData.isAvailable} onChange={e => setFormData({...formData, isAvailable: e.target.checked})} style={{ width: '18px', height: '18px', accentColor: 'var(--secondary)' }} />
                    Dish is currently available (in-store)
                  </label>
                </div>
                <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>{editingId ? 'Save Changes' : 'Add Dish'}</button>
              </form>
            </motion.div>
          </div>
        )}

        {/* Category Modal */}
        {isCategoryModalOpen && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} style={{ backgroundColor: '#1E1E1E', padding: '2rem', borderRadius: '12px', width: '100%', maxWidth: '400px', border: '1px solid #333' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ color: '#FFF', fontSize: '1.5rem', margin: 0 }}>Manage Categories</h3>
                <button onClick={() => setIsCategoryModalOpen(false)} style={{ background: 'none', border: 'none', color: '#AAA', cursor: 'pointer' }}><X size={24} /></button>
              </div>
              
              <div style={{ marginBottom: '1.5rem' }}>
                {categories.map(c => (
                  <div key={c._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.8rem', backgroundColor: '#2A2A2A', marginBottom: '8px', borderRadius: '8px' }}>
                    <span>{c.name}</span>
                    <button onClick={() => handleDeleteCategory(c._id)} style={{ background: 'none', border: 'none', color: '#EF5350', cursor: 'pointer' }}><Trash2 size={16} /></button>
                  </div>
                ))}
              </div>

              <form onSubmit={handleAddCategory} style={{ display: 'flex', gap: '10px' }}>
                <input type="text" className="input-elegant" placeholder="New category name" value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} required style={{ flex: 1 }} />
                <button type="submit" className="btn btn-primary"><Plus size={18} /></button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AdminMenu;
