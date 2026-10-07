import React, { useEffect } from 'react';
import { CheckCircle2, X } from 'lucide-react';

interface ToastProps {
  message: string | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, onClose }) => {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message) return null;

  return (
    <aside 
      className="toast-notification"
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        bottom: '28px',
        right: '28px',
        zIndex: 99999,
        background: '#0c1e21',
        color: '#ffffff',
        padding: '16px 22px',
        borderRadius: '16px',
        boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        border: '1px solid rgba(30, 138, 138, 0.4)',
        maxWidth: '420px',
        animation: 'slideUpToast 0.35s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      <CheckCircle2 size={22} color="#1e8a8a" style={{ flexShrink: 0 }} />
      <span style={{ fontSize: '14px', lineHeight: 1.5, color: '#f0f5f5' }}>{message}</span>
      <button 
        onClick={onClose} 
        aria-label="Close notification"
        style={{
          background: 'none',
          border: 'none',
          color: '#8fa5a7',
          cursor: 'pointer',
          padding: '4px',
          marginLeft: 'auto',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <X size={16} />
      </button>
    </aside>
  );
};
