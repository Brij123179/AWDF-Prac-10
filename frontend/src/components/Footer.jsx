import React from 'react';
import { Heart, Zap, Layers } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="footer">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '0.4rem' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <Zap size={14} color="#6366f1" />
          <span>React 18 Concurrent Features & Code Splitting</span>
        </span>
        <span>•</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <Layers size={14} color="#06b6d4" />
          <span>Vite 5 Rollup Chunk Segmentation</span>
        </span>
      </div>
      <p style={{ fontSize: '0.78rem', color: '#64748b' }}>
        Practical 8 • ITUE301 Advanced Web Development Frameworks • CO1 / PO3, PO5
      </p>
    </footer>
  );
};

export default Footer;
