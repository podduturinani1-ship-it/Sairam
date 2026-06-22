import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import axios from 'axios';

const FEATURED_DISHES = [
  { name: 'Special Chicken Biryani', img: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&q=80', desc: 'Aromatic basmati rice cooked with tender chicken and secret spices.' },
  { name: 'Paneer Butter Masala', img: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc0?w=800&q=80', desc: 'Cottage cheese in a rich, creamy tomato and butter gravy.' },
  { name: 'Masala Dosa', img: 'https://images.unsplash.com/photo-1645177628172-a94c1f96e6db?w=800&q=80', desc: 'Crispy rice crepe filled with spiced potato curry.' },
];

const Home = () => {
  const [liveStatus, setLiveStatus] = useState({ occupancy: 75, tablesAvailable: 4, waitTime: 15, trendingDish: 'Chicken Biryani' });
  const [featured, setFeatured] = useState(FEATURED_DISHES);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/analytics/live-status`);
        setLiveStatus(data);
      } catch (error) {
        console.error('Failed to fetch live status', error);
      }
    };
    const fetchMenu = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/menu`);
        setFeatured(FEATURED_DISHES.map(dish => {
          const dbDish = data.find(d => d.name === dish.name);
          return dbDish && dbDish.imageUrl ? { ...dish, img: dbDish.imageUrl } : dish;
        }));
      } catch (error) {
        console.error('Failed to fetch menu images', error);
      }
    };
    fetchStatus();
    fetchMenu();
    const interval = setInterval(fetchStatus, 60000); // update every minute
    return () => clearInterval(interval);
  }, []);

  const fadeIn = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  return (
    <div style={{ backgroundColor: 'var(--bg-color)' }}>
      {/* Hero Section */}
      <section style={{ 
        height: '80vh', 
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
      }}>
        {/* Background Image (Update this URL to use your local image, e.g., '/hero-bg.jpg') */}
        <div className="hero-poster" style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'url("https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=1920")',
          backgroundSize: 'cover', backgroundPosition: 'center',
          filter: 'brightness(0.4)',
          zIndex: 0
        }} />
        <motion.div 
          initial="hidden" animate="visible" variants={fadeIn}
          className="container text-center" style={{ position: 'relative', zIndex: 10, color: 'var(--text-inverse)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem', backgroundColor: 'rgba(0,0,0,0.5)', padding: '6px 16px', borderRadius: '30px', border: '1px solid rgba(212,175,55,0.3)' }}>
            <span style={{ color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>⭐ 4.8 Rating</span>
            <span style={{ color: '#DDD' }}>|</span>
            <span style={{ color: '#FFF' }}>100+ Dishes</span>
            <span style={{ color: '#DDD' }}>|</span>
            <span style={{ color: '#FFF' }}>🚗 Parking Available</span>
          </div>

          <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: '1.2rem', letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '1rem', color: 'var(--secondary)' }}>
            Located in Nirmal, Telangana
          </h2>
          <h1 style={{ fontSize: '5.5rem', marginBottom: '1.5rem', color: 'var(--text-inverse)', textShadow: '0 4px 20px rgba(0,0,0,0.5)', fontFamily: 'var(--font-serif)', letterSpacing: '2px' }}>
            Sai Ram Restaurant
          </h1>
          <p style={{ fontSize: '1.5rem', marginBottom: '3rem', fontStyle: 'italic', fontFamily: 'var(--font-serif)', fontWeight: 300, color: '#DDD' }}>
            "A Legacy of Taste Since 2010"
          </p>
          <div className="flex justify-center gap-6 flex-wrap">
            <Link to="/menu" className="btn btn-primary" style={{ padding: '16px 40px', fontSize: '1.1rem' }}>View Menu</Link>
            <Link to="/booking" className="btn btn-outline" style={{ padding: '16px 40px', fontSize: '1.1rem', color: 'var(--secondary)', borderColor: 'var(--secondary)' }}>Book a Table</Link>
          </div>
        </motion.div>
      </section>

      {/* Live Status Widget */}
      <section style={{ transform: 'translateY(-50%)', position: 'relative', zIndex: 20 }}>
        <div className="container">
          <div className="glass card" style={{ padding: '2rem', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '2rem' }}>
            <div className="text-center">
              <div style={{ color: 'var(--primary)', fontSize: '2rem', fontWeight: 'bold' }}>{liveStatus.occupancy}%</div>
              <div style={{ color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px' }}>Current Occupancy</div>
            </div>
            <div className="text-center">
              <div style={{ color: 'var(--primary)', fontSize: '2rem', fontWeight: 'bold' }}>{liveStatus.tablesAvailable}</div>
              <div style={{ color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px' }}>Tables Available</div>
            </div>
            <div className="text-center">
              <div style={{ color: 'var(--primary)', fontSize: '2rem', fontWeight: 'bold' }}>{liveStatus.waitTime}m</div>
              <div style={{ color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px' }}>Est. Wait Time</div>
            </div>
            <div className="text-center">
              <div style={{ color: 'var(--primary)', fontSize: '1.2rem', fontWeight: 'bold', lineHeight: '2rem' }}>{liveStatus.trendingDish}</div>
              <div style={{ color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px' }}>Trending Today</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Dishes */}
      <section className="section section-dark" style={{ paddingTop: '4rem' }}>
        <div className="container">
          <h2 className="section-title">Signature Delicacies</h2>
          <p className="section-subtitle">Curated masterpieces prepared by our expert chefs.</p>
          
          <div className="grid md:grid-cols-3 gap-8">
            {featured.map((dish, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.2 }}
                viewport={{ once: true }}
                className="card card-dark"
                style={{ overflow: 'hidden' }}
              >
                <div style={{ height: '250px', overflow: 'hidden' }}>
                  <img src={dish.img} alt={dish.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }} className="hover-zoom" onMouseOver={e => e.currentTarget.style.transform = 'scale(1.1)'} onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'} />
                </div>
                <div style={{ padding: '2rem', textAlign: 'center' }}>
                  <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--secondary)' }}>{dish.name}</h3>
                  <p style={{ color: '#AAA', marginBottom: '1.5rem' }}>{dish.desc}</p>
                  <Link to="/menu" className="btn btn-outline" style={{ padding: '8px 24px' }}>Order Now</Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
