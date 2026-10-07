import React from 'react';
import { X, Check, ArrowUpRight, Box, Clock, Layers } from 'lucide-react';
import { Product } from '../types';
import { RevealImage } from './RevealImage';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  onRequestSample: (product: Product) => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  onClose,
  onRequestSample
}) => {
  if (!product) return null;

  return (
    <div 
      className="modal-overlay active"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-product-title"
    >
      <div className="modal-box">
        <button 
          className="modal-close-btn" 
          onClick={onClose}
          aria-label="Close dialog"
        >
          <X size={20} />
        </button>

        <div className="modal-grid">
          <div className="modal-image-side">
            <RevealImage
              variant="detail"
              id="modal-product-img" 
              src={product.image} 
              alt={product.name} 
              width="320"
              height="300"
            />
          </div>

          <div className="modal-info-side">
            <span className="modal-badge">{product.categoryLabel}</span>
            <h2 className="modal-title" id="modal-product-title">{product.name}</h2>
            <p className="modal-desc">{product.fullDesc}</p>

            {/* Quick Specs Badges */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '20px' }}>
              {product.moq && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--color-heading)', background: '#edf4f4', padding: '5px 12px', borderRadius: '8px', fontWeight: 600 }}>
                  <Box size={14} color="#1e8a8a" />
                  MOQ: {product.moq}
                </div>
              )}
              {product.leadTime && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--color-heading)', background: '#edf4f4', padding: '5px 12px', borderRadius: '8px', fontWeight: 600 }}>
                  <Clock size={14} color="#1e8a8a" />
                  Delivery: {product.leadTime}
                </div>
              )}
              {product.materials && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--color-heading)', background: '#edf4f4', padding: '5px 12px', borderRadius: '8px', fontWeight: 600 }}>
                  <Layers size={14} color="#1e8a8a" />
                  {product.materials}
                </div>
              )}
            </div>

            <h4 style={{ fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-heading)', marginBottom: '10px' }}>
              Hospitality Features
            </h4>
            <ul className="modal-specs-list">
              {product.specs.map((spec, i) => (
                <li key={i}>
                  <Check size={16} color="#1e8a8a" strokeWidth={2.5} />
                  <span>{spec}</span>
                </li>
              ))}
            </ul>

            <button 
              onClick={() => onRequestSample(product)}
              className="tj-primary-btn"
              style={{ alignSelf: 'flex-start' }}
            >
              <span className="btn-text">Enquire about this product</span>
              <span className="btn-icon">
                <ArrowUpRight size={14} strokeWidth={2.5} />
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
