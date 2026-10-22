import { enquiryText, validateEnquiry } from '../src/leads/validation.js';
declare const process: { env: Record<string, string | undefined> };
const headers = { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' };
const json = (status: number, body: object) => Response.json(body, { status, headers });
interface Options { apiKey?: string; from?: string; to?: string; fetchImpl?: typeof fetch; }
export function createEnquiryHandler(options: Options = {}) {
  // Per-instance defense. Configure distributed per-IP rate limits in Vercel WAF before advertising.
  const buckets = new Map<string, { count: number; expires: number }>();
  return async (req: Request): Promise<Response> => {
    if (req.method !== 'POST') return new Response(null, { status: 405, headers: { ...headers, Allow: 'POST' } });
    if (req.headers.get('origin') !== new URL(req.url).origin || req.headers.get('sec-fetch-site') === 'cross-site') return json(403, { error: 'Use the enquiry form on this website.' });
    if (!req.headers.get('content-type')?.startsWith('application/json')) return json(415, { error: 'Expected JSON.' });
    const ip = req.headers.get('x-vercel-forwarded-for')?.split(',')[0].trim() || 'unknown';
    const now = Date.now();
    for (const [key, entry] of buckets) if (entry.expires <= now) buckets.delete(key);
    const bucket = buckets.get(ip) || { count: 0, expires: now + 600_000 };
    if (++bucket.count > 5 || (!buckets.has(ip) && buckets.size >= 2000)) return json(429, { error: 'Too many requests. Please call or use WhatsApp.' });
    buckets.set(ip, bucket);
    let body: unknown;
    try {
      const reader = req.body?.getReader(); if (!reader) return json(400, { error: 'Enter your requirements.' });
      const decoder = new TextDecoder(); let raw = '', bytes = 0;
      while (true) { const { done, value } = await reader.read(); if (done) break; bytes += value.byteLength; if (bytes > 12_000) { await reader.cancel(); return json(413, { error: 'Enquiry too large.' }); } raw += decoder.decode(value, { stream: true }); }
      body = JSON.parse(raw + decoder.decode());
    } catch { return json(400, { error: 'Invalid enquiry.' }); }
    const result = validateEnquiry(body);
    if (!result.data) return json(400, { error: 'Please check your details.', errors: result.errors });
    if (result.data.website) return json(400, { error: 'This enquiry could not be accepted. Please contact us directly.' });
    const requestId = (body as Record<string, unknown>).requestId;
    if (typeof requestId !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(requestId)) return json(400, { error: 'Invalid request identifier. Please refresh the page.' });
    if (!options.apiKey || !options.from || !options.to) return json(503, { error: 'Online enquiries are not configured. Please use WhatsApp, telephone or email.' });
    const controller = new AbortController(); const timer = setTimeout(() => controller.abort(), 10_000);
    try {
      const response = await (options.fetchImpl || fetch)('https://api.resend.com/emails', {
        method: 'POST', signal: controller.signal,
        headers: { Authorization: `Bearer ${options.apiKey}`, 'Content-Type': 'application/json', 'Idempotency-Key': `enquiry/${requestId}` },
        body: JSON.stringify({ from: options.from, to: [options.to], reply_to: result.data.email, subject: 'Ecolourà — hotel bulk quotation request', text: enquiryText(result.data) }),
      });
      if (!response.ok) return json(502, { error: 'Delivery could not be confirmed. Please retry or contact us directly.' });
      const delivered = await response.json();
      if (!delivered || typeof delivered.id !== 'string' || !delivered.id) return json(502, { error: 'Delivery could not be confirmed.' });
      return json(200, { submissionId: requestId });
    } catch { return json(502, { error: 'Delivery could not be confirmed. Please retry or contact us directly.' }); }
    finally { clearTimeout(timer); }
  };
}
interface NodeRequest extends AsyncIterable<Uint8Array> { method?: string; url?: string; headers: Record<string, string | string[] | undefined>; body?: unknown; }
interface NodeResponse { statusCode: number; setHeader(name: string, value: string): void; end(body?: string): void; }
export function createNodeEnquiryHandler(options: Options = {}) {
  const handle = createEnquiryHandler(options);
  return async (req: NodeRequest, res: NodeResponse) => {
    try {
      const h = new Headers(); for (const [k, v] of Object.entries(req.headers)) if (v !== undefined) h.set(k, Array.isArray(v) ? v.join(', ') : v);
      const protocol = h.get('x-forwarded-proto')?.split(',')[0] || 'https', host = h.get('host');
      if (!host || !['http', 'https'].includes(protocol)) { res.statusCode = 400; res.end(); return; }
      let raw = '';
      if (req.method === 'POST') {
        if (req.body !== undefined) raw = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
        else { const decoder = new TextDecoder(); let size = 0; for await (const chunk of req) { size += chunk.byteLength; if (size > 12_000) { res.statusCode = 413; res.setHeader('Cache-Control', 'no-store'); res.end(); return; } raw += decoder.decode(chunk, { stream: true }); } raw += decoder.decode(); }
        if (new TextEncoder().encode(raw).byteLength > 12_000) { res.statusCode = 413; res.setHeader('Cache-Control', 'no-store'); res.end(); return; }
      }
      const response = await handle(new Request(new URL(req.url || '/api/enquiry', `${protocol}://${host}`), { method: req.method || 'GET', headers: h, ...(req.method === 'POST' ? { body: raw } : {}) }));
      res.statusCode = response.status; response.headers.forEach((v, k) => res.setHeader(k, v)); res.end(await response.text());
    } catch { res.statusCode = 500; res.setHeader('Cache-Control', 'no-store'); res.end(JSON.stringify({ error: 'Please retry or contact us directly.' })); }
  };
}
let handler: ReturnType<typeof createNodeEnquiryHandler> | undefined;
export default function enquiry(req: NodeRequest, res: NodeResponse) {
  handler ||= createNodeEnquiryHandler({ apiKey: process.env.RESEND_API_KEY, from: process.env.ENQUIRY_FROM_EMAIL, to: process.env.ENQUIRY_TO_EMAIL });
  return handler(req, res);
}
