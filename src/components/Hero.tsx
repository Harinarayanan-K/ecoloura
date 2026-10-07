import React from 'react';
import { ArrowUpRight, Star, Sparkles } from 'lucide-react';

interface HeroProps {
  onExploreCollection: () => void;
  onOpenQuoteBuilder: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onExploreCollection, onOpenQuoteBuilder }) => {
  return (
    <section className="hero-section" id="home" aria-label="Introduction">
      {/* Bexon 11 Angled Decorative Shapes */}
      <div className="hero-shape-polygon-1" aria-hidden="true"></div>
      <div className="hero-shape-polygon-2" aria-hidden="true"></div>
      <div className="hero-shape-blur" aria-hidden="true"></div>
      <div className="hero-shape-floating-line" aria-hidden="true"></div>

      <div className="container">
        <div className="hero-grid">
          {/* Left Hero Text Content */}
          <div className="hero-content">
            <div className="sub-title-badge">
              <span className="badge-icon">
                <Sparkles size={14} />
              </span>
              <span>PRESTIGIOUS LUXURY HOTEL AMENITIES</span>
            </div>

            <h1 className="hero-title">
              Elevating Luxury & <span className="highlight-word">Heritage</span> Hospitality.
            </h1>

            <p className="hero-desc">
              Committed to delivering bespoke, eco-conscious toiletries and refined in-room essentials that define unforgettable guest experiences across five-star resorts and royal heritage palaces.
            </p>

            <div className="hero-actions">
              <button onClick={onExploreCollection} className="tj-primary-btn">
                <span className="btn-text">Explore Collection</span>
                <span className="btn-icon">
                  <ArrowUpRight size={15} strokeWidth={2.5} />
                </span>
              </button>

              <button onClick={onOpenQuoteBuilder} className="tj-outline-btn">
                <span>Configure Amenity Suite</span>
              </button>

              {/* Customer Avatar Proof Stack (Bexon 11) */}
              <div className="hero-customers">
                <div className="customer-avatar-stack">
                  <div className="avatar-item">
                    <img src="/assets/images/client-1.webp" alt="Partner General Manager" width="44" height="44" />
                  </div>
                  <div className="avatar-item">
                    <img src="/assets/images/client-2.webp" alt="Partner Procurement Lead" width="44" height="44" />
                  </div>
                  <div className="avatar-item">
                    <img src="/assets/images/client-3.webp" alt="Partner Hotel Curator" width="44" height="44" />
                  </div>
                  <div className="avatar-plus" aria-label="Over 100 hotels">+</div>
                </div>
                <div className="customers-proof-text">
                  100+ Heritage Hotels
                  <span>Trusted Supply Partner</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Hero Image: Diagonal Masked Frame */}
          <div className="hero-image-wrapper">
            <div className="hero-diagonal-container">
              <img 
                src="/assets/images/hero-luxury.jpg" 
                alt="ecolourà Luxury Presidential Suite Vanity and Bespoke Amenities"
                width="560"
                height="520"
                loading="eager"
              />
            </div>

            {/* Floating Glassmorphism Badge */}
            <div className="hero-float-card">
              <div className="float-card-icon">
                <Star size={20} fill="#1e8a8a" color="#1e8a8a" />
              </div>
              <div className="float-card-text">
                <strong>Five-Star Certified</strong>
                <span>Eco-Friendly & Bespoke Formulation</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
