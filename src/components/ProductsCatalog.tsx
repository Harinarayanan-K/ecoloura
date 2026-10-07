import { WhatsAppIcon } from './WhatsAppIcon';
import React, { useState } from 'react';
import { Package, Search, ArrowUpRight, Check, Download } from 'lucide-react';
import { Product } from '../types';
import { RevealHeading } from './RevealHeading';
import { RevealImage } from './RevealImage';
import { catalogueUrl } from '../lib/contact';

interface ProductsCatalogProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onQuickInquire: (product: Product) => void;
}

export const ProductsCatalog: React.FC<ProductsCatalogProps> = ({
  products,
  onSelectProduct,
  onQuickInquire
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'personal-care' | 'grooming' | 'in-room'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filterTabs = [
    { id: 'all', label: 'All amenities' },
    { id: 'personal-care', label: 'Personal Care' },
    { id: 'grooming', label: 'Grooming Sets' },
    { id: 'in-room', label: 'In-Room Comfort' },
  ];

  const filteredProducts = products.filter((prod) => {
    const matchesCategory = activeFilter === 'all' || prod.category === activeFilter;
    const matchesSearch = prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          prod.shortDesc.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          prod.specPill.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <section className="products-section section-gap" id="products" aria-label="Our Amenities Catalog">
      <div className="container">
        <div className="sec-heading text-center">
          <div className="sub-title-badge">
            <span className="badge-icon">
              <Package size={14} />
            </span>
            <span>THE AMENITY COLLECTION</span>
          </div>
          <RevealHeading className="sec-title">Everyday essentials.<br /><em>Beautifully considered.</em></RevealHeading>
          <p className="sec-desc">
            The little comforts that make a welcome complete. Explore our original product collection, available for bulk supply and custom branding.
          </p>
          <a className="catalogue-download-link" href={catalogueUrl} download="Ecoloura-Product-Catalogue.pdf"><Download size={16} /><span>Download product catalogue</span><span className="catalogue-file-tag">PDF · 9 products</span></a>
        </div>

        <div className="catalog-tools">
          <div className="product-filters" role="group" aria-label="Filter products by category">
            {filterTabs.map(tab => <button key={tab.id} onClick={() => setActiveFilter(tab.id as typeof activeFilter)} className={`filter-btn ${activeFilter === tab.id ? 'active' : ''}`} aria-pressed={activeFilter === tab.id}>{tab.label}</button>)}
          </div>
          <div className="catalog-search"><Search size={15} /><input type="search" aria-label="Search amenities" placeholder="Find your guest essentials…" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} /></div>
        </div>

        {/* Products Grid */}
        <div className="products-grid">
          {filteredProducts.map((prod, index) => (
            <article key={prod.id} className="product-card">
              <div className="product-thumb-wrap">
                <span className="product-category-tag">{prod.categoryLabel}</span>
                <RevealImage
                  revealDelay={(index % 3) * 90}
                  src={prod.image} 
                  alt={prod.name} 
                  loading="lazy" 
                  width="280"
                  height="220"
                />
                <button 
                  className="product-quick-view-btn"
                  onClick={() => onSelectProduct(prod)}
                  title={`Quick inspect ${prod.name}`}
                  aria-label={`Quick inspect ${prod.name}`}
                >
                  <Search size={18} />
                </button>
              </div>

              <div className="product-content">
                <h3 className="product-title">{prod.name}</h3>
                <p className="product-desc">{prod.shortDesc}</p>
                <div className="product-footer">
                  <span className="product-spec-pill">
                    <Check size={12} color="#1e8a8a" />
                    {prod.specPill}
                  </span>
                  <button 
                    onClick={() => onSelectProduct(prod)}
                    className="product-inquire-link"
                  >
                    <span>Quick View</span>
                    <ArrowUpRight size={14} />
                  </button>
                </div>
                <button className="product-whatsapp-link" onClick={() => onQuickInquire(prod)} aria-label={`Enquire about ${prod.name} on WhatsApp`}><WhatsAppIcon size={14} /><span>WhatsApp enquiry</span><ArrowUpRight size={14} /></button>
              </div>
            </article>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--color-text-muted)' }}>
            <p style={{ fontSize: '18px', fontWeight: 600 }}>No amenities match "{searchQuery}"</p>
            <button 
              onClick={() => { setActiveFilter('all'); setSearchQuery(''); }}
              className="tj-outline-btn"
              style={{ marginTop: '14px' }}
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
