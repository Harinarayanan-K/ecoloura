export const contactEmail = 'ecolourahotelsuppliers@gmail.com';
export const contactPhone = '+918590365077';
export const catalogueUrl = '/downloads/ecoloura-product-catalogue.pdf';

export function whatsappUrl(message: string) {
  return `https://wa.me/${contactPhone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
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
