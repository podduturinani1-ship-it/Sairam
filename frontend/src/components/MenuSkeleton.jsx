import React from 'react';

const MenuSkeleton = () => {
  return (
    <div className="masonry-grid">
      {[1, 2, 3, 4, 5, 6].map(i => (
        <div key={i} className="masonry-item" style={{ backgroundColor: '#1E1E1E', minHeight: '300px', borderRadius: '8px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)', animation: 'shimmer 1.5s infinite', zIndex: 1 }} />
          <div style={{ position: 'absolute', bottom: '20px', left: '20px', right: '20px' }}>
            <div style={{ height: '24px', width: '60%', backgroundColor: '#333', borderRadius: '4px', marginBottom: '8px' }}></div>
            <div style={{ height: '16px', width: '80%', backgroundColor: '#222', borderRadius: '4px' }}></div>
          </div>
        </div>
      ))}
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default MenuSkeleton;
