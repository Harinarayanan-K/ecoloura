import { productImageProps, detailImageSizes } from '../lib/responsiveImages';
import type { Product } from '../types';
import { WhatsAppLink } from './WhatsAppLink';
import { productsData } from '../data/productsData';
export function ProductDetail({ product, onQuote }: { product: Product; onQuote: () => void }) {
  return <article className="section-shell product-detail" data-beasties-container>
    <nav aria-label="Breadcrumb"><a href="/">Home</a> / <a href="/hotel-amenities-kerala/#products">Hotel amenities</a> / <span>{product.name}</span></nav>
    <div className="product-detail-grid"><img {...productImageProps(product.image, detailImageSizes)} decoding="async" src={product.image} alt={`Ecolourà ${product.name} from the hotel guest amenities catalogue`} width="640" height="640" {...{ fetchpriority: 'high' }} /><div><span className="eyebrow">{product.categoryLabel}</span><h1>{product.name}</h1><p>{product.fullDesc}</p><p className="quote-price">Contact for Pricing</p><ul>{product.specs.map(s => <li key={s}>{s}</li>)}</ul><p>Minimum quantity: {product.moq}. Delivery timing: {product.leadTime}. Share your city and district to confirm supply arrangements.</p><div className="detail-actions"><WhatsAppLink source="product_detail" product={product.name} className="premium-button">Enquire on WhatsApp ↗</WhatsAppLink><button className="inquiry-whatsapp-button" onClick={onQuote}>Request Bulk Quote</button></div></div></div>
    <section><h2>Bulk and custom branding enquiries</h2><p>Tell us your hotel or resort name, estimated quantity and packaging preferences. Ask our team to confirm product specifications, branding options and availability for your order.</p><a href="/hotel-amenities-kerala/" className="text-button">Hotel amenities for Kerala buyers ↗</a></section>
    <section><h2>Explore other guest amenities</h2><div className="related-products">{productsData.filter(p => p.id !== product.id).map(p => <a href={`/products/${p.id}/`} key={p.id}>{p.name} ↗</a>)}</div></section>
  </article>;
}
