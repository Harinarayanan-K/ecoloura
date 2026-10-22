import { B2BEnquiryForm } from './B2BEnquiryForm';
import { WhatsAppLink } from './WhatsAppLink';
export const keralaFaqs = [
  ['Which hotel amenities can I enquire about?', 'Our catalogue includes dental kits, shaving kits, vanity kits, shower caps, sewing kits, guest combs, room slippers, bath loofahs and notepads with pens. Ask us to confirm current availability and packaging options.'],
  ['Can you supply custom-logo hotel toiletries?', 'Custom branding and private-label packaging are offered on enquiry. Share the products you need and your logo or packaging preferences. Our team will confirm suitable options before quoting.'],
  ['What are your bulk prices and minimum order quantities?', 'Prices and minimum quantities depend on the product, packaging and customization. Request a bulk quote with your product selection and estimated quantity; no fixed prices or minimum quantities are published here.'],
  ['Can hotels in Kochi and other Kerala districts enquire?', 'Yes. Hotel and resort buyers in Kochi (Ernakulam) and across Kerala can send their requirements. Please share your city and district so our team can confirm whether supply is available, along with delivery arrangements and costs. No local branch or delivery guarantee is stated.'],
  ['How do I request a quotation?', 'Choose your products and contact Ecolourà on WhatsApp, by telephone or email. You can also use the enquiry form when online submission is enabled. Opening WhatsApp prepares a message; press Send there to contact us.'],
  ['Are samples available before a bulk order?', 'Ask our team about sample availability, any charges and delivery arrangements. Confirm these details before planning your order.'],
];
export function KeralaBuyingGuide() {
  return <>
    <section className="section-shell buying-guide" id="kerala-buying-guide">
      <span className="eyebrow">FOR HOSPITALITY BUYERS IN KERALA</span>
      <h2>Plan your hotel amenity order.</h2>
      <p>Choosing a hotel amenities supplier in Kerala starts with the right product selection and a clear quotation. Ecolourà supplies guest amenities in bulk, with custom branding options to discuss for your property.</p>
      <div className="buying-steps">
        <article><h3>1. Choose your essentials</h3><p>Explore the existing collection above. Tell us which items your hotel or resort needs and your estimated order size, if known.</p></article>
        <article><h3>2. Discuss your branding</h3><p>Ask about customized hotel toiletries and branded packaging. Product specifications, artwork requirements and minimum quantities need confirmation.</p></article>
        <article><h3>3. Confirm supply to your location</h3><p>Include your city and district. Buyers in Kochi and elsewhere in Kerala should confirm availability, delivery costs and timing with our team before ordering.</p></article>
      </div>
      <WhatsAppLink source="kerala_buying_guide" className="premium-button">Discuss a bulk order on WhatsApp ↗</WhatsAppLink>
    </section>
    <section className="section-shell landing-faq"><span className="eyebrow">BEFORE YOU REQUEST A QUOTE</span><h2>Hotel buyer questions</h2>{keralaFaqs.map(([q,a]) => <details key={q}><summary>{q}</summary><p>{a}</p></details>)}</section>
    <section className="section-shell quote-section" id="bulk-quote"><div><span className="eyebrow">YOUR NEXT STEP</span><h2>Request a bulk quotation</h2><p>Tell us about your hotel or resort, products and location. Our team can discuss availability, customization and pricing.</p><WhatsAppLink source="kerala_quote" className="text-button">Prefer WhatsApp? Start a conversation ↗</WhatsAppLink></div><B2BEnquiryForm /></section>
  </>;
}
