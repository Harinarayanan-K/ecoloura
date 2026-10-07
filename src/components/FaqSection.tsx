import React, { useState } from 'react';
import { Phone, ArrowUpRight, Plus, Minus } from 'lucide-react';
import { faqData } from '../data/productsData';

interface FaqSectionProps {
  onCallSpecialist: () => void;
}

export const FaqSection: React.FC<FaqSectionProps> = ({ onCallSpecialist }) => {
  const [activeFaq, setActiveFaq] = useState<string>('faq-1');

  return (
    <section className="faq-section section-gap" id="contact" aria-label="Frequently Asked Questions & Contact">
      <div className="container">
        <div className="faq-layout">
          {/* Left: Call Card */}
          <div className="faq-contact-card">
            <h3>Ready to Elevate Your Guest Experience?</h3>
            <p>
              Contact our hospitality procurement desk for sample boxes, volume tiered pricing, and bespoke custom embossing options.
            </p>

            <div className="faq-phone-block">
              <div className="faq-phone-icon">
                <Phone size={20} color="#ffffff" />
              </div>
              <div>
                <span style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.85 }}>
                  Direct Hotline
                </span>
                <div className="faq-phone-number">+91 89395 40771</div>
              </div>
            </div>

            <div style={{ fontSize: '14.5px', opacity: 0.9, marginBottom: '24px' }}>
              Email: <strong>ecolourahotelsuppliers@gmail.com</strong>
            </div>

            <button 
              onClick={onCallSpecialist}
              className="tj-primary-btn" 
              style={{ background: '#0c1e21', boxShadow: '0 4px 15px rgba(0,0,0,0.3)', width: '100%', justifyContent: 'center' }}
            >
              <span className="btn-text">Call Procurement Specialist</span>
              <span className="btn-icon" style={{ background: 'var(--color-primary)' }}>
                <ArrowUpRight size={14} strokeWidth={2.5} />
              </span>
            </button>
          </div>

          {/* Right: Interactive FAQ Accordion */}
          <div className="accordion-list">
            {faqData.map((faq) => {
              const isOpen = activeFaq === faq.id;
              return (
                <div key={faq.id} className={`accordion-item ${isOpen ? 'active' : ''}`}>
                  <div 
                    className="accordion-header"
                    onClick={() => setActiveFaq(isOpen ? '' : faq.id)}
                    role="button"
                    tabIndex={0}
                    aria-expanded={isOpen}
                  >
                    <span className="accordion-title">{faq.question}</span>
                    <span className="accordion-icon">
                      {isOpen ? <Minus size={16} /> : <Plus size={16} />}
                    </span>
                  </div>
                  <div className="accordion-body">
                    <div className="accordion-inner-text">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
