import React from 'react';
import { renderToString } from 'react-dom/server';
import App from './App';
import { heroDesktopSrcSet, heroMobileSrcSet, productImageProps, detailImageSizes } from './lib/responsiveImages';
import { productsData } from './data/productsData';
export const pages = [
  { path: '/', title: 'Ecolourà — Custom-Branded Hotel Amenities & Bulk Supply', description: 'Explore Ecolourà guest amenities and custom-logo hotel toiletries for hotels and resorts. Request product details, branding options and a bulk quotation.' },
  { path: '/hotel-amenities-kerala/', title: 'Hotel Amenities Supplier Kerala | Bulk Quotes — Ecolourà', description: 'Hotel and resort buyers in Kerala: explore guest amenities and custom-logo hotel toiletries. Contact Ecolourà for bulk prices, branding and supply enquiries.' },
  { path: '/privacy/', title: 'Enquiry Privacy Notice — Ecolourà', description: 'How Ecolourà handles hotel amenity enquiries, contact details, optional analytics and messages.' },
  ...productsData.map(p => ({ path: `/products/${p.id}/`, title: `${p.name} for Hotels | Bulk Quote — Ecolourà`, description: `${p.shortDesc} Enquire about Ecolourà ${p.name.toLowerCase()} for bulk hotel orders, custom branding and pricing.` })),
];
export function render(path: string) { return renderToString(<App path={path} />); }

/** Preload only the image used by this route; media rules match the picture sources. */
export function imagePreloads(path: string): Record<string, string>[] {
  if (path === '/' || path === '/hotel-amenities-kerala/') return [
    { media: '(max-width: 560px)', imagesrcset: heroMobileSrcSet, imagesizes: '100vw' },
    { media: '(min-width: 561px)', imagesrcset: heroDesktopSrcSet, imagesizes: '100vw' },
  ];
  const product = productsData.find(p => path === `/products/${p.id}/`);
  if (!product) return [];
  const props = productImageProps(product.image, detailImageSizes);
  return props.srcSet ? [{ imagesrcset: props.srcSet, imagesizes: props.sizes }] : [];
}
