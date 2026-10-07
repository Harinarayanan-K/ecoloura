import React from 'react';
import { Sparkles, Star } from 'lucide-react';
import { testimonialsData } from '../data/productsData';

export const Testimonials: React.FC = () => {
  return (
    <section className="testimonials-section section-gap" aria-label="Hotelier Endorsements">
      <div className="container">
        <div className="sec-heading text-center">
          <div className="sub-title-badge">
            <span className="badge-icon">
              <Sparkles size={14} />
            </span>
            <span>HOTELIER ENDORSEMENTS</span>
          </div>
          <h2 className="sec-title">What Premier Hoteliers Say About Us.</h2>
        </div>

        <div className="testimonials-grid">
          {testimonialsData.map((t, index) => (
            <div key={index} className="testimonial-card">
              <div>
                <div className="testimonial-stars" aria-label={`${t.stars} stars`}>
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} size={18} fill="#ffaa00" color="#ffaa00" />
                  ))}
                </div>
                <blockquote className="testimonial-quote">
                  "{t.quote}"
                </blockquote>
              </div>

              <div className="testimonial-author">
                <img 
                  src={t.image} 
                  alt={t.name} 
                  className="author-img" 
                  width="48"
                  height="48"
                  loading="lazy"
                />
                <div>
                  <div className="author-name">{t.name}</div>
                  <div className="author-role">{t.role}, {t.hotel}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
