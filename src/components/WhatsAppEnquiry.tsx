import { WhatsAppIcon } from './WhatsAppIcon';
import React, { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, X } from 'lucide-react';
import { productsData } from '../data/productsData';
import { whatsappUrl } from '../lib/contact';

interface WhatsAppEnquiryProps {
  product: string | null;
  onProductChange: (product: string | null) => void;
}

export function WhatsAppEnquiry({ product, onProductChange }: WhatsAppEnquiryProps) {
  const [quantity, setQuantity] = useState('');
  const panel = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const open = product !== null;

  useEffect(() => {
    if (!open) return;
    panel.current?.querySelector<HTMLElement>('select')?.focus();
    const key = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { onProductChange(null); trigger.current?.focus(); }
    };
    document.addEventListener('keydown', key);
    return () => document.removeEventListener('keydown', key);
  }, [open, onProductChange]);

  const close = () => { onProductChange(null); trigger.current?.focus(); };
  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const message = `Hello Ecolourà,\n\nI would like a bulk quotation.\nProduct: ${product || 'Please help me choose amenities'}\nEstimated quantity: ${quantity} units\n\nPlease share available options, branding details, and delivery arrangements. Thank you.`;
    window.open(whatsappUrl(message), '_blank', 'noopener,noreferrer');
  };

  return <aside className="whatsapp-widget" aria-label="WhatsApp enquiries">
    {open && <div className="whatsapp-panel" id="whatsapp-enquiry" ref={panel} role="region" aria-labelledby="whatsapp-title">
      <button className="whatsapp-close" onClick={close} aria-label="Close WhatsApp enquiry"><X size={17} /></button>
      <span className="eyebrow">A QUICK CONVERSATION</span>
      <h2 id="whatsapp-title">How can we help?</h2>
      <p>Choose a product and quantity. We’ll prepare your message for our team.</p>
      <form onSubmit={submit}>
        <label>Product<select aria-label="Product" name="whatsappProduct" value={product || ''} onChange={event => onProductChange(event.target.value)}>
          <option value="">Help me choose amenities</option>
          {productsData.map(item => <option key={item.id} value={item.name}>{item.name}</option>)}
        </select></label>
        <label>Estimated quantity<input name="whatsappQuantity" type="number" min="1" step="1" max="10000000" required value={quantity} onChange={event => setQuantity(event.target.value)} placeholder="e.g. 1,000 units" /></label>
        <button className="premium-button" type="submit">Continue to WhatsApp <ArrowUpRight size={16} /></button>
        <small>Your message opens in WhatsApp, ready for you to send.</small>
      </form>
    </div>}
    <button ref={trigger} className={`whatsapp-trigger ${open ? 'is-open' : ''}`} aria-label={open ? 'Close WhatsApp panel' : 'Open WhatsApp enquiry'} aria-expanded={open} aria-controls="whatsapp-enquiry" onClick={() => open ? close() : onProductChange('')}>
      {open ? <X size={22} /> : <WhatsAppIcon size={26} />}
    </button>
  </aside>;
}
