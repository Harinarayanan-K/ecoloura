// No personal details, free text, query strings or click IDs enter this event API.
type AnalyticsWindow = Window & { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void };
const w = () => window as AnalyticsWindow;
const key = 'ecoloura-measurement-consent-v1';
const ga = import.meta.env?.VITE_GA4_ID || '';
const gtm = import.meta.env?.VITE_GTM_ID || '';
export const trackingConfigured = /^G-[A-Z0-9]+$/.test(ga) || /^GTM-[A-Z0-9]+$/.test(gtm);
let allowed = false, started = false;
export function savedConsent(): 'accepted' | 'declined' | null {
  try { const value = localStorage.getItem(key); return value === 'accepted' || value === 'declined' ? value : null; } catch { return null; }
}
export function setMeasurementConsent(accept: boolean) {
  try { localStorage.setItem(key, accept ? 'accepted' : 'declined'); } catch { /* Session-only consent. */ }
  allowed = accept;
  if (!trackingConfigured) return;
  const win = w();
  win.dataLayer ||= [];
  win.gtag ||= function () { win.dataLayer!.push(arguments); };
  const denied = { analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' };
  if (!started) win.gtag('consent', 'default', denied);
  win.gtag('consent', 'update', { ...denied, analytics_storage: accept ? 'granted' : 'denied' });
  if (!accept || started) return;
  started = true;
  const script = document.createElement('script'); script.async = true;
  if (/^GTM-[A-Z0-9]+$/.test(gtm)) {
    win.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
    script.src = `https://www.googletagmanager.com/gtm.js?id=${gtm}`;
  } else {
    script.src = `https://www.googletagmanager.com/gtag/js?id=${ga}`;
    win.gtag('js', new Date());
    // Exclude the query string (which could contain personal data).
    win.gtag('config', ga, { send_page_view: false, allow_google_signals: false, allow_ad_personalization_signals: false });
  }
  document.head.appendChild(script);
  track('landing_page_view', 'page');
}
type EventName = 'landing_page_view' | 'whatsapp_click' | 'telephone_click' | 'email_click' | 'enquiry_submitted';
/** Injected transport lets tests verify event semantics without any account ID or network call. */
export function createEventTracker(options: { isAllowed: () => boolean; send: (event: string, params: Record<string, string>) => void; page: () => { path: string; origin: string }; now?: () => number }) {
  const recent = new Map<string, number>();
  return (event: EventName, source: string, product?: string, submissionId?: string) => {
    if (!options.isAllowed() || (event === 'enquiry_submitted' && !submissionId)) return;
    const id = submissionId ? `submission:${submissionId}` : `${event}:${source}:${product || ''}`;
    const now = (options.now || Date.now)();
    const previous = recent.get(id);
    if (previous !== undefined && now - previous < (submissionId ? 86_400_000 : 30_000)) return;
    if (submissionId) {
      try { if (sessionStorage.getItem(id)) return; sessionStorage.setItem(id, '1'); } catch { /* Memory fallback. */ }
    }
    recent.set(id, now);
    const page = options.page();
    const params = { source, ...(product ? { product } : {}), page_path: page.path, page_location: page.origin + page.path, page_referrer: '', ...(submissionId ? { event_id: submissionId } : {}) };
    options.send(event, params);
  };
}
export const track = createEventTracker({
  isAllowed: () => allowed && trackingConfigured,
  page: () => ({ path: location.pathname, origin: location.origin }),
  send: (event, params) => {
    if (/^GTM-[A-Z0-9]+$/.test(gtm)) w().dataLayer?.push({ event, ...params });
    else w().gtag?.('event', event, params);
  },
});
