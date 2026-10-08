import { businessInfo, clients, faqs, sampleReviews } from '../data/siteData';
import { productsData } from '../data/productsData';

const normalize = (text: string) => text.toLowerCase().replace(/[’']/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
const listClients = (items = clients) => items.map(([name, type]) => `${name} (${type})`).join(', ');

export const websiteSections = [
  { keywords: 'company about ecolora ecoloura business approach services sectors hospital hotel resort guest property recurring bulk', text: `Company: ${businessInfo.name}. ${businessInfo.overview}` },
  { keywords: 'clients customers partners aster aester kims alshifa moulana hotels hospitals healthcare', text: `Selected clients shown on the website: ${listClients()}. This is a selected list, not the complete client base. Client order details, contract dates, and contact people are not published.` },
  { keywords: 'brand branding logo custom private label packaging', text: `Branding: ${faqs[0][1]} Product selection can be tailored to guest needs, with bulk and recurring institutional orders.` },
  { keywords: 'moq minimum quantity quantities bulk order pricing cost quote', text: `Minimum order: ${faqs[1][1]}` },
  { keywords: 'sample samples try test', text: `Samples: ${faqs[3][1]}` },
  { keywords: 'contact email phone whatsapp enquiry inquiry quotation quote order form send', text: `Contact: ${businessInfo.email}; phone/WhatsApp ${businessInfo.phone}. ${businessInfo.enquiry}` },
  { keywords: 'catalogue catalog download pdf collection photos stock delivery address hours material certificate', text: businessInfo.catalogue },
  { keywords: 'review reviews testimonial testimonials endorsement feedback', text: `All website reviews are illustrative mock content, NOT real client endorsements. Sample review text: ${sampleReviews.map(([quote, author]) => `${author}: ${quote}`).join(' ')}` },
  { keywords: 'website navigation page collection approach solutions clients animation privacy ai chatbot', text: 'Navigation: Collection (#products), Our approach (#about), Who we serve (#solutions), Our clients (#clients), Contact (#contact). Products can be filtered by category, opened for details, or enquired about via WhatsApp. Client badges scroll slowly and have a Pause/Resume button. The AI is powered by Groq through a Vercel function. No model download or WebGPU is required. Messages and recent conversation are sent to Groq for inference. The site does not store chat messages in a database or log them. Conversation display stays in browser memory, and New Chat clears it. Free provider usage limits apply.' },
];

// Common business facts bypass small-model invention. Complex questions use
// the same shared website sections as context for local LLM generation.
export function websiteAnswer(question: string): string | null {
  const text = normalize(question);
  if (text.length > 300 || /\b(ignore|pretend|poem|story|translate|compare|versus)\b/.test(text)) return null;
  if (/\b(reviews?|testimonials?|endorsements?|feedback)\b/.test(text)) {
    return 'The reviews shown on our website are illustrative sample copy, not actual client endorsements. They describe hospitality, healthcare procurement, and property operations perspectives. Please contact our team if you need client references.';
  }
  const client = clients.find(([name]) => ` ${text} `.includes(` ${normalize(name)} `) ||
    (name === 'KIMS Al Shifa' && /\b(kims|alshifa|al shifa)\b/.test(text)) ||
    (name === 'Aster' && /\baester\b/.test(text)));
  if (client) return `${client[0]} is listed in our selected website clients (${client[1]}). We serve hospitality and healthcare establishments. Specific orders, contracts, and client contact details are not published; please ask our team for further information.`;
  if (/\b(clients?|customers?|partners?|whom)\b/.test(text) || /\b(which|what) (hotels|hospitals)\b/.test(text)) {
    let selected = clients;
    if (/\b(hospitals?|healthcare)\b/.test(text) && !/\bhotels?\b/.test(text)) selected = clients.filter(([, type]) => type === 'Healthcare' || type === 'Perinthalmanna');
    else if (/\bhotels?\b/.test(text) && !/\b(hospitals?|healthcare)\b/.test(text)) selected = clients.filter(([, type]) => type === 'Hospitality');
    return `Our selected website clients include ${listClients(selected)}. This is a selected list; we also serve other hospitality and guest-care establishments.`;
  }
  if (/\b(samples?)\b/.test(text)) return faqs[3][1];
  if (/\b(moq|minimum|quantities)\b/.test(text)) return faqs[1][1];
  if (/\b(logo|branding|customize|customise|private label|branded|custom)\b/.test(text)) return faqs[0][1];
  if (/\b(quote|quotation|enquiry|inquiry|form|place an order|order process)\b/.test(text)) return `${businessInfo.enquiry} Contact: ${businessInfo.email}; WhatsApp ${businessInfo.phone}.`;
  if (/\b(contact|email|phone|whatsapp|reach|call)\b/.test(text)) return `Email: ${businessInfo.email}. Phone/WhatsApp: ${businessInfo.phone}. You can also use the website enquiry form to prepare an email or WhatsApp message for our team.`;
  if (/\b(catalogue|catalog|pdf|download)\b/.test(text)) return 'Download our product catalogue from the Collection section or the footer’s Product catalogue link. It includes our original product photographs; contact the team for a quotation and current availability.';
  if (/\b(products?|amenities|collection)\b/.test(text) && /\b(what|which|list|all|supply|offer|sell)\b/.test(text)) return `Our website collection includes ${productsData.map(p => p.name).join(', ')}. We supply institutional bulk orders, with custom branding options on enquiry.`;
  if (/\b(who are you|about|company|business|who do you serve|hospitals?|resorts?|hotels?|services)\b/.test(text)) return `${businessInfo.name} is ${businessInfo.overview.charAt(0).toLowerCase()}${businessInfo.overview.slice(1)}`;
  if (/\b(price|cost|delivery|shipping|address|hours|certifications?|materials?)\b/.test(text)) return businessInfo.catalogue;
  if (/\b(privacy|webgpu|ai|chatbot|messages|model)\b/.test(text)) return websiteSections[8].text;
  return null;
}
