import React from 'react';
import { renderToString } from 'react-dom/server';
import App from './App';
import { productsData } from './data/productsData';
export const pages = [
  { path: '/', title: 'Ecolourà — Custom-Branded Hotel Amenities & Bulk Supply', description: 'Explore Ecolourà guest amenities and custom-logo hotel toiletries for hotels and resorts. Request product details, branding options and a bulk quotation.' },
  { path: '/hotel-amenities-kerala/', title: 'Hotel Amenities Supplier Kerala | Bulk Quotes — Ecolourà', description: 'Hotel and resort buyers in Kerala: explore guest amenities and custom-logo hotel toiletries. Contact Ecolourà for bulk prices, branding and supply enquiries.' },
  { path: '/privacy/', title: 'Enquiry Privacy Notice — Ecolourà', description: 'How Ecolourà handles hotel amenity enquiries, contact details, optional analytics and messages.' },
  ...productsData.map(p => ({ path: `/products/${p.id}/`, title: `${p.name} for Hotels | Bulk Quote — Ecolourà`, description: `${p.shortDesc} Enquire about Ecolourà ${p.name.toLowerCase()} for bulk hotel orders, custom branding and pricing.` })),
];
export function render(path: string) { return renderToString(<App path={path} />); }
