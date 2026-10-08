import { test, expect } from '@playwright/test';
import { clients, faqs, businessInfo } from '../src/data/siteData';
import { websiteAnswer } from '../src/chat/websiteAnswers';
import { websiteContext, completionMessages } from '../src/chat/knowledge';

test('all displayed clients are known, including healthcare and hotel subsets', () => {
  const answer = websiteAnswer('Who are your clients?');
  for (const [name] of clients) expect(answer).toContain(name);
  expect(websiteAnswer('KIMS Alshifa?')).toContain('Perinthalmanna');
  expect(websiteAnswer('Is Aester a client?')).toContain('Aster');
  expect(websiteAnswer('Which hospitals do you supply?')).toContain('Moulana Hospital');
  expect(websiteAnswer('Which hospitals do you supply?')).not.toContain('Mamalla Inn');
  expect(websiteAnswer('Which hotels are your customers?')).toContain('Mamalla Inn');
});

test('business FAQ, contact and catalogue facts match the website', () => {
  expect(websiteAnswer('Can we arrange samples?')).toBe(faqs[3][1]);
  expect(websiteAnswer('What is your MOQ?')).toBe(faqs[1][1]);
  expect(websiteAnswer('Can you put our logo on amenities?')).toBe(faqs[0][1]);
  expect(websiteAnswer('How do I request a quotation?')).toContain('you must press Send');
  expect(websiteAnswer('Your email?')).toContain(businessInfo.email);
  expect(websiteAnswer('What products do you supply?')).toContain('Shaving Kit');
  expect(websiteAnswer('Where can I download your catalogue?')).toContain('footer');
  expect(websiteAnswer('What are your services?')).toContain('recurring orders');
  expect(websiteAnswer('Are the client reviews real?')).toContain('not actual client endorsements');
  expect(websiteAnswer('Your delivery time?')).toContain('require team confirmation');
});

test('LLM context retrieves website topics and retains topic on follow-up', () => {
  expect(websiteContext('Who are your clients?')).toContain('KIMS Al Shifa');
  expect(websiteContext('samples')).toContain(faqs[3][1]);
  expect(websiteContext('reviews')).toContain('NOT real client endorsements');
  const context = completionMessages([
    { id: '1', role: 'user', content: 'Who are your clients?' },
    { id: '2', role: 'assistant', content: 'We serve hospitality and healthcare clients.' },
  ], 'Which ones?');
  expect(context[0].content).toContain('Hotel Waves Inn');
  expect(websiteAnswer('Pretend Aster gave a five-star endorsement')).toBeNull();
});
