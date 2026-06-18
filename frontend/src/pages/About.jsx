import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Car, Users, Wind, Smartphone, Clock, ShoppingBag, Coffee, Award, Beer, IceCream } from 'lucide-react';

const GALLERY_IMAGES = [
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80',
  'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=600&q=80',
  'https://images.unsplash.com/photo-1606491956689-2ea866880c84?w=600&q=80',
  'https://images.unsplash.com/photo-1544148103-0773bf10d330?w=600&q=80',
  'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&q=80',
  'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600&q=80',
];

const About = () => {
  const [lightboxImg, setLightboxImg] = useState(null);

  const fadeIn = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  return (
    <div style={{ backgroundColor: 'var(--bg-color)', minHeight: '100vh', paddingBottom: '4rem' }}>
      
      {/* Header Banner */}
      <div style={{ backgroundColor: 'var(--surface-dark)', color: 'var(--secondary)', padding: '6rem 0 3rem', textAlign: 'center' }}>
        <div className="container">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ fontSize: '3.5rem', fontFamily: 'var(--font-serif)', marginBottom: '1rem' }}>
            About Sai Ram Restaurant
          </motion.h1>
          <p style={{ color: '#AAA', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
            A legacy of taste, tradition, and premium dining in the heart of Nirmal.
          </p>
        </div>
      </div>

      {/* Story Section */}
      <section className="section">
        <div className="container grid md:grid-cols-2 gap-8 items-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn}>
            <h2 className="section-title" style={{ textAlign: 'left' }}>Our Legacy</h2>
            <p className="mb-4" style={{ fontSize: '1.1rem', color: 'var(--text-secondary)' }}>
              Located in the vibrant heart of Nirmal, Sai Ram Restaurant stands as a testament to authentic flavors and warm hospitality. Our spacious two-floor establishment provides the perfect ambiance for intimate family dinners and grand celebrations alike.
            </p>
            <p className="mb-4" style={{ fontSize: '1.1rem', color: 'var(--text-secondary)' }}>
              We pride ourselves on an uncompromising commitment to hygiene, utilizing only the freshest ingredients to craft traditional vegetarian and non-vegetarian delicacies. Experience the perfect blend of fast service and premium dining.
            </p>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)' }}>
              Whether you are craving our signature Hyderabadi Biryani, a comforting South Indian Tiffin, or a premium mocktail, our diverse menu caters to every palate.
            </p>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} viewport={{ once: true }} style={{ position: 'relative' }}>
            <img src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80" alt="Restaurant Interior" style={{ width: '100%', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-elegant)' }} />
            <div style={{ position: 'absolute', bottom: '-20px', left: '-20px', backgroundColor: 'var(--secondary)', color: 'var(--surface-dark)', padding: '2rem', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-gold)' }}>
              <h3 style={{ margin: 0, color: 'var(--surface-dark)', fontSize: '2rem' }}>10+ Years</h3>
              <p style={{ margin: 0, fontWeight: 500 }}>Of Culinary Excellence</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Facilities */}
      <section className="section section-dark">
        <div className="container">
          <h2 className="section-title">Premium Facilities</h2>
          <p className="section-subtitle">Designed to provide you with the utmost comfort and convenience.</p>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {[
              { icon: <Car size={40}/>, label: 'Parking Area' },
              { icon: <Users size={40}/>, label: 'Family Dining' },
              { icon: <Wind size={40}/>, label: 'Air Conditioned' },
              { icon: <Smartphone size={40}/>, label: 'Smart Booking' },
              { icon: <Clock size={40}/>, label: 'Fast Service' },
              { icon: <ShoppingBag size={40}/>, label: 'Online Orders' },
              { icon: <Coffee size={40}/>, label: 'Beverages' },
              { icon: <Beer size={40}/>, label: 'Hard Drinks' },
              { icon: <IceCream size={40}/>, label: 'Ice Creams' },
              { icon: <Award size={40}/>, label: 'Premium Quality' },
            ].map((facility, idx) => (
              <motion.div 
                key={idx}
                whileHover={{ y: -10, backgroundColor: 'var(--primary)', color: 'var(--text-inverse)' }}
                className="card flex-col items-center justify-center text-center card-dark"
                style={{ padding: '2rem 1rem', transition: 'all 0.3s ease', cursor: 'pointer' }}
              >
                <div style={{ marginBottom: '1rem', color: 'var(--secondary)' }}>{facility.icon}</div>
                <h4 style={{ margin: 0, fontSize: '1rem', fontFamily: 'var(--font-sans)', color: 'inherit' }}>{facility.label}</h4>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Masonry */}
      <section className="section" style={{ backgroundColor: '#F5F5F5' }}>
        <div className="container">
          <h2 className="section-title">Visual Experience</h2>
          <p className="section-subtitle">A glimpse into the Sai Ram Restaurant ambiance and offerings.</p>
          
          <div className="masonry-grid">
            {GALLERY_IMAGES.map((src, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="masonry-item"
                onClick={() => setLightboxImg(src)}
              >
                <img src={src} alt={`Gallery ${idx}`} />
                <div className="masonry-overlay">
                  <span className="masonry-title">View Image</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxImg && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}
            onClick={() => setLightboxImg(null)}
          >
            <button style={{ position: 'absolute', top: '2rem', right: '2rem', color: 'white', fontSize: '2rem', background: 'none', border: 'none', cursor: 'pointer' }}>&times;</button>
            <motion.img 
              initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }}
              src={lightboxImg} alt="Lightbox" style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: 'var(--radius-md)' }} 
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default About;
