import { productsData } from '../data/productsData.js';

export const districts = ['Alappuzha', 'Ernakulam', 'Idukki', 'Kannur', 'Kasaragod', 'Kollam', 'Kottayam', 'Kozhikode', 'Malappuram', 'Palakkad', 'Pathanamthitta', 'Thiruvananthapuram', 'Thrissur', 'Wayanad'];
export interface Enquiry {
  property: string; name: string; email: string; phone: string; city: string; district: string;
  products: string[]; quantity: string; requirements: string; consent: boolean; website: string;
}
export function validateEnquiry(input: unknown): { data?: Enquiry; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  if (!input || typeof input !== 'object' || Array.isArray(input)) return { errors: { form: 'Please enter your enquiry details.' } };
  const raw = input as Record<string, unknown>;
  const field = (key: string, label: string, max: number, required = true) => {
    const value = typeof raw[key] === 'string' ? (raw[key] as string).trim() : '';
    if ((required && !value) || value.length > max || /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(value)) errors[key] = `${label}: ${required ? 'enter a value of' : 'use'} ${max} characters or fewer.`;
    return value;
  };
  const data: Enquiry = {
    property: field('property', 'Hotel or resort name', 150), name: field('name', 'Contact person', 100),
    email: field('email', 'Business email', 254), phone: field('phone', 'Phone', 25),
    city: field('city', 'City', 100), district: field('district', 'District', 30),
    products: Array.isArray(raw.products) ? raw.products.filter((v): v is string => typeof v === 'string') : [],
    quantity: field('quantity', 'Estimated quantity', 100, false), requirements: field('requirements', 'Requirements', 1500, false),
    consent: raw.consent === true, website: typeof raw.website === 'string' ? raw.website : '',
  };
  if (!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(data.email) || /[\r\n]/.test(data.email)) errors.email = 'Enter a valid business email address.';
  if (!/^\+?[\d\s().-]+$/.test(data.phone) || !/^[0-9]{7,15}$/.test(data.phone.replace(/\D/g, ''))) errors.phone = 'Enter a valid phone number including your country code.';
  if (!districts.includes(data.district)) errors.district = 'Choose a district in Kerala.';
  if (!data.products.length || data.products.length > productsData.length || data.products.some(id => !productsData.some(p => p.id === id)) || new Set(data.products).size !== data.products.length) errors.products = 'Select at least one product from the catalogue.';
  if (!data.consent) errors.consent = 'Please agree to be contacted about this enquiry.';
  return Object.keys(errors).length ? { errors } : { data, errors };
}
export function enquiryText(data: Enquiry) {
  return [
    'Hello Ecolourà, I am contacting you on behalf of a hotel/resort. Please share your catalogue and quotation process.', '',
    `Hotel / resort: ${data.property}`, `Contact person: ${data.name}`, `Business email: ${data.email}`, `Phone: ${data.phone}`,
    `Location: ${data.city}, ${data.district}, Kerala`, `Products: ${data.products.map(id => productsData.find(p => p.id === id)?.name).join(', ')}`,
    `Estimated quantity: ${data.quantity || 'To discuss'}`, `Additional requirements: ${data.requirements || 'None specified'}`,
    'Consent: agreed to contact about this enquiry.',
  ].join('\n');
}
