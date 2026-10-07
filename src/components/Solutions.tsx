import React from 'react';
import { Sparkles, ArrowUpRight } from 'lucide-react';

interface SolutionsProps {
  onSelectSolution: (solution: string) => void;
}

export const Solutions: React.FC<SolutionsProps> = ({ onSelectSolution }) => {
  return (
    <section className="solutions-dark-section section-gap" id="solutions" aria-label="Hospitality Solutions">
      <div className="container">
        <div className="sec-heading text-center">
          <div className="sub-title-badge dark-badge">
            <span className="badge-icon">
              <Sparkles size={14} />
            </span>
            <span>OUR BESPOKE SOLUTIONS</span>
          </div>
          <h2 className="sec-title">Tailored Hospitality Amenities for Every Stature.</h2>
          <p className="sec-desc">
            From historic royal palaces to eco-luxury coastal resorts, our tailored collections ensure consistent grandeur and guest delight.
          </p>
        </div>

        <div className="solutions-grid">
          {/* Solution Card 1 */}
          <div className="solution-card">
            <div className="solution-img-wrap">
              <img 
                src="/assets/images/hero-luxury.jpg" 
                alt="Heritage Palace Suites Collection" 
                loading="lazy"
              />
            </div>
            <div className="solution-body">
              <span className="solution-category">Heritage & Palaces</span>
              <h3 className="solution-title">Royal Heritage Suites</h3>
              <p className="solution-desc">
                Artisanal gold-embossed packaging, organic botanical soaps, and custom monogramming designed for palaces and heritage monuments.
              </p>
              <button 
                onClick={() => onSelectSolution('Heritage Palace Line')}
                className="solution-link"
              >
                <span>View Collection</span>
                <span className="arrow-circle">
                  <ArrowUpRight size={14} strokeWidth={2.5} />
                </span>
              </button>
            </div>
          </div>

          {/* Solution Card 2 */}
          <div className="solution-card">
            <div className="solution-img-wrap">
              <img 
                src="/assets/images/about-craft.jpg" 
                alt="Boutique Eco-Sanctuary Collection" 
                loading="lazy"
              />
            </div>
            <div className="solution-body">
              <span className="solution-category">Eco-Conscious Suites</span>
              <h3 className="solution-title">Boutique Eco-Sanctuary</h3>
              <p className="solution-desc">
                100% biodegradable wheat straw, cornstarch shower caps, and bamboo toothbrushes for sustainability-certified luxury retreats.
              </p>
              <button 
                onClick={() => onSelectSolution('Eco Boutique Line')}
                className="solution-link"
              >
                <span>View Collection</span>
                <span className="arrow-circle">
                  <ArrowUpRight size={14} strokeWidth={2.5} />
                </span>
              </button>
            </div>
          </div>

          {/* Solution Card 3 */}
          <div className="solution-card">
            <div className="solution-img-wrap">
              <img 
                src="/assets/images/hero-luxury.jpg" 
                alt="Executive In-Room Amenities" 
                loading="lazy"
              />
            </div>
            <div className="solution-body">
              <span className="solution-category">In-Room Amenities</span>
              <h3 className="solution-title">Executive Comfort Range</h3>
              <p className="solution-desc">
                Plush velvet slippers, precision parchment notepads, and grooming essentials tailored to elevate business and luxury stays.
              </p>
              <button 
                onClick={() => onSelectSolution('Executive Comfort Line')}
                className="solution-link"
              >
                <span>View Collection</span>
                <span className="arrow-circle">
                  <ArrowUpRight size={14} strokeWidth={2.5} />
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
