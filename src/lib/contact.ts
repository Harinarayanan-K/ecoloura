import { publicAsset } from './publicAsset';
import { businessInfo } from '../data/siteData';
export const contactEmail = businessInfo.email;
export const contactPhone = businessInfo.phone;
export const catalogueUrl = publicAsset('/downloads/ecoloura-product-catalogue.pdf');

/** The configured business number is the default; the Vite override is public build-time config. */
export const whatsappNumber = import.meta.env?.VITE_WHATSAPP_NUMBER ?? businessInfo.phone;
export function normalizeWhatsAppNumber(number: string): string | null {
  if (!/^\+?[\d\s().-]+$/.test(number.trim())) return null;
  const digits = number.replace(/\D/g, '');
  return /^[1-9]\d{7,14}$/.test(digits) ? digits : null;
}
export function whatsappUrl(message: string, number = whatsappNumber): string | null {
  const normalized = normalizeWhatsAppNumber(number);
  return normalized ? `https://wa.me/${normalized}?text=${encodeURIComponent(message)}` : null;
}
export function defaultWhatsAppMessage(product?: string) {
  return `Hello Ecolourà, I am contacting you on behalf of a hotel/resort. I would like information about your custom-branded hotel amenities and bulk pricing.${product ? ` Product of interest: ${product}.` : ''} Please share your catalogue and quotation process.`;
}

export function inquiryMessage(data: FormData) {
  const value = (key: string) => String(data.get(key) || '').trim();
  return [
    'Hello Ecolourà,', '', 'Please share a quotation for our property.', '',
    `Name: ${value('name')}`, `Property / organization: ${value('property')}`,
    `Property type: ${value('type')}`, `Phone: ${value('phone')}`,
    `Email: ${value('email')}`, `Delivery location: ${value('location')}`,
    `Estimated quantity: ${value('quantity')} units per item`,
    `Branding: ${value('branding')}`, '', `Requirements: ${value('requirements')}`, '', 'Thank you.',
  ].join('\n');
}

export function emailInquiryUrl(message: string) {
  return `mailto:${contactEmail}?subject=${encodeURIComponent('Hospitality amenities enquiry')}&body=${encodeURIComponent(message)}`;
}
