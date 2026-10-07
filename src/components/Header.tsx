import React, { useState, useEffect } from 'react';
import { Phone, ArrowUpRight, Menu, X } from 'lucide-react';

interface HeaderProps {
  onOpenQuoteBuilder: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenQuoteBuilder }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'Why Us', href: '#why-us' },
    { name: 'About', href: '#about' },
    { name: 'Solutions', href: '#solutions' },
    { name: 'Amenities', href: '#products' },
    { name: 'Hotels', href: '#portfolio' },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <>
      <header className={`header-area ${isScrolled ? 'header-scrolled' : ''}`} id="header">
        <div className="header-inner-pill">
          {/* Site Logo */}
          <a href="#home" className="header-brand" aria-label="ecolourà - Home">
            <img 
              src="/assets/images/logo.png" 
              alt="ecolourà Luxury Hotel Amenities Logo" 
              className="brand-logo-img" 
              width="34" 
              height="34" 
            />
            <span className="brand-text">ecolourà</span>
            <span className="brand-tag">Luxury</span>
          </a>

          {/* Navigation Links */}
          <nav className="header-nav" aria-label="Main Navigation">
            <ul className="nav-menu">
              {navLinks.map((link) => (
                <li key={link.name} className="nav-item">
                  <a href={link.href}>{link.name}</a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Right Header Actions */}
          <div className="header-right">
            <a 
              href="tel:+918939540771" 
              className="header-contact-call"
              title="Call our procurement desk"
            >
              <Phone size={17} />
              <span>+91 89395 40771</span>
            </a>

            <button 
              onClick={onOpenQuoteBuilder}
              className="tj-primary-btn"
              aria-label="Request Bespoke Amenity Box"
            >
              <span className="btn-text">Bespoke Quote</span>
              <span className="btn-icon">
                <ArrowUpRight size={15} strokeWidth={2.5} />
              </span>
            </button>

            {/* Mobile Drawer Hamburger */}
            <button 
              className="hamburger-btn" 
              onClick={() => setIsDrawerOpen(true)}
              aria-label="Open Navigation Menu"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Off-Canvas Drawer */}
      <div 
        className={`drawer-overlay ${isDrawerOpen ? 'active' : ''}`}
        onClick={(e) => {
          if (e.target === e.currentTarget) setIsDrawerOpen(false);
        }}
      >
        <div className="drawer-content">
          <div>
            <div className="drawer-header">
              <div className="header-brand">
                <img src="/assets/images/logo.png" alt="ecolourà Logo" className="brand-logo-img" />
                <span className="brand-text">ecolourà</span>
              </div>
              <button 
                className="drawer-close" 
                onClick={() => setIsDrawerOpen(false)}
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>

            <ul className="drawer-menu-list">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <a 
                    href={link.href} 
                    onClick={() => setIsDrawerOpen(false)}
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>

            <button
              onClick={() => {
                setIsDrawerOpen(false);
                onOpenQuoteBuilder();
              }}
              className="tj-primary-btn"
              style={{ width: '100%', justifyContent: 'center', marginTop: '10px' }}
            >
              <span className="btn-text">Build Amenity Box</span>
              <span className="btn-icon">
                <ArrowUpRight size={15} strokeWidth={2.5} />
              </span>
            </button>
          </div>

          <div className="drawer-contact-info">
            <h5 className="drawer-contact-title">Procurement Desk</h5>
            <div className="drawer-contact-item">
              <span>Direct Hotline</span>
              <a href="tel:+918939540771">+91 89395 40771</a>
            </div>
            <div className="drawer-contact-item">
              <span>Email Inquiries</span>
              <a href="mailto:ecolourahotelsuppliers@gmail.com">ecolourahotelsuppliers@gmail.com</a>
            </div>
            <div className="drawer-contact-item">
              <span>Specialization</span>
              <strong>Luxury Heritage & 5-Star Boutique Amenities</strong>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
