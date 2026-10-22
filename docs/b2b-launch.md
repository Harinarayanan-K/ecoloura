# Ecolourà B2B implementation and launch

This improves the existing Vite/React/Vercel site; it does not migrate it to Next.js or Sites hosting. See [the initial audit](b2b-audit.md). Changes are local until deployed.

## What changed

- Direct hotel/resort bulk-supply headline, quotation and WhatsApp CTAs, Kerala buyer navigation, labelled mobile WhatsApp control, and optional quantity in the existing WhatsApp panel.
- Dedicated `/hotel-amenities-kerala/` page reusing all nine catalogue products, genuine photos, product filters, catalogue PDF and branding content. Accurate buying guidance and FAQs explicitly require confirmation of supply arrangements. Kerala is the buyer market, not an invented delivery promise or local office.
- `/products/<existing-product-id>/` pages with genuine catalogue details, contextual WhatsApp messages, bulk enquiry and related-product links; existing quick-view dialogs remain.
- Removed invented attributed review quotes and updated chatbot knowledge accordingly. Existing source client names remain unchanged; business owner should verify publication permission.
- Shared client/server form validation, accessible labels/errors, loading, honest success/failure states, a honeypot, body size limits, same-origin checks, per-instance rate limits, plain-text email delivery, and provider idempotency for retries. Fields remain on screen after a failure. No credentials, enquiry text or contact details are logged by this code. The response confirms provider acceptance, not inbox delivery or lead qualification.
- Static HTML for home, Kerala, privacy and nine products, unique metadata, absolute OG image, canonicals, accurate Organization schema, robots and generated sitemap. No fabricated offers/reviews/addresses/local-business schema. Existing search/filter/chat interactions hydrate in the browser. Root-relative assets support direct visits to nested routes; subdirectory hosting now requires adapting the base and links.
- Optimized copies of the nine product photos as WebP (original PNGs retained): 4,287,702 → 269,950 bytes combined, 93.7% smaller. Product photos load lazily, the hero is prioritized, and the chatbot remains in a separate lazy chunk. Key hero content is immediately visible. No production PageSpeed or Core Web Vitals score is claimed.
- Optional consent-gated GA4 or GTM, separate contact clicks and acknowledged form events, no configured analytics IDs, and no invented confirmed WhatsApp leads.

## Business information still needed

Confirm ownership and WhatsApp availability of the existing published `+91 89395 40771`; it was read from `src/data/siteData.ts`, not invented. Confirm the published email `ecolourahotelsuppliers@gmail.com` and the destination inbox. Confirm which cities/districts can actually be supplied, freight arrangements, customization options per product, product specifications, MOQs, sample terms and lead times. No numeric prices or guarantees have been added.

Supply a verified sender domain and Resend credentials. Confirm privacy notice/business operator details, retention period and mailbox access/deletion process before enabling online collection. These are launch requirements documented here, not invented customer-facing facts. No marketing subscription is created. No CRM or offline conversion connector is currently configured.

## Environment variables

Copy `.env.example` to `.env.local` for development; this file is ignored. Vite uses `VITE_` rather than `NEXT_PUBLIC_`. Public variables are embedded at build time and require a rebuild after changes. Do not put secrets in them.

| Variable | Where | Purpose |
| --- | --- | --- |
| `VITE_WHATSAPP_NUMBER` | Public, build time | Optional override of existing business number. International country code + number; spaces and `+` accepted, normalized for wa.me. Invalid/blank override shows contact fallback; it never creates a broken wa.me link. Default is existing source number. |
| `VITE_ENQUIRY_FORM_ENABLED` | Public, build time | Default `false`. Set `true` only after backend configuration and verified inbox delivery. Form otherwise explicitly explains unavailability and offers WhatsApp/call/email. |
| `RESEND_API_KEY` | Server secret | Restricted sending credential for Resend. |
| `ENQUIRY_FROM_EMAIL` | Server only | Sender address on a verified Resend domain. No default sender. |
| `ENQUIRY_TO_EMAIL` | Server only | Owner-supplied recipient inbox. No hidden fallback destination. |
| `VITE_GA4_ID` | Public, build time | Actual GA4 measurement ID, optional. Blank by default. |
| `VITE_GTM_ID` | Public, build time | Actual GTM container ID, optional. GTM takes precedence over direct GA4; use just one. |
| `GROQ_API_KEY`, `GROQ_MODEL` | Server only | Existing chatbot configuration; see [groq-chatbot.md](groq-chatbot.md). |

The canonical domain and sitemap origin are `https://www.ecoloura.in` in `scripts/prerender.mjs`, `public/robots.txt` and `index.html`. Change them together if the production domain changes. They intentionally remain the production canonical during preview builds. Protect preview deployments from indexing with Vercel deployment protection or `X-Robots-Tag: noindex` on the preview environment; production must permit indexing.

## Email integration and honest status

`api/enquiry.ts` is a conventional Vercel Node serverless endpoint, like the existing chatbot endpoint. It accepts JSON POSTs only from the same origin. A valid request needs all required fields, an allowed catalogue product, Kerala district, explicit contact consent and a UUID request identifier. Optional quantity and requirements stay optional. Provider URL and recipient are server controlled; user input appears in plain text and `reply_to`, not in HTML or email headers. [Resend send-email API](https://resend.com/docs/api-reference/emails/send-email).

Retries for unchanged details reuse an idempotency key; provider idempotency reduces duplicate delivery after an ambiguous timeout. A changed payload receives a new key. Resend acceptance is reported only after a successful response with a provider message ID; that does not prove inbox delivery. Verify actual inbox and spam-folder receipt with the business owner before enabling. Monitor Resend delivery/bounce events and inbox availability after launch. No automatic retry queue or CRM is claimed. Set distributed rate limits for `/api/enquiry` in Vercel WAF; the in-memory limit (5 requests per IP / 10 minutes) is per function instance and resets across instances. If abuse persists, add an owner-configured challenge with server verification; no challenge key has been fabricated.

`npm run dev` and `npm run preview` serve the frontend only; they do not execute Vercel functions. Use Vercel dev or a preview deployment for real integration tests. An unconfigured submission returns 503 and must not be counted as a conversion.

## Local commands and verification

```sh
npm ci
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000/hotel-amenities-kerala/`. Use Node 22 LTS for local work and Vercel's matching Node runtime.

```sh
npm run typecheck
npm run build
npm test
npm run preview -- --host 127.0.0.1 --port 3000
```

There is no existing ESLint configuration or lint script; none was added merely to manufacture a passing check. `build` runs both client and server TypeScript checks. Playwright uses the existing installed Google Chrome and serves `dist` on port 3002. Existing `test:chat` remains an alias for the same suite. The real-model test needs Groq and remains opt-in; ordinary tests mock external services.

To exercise the enabled form UI against mocked delivery without real email credentials:

```sh
VITE_ENQUIRY_FORM_ENABLED=true npm run build
npm test
npm run build
```

The final command restores the default, disabled online-submission release build (provided `.env.local` retains `false`). Unit/API tests use a mocked Resend transport; browser success/retry tests mock `/api/enquiry`. They verify semantics and UI, not real mailbox delivery. Test actual submission with Vercel's Node runtime once owner credentials are supplied:

```sh
npx vercel dev --listen 3000
```

Ensure the local environment contains the three server variables and enable the form in the local build/runtime only for this test. Send one clearly labelled test enquiry, verify it arrives in the configured inbox with correct details/reply-to, then test provider failure and duplicate retry. Restore the public flag to false if delivery is not verified. No real enquiry was sent during implementation.

## Deployment commands

The existing deployment target is Vercel (`vercel.json` retained). With the owner's Vercel account/project access, deploy a preview first:

```sh
npx vercel login
npx vercel link
npx vercel env add RESEND_API_KEY production
npx vercel env add ENQUIRY_FROM_EMAIL production
npx vercel env add ENQUIRY_TO_EMAIL production
npx vercel env add VITE_WHATSAPP_NUMBER production
npx vercel env add VITE_ENQUIRY_FORM_ENABLED production
npx vercel
```

Use `preview` instead of `production` in `vercel env add` for preview integration testing. Add actual `VITE_GA4_ID` OR `VITE_GTM_ID` using the same command only when supplied. Retain existing Groq variables. Enter values at the CLI prompts, never in source control or shell command arguments. The public form flag should remain false until preview integration delivery is verified; then set the production flag true and deploy:

```sh
npx vercel --prod
```

Vercel uses `npm run build`, publishes `dist`, and serves both `api/*.ts` endpoints. Static-only hosting can serve the pages/WhatsApp but needs a separately hosted same-origin backend before enabling the form. Avoid a catch-all SPA rewrite over generated product pages or API paths. Keep existing catalogue and download URLs working. Redirect the alternate apex domain to `www.ecoloura.in` in Vercel domain settings.

## GA4, GTM, Ads and Search Console

Use actual account IDs only. The code loads no Google analytics/tag script until the visitor allows optional analytics. It initializes consent before loading tags; advertising storage, advertising user data and ad personalization remain denied. Only analytics storage may be granted. Withdraw consent with footer preferences. Do not enable direct remarketing/Ads tags or enhanced conversions without implementing the corresponding owner-reviewed consent and attribution integration. [Google consent implementation](https://developers.google.com/tag-platform/security/guides/consent).

**Direct GA4:** create the owner's web data stream and supply `VITE_GA4_ID`. This implementation sends `landing_page_view` for page visits rather than an automatic `page_view`, excluding query strings/referrers from custom payloads. Disable Enhanced Measurement form interactions, outbound-click measurement and automatic page views in the owner configuration to avoid duplicate or unintended collection; use these controlled custom events. Check DebugView/Realtime after consent. Mark `enquiry_submitted` as a key event after real integration testing. Do not mark page visits or contact clicks as completed enquiries.

**GTM alternative:** supply `VITE_GTM_ID` and leave GA4 blank. Use Custom Event triggers for the event names below; configure the actual Google tag/GA4 event tags. Map `source`, `product`, `page_path`, `page_location` and `event_id` from data-layer variables. Override Google tag `page_location` with the supplied clean origin/path, omit referrer/query strings, disable automatic page views and Enhanced Measurement forms/outbound clicks, and require `analytics_storage`. Do not use All Pages or arbitrary click triggers to record leads. Configure tag consent checks; do not add tags that bypass this site's denied advertising consent.

| Event | Trigger | Reporting role |
| --- | --- | --- |
| `landing_page_view` | Initial page load after opt-in | Visit diagnostic only; not an enquiry |
| `whatsapp_click` | Actual wa.me link activation / prepared-message launch | Secondary intent signal, not sent message or confirmed lead |
| `telephone_click` | Actual tel link click | Secondary intent signal; not a connected call |
| `email_click` | Actual mailto link click | Secondary intent signal; not delivered email |
| `enquiry_submitted` | Server reports provider-accepted delivery | Enquiry candidate; not a qualified lead or completed sale |

Repeated identical contact actions within 30 seconds in one page instance are suppressed. Acknowledged form IDs are deduplicated in memory/session storage. No event contains names, phone/email, form text, raw query strings or click IDs. The website cannot observe whether a WhatsApp conversation occurred. Browser storage/consent/ad blockers can limit reporting; do not infer conversions from missing data.

**Google Ads:** link the actual Ads and GA4 accounts and import the verified form key event, count `One` per lead action, and choose a single source of conversion truth. Do not simultaneously import and directly fire the same conversion. Treat contact clicks as Secondary observation actions and form enquiries as a provisional Primary action only after mailbox delivery testing; later optimize toward qualified leads if a CRM supports it. [Primary/secondary conversion guidance](https://support.google.com/google-ads/answer/11461796?hl=en), [qualified lead reporting](https://support.google.com/google-ads/answer/11459091?hl=en).

**Qualification:** no CRM, click-ID capture, Ads offline import or WhatsApp Business webhook exists in this repo. Start an owner-managed lead log with date, source when known, products, business/property, district, requested quantity, qualification status and outcome, with restricted access and a retention policy. Only an actual buyer conversation/CRM review can qualify a lead. If implementing offline imports later, capture attribution with appropriate consent, preserve a stable lead ID, and use the owner's Ads conversion action; never manufacture qualified-lead events from clicks.

**Search Console:** verify ownership of `ecoloura.in` using the owner's DNS TXT record (or supplied HTML file). Submit `https://www.ecoloura.in/sitemap.xml`, inspect the landing and product URLs, check indexing and canonical selection. No verification token is fabricated.

**Initial Search campaign:** one Kerala-targeted Search campaign linking to `/hotel-amenities-kerala/`, total daily budget ₹300–₹500. Start with buyer-intent phrase/exact themes such as hotel amenities supplier Kerala, hotel toiletries supplier Kerala, customized hotel toiletries, branded hotel toiletries supplier, hotel guest amenities wholesale and hotel amenities supplier Kochi. Use Kochi supply language only after coverage is confirmed. Review search terms and add irrelevant retail/job/DIY/one-piece queries as negatives when observed. Use business-accurate ad copy, the actual phone asset, presence-based location targeting, and no delivery/price/certification promises. Monitor cost per genuine enquiry and qualified lead; no CPC, volume or lead guarantees are made.

## Production launch checklist

- [ ] Owner confirms WhatsApp number/email, product/customization facts, client-name permission, coverage and privacy/retention practices.
- [ ] Resend sender verified; secret/server recipient configured; test enquiry received in the actual inbox; bounces monitored.
- [ ] Form flag remains false until delivery passes; then enable and rebuild. No test account IDs or credentials ship.
- [ ] Vercel distributed rate limits configured; method/origin/size/validation failure paths verified in preview.
- [ ] Home, Kerala, all product pages, catalogue and privacy load by direct URL; mobile menu, dialogs and WhatsApp work on desktop/mobile.
- [ ] Actual wa.me destination and prefilled product messages verified with the owner; click alone never produces lead success.
- [ ] Metadata/canonicals/OG images/sitemap/robots verified at production URL; Search Console ownership and sitemap submitted.
- [ ] Actual GA4 or GTM configured, consent accepted/declined/revoked tested, no events before consent and no personal details in payloads.
- [ ] Ads goals separate contact intent from acknowledged form enquiries and qualified leads; duplicate conversion sources removed.
- [ ] Check PageSpeed Insights/Core Web Vitals on production mobile after deployment; no local screenshot is presented as a speed score.
- [ ] Review actual inbox and WhatsApp enquiries regularly and update the lead log; investigate failed delivery before spending on ads.

## Verification results — 21 October 2026

- `npm run typecheck`: passed (client and server).
- `npm run build`: passed; 12 pages prerendered and sitemap emitted. Final default build verified to keep online submission disabled.
- `npm test`: 29 passed, 1 skipped (optional real Groq test). The enabled-form build was also tested with mocked delivery: failure retained fields, retry reused its identifier and only acknowledged delivery showed success.
- Chrome responsive checks at 320, 390, 768 and 1440px: no horizontal overflow; product routes and image loading passed. Mobile/desktop screenshots were visually inspected. Screenshots are local test artifacts under ignored `test-results/`.
- WhatsApp international number validation, Unicode/ampersand message encoding, product selection and prepared-form messages passed. No actual WhatsApp conversation was sent or recipient ownership independently verified.
- Static no-JavaScript content, product routes, images, PDF, robots and sitemap passed. All 12 generated pages have one H1 and one canonical; no zero product prices were found.
- API tests covered method/origin/content type, required fields, catalogue allowlist, consent, honeypot, payload size, missing configuration, provider acceptance/failure, timeout-style transport failure, idempotency and rate limits. Both Web Request and Vercel Node adapter paths were exercised with mocked transport.
- Tracking tests verified consent gating, distinct WhatsApp vs form events, acknowledgement requirement and deduplication using an injected transport without measurement IDs. The default browser build made no Google tracking requests. No real GA4/GTM/Ads account reporting was tested.
- `git diff --check`: passed. No lint command exists in the project. No real email delivery, live PageSpeed score, Search Console ownership or production deployment is claimed.

See [the complete changed-file list](b2b-changed-files.md) for source, assets and generated build output. Existing untracked personal artifacts were left alone.
