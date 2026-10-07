import React, { useState, useEffect } from 'react';
import { Sparkles, BarChart3, CheckCircle2, ArrowUpRight, Play } from 'lucide-react';

interface AboutSectionProps {
  onOpenCatalog: () => void;
  onPlayStory: () => void;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ onOpenCatalog, onPlayStory }) => {
  const [kitsCount, setKitsCount] = useState(0);
  const [satisfaction, setSatisfaction] = useState(0);

  useEffect(() => {
    let currentKits = 0;
    const targetKits = 250;
    const intervalKits = setInterval(() => {
      currentKits += 5;
      if (currentKits >= targetKits) {
        setKitsCount(targetKits);
        clearInterval(intervalKits);
      } else {
        setKitsCount(currentKits);
      }
    }, 25);

    let currentSat = 0;
    const targetSat = 99.8;
    const intervalSat = setInterval(() => {
      currentSat += 2.2;
      if (currentSat >= targetSat) {
        setSatisfaction(targetSat);
        clearInterval(intervalSat);
      } else {
        setSatisfaction(parseFloat(currentSat.toFixed(1)));
      }
    }, 25);

    return () => {
      clearInterval(intervalKits);
      clearInterval(intervalSat);
    };
  }, []);

  return (
    <section className="about-section section-gap" id="about" aria-label="About ecolourà">
      <div className="container">
        <div className="about-grid">
          {/* Left About Image Column */}
          <div className="about-image-column">
            <div className="about-main-image-wrap">
              <img 
                src="/assets/images/about-craft.jpg" 
                alt="ecolourà Hospitality Curator showcasing luxury eco amenities" 
                width="520"
                height="520"
                loading="lazy"
              />
            </div>

            <div className="about-badge-card">
              <div className="customer-stack-wrap">
                <div className="avatar-item">
                  <img src="/assets/images/client-1.webp" alt="Client 1" width="44" height="44" />
                </div>
                <div className="avatar-item">
                  <img src="/assets/images/client-2.webp" alt="Client 2" width="44" height="44" />
                </div>
                <div className="avatar-item">
                  <img src="/assets/images/client-3.webp" alt="Client 3" width="44" height="44" />
                </div>
                <div className="avatar-plus">+</div>
              </div>
              <p>Trusted by 100+ Heritage Hotels & Boutique Retreats</p>
            </div>
          </div>

          {/* Right Content Column */}
          <div className="about-content-column">
            <div className="sub-title-badge">
              <span className="badge-icon">
                <Sparkles size={14} />
              </span>
              <span>ABOUT OUR COMPANY</span>
            </div>

            <h2 className="sec-title" style={{ marginBottom: '24px' }}>
              Driven by Purpose, Fueled by the Pursuit of Timeless Luxury.
            </h2>

            {/* Live Countup Counters (Bexon 11 Style) */}
            <div className="about-counters-row">
              <div className="countup-item">
                <div className="countup-icon">
                  <BarChart3 size={24} />
                </div>
                <div>
                  <div className="countup-number-wrap">
                    <span>{kitsCount}</span>
                    <span className="count-suffix">K+</span>
                  </div>
                  <div className="countup-label">Guest Kits Delivered to Premier Suites</div>
                </div>
              </div>

              <div className="countup-item">
                <div className="countup-icon">
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <div className="countup-number-wrap">
                    <span>{satisfaction.toFixed(1)}</span>
                    <span className="count-suffix">%</span>
                  </div>
                  <div className="countup-label">Punctual Supply & Guest Satisfaction</div>
                </div>
              </div>
            </div>

            <div className="about-text-content">
              <p>
                At <strong>ecolourà</strong>, we specialize in providing premium hotel amenities that blend luxury, comfort, and functionality. With a deep understanding of hospitality standards, we curate products that enhance every guest experience — from elegant toiletries to refined in-room essentials.
              </p>
              <br />
              <p>
                Our mission is to deliver exceptional quality and craftsmanship, ensuring that every detail reflects the sophistication of your brand. Trusted by leading hotels and resorts, we take pride in being a reliable partner dedicated to elevating guest satisfaction through timeless, thoughtfully designed amenities.
              </p>
            </div>

            <div className="about-actions-row">
              <button onClick={onOpenCatalog} className="tj-primary-btn">
                <span className="btn-text">Request Catalog & Pricing</span>
                <span className="btn-icon">
                  <ArrowUpRight size={14} strokeWidth={2.5} />
                </span>
              </button>

              <button onClick={onPlayStory} className="play-story-btn">
                <span className="play-icon-circle">
                  <Play size={14} fill="currentColor" />
                </span>
                <span>Play Brand Story</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
