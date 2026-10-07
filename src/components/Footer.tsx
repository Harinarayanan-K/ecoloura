import React, { useState } from 'react';
import { ArrowUpRight, Phone, Mail, MapPin } from 'lucide-react';

interface FooterProps {
  onNewsletterSubmit: (email: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNewsletterSubmit }) => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      onNewsletterSubmit(email);
      setEmail('');
    }
  };

  return (
    <footer className="site-footer" role="contentinfo">
      <div className="container">
        {/* Newsletter Bar (Bexon 11 Style) */}
        <div className="footer-newsletter-bar">
          <div className="footer-newsletter-brand">
            <img 
              src="/assets/images/logo.png" 
              alt="ecolourà" 
              style={{ height: '38px', width: 'auto' }} 
            />
            <span className="footer-brand-title">ecolourà</span>
          </div>

          <form className="footer-form-wrap" onSubmit={handleSubmit}>
            <input 
              type="email" 
              placeholder="Enter your hotel email for wholesale catalog..." 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
            <button 
              type="submit" 
              className="tj-primary-btn" 
              style={{ padding: '6px 8px 6px 20px' }}
            >
              <span className="btn-text">Get Catalog</span>
              <span className="btn-icon">
                <ArrowUpRight size={14} strokeWidth={2.5} />
              </span>
            </button>
          </form>
        </div>

        {/* 4 Column Footer Grid */}
        <div className="footer-grid">
          {/* Col 1 */}
          <div>
            <div className="header-brand" style={{ marginBottom: '12px' }}>
              <img src="/assets/images/logo.png" alt="ecolourà Logo" className="brand-logo-img" />
              <span className="brand-text" style={{ color: '#ffffff' }}>ecolourà</span>
            </div>
            <p className="footer-col-desc">
              "Step into a timeless experience of luxury and history." Providing bespoke, sustainable hotel amenities curated for prestigious heritage hotels, luxury boutique estates, and five-star properties.
            </p>
            <div style={{ fontSize: '13.5px', color: 'var(--color-primary)', fontWeight: 700 }}>
              ✦ Certified Luxury Hotel Amenities Supplier
            </div>
          </div>

          {/* Col 2 */}
          <div>
            <h4 className="footer-heading">Collections</h4>
            <ul className="footer-links">
              <li><a href="#products">In-Room Amenities</a></li>
              <li><a href="#products">Personal Care Kits</a></li>
              <li><a href="#products">Bamboo Grooming Line</a></li>
              <li><a href="#products">Heritage Velvet Slippers</a></li>
              <li><a href="#products">Bespoke Hotel Monograms</a></li>
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <h4 className="footer-heading">Quick Links</h4>
            <ul className="footer-links">
              <li><a href="#home">Home</a></li>
              <li><a href="#why-us">Why Choose Us</a></li>
              <li><a href="#about">About ecolourà</a></li>
              <li><a href="#solutions">Hospitality Solutions</a></li>
              <li><a href="#portfolio">Heritage Partners</a></li>
              <li><a href="#contact">Contact Desk</a></li>
            </ul>
          </div>

          {/* Col 4 */}
          <div>
            <h4 className="footer-heading">Procurement Office</h4>
            <div className="footer-contact-details">
              <div className="contact-row">
                <Phone size={18} color="var(--color-primary)" style={{ flexShrink: 0, marginTop: '3px' }} />
                <div>
                  <span>Direct Hotline:</span><br />
                  <a href="tel:+918939540771">+91 89395 40771</a>
                </div>
              </div>

              <div className="contact-row">
                <Mail size={18} color="var(--color-primary)" style={{ flexShrink: 0, marginTop: '3px' }} />
                <div>
                  <span>Email Inquiries:</span><br />
                  <a href="mailto:ecolourahotelsuppliers@gmail.com">ecolourahotelsuppliers@gmail.com</a>
                </div>
              </div>

              <div className="contact-row">
                <MapPin size={18} color="var(--color-primary)" style={{ flexShrink: 0, marginTop: '3px' }} />
                <div>
                  <span>Headquarters:</span><br />
                  <span>India • Supplying Worldwide</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div>&copy; {new Date().getFullYear()} ecolourà. All Rights Reserved. Transforming Luxury Hospitality.</div>
          <div className="footer-bottom-links">
            <a href="#contact">Privacy Policy</a>
            <a href="#contact">Terms of Supply</a>
            <a href="#about">Sustainability Commitment</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
