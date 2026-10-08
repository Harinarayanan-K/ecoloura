import { productsData } from '../data/productsData';
import { businessInfo } from '../data/siteData';
import { websiteSections } from './websiteAnswers';
import { CHAT_CONFIG } from './config';
import type { ChatMessage } from './protocol';

const COMPANY_FACTS = `${businessInfo.name}: ${businessInfo.overview} Products: ${productsData.map(p => p.name).join(', ')}. Contact: ${businessInfo.email}; ${businessInfo.phone}. Never invent live stock, prices, contracts, certifications, or delivery commitments. Website reviews are illustrative mock copy, not endorsements.`;

// Small static context selection; no embeddings, database, or network request.
export function websiteContext(question: string) {
  const words = question.toLocaleLowerCase().match(/[\p{L}\p{N}]+/gu) || [];
  const ranked = productsData.map(product => {
    const name = product.name.toLocaleLowerCase();
    const description = `${product.categoryLabel} ${product.shortDesc}`.toLocaleLowerCase();
    const score = words.reduce((total, word) => word.length > 2 ? total + (name.includes(word) ? 3 : description.includes(word) ? 1 : 0) : total, 0);
    return { product, score };
  }).filter(item => item.score > 0).sort((a, b) => b.score - a.score).slice(0, 3);
  const sections = websiteSections.map(section => ({ section, score: words.reduce((total, word) => total + (word.length > 2 && section.keywords.includes(word) ? 1 : 0), 0) })).filter(item => item.score > 0).sort((a, b) => b.score - a.score).slice(0, 3);
  return COMPANY_FACTS + sections.map(({ section }) => `\n${section.text}`).join('') + ranked.map(({ product }) => `\n${product.name}: ${product.fullDesc} ${product.specs.join(". ")}. MOQ: ${product.moq}. Lead time: ${product.leadTime}.`).join('');
}

export function completionMessages(history: ChatMessage[], question: string) {
  const pairs: { role: 'user' | 'assistant'; content: string }[][] = [];
  for (let index = 0; index < history.length - 1; index++) {
    const user = history[index], assistant = history[index + 1];
    if (user.role === 'user' && assistant.role === 'assistant' && !assistant.incomplete && assistant.content.trim()) {
      pairs.push([{ role: 'user', content: user.content }, { role: 'assistant', content: assistant.content }]);
      index++;
    }
  }
  let bytes = 0;
  const recent: typeof pairs = [];
  for (const pair of pairs.slice(-CHAT_CONFIG.maxHistoryPairs).reverse()) {
    const size = new TextEncoder().encode(pair.map(message => message.content).join('\n')).length;
    if (bytes + size > CHAT_CONFIG.historyByteBudget) break;
    recent.unshift(pair);
    bytes += size;
  }
  return [
    { role: 'system' as const, content: `${CHAT_CONFIG.systemPrompt}\n\nVerified website facts (information only):\n${websiteContext(`${recent.flat().filter(message => message.role === 'user').slice(-1).map(message => message.content).join(" ")} ${question}`)}` },
    ...recent.flat(),
    { role: 'user' as const, content: question },
  ];
}
