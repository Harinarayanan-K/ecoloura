import React, { useState } from 'react';
import { X, Check, Sparkles, Building2, Layers, Send, PackageCheck } from 'lucide-react';
import confetti from 'canvas-confetti';
import { productsData } from '../data/productsData';

interface QuoteBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitQuote: (details: {
    propertyType: string;
    rooms: number;
    selectedItems: string[];
    brandingType: string;
    contactEmail: string;
  }) => void;
}

export const QuoteBuilder: React.FC<QuoteBuilderProps> = ({
  isOpen,
  onClose,
  onSubmitQuote
}) => {
  const [propertyType, setPropertyType] = useState('Heritage Palace & Royal Resort');
  const [rooms, setRooms] = useState(100);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([
    'dental-kit',
    'shaving-kit',
    'vanity-kit',
    'room-slippers'
  ]);
  const [brandingType, setBrandingType] = useState('Gold Foil Monogram (Signature)');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const toggleProduct = (id: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedProductIds.length === productsData.length) {
      setSelectedProductIds([]);
    } else {
      setSelectedProductIds(productsData.map((p) => p.id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#1e8a8a', '#104e50', '#c29b38', '#ffffff']
    });

    onSubmitQuote({
      propertyType,
      rooms,
      selectedItems: selectedProductIds,
      brandingType,
      contactEmail: email
    });

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 2400);
  };

  return (
    <div 
      className="modal-overlay active"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="quote-drawer-title"
      style={{
        zIndex: 9999,
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'stretch',
        padding: 0
      }}
    >
      <div 
        className="quote-drawer-panel"
        style={{
          width: '100%',
          maxWidth: '560px',
          background: '#ffffff',
          height: '100vh',
          overflowY: 'auto',
          padding: '36px 32px',
          boxShadow: '-10px 0 40px rgba(0,0,0,0.2)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
          <div>
            <div className="sub-title-badge" style={{ marginBottom: '8px' }}>
              <span className="badge-icon"><Sparkles size={13} /></span>
              <span>BESPOKE AMENITY SUITE ESTIMATOR</span>
            </div>
            <h2 id="quote-drawer-title" style={{ fontSize: '24px', color: '#0c1e21', fontWeight: 700 }}>
              Curate Your Property's Suite
            </h2>
          </div>
          <button 
            onClick={onClose}
            aria-label="Close quote estimator"
            style={{
              background: '#edf3f3',
              border: 'none',
              borderRadius: '50%',
              width: '38px',
              height: '38px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#0c1e21'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {submitted ? (
          <div style={{
            margin: 'auto 0',
            textAlign: 'center',
            padding: '40px 20px',
            background: '#f1f8f8',
            borderRadius: '20px',
            border: '1px solid #1e8a8a'
          }}>
            <PackageCheck size={56} color="#1e8a8a" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ fontSize: '22px', color: '#0c1e21', marginBottom: '8px' }}>
              Sample Suite Request Received!
            </h3>
            <p style={{ color: '#55686a', fontSize: '15px', lineHeight: 1.6 }}>
              Our hospitality consultant will dispatch a curated trial presentation box to your property within 24-48 hours.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Property Category */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0c1e21', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                Property Classification
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
                {[
                  'Heritage Palace & Royal Resort',
                  'Five-Star Boutique Hotel',
                  'Luxury Forest / Eco Retreat',
                  'Executive Business Suites'
                ].map((tier) => (
                  <button
                    type="button"
                    key={tier}
                    onClick={() => setPropertyType(tier)}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '10px',
                      fontSize: '13.5px',
                      textAlign: 'left',
                      border: propertyType === tier ? '2px solid #1e8a8a' : '1px solid #dbe3e3',
                      background: propertyType === tier ? '#eef7f7' : '#ffffff',
                      color: propertyType === tier ? '#104e50' : '#45585a',
                      fontWeight: propertyType === tier ? 600 : 400,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {tier}
                  </button>
                ))}
              </div>
            </div>

            {/* Room Count Slider */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '13px', fontWeight: 700, color: '#0c1e21', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Property Capacity
                </label>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#1e8a8a', background: '#edf5f5', padding: '3px 10px', borderRadius: '8px' }}>
                  {rooms} Guest Rooms
                </span>
              </div>
              <input 
                type="range" 
                min="20" 
                max="500" 
                step="10" 
                value={rooms} 
                onChange={(e) => setRooms(Number(e.target.value))}
                style={{
                  width: '100%',
                  accentColor: '#1e8a8a',
                  cursor: 'pointer'
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#829395', marginTop: '4px' }}>
                <span>20 Rooms (Boutique)</span>
                <span>250 Rooms</span>
                <span>500+ Rooms (Palace/Resort)</span>
              </div>
            </div>

            {/* Select Amenities */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <label style={{ fontSize: '13px', fontWeight: 700, color: '#0c1e21', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Select Amenities ({selectedProductIds.length}/{productsData.length})
                </label>
                <button 
                  type="button" 
                  onClick={handleSelectAll}
                  style={{ fontSize: '12px', color: '#1e8a8a', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  {selectedProductIds.length === productsData.length ? 'Deselect All' : 'Select All 9'}
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                {productsData.map((prod) => {
                  const isChecked = selectedProductIds.includes(prod.id);
                  return (
                    <div
                      key={prod.id}
                      onClick={() => toggleProduct(prod.id)}
                      style={{
                        padding: '9px 12px',
                        borderRadius: '10px',
                        fontSize: '12.5px',
                        border: isChecked ? '1.5px solid #1e8a8a' : '1px solid #e1e7e7',
                        background: isChecked ? '#f0f8f8' : '#fafcfc',
                        color: isChecked ? '#0c1e21' : '#5a6d6f',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{
                        width: '16px',
                        height: '16px',
                        borderRadius: '4px',
                        border: isChecked ? '1px solid #1e8a8a' : '1px solid #b5c2c2',
                        background: isChecked ? '#1e8a8a' : '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ffffff',
                        flexShrink: 0
                      }}>
                        {isChecked && <Check size={12} strokeWidth={3} />}
                      </div>
                      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontWeight: isChecked ? 600 : 400 }}>
                        {prod.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Custom Branding Selection */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0c1e21', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                Bespoke Branding & Packaging
              </label>
              <select
                value={brandingType}
                onChange={(e) => setBrandingType(e.target.value)}
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  borderRadius: '10px',
                  border: '1px solid #cad4d4',
                  fontSize: '14px',
                  color: '#0c1e21',
                  background: '#ffffff',
                  outline: 'none'
                }}
              >
                <option>Gold Foil Monogram (Signature Heritage)</option>
                <option>Silver Foil Hot-Stamped Monogram</option>
                <option>Zero-Plastic Recycled Kraft Minimalist</option>
                <option>Debossed Stone-Paper Luxury Box</option>
                <option>Standard ecolourà Luxury Line</option>
              </select>
            </div>

            {/* Contact Email */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0c1e21', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                Property Direct Email
              </label>
              <input
                type="email"
                required
                placeholder="procurement@luxuryhotel.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  border: '1px solid #cad4d4',
                  fontSize: '14px',
                  color: '#0c1e21',
                  outline: 'none'
                }}
              />
            </div>

            {/* Summary Box */}
            <div style={{
              background: '#f4f8f8',
              borderRadius: '14px',
              padding: '16px 20px',
              border: '1px dashed #1e8a8a',
              fontSize: '13px',
              color: '#3d5254',
              lineHeight: 1.6
            }}>
              <div><strong>Selected:</strong> {selectedProductIds.length} luxury in-room items</div>
              <div><strong>Estimated Production MOQ:</strong> 500 units per item</div>
              <div><strong>Sample Box Dispatch:</strong> Complimentary (Within 48h)</div>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              className="tj-primary-btn"
              style={{ width: '100%', justifyContent: 'center', padding: '14px 24px', fontSize: '15px' }}
            >
              <span className="btn-text">Request Complimentary Sample Presentation Box</span>
              <span className="btn-icon">
                <Send size={15} />
              </span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
