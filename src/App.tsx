import { WhatsAppIcon } from './components/WhatsAppIcon';
import React, { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, ArrowRight, Menu, X, PackageCheck, Palette, Truck, Building2, HeartPulse, Hotel, Check, Plus, Minus, Mail, Phone, Quote, Pause, Play, Download } from 'lucide-react';
import { ProductsCatalog } from './components/ProductsCatalog';
import { ProductModal } from './components/ProductModal';
import { RevealHeading } from './components/RevealHeading';
import { RevealImage } from './components/RevealImage';
import { productsData } from './data/productsData';
import { Product } from './types';
import { WhatsAppEnquiry } from './components/WhatsAppEnquiry';
import { contactEmail, contactPhone, catalogueUrl, inquiryMessage, emailInquiryUrl, whatsappUrl } from './lib/contact';

const email = contactEmail;
const phone = contactPhone;
const clients = [
  ['Aster', 'Healthcare'], ['KIMS Al Shifa', 'Perinthalmanna'], ['Moulana Hospital', 'Healthcare'],
  ['Hotel Waves Inn', 'Hospitality'], ['Grand Residency', 'Hospitality'], ['Mamalla Inn', 'Hospitality'],
  ['Malabar Inn Hotel & Spa', 'Hospitality'], ['MPS Royal Suites', 'Hospitality'], ['Mahbliss Pines', 'Hospitality'],
  ['Asian Mother & Child', 'Healthcare'], ['Grand View Inn', 'Hospitality'], ["Erica’s Property Management", 'Property management'],
];
function ClientBadgeRow({ items, reverse = false, paused = false, compact = false }: { items: string[][]; reverse?: boolean; paused?: boolean; compact?: boolean }) {
  return <div className={`client-marquee ${compact ? 'client-marquee-compact' : ''}`}>
    <div className={`client-marquee-track ${reverse ? 'client-marquee-reverse' : ''} ${paused ? 'is-paused' : ''}`}>
      {[0, 1].map(copy => <ul className="client-badge-group" key={copy} aria-hidden={copy === 1 ? true : undefined}>
        {items.map(([name, type]) => <li className="client-badge" key={name}>
          <span className="client-badge-mark" aria-hidden="true">{name === 'KIMS Al Shifa' ? 'K' : name.charAt(0)}</span>
          <strong>{name}</strong><span className="client-badge-type">{type}</span>
        </li>)}
      </ul>)}
    </div>
  </div>;
}

const faqs = [
  ['Can you add our brand to the amenities?', 'Yes. We supply customized and private-label amenities for hotels, resorts, hospitals, and other institutions. Share your logo and packaging preferences, and we’ll discuss suitable options for your order.'],
  ['What is the minimum order quantity?', 'Minimum quantities vary by product, packaging, and customization. Tell us which items you need and your expected volume so we can provide an accurate quotation.'],
  ['Do you supply hospitals as well as hotels?', 'Yes. Our clients include hospitality properties and healthcare establishments. We can help put together a practical selection of personal-care and guest-use essentials for your requirements.'],
  ['Can we arrange samples before a bulk order?', 'Contact our team to discuss available samples, any associated costs, and delivery arrangements before confirming a recurring or customized order.'],
];

function Inquiry({ onClose, initialProduct }: { onClose: () => void; initialProduct?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement;
    const old = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    ref.current?.querySelector<HTMLElement>('button')?.focus();
    const key = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'Tab') {
        const items = ref.current?.querySelectorAll<HTMLElement>('button, input, select, textarea, a[href]');
        if (!items?.length) return;
        const first = items[0], last = items[items.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', key);
    return () => { document.body.style.overflow = old; document.removeEventListener('keydown', key); previous?.focus(); };
  }, [onClose]);
  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const body = inquiryMessage(data);
    const channel = (e.nativeEvent as SubmitEvent).submitter?.getAttribute('value');
    if (channel === 'whatsapp') window.open(whatsappUrl(body), '_blank', 'noopener,noreferrer');
    else window.location.href = emailInquiryUrl(body);
  };
  return <div className="inquiry-backdrop" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
    <div className="inquiry-panel" ref={ref} role="dialog" aria-modal="true" aria-labelledby="inquiry-title">
      <button className="inquiry-close" onClick={onClose} aria-label="Close enquiry"><X size={22} /></button>
      <span className="eyebrow">LET’S WORK TOGETHER</span><h2 id="inquiry-title">A considered start.<br /><em>A lasting partnership.</em></h2>
      <p>Tell us a little about your property and the amenities you have in mind.</p>
      <form onSubmit={submit}>
        <label>Your name<input name="name" required maxLength={100} autoComplete="name" placeholder="Full name" /></label>
        <label>Property / organization<input name="property" required maxLength={150} autoComplete="organization" placeholder="Your hotel, hospital, or company" /></label>
        <div className="form-pair"><label>Property type<select name="type"><option>Hotel / business hotel</option><option>Resort</option><option>Hospital</option><option>Guest house</option><option>Property management</option><option>Other establishment</option></select></label><label>Work email<input name="email" type="email" required autoComplete="email" placeholder="you@company.com" /></label></div>
        <div className="form-pair"><label>Phone number<input name="phone" type="tel" required minLength={7} maxLength={25} autoComplete="tel" placeholder="Include your country code" /></label><label>Delivery location<input name="location" required maxLength={200} autoComplete="address-level2" placeholder="City, state, and country" /></label></div>
        <div className="form-pair"><label>Estimated quantity per item<input name="quantity" type="number" min="1" step="1" max="10000000" required placeholder="e.g. 1,000 units" /></label><label>Branding requirements<select name="branding"><option>Standard packaging</option><option>Custom logo / private label</option><option>Please help me decide</option></select></label></div>
        <label>Your requirements<textarea name="requirements" required maxLength={1500} rows={4} defaultValue={initialProduct ? `I would like samples and a bulk quotation for ${initialProduct}.` : ''} placeholder="Products, quantities for individual items, and any other details…" /></label>
        <div className="inquiry-submit-options"><button className="premium-button" name="channel" value="email" type="submit"><Mail size={16} /> Enquire by email <ArrowUpRight size={16} /></button><button className="inquiry-whatsapp-button" name="channel" value="whatsapp" type="submit"><WhatsAppIcon size={16} /> Send via WhatsApp <ArrowUpRight size={16} /></button></div>
        <small>We’ll open your email app or WhatsApp with all your details ready for you to send. Prefer a conversation? <a href={`tel:${phone}`}>Call our team.</a></small>
      </form>
    </div>
  </div>;
}

export default function App() {
  const [menu, setMenu] = useState(false);
  const [clientsPaused, setClientsPaused] = useState(false);
  const [whatsappProduct, setWhatsappProduct] = useState<string | null>(null);
  const [selected, setSelected] = useState<Product | null>(null);
  const [inquiry, setInquiry] = useState<string | null>(null);
  const [faq, setFaq] = useState<number | null>(0);
  const closeInquiry = React.useCallback(() => setInquiry(null), []);
  useEffect(() => {
    const copy = document.querySelectorAll<HTMLElement>(
      '.welcome-eyebrow, .welcome-hero-content > p, .welcome-hero-actions, ' +
      'main .section-shell .eyebrow, .approach-description > p, .bespoke-copy > p, ' +
      '.clients-section > p, .faq-premium > div > p, .products-section .sec-desc, ' +
      '.products-section .sub-title-badge, .contact-banner > .eyebrow, .contact-banner > .premium-button'
    );
    copy.forEach(el => {
      el.classList.add('text-reveal-copy');
      el.style.setProperty('--copy-delay', el.matches('.welcome-eyebrow') ? '0ms' :
        el.matches('.welcome-hero-actions') ? '750ms' :
        el.matches('.welcome-hero-content > p') ? '600ms' : '180ms');
    });
    const targets = document.querySelectorAll('.reveal, .text-reveal-group, .text-reveal-copy');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
    }), { threshold: 0.15, rootMargin: '0px 0px -30px 0px' });
    const showAll = () => {
      if (reducedMotion.matches) {
        targets.forEach(el => el.classList.add('is-visible'));
        observer.disconnect();
      }
    };
    if (reducedMotion.matches) showAll();
    else targets.forEach(el => observer.observe(el));
    reducedMotion.addEventListener('change', showAll);
    return () => { observer.disconnect(); reducedMotion.removeEventListener('change', showAll); };
  }, []);
  useEffect(() => {
    if (!selected) return;
    const previous = document.activeElement as HTMLElement;
    const old = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const dialog = document.querySelector<HTMLElement>('.modal-box');
    dialog?.querySelector<HTMLElement>('button')?.focus();
    const key = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelected(null);
      if (event.key === 'Tab') {
        const buttons = dialog?.querySelectorAll<HTMLElement>('button');
        if (!buttons?.length) return;
        const first = buttons[0], last = buttons[buttons.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', key);
    return () => { document.body.style.overflow = old; document.removeEventListener('keydown', key); previous?.focus(); };
  }, [selected]);
  const links = [['Collection', '#products'], ['Our approach', '#about'], ['Who we serve', '#solutions'], ['Our clients', '#clients']];
  return <div className="premium-site">
    <a className="skip-link" href="#main-content">Skip to content</a>
    <div className="announcement">THOUGHTFUL AMENITIES. EXCEPTIONAL CARE.<span>For hospitality & healthcare <ArrowUpRight size={12} /></span></div>
    <header className="premium-header">
      <a className="wordmark" href="#home" aria-label="Ecolourà home">ecolourà<span>HOSPITALITY AMENITIES</span></a>
      <nav aria-label="Main navigation">{links.map(([label, href]) => <a key={href} href={href}>{label}</a>)}</nav>
      <button className="header-quote" onClick={() => setInquiry('')}>Let’s talk <ArrowUpRight size={17} /></button>
      <button className="mobile-toggle" onClick={() => setMenu(!menu)} aria-label={menu ? 'Close navigation' : 'Open navigation'} aria-expanded={menu} aria-controls="mobile-navigation">{menu ? <X /> : <Menu />}</button>
      {menu && <nav id="mobile-navigation" className="mobile-navigation" aria-label="Mobile navigation">{links.map(([label, href]) => <a key={href} href={href} onClick={() => setMenu(false)}>{label}</a>)}<button onClick={() => { setMenu(false); setInquiry(''); }}>Request a quote <ArrowUpRight size={18} /></button></nav>}
    </header>
    <main id="main-content">
      <section className="welcome-hero" id="home" aria-label="Hospitality amenities, thoughtfully supplied">
        <RevealImage variant="hero" className="welcome-hero-image" src="/assets/images/hero-hospitality-v2.webp" alt="Morning light falling across a stone guest-room vanity with fresh linen and tropical greenery" fetchPriority="high" />
        <div className="welcome-hero-shade" aria-hidden="true" />
        <div className="welcome-hero-content">
          <span className="welcome-eyebrow"><span /> HOSPITALITY, IN EVERY DETAIL</span>
          <RevealHeading as="h1">A better stay<br />starts with<br /><em>the little things.</em></RevealHeading>
          <p>Guest essentials that reflect your care.<br />Thoughtfully supplied. Beautifully branded.</p>
          <div className="welcome-hero-actions">
            <a className="welcome-primary" href="#products">Explore our amenities <ArrowUpRight size={19} /></a>
            <button className="welcome-secondary" onClick={() => setInquiry('Custom-branded amenities')}>Make it your own <ArrowRight size={17} /></button>
          </div>
        </div>
        <div className="welcome-hero-bottom">
          <div className="welcome-audience">FOR THE PLACES THAT CARE<span>Hotels & resorts <i /> Hospitals <i /> Guest stays</span></div>
          <a className="welcome-scroll" href="#about"><span>Discover Ecolourà</span><ArrowRight size={16} /></a>
          <div className="welcome-services"><span>Bulk supply</span><span>Private label</span><span>Personal service</span></div>
        </div>
      </section>
      <section className="trust-strip trust-strip-moving" aria-label="Selected clients"><span>IN GOOD<br /><strong>COMPANY.</strong></span><ClientBadgeRow items={clients.slice(0, 6)} paused={clientsPaused} compact /></section>
      <section className="approach-section section-shell reveal" id="about">
        <div><span className="eyebrow">01 / THE ECOLOURÀ APPROACH</span><RevealHeading>Hospitality is personal.<br /><em>Your amenities should be, too.</em></RevealHeading></div>
        <div className="approach-description"><p>From the first freshen-up to the comforts of a guest room, the smallest essentials say something about you. We help make that something special.</p><p>Ecolourà supplies guest-use products to hotels, resorts, hospitals, and care establishments, with custom branding and bulk supply built around your needs.</p><a className="text-button" href="#solutions">A partnership tailored to you <ArrowUpRight size={17} /></a></div>
        <div className="benefits">{[[Palette, 'Distinctly your brand', 'Private-label packaging that brings your property’s identity to every guest touchpoint.'], [PackageCheck, 'Everyday essentials, elevated', 'A practical, coordinated collection for personal care, grooming, and in-room comfort.'], [Truck, 'Built for your operations', 'Bulk ordering and repeat supply planned around the way your property works.']].map(([Icon, title, description], i) => { const Symbol = Icon as typeof Palette; return <article key={i}><Symbol size={25} strokeWidth={1.2} /><span className="benefit-number">0{i + 1}</span><h3>{title as string}</h3><p>{description as string}</p></article>; })}</div>
      </section>
      <ProductsCatalog products={productsData} onSelectProduct={setSelected} onQuickInquire={p => setWhatsappProduct(p.name)} />
      <section className="bespoke-section section-shell reveal">
        <div className="bespoke-visual"><RevealImage variant="lifestyle" src="/assets/images/products/vanity-kit.png" alt="Ecolourà original vanity kit and individually packaged guest amenities" loading="lazy" /><span className="bespoke-stamp">YOUR<br />BRAND<br /><span>beautifully considered</span></span><div className="visual-caption"><span>THE PRIVATE-LABEL COLLECTION</span><span>Made for you ↗</span></div></div>
        <div className="bespoke-copy"><span className="eyebrow">YOUR SIGNATURE, IN EVERY DETAIL</span><RevealHeading>Our essentials.<br /><em>Your identity.</em></RevealHeading><p>A welcome that feels like you. Create a cohesive amenity collection with your property’s branding, thoughtfully coordinated from packaging to presentation.</p><ul><li><Check size={16} /> Custom logo & branded packaging</li><li><Check size={16} /> Product selections for your guest needs</li><li><Check size={16} /> Bulk & recurring institutional orders</li></ul><button className="premium-button" onClick={() => setInquiry('Custom-branded amenities')}>Let’s create your collection <ArrowUpRight size={18} /></button></div>
      </section>
      <section className="sectors-section section-shell reveal" id="solutions"><div className="section-topline"><div><span className="eyebrow">02 / WHO WE SERVE</span><RevealHeading>Different spaces.<br /><em>The same thoughtful care.</em></RevealHeading></div><p>For every establishment where<br />comfort and care come first.</p></div><div className="sector-grid">{[[Hotel, 'Hotels & resorts', 'From boutique stays to business hotels, guest essentials that complement your experience.', '01'], [HeartPulse, 'Hospitals & healthcare', 'Personal-care essentials for patient comfort and the people who care for them.', '02'], [Building2, 'Guest houses & properties', 'A considered collection for guest houses, serviced stays, and property-management teams.', '03']].map(([Icon, title, desc, number]) => { const Symbol = Icon as typeof Hotel; return <button key={number as string} className="sector-card" onClick={() => setInquiry(title as string)}><div><Symbol size={30} strokeWidth={1} /><span>{number as string}</span></div><h3>{title as string}</h3><p>{desc as string}</p><span className="sector-link">Explore a partnership <ArrowUpRight size={19} /></span></button>; })}</div></section>
      <section className="clients-section section-shell reveal" id="clients"><span className="eyebrow">03 / RELATIONSHIPS THAT MATTER</span><RevealHeading>Chosen by people<br /><em>who care for people.</em></RevealHeading><p>Serving hospitality and healthcare establishments with the essentials their guests and patients need.</p><div className="client-badge-showcase" id="client-badge-showcase">
        <div className="client-motion-toolbar"><span>HOSPITALITY & HEALTHCARE PARTNERS</span><button onClick={() => setClientsPaused(!clientsPaused)} aria-pressed={clientsPaused} aria-label={clientsPaused ? 'Resume client badges' : 'Pause client badges'} aria-controls="client-badge-showcase">{clientsPaused ? <Play size={12} /> : <Pause size={12} />}<span>{clientsPaused ? 'Resume' : 'Pause'}</span></button></div>
        <ClientBadgeRow items={clients.slice(0, 6)} paused={clientsPaused} />
        <ClientBadgeRow items={clients.slice(6)} reverse paused={clientsPaused} />
      </div>
      <div className="reviews-heading"><span className="eyebrow">A PARTNER’S PERSPECTIVE</span><span className="demo-label">Sample reviews · Illustrative copy</span></div><div className="review-grid">{[
        ['“A coordinated amenity selection makes our rooms feel more considered. Having our own branding on the essentials is a lovely finishing touch.”', 'Hotel purchasing team', 'Sample hospitality review'],
        ['“We value a supplier who understands everyday patient-care needs and helps us plan our essential products around regular requirements.”', 'Healthcare procurement team', 'Sample healthcare review'],
        ['“From choosing the right guest kits to planning repeat orders, a personal and practical approach makes the process much easier.”', 'Property operations team', 'Sample property review'],
      ].map(([quote, author, role]) => <article className="review-card" key={author}><Quote size={24} strokeWidth={1} /><blockquote>{quote}</blockquote><div><strong>{author}</strong><span>{role}</span></div></article>)}</div><p className="review-disclosure">These sample reviews are mock content for the design preview, not actual client endorsements.</p></section>
      <section className="faq-premium section-shell reveal"><div><span className="eyebrow">A FEW HELPFUL DETAILS</span><RevealHeading>Good questions.<br /><em>Thoughtful answers.</em></RevealHeading><p>Have something else in mind?<br /><a href={`mailto:${email}`} className="text-button">Ask our team <ArrowUpRight size={16} /></a></p></div><div className="faq-list">{faqs.map(([question, answer], i) => <article key={question} className={faq === i ? 'faq-open' : ''}><button onClick={() => setFaq(faq === i ? null : i)} aria-expanded={faq === i} aria-controls={`faq-answer-${i}`}>{question}{faq === i ? <Minus size={18} /> : <Plus size={18} />}</button><div id={`faq-answer-${i}`} hidden={faq !== i}><p>{answer}</p></div></article>)}</div></section>
      <section className="contact-banner" id="contact"><span className="eyebrow">THE NEXT GREAT WELCOME STARTS HERE</span><RevealHeading>Let’s make your guests<br /><em>feel at home.</em></RevealHeading><button className="premium-button light-button" onClick={() => setInquiry('')}>Start a conversation <ArrowUpRight size={20} /></button><span className="contact-decoration" aria-hidden="true">e.</span></section>
    </main>
    <footer className="premium-footer"><div className="footer-main"><div><a className="wordmark" href="#home">ecolourà<span>HOSPITALITY AMENITIES</span></a><p>Small details. Lasting impressions.<br />Guest essentials for hospitality & healthcare.</p></div><div><span className="footer-label">EXPLORE</span>{links.map(([label, href]) => <a key={href} href={href}>{label}</a>)}<a href={catalogueUrl} download="Ecoloura-Product-Catalogue.pdf"><Download size={14} /> Product catalogue</a></div><div><span className="footer-label">LET’S CONNECT</span><a href={`tel:${phone}`}><Phone size={15} /> +91 85903 65077</a><a href={`mailto:${email}`}><Mail size={15} /> {email}</a><span>Bulk supply & private-label enquiries</span></div></div><div className="footer-end"><span>© {new Date().getFullYear()} Ecolourà. All rights reserved.</span><span>THOUGHTFUL BY NATURE. PERSONAL BY DESIGN.</span><a href="#home">Back to top ↑</a></div></footer>
    <ProductModal product={selected} onClose={() => setSelected(null)} onRequestSample={p => { setSelected(null); setInquiry(p.name); }} />
    <WhatsAppEnquiry product={whatsappProduct} onProductChange={setWhatsappProduct} />
    {inquiry !== null && <Inquiry initialProduct={inquiry} onClose={closeInquiry} />}
  </div>;
}
