# Remaining PageSpeed findings — 22 October 2026

The shared stylesheet is now non-blocking in the production HTML, and the flagged dental thumbnail is smaller. The supplied 53 ms unattributed forced-reflow finding could not be reproduced locally; it is not claimed to be fixed.

## Changes

- Added Beasties 0.5.5 as a development/build dependency. The existing prerender step generates critical CSS for all 20 routes. The header, hero, product/privacy article and permanent contact controls mark their critical content with `data-beasties-container`. Responsive rules and styles for navigation, quotation forms, dialogs, consent and WhatsApp states are explicitly preserved.
- Kept the complete shared stylesheet unchanged for other content and interactive states. It loads with `media="print"` and switches to `all` on load. A regular stylesheet link inside `noscript` preserves the full design without JavaScript. No new runtime service or credentials are involved.
- Inlined the existing font-face definitions separately: static extraction cannot resolve families used through CSS variables. This prevents a late change from fallback fonts when the deferred stylesheet arrives. Existing font preloads and local font assets remain in use.
- Moved route-specific image preloads immediately after the viewport meta tag, before the inline stylesheet. Keeping them after the viewport declaration lets mobile media queries choose the correct image. Browser tests confirm a single hero image request.
- Regenerated only the 320px dental-kit derivative at WebP quality 74 from the existing original. The image falls from 22,090 to 17,052 bytes, saving 5,038 bytes (22.8%). A visual comparison at native size retained readable product packaging and the original composition. Higher-resolution variants and original photographs are unchanged.
- The stylesheet extractor runs only during `npm run build`. The development server continues to use the normal Vite stylesheet workflow. Builds fail if a linked stylesheet cannot be read.

## Verification and measured limits

The hero text animation was subsequently restored at the owner's request. It uses a 650 ms, 8px movement with staggered heading lines; opacity stays at 1, and reduced-motion users get static text. It is CSS-driven and included in the generated critical styles. The build and 44-test suite passed again after this change. The Lighthouse snapshots below predate this animation update; scores have not been remeasured for it.

`npm run build`, `npm run typecheck` and `npm test` passed. The suite has 44 passed tests and one skipped optional live-Groq test. There is no configured lint command.

Ten new checks verify inline CSS/fallbacks on every generated route, local body-font availability, stable first-screen layout before/after deliberately delayed CSS, early mobile navigation, and readable catalogue content without JavaScript. Delayed delivery is tested for home, the Kerala landing page, dental product detail and privacy at 390px and 1440px. Existing checks cover 320/390/768/1440px layouts, responsive image selection at 1x/2x density, WhatsApp encoding, form validation, mocked delivery/tracking and chatbot interactions. Mobile and desktop screenshots were visually inspected.

Local Lighthouse 12.8.2 against Chrome and the production preview on port 3002:

| Metric | Before mobile | After mobile | After desktop |
| --- | ---: | ---: | ---: |
| Performance | 95 | 94 | 100 |
| Accessibility | 100 | 100 | 100 |
| Best practices | 100 | 100 | 100 |
| SEO | 100 | 100 | 100 |
| FCP | 1.66 s | 1.80 s | 0.41 s |
| LCP | 2.79 s | 2.85 s | 0.77 s |
| TBT | 0 ms | 3.5 ms | 0 ms |
| CLS | 0 | 0 | 0.00015 |
| Render-blocking stylesheet requests | 1 | 0 | 0 |
| Estimated blocking savings | 450 ms | 0 ms | 0 ms |

These are single local lab runs, not new public PageSpeed results. Removing the render-blocking diagnostic did **not** demonstrate an overall mobile speed improvement in this comparison. Inline CSS trades larger HTML for removing the stylesheet request from the initial rendering dependency. Home HTML gzip size rose from approximately 11.3 KB to 17.9 KB. The complete stylesheet is retained for caching and other states. Recheck the deployed site before claiming a real-user speed gain; mobile LCP remains above 2.5 seconds in this lab snapshot.

The Chrome traces contain no `Layout` events nested inside `FunctionCall`, `EvaluateScript`, `EventDispatch` or `FireAnimationFrame` events in either run. The largest layout task was 29.6 ms before and 16.9 ms after, but total layout work increased from 33.5 to 77.8 ms as deferred styles were applied. These observations do not establish that the screenshot's unattributed 53 ms forced reflow is eliminated. No speculative changes to image animations, focus handling or chat scrolling were made. A new production trace with attribution is needed if that warning persists.

Detailed values and timestamps: [critical-css-results.json](critical-css-results.json). Changed source/build files: [critical-css-changed-files.md](critical-css-changed-files.md).

## Local commands and deployment

Use the existing supported Node environment; this build dependency requires Node 20.19 or newer and was tested with Node 22.13.1.

```sh
npm ci
npm run dev
```

Build and check the production version separately:

```sh
npm run build
npm run typecheck
npm test
npm run preview -- --host 127.0.0.1 --port 3002 --strictPort
```

No new environment variables or business information are required for these changes. Existing email/analytics/chat credentials and launch requirements remain documented in [b2b-launch.md](b2b-launch.md). Regenerating images remains optional; see [performance-improvements.md](performance-improvements.md).

Deploy the reviewed source and lockfile through the existing Vercel Git workflow, which runs `npm run build` and publishes `dist`. Alternatively, from an authenticated, linked Vercel project, the deployment command is `npx vercel --prod`. This task has not published a deployment. Install development dependencies during the build so the CSS processor is available.

## Launch checks

- [ ] Inspect a Vercel preview before production: direct home, Kerala, product and privacy URLs must render with fonts and images.
- [ ] Under mobile throttling, check the first screen, mobile menu, quotation dialog, floating WhatsApp panel and chatbot. Confirm the header still says “Let’s talk” and only the floating WhatsApp trigger is icon-only.
- [ ] Disable JavaScript and check that page content, catalogue images, contact anchors and the full stylesheet still load.
- [ ] Confirm the dental thumbnail is the 17,052-byte variant and no original product specifications/contact configuration changed.
- [ ] Rerun public mobile/desktop PageSpeed. Compare actual FCP/LCP and layout stability, not only whether a diagnostic disappeared.
- [ ] If forced reflow persists, capture/expand its call stack or export the Chrome performance trace; investigate the attributed source before changing working interactions.

Implementation references: [Beasties documentation](https://github.com/danielroe/beasties), [Chrome render-blocking guidance](https://developer.chrome.com/docs/performance/insights/render-blocking), [Chrome forced-reflow guidance](https://developer.chrome.com/docs/performance/insights/forced-reflow).
