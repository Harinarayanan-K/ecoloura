import { test, expect } from '@playwright/test';
import { createEnquiryHandler, createNodeEnquiryHandler } from '../api/enquiry';
import { validateEnquiry } from '../src/leads/validation';
import { defaultWhatsAppMessage, normalizeWhatsAppNumber, whatsappUrl } from '../src/lib/contact';
const valid = { property: 'Test Hotel', name: 'Test Buyer', email: 'buyer@example.com', phone: '+919876543210', city: 'Kochi', district: 'Ernakulam', products: ['dental-kit'], quantity: '', requirements: '', consent: true, website: '', requestId: 'cc133566-1234-4aa4-8bb5-123456789012' };
const request = (body: unknown = valid, extra: Record<string, string> = {}) => new Request('https://ecoloura.example/api/enquiry', { method: 'POST', headers: { origin: 'https://ecoloura.example', 'content-type': 'application/json', ...extra }, body: JSON.stringify(body) });
const config = { apiKey: 'TEST_ONLY_NOT_A_REAL_KEY', from: 'sender@example.com', to: 'inbox@example.com' };

test('WhatsApp validates international number and round-trips Unicode/product message', () => {
  expect(normalizeWhatsAppNumber('+91 89395 40771')).toBe('918939540771');
  for (const n of ['', '08939540771', '+1', 'https://evil.test/123456789', '+91abc8939540771']) expect(whatsappUrl('Hello', n)).toBeNull();
  const message = defaultWhatsAppMessage('Notepad & Pen — hôtel');
  const url = new URL(whatsappUrl(message, '+918939540771')!);
  expect(url.hostname).toBe('wa.me'); expect(url.pathname).toBe('/918939540771');
  expect(url.searchParams.get('text')).toBe(message); expect(url.hash).toBe('');
});

test('required fields, catalogue selection, lengths and consent are validated', () => {
  expect(validateEnquiry(valid).data).toBeDefined();
  const result = validateEnquiry({ ...valid, property: '', email: 'a@b\r\nBcc:x@y.com', phone: 'abc', district: 'Unknown', products: ['invented-product'], consent: false, requirements: 'x'.repeat(1501) });
  expect(Object.keys(result.errors)).toEqual(expect.arrayContaining(['property', 'email', 'phone', 'district', 'products', 'consent', 'requirements']));
  expect(result.data).toBeUndefined();
});

test('server never accepts unconfigured delivery, cross-site requests, spam or malformed bodies', async () => {
  expect((await createEnquiryHandler()(request())).status).toBe(503);
  let calls = 0;
  const handle = createEnquiryHandler({ ...config, fetchImpl: async () => { calls++; throw Error(); } });
  expect((await handle(new Request('https://ecoloura.example/api/enquiry'))).status).toBe(405);
  expect((await handle(request(valid, { origin: 'https://evil.example' }))).status).toBe(403);
  expect((await handle(request(valid, { 'content-type': 'text/plain' }))).status).toBe(415);
  expect((await handle(request({ ...valid, consent: false }))).status).toBe(400);
  expect((await handle(request({ ...valid, website: 'spam' }))).status).toBe(400);
  expect((await handle(request({ ...valid, requestId: 'invalid' }))).status).toBe(400);
  expect((await handle(request({ ...valid, extra: 'x'.repeat(13000) }))).status).toBe(413);
  expect(calls).toBe(0);
});

test('delivery uses fixed recipient, plain text, reply-to and stable idempotency; accepted response has no PII', async () => {
  const payloads: any[] = [];
  const handle = createEnquiryHandler({ ...config, fetchImpl: async (url, init) => {
    expect(url).toBe('https://api.resend.com/emails');
    expect((init?.headers as any)['Idempotency-Key']).toBe(`enquiry/${valid.requestId}`);
    payloads.push(JSON.parse(String(init?.body))); return Response.json({ id: 'provider-test-id' });
  } });
  for (let i = 0; i < 2; i++) {
    const response = await handle(request({ ...valid, requirements: '<script>alert(1)</script>', to: 'attacker@example.com' }));
    expect(response.status).toBe(200); expect(response.headers.get('cache-control')).toBe('no-store');
    expect(await response.json()).toEqual({ submissionId: valid.requestId });
  }
  expect(payloads[0].to).toEqual(['inbox@example.com']); expect(payloads[0].reply_to).toBe(valid.email);
  expect(payloads[0].text).toContain('<script>'); expect(payloads[0].html).toBeUndefined();
  expect(payloads[0]).toEqual(payloads[1]);
});

test('upstream failures, ambiguous responses, and abuse never produce success', async () => {
  for (const fetchImpl of [async () => new Response('private-provider-details', { status: 401 }), async () => Response.json({}), async () => { throw Error('private-key'); }]) {
    const response = await createEnquiryHandler({ ...config, fetchImpl })(request());
    expect(response.status).toBe(502); const body = await response.text();
    expect(body).not.toContain('private'); expect(body).not.toContain('submissionId');
  }
  const handle = createEnquiryHandler();
  for (let i = 0; i < 5; i++) expect((await handle(request())).status).toBe(503);
  expect((await handle(request())).status).toBe(429);
});

test('Vercel Node adapter accepts parsed body and bounds payload', async () => {
  const handle = createNodeEnquiryHandler({ ...config, fetchImpl: async () => Response.json({ id: 'test-id' }) });
  const req = { method: 'POST', url: '/api/enquiry', headers: { host: 'ecoloura.example', origin: 'https://ecoloura.example', 'content-type': 'application/json' }, body: valid, async *[Symbol.asyncIterator]() {} };
  let result = ''; const res = { statusCode: 0, setHeader: () => {}, end: (s?: string) => { result = s || ''; } };
  await handle(req, res); expect(res.statusCode).toBe(200); expect(JSON.parse(result).submissionId).toBe(valid.requestId);
  await handle({ ...req, body: { ...valid, requirements: 'x'.repeat(13000) } }, res); expect(res.statusCode).toBe(413);
});

test('tracking separates clicks and submissions, requires consent, and deduplicates acknowledged leads', async () => {
  const { createEventTracker } = await import('../src/lib/analytics');
  let allowed = false, now = 1;
  const events: { event: string; params: Record<string, string> }[] = [];
  const track = createEventTracker({ isAllowed: () => allowed, now: () => now, page: () => ({ path: '/hotel-amenities-kerala/', origin: 'https://ecoloura.example' }), send: (event, params) => events.push({ event, params }) });
  track('whatsapp_click', 'hero'); expect(events).toHaveLength(0);
  allowed = true; track('whatsapp_click', 'hero', 'Dental Kit'); track('whatsapp_click', 'hero', 'Dental Kit');
  expect(events.map(e => e.event)).toEqual(['whatsapp_click']);
  track('enquiry_submitted', 'form'); expect(events).toHaveLength(1);
  track('enquiry_submitted', 'form', undefined, 'test-acknowledgement'); track('enquiry_submitted', 'form', undefined, 'test-acknowledgement');
  expect(events.map(e => e.event)).toEqual(['whatsapp_click', 'enquiry_submitted']);
  expect(Object.keys(events[1].params).sort()).toEqual(['event_id', 'page_location', 'page_path', 'page_referrer', 'source']);
  now += 31_000; track('whatsapp_click', 'hero', 'Dental Kit'); expect(events).toHaveLength(3);
  allowed = false; track('telephone_click', 'footer'); expect(events).toHaveLength(3);
});
