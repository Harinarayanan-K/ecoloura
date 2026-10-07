import React from 'react';
import { Sparkles, ArrowUpRight } from 'lucide-react';
import { portfolioData } from '../data/productsData';

interface PortfolioProps {
  onSelectCaseStudy: (title: string) => void;
}

export const Portfolio: React.FC<PortfolioProps> = ({ onSelectCaseStudy }) => {
  return (
    <section className="portfolio-section section-gap" id="portfolio" aria-label="Heritage Case Studies">
      <div className="container">
        <div className="sec-heading">
          <div className="sub-title-badge">
            <span className="badge-icon">
              <Sparkles size={14} />
            </span>
            <span>HERITAGE CASE STUDIES</span>
          </div>
          <h2 className="sec-title">Selected Hospitality Partnerships.</h2>
          <p className="sec-desc">
            Witness how ecolourà tailors luxury collections for leading heritage palaces, luxury retreats, and boutique hotels.
          </p>
        </div>

        <div className="portfolio-list">
          {portfolioData.map((item) => (
            <div 
              key={item.number} 
              className="portfolio-row-item"
              onClick={() => onSelectCaseStudy(item.title)}
              style={{ cursor: 'pointer' }}
            >
              <div className="portfolio-row-thumb">
                <img 
                  src={item.image} 
                  alt={item.title} 
                  loading="lazy" 
                  width="140"
                  height="90"
                />
              </div>

              <div className="portfolio-row-number">{item.number}</div>

              <div className="portfolio-row-info">
                <span className="portfolio-row-tag">{item.tag}</span>
                <h3 className="portfolio-row-title">{item.title}</h3>
                <div style={{ display: 'flex', gap: '10px', fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                  <span>{item.client}</span>
                  <span>•</span>
                  <span>{item.location}</span>
                </div>
              </div>

              <div className="portfolio-row-arrow" aria-hidden="true">
                <ArrowUpRight size={20} strokeWidth={2.5} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
