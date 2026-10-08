import { productsData } from '../data/productsData';

// Direct answers for simple catalogue questions keep small-model guesses out of
// business facts. Other questions still use the local LLM and conversation context.
export function catalogueAnswer(question: string): string | null {
  const text = question.toLowerCase().replace(/[’']/g, '').trim();
  if (text.length > 240 || /\b(write|poem|story|translate|ignore|pretend|instead|compare|difference|versus|not|dont|without)\b/.test(text)) return null;
  const enquiry = /\b(have|supply|sell|offer|available|availability|stock|about|tell|provide|brand|branding|logo|custom|customize|customise|price|cost|moq|delivery)\b/.test(text);
  let productOnly = false;
  const shortQuestion = text.replace(/[?!.,]/g, "").trim();
  const matches = productsData.filter(product => {
    const aliases = [product.name.toLowerCase(), product.id.replace(/-/g, ' ')];
    if (product.id === 'comb') aliases.push('comb');
    if (product.id === 'room-slippers') aliases.push('slippers');
    if (product.id === 'notepad-pen') aliases.push('notepad', 'notepad and pen');
    if (aliases.some(alias => shortQuestion === alias || shortQuestion === `${alias}s`)) productOnly = true;
    return aliases.some(alias => new RegExp(`\\b${alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}s?\\b`).test(text));
  });
  if (!enquiry && !productOnly) return null;
  if (matches.length > 1) return null;
  if (matches.length === 1) {
    const product = matches[0];
    const detail = (productOnly || /\b(about|tell)\b/.test(text)) ? ` ${product.fullDesc}` : '';
    const branding = /\b(brand|branding|logo|custom|customize|customise)\b/.test(text)
      ? ' Custom branding options are available on enquiry; our team can confirm logo placement and packaging for your property.' : '';
    return `Yes, ${product.name} is in our catalogue and offered for institutional bulk orders.${detail}${branding} Please contact our team to confirm current stock, pricing, minimum quantities, and delivery for your order.`;
  }
  if (/\b(shower gel|shampoo|conditioner|body wash|soap)\b/.test(text)) {
    return 'That product is not listed in our current website catalogue. Please enquire with our team about supply and custom branding; the catalogue does not confirm whether we can source it. Our listed bathroom amenities include Shower Cap, Vanity Kit, Bath Loofah, and Dental Kit.';
  }
  return null;
}
