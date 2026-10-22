import { productsData } from '../data/productsData';

// Direct answers for simple catalogue questions keep small-model guesses out of
// business facts. Other questions still use the local LLM and conversation context.
export function catalogueAnswer(question: string): string | null {
  const text = question.toLowerCase().replace(/[’']/g, '').trim();
  if (text.length > 240 || /\b(write|poem|story|translate|ignore|pretend|instead|compare|difference|versus|not|dont|without)\b/.test(text)) return null;
  const enquiry = /\b(have|supply|sell|offer|available|availability|stock|about|tell|provide|brand|branding|logo|custom|customize|customise|price|cost|moq|delivery)\b/.test(text);
  let productOnly = false;
  const shortQuestion = text.replace(/[?!.,]/g, "").trim();
  const candidates = productsData.map(product => {
    const aliases = [product.name.toLowerCase(), product.id.replace(/-/g, ' ')];
    if (product.id === 'revitalizing-shower-gel') aliases.push('shower gel');
    if (product.id === 'conditioner-shower-gel-set') aliases.push('hair conditioner', 'conditioner');
    if (product.id === 'wheat-straw-razor') aliases.push('wheat straw razor', 'razor');
    if (product.id === 'shave-gel-sachets') aliases.push('shave gel', 'shaving gel');
    if (product.id === 'comb') aliases.push('comb');
    if (product.id === 'room-slippers') aliases.push('slippers');
    if (product.id === 'notepad-pen') aliases.push('notepad', 'notepad and pen');
    if (aliases.some(alias => shortQuestion === alias || shortQuestion === `${alias}s`)) productOnly = true;
    const matchedAliases = aliases.filter(alias => new RegExp(`\\b${alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}s?\\b`).test(text));
    return { product, matchedAliases };
  });
  // Prefer a specific variant when its full name also includes a generic product name.
  const matches = candidates.filter(candidate => candidate.matchedAliases.some(alias =>
    !candidates.some(other => other !== candidate && other.matchedAliases.some(longer => longer.length > alias.length && longer.includes(alias)))
  )).map(candidate => candidate.product);
  if (!enquiry && !productOnly) return null;
  if (matches.length > 1) return null;
  if (matches.length === 1) {
    const product = matches[0];
    const detail = (productOnly || /\b(about|tell)\b/.test(text)) ? ` ${product.fullDesc}` : '';
    const branding = /\b(brand|branding|logo|custom|customize|customise)\b/.test(text)
      ? ' Custom branding options are available on enquiry; our team can confirm logo placement and packaging for your property.' : '';
    return `Yes, ${product.name} is in our catalogue and offered for institutional bulk orders.${detail}${branding} Please contact our team to confirm current stock, pricing, minimum quantities, and delivery for your order.`;
  }
  if (/\bsoap\b/.test(text)) {
    return 'Soap is shown as part of our Guest Grooming Set. Please contact our team about individual soap supply, set contents, branding, current stock, pricing, minimum quantities, and delivery.';
  }
  if (/\b(shampoo|body wash)\b/.test(text)) {
    return 'That product is not listed in our current website catalogue. Please enquire with our team about supply and custom branding; the catalogue does not confirm whether we can source it. Our listed bathroom amenities include Shower Cap, Vanity Kit, Bath Loofah, and Dental Kit.';
  }
  return null;
}
