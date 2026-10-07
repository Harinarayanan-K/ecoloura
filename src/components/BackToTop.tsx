import React, { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export const BackToTop: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  if (!visible) return null;

  return (
    <button
      onClick={scrollToTop}
      aria-label="Back to top of page"
      className="back-to-top-btn"
      style={{
        position: 'fixed',
        bottom: '28px',
        left: '28px',
        width: '46px',
        height: '46px',
        borderRadius: '50%',
        background: '#ffffff',
        border: '1px solid var(--color-border)',
        boxShadow: '0 8px 24px rgba(12, 30, 33, 0.12)',
        color: 'var(--color-primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        zIndex: 900,
        transition: 'all 0.3s ease'
      }}
    >
      <ArrowUp size={20} strokeWidth={2.2} />
    </button>
  );
};
