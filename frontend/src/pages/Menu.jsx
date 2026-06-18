import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MenuCard from '../components/MenuCard';
import MenuSkeleton from '../components/MenuSkeleton';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = ['All', 'Veg', 'Non Veg', 'Tiffins', 'Biryanis', 'Curries', 'Drinks', 'Ice Creams'];

const Menu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [ageVerified, setAgeVerified] = useState(false);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/menu`);
        setMenuItems(data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching menu", error);
        setIsLoading(false);
      }
    };
    fetchMenu();
  }, []);

  const handleCategoryClick = (category) => {
    if (category === 'Hard Drinks' && !ageVerified) {
      const isAdult = window.confirm("You must be 21 or older to view Hard Drinks. Are you 21 or older?");
      if (isAdult) {
        setAgeVerified(true);
        setActiveCategory(category);
      }
    } else {
      setActiveCategory(category);
    }
  };

  const filteredMenu = activeCategory === 'All' 
    ? menuItems.filter(item => item.subcategory !== 'Hard' || ageVerified) 
    : menuItems.filter(item => item.category === activeCategory);

  return (
    <div style={{ backgroundColor: 'var(--bg-color)', minHeight: '100vh', paddingBottom: '4rem' }}>
      {/* Header Banner */}
      <div style={{ 
        backgroundColor: 'var(--surface-dark)', 
        color: 'var(--secondary)', 
        padding: '6rem 0 3rem',
        textAlign: 'center',
        backgroundImage: 'url("https://www.transparenttextures.com/patterns/stardust.png")'
      }}>
        <div className="container">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
            style={{ fontSize: '3.5rem', fontFamily: 'var(--font-serif)', marginBottom: '1rem', letterSpacing: '2px' }}
          >
            Culinary Masterpieces
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            style={{ color: '#AAA', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto', fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}
          >
            Explore our diverse menu featuring the finest ingredients, crafted with passion and heritage.
          </motion.p>
        </div>
      </div>

      <div className="container" style={{ marginTop: '-2rem', position: 'relative', zIndex: 10 }}>
        {/* Category Filter */}
        <div className="glass" style={{ padding: '1rem', borderRadius: 'var(--radius-full)', display: 'flex', overflowX: 'auto', gap: '0.5rem', marginBottom: '3rem', boxShadow: 'var(--shadow-elegant)' }}>
          {CATEGORIES.map(category => (
            <button 
              key={category}
              className={`btn ${activeCategory === category ? 'btn-primary' : 'btn-outline'}`}
              style={{ 
                whiteSpace: 'nowrap', 
                borderRadius: 'var(--radius-full)', 
                border: activeCategory === category ? 'none' : '1px solid transparent',
                backgroundColor: activeCategory === category ? '' : 'transparent',
                color: activeCategory === category ? '' : 'var(--text-secondary)',
                fontWeight: activeCategory === category ? 'bold' : '500'
              }}
              onClick={() => handleCategoryClick(category)}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Menu Grid */}
        <motion.div layout className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {isLoading ? (
            // Skeleton Loaders
            Array.from({ length: 8 }).map((_, idx) => (
              <motion.div 
                key={idx} 
                className="card" 
                style={{ height: '420px', backgroundColor: '#FFF', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <div style={{ height: '280px', backgroundColor: '#E0E0E0' }}></div>
                <div style={{ padding: '1.5rem', flex: 1 }}>
                  <div style={{ height: '20px', width: '70%', backgroundColor: '#E0E0E0', marginBottom: '1rem', borderRadius: '4px' }}></div>
                  <div style={{ height: '15px', width: '100%', backgroundColor: '#E0E0E0', marginBottom: '0.5rem', borderRadius: '4px' }}></div>
                  <div style={{ height: '15px', width: '40%', backgroundColor: '#E0E0E0', marginBottom: '1.5rem', borderRadius: '4px' }}></div>
                  <div style={{ height: '40px', width: '100%', backgroundColor: '#E0E0E0', borderRadius: '8px' }}></div>
                </div>
              </motion.div>
            ))
          ) : (
            <AnimatePresence>
              {filteredMenu.map((item, idx) => (
                <motion.div 
                  key={item._id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                >
                  <MenuCard item={item} />
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </motion.div>
        
        {!isLoading && filteredMenu.length === 0 && (
          <div className="text-center" style={{ padding: '4rem 0', color: 'var(--text-secondary)' }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '2rem', marginBottom: '1rem' }}>No Items Found</h3>
            <p>We couldn't find any dishes in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Menu;

