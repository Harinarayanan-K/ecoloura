import React from 'react';
import { Sparkles, ShieldCheck, Truck, ArrowUpRight } from 'lucide-react';

interface WhyChooseUsProps {
  onSelectFeature: (featureName: string) => void;
}

export const WhyChooseUs: React.FC<WhyChooseUsProps> = ({ onSelectFeature }) => {
  return (
    <section className="choose-section section-gap" id="why-us" aria-label="Why Choose ecolourà">
      <div className="container">
        <div className="sec-heading text-center">
          <div className="sub-title-badge">
            <span className="badge-icon">
              <Sparkles size={14} />
            </span>
            <span>CHOOSE THE BEST</span>
          </div>
          <h2 className="sec-title">Empowering Stays with Distinctive Expertise.</h2>
          <p className="sec-desc">
            Every touchpoint in hospitality matters. We engineer hotel amenity solutions that merge luxury aesthetics, certified sustainability, and punctual fulfillment.
          </p>
        </div>

        <div className="choose-grid">
          {/* Card 1 */}
          <div className="choose-card">
            <div className="choose-icon-wrap">
              <Sparkles size={32} />
            </div>
            <h3 className="choose-card-title">Bespoke Customization</h3>
            <p className="choose-card-desc">
              Personalized foil stamping, custom botanical aromas, and artisanal packaging tailored specifically to reflect your resort's prestigious brand heritage.
            </p>
            <button 
              onClick={() => onSelectFeature('Bespoke Formulation')}
              className="text-btn"
            >
              <span>Request Formulation</span>
              <span className="btn-icon">
                <ArrowUpRight size={12} strokeWidth={2.5} />
              </span>
            </button>
          </div>

          {/* Card 2 */}
          <div className="choose-card">
            <div className="choose-icon-wrap">
              <ShieldCheck size={32} />
            </div>
            <h3 className="choose-card-title">Eco-Conscious Standards</h3>
            <p className="choose-card-desc">
              Zero-plastic wheat straw polymers, organic unbleached cotton, and biodegradable cornstarch materials that honor global ecological standards.
            </p>
            <button 
              onClick={() => onSelectFeature('Eco Standards')}
              className="text-btn"
            >
              <span>View Sustainability</span>
              <span className="btn-icon">
                <ArrowUpRight size={12} strokeWidth={2.5} />
              </span>
            </button>
          </div>

          {/* Card 3 */}
          <div className="choose-card">
            <div className="choose-icon-wrap">
              <Truck size={32} />
            </div>
            <h3 className="choose-card-title">Dependable Bulk Logistics</h3>
            <p className="choose-card-desc">
              Guaranteed on-time replenishment, strict QA inspections, and seamless multi-property fulfillment for boutique retreats and luxury hotel chains.
            </p>
            <button 
              onClick={() => onSelectFeature('Bulk Logistics')}
              className="text-btn"
            >
              <span>Bulk Inquiries</span>
              <span className="btn-icon">
                <ArrowUpRight size={12} strokeWidth={2.5} />
              </span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
