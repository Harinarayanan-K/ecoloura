# Performance and readability improvements — 22 October 2026

Follow-up for the remaining render-blocking stylesheet, dental thumbnail and unattributed layout warning: [critical-css-improvements.md](critical-css-improvements.md). Its measurements supersede the snapshots below for the current build.

This update addresses the mobile image-delivery, font-loading, unused-CSS and contrast findings in the supplied PageSpeed screenshots. It preserves the existing catalogue, branding, quotation/WhatsApp behavior, tracking and chatbot. The header remains “Let’s talk”; only the floating WhatsApp launcher is icon-only.

## Implementation

- Added responsive 320/480/768/1024px WebP copies for the 17 current square product photographs, plus appropriately sized copies of the existing lifestyle photo. Catalogue cards, product pages and quick-view dialogs now use `srcset` and layout-specific `sizes`. All original photographs remain available.
- Added mobile portrait hero variants using the existing 62% horizontal crop, plus compressed desktop variants. The browser chooses the correct source via `picture`. Route-specific, media-matched preloads prioritize the hero or product detail image without downloading both mobile and desktop sources. Other pages do not preload the hero.
- Added same-origin WOFF2 copies of DM Sans, Cormorant Garamond (normal and italic) and Manrope. Kept the weights used by the active design and `font-display: swap`; preloaded the normal body and heading fonts. Removed Google stylesheet imports from the active CSS and external-font preconnects. Font files are distributed with their SIL Open Font License notices in `public/assets/fonts/`.
- Replaced the 45 KB legacy base stylesheet import with a 13 KB active base retaining reset, tokens, typography, buttons, catalogue and modal rules/breakpoints. The original stylesheet remains available for unused legacy components. Removed obsolete editorial-hero and review-layout rules from the active premium stylesheet.
- Split the always-visible chatbot launcher CSS from the panel stylesheet. The panel's existing lazy module now brings its styles in only when the assistant is opened. No runtime dependency was added.
- Darkened muted green text in client badges, catalogue descriptions, labels, footers and section headings. Increased catalogue description/contact text sizes. Checked fully revealed content with reduced motion so invisible intro animations could not hide contrast failures.

## Asset reductions

- Mobile hero: original 234,756 bytes → 36,090 bytes at the 564px portrait source (84.6% smaller); the 360px source is 19,788 bytes.
- Desktop hero: original 234,756 bytes → 119,848 bytes at the largest 1672px optimized source.
- Referenced product/lifestyle source photographs total 3,239,558 bytes; their 320px alternatives total 295,708 bytes (90.9% smaller). Higher-density screens may choose larger alternatives. This is an asset-size comparison, not a claim that every visitor downloads every photo.
- The main stylesheet falls from 90,858 bytes to approximately 55 KB, and two extra Google font stylesheets are eliminated. About 8.4 KB of chatbot-panel CSS is deferred until needed.

## Verification

- `npm run build` passes, including client/server TypeScript checks and all 20 prerendered pages.
- Full regression suite: 34 passed, 1 skipped (optional real Groq test, which requires its external service).
- New browser checks verify mobile image selection at 1x and 2x pixel density, a single mobile hero request, no Google Fonts network requests, local font availability, deferred chatbot CSS and working responsive product/quick-view image sources.
- Existing responsive tests cover 320, 390, 768 and 1440px screens; catalogue, product, form, WhatsApp, tracking and mocked-chat tests pass. Mobile and desktop screenshots were visually inspected.
- Additional axe contrast scans check fully visible home/landing content and opened quotation, product and assistant panels. Animations are allowed to finish before panel scans, avoiding false reports from transitional opacity.
- Lighthouse reports and limitations are recorded in `performance-results.json`. All scores are local lab snapshots using Lighthouse 12.8.2 and Chrome against the production preview on port 3002, not a new measurement of the public domain. The before/after mobile comparison uses the same Lighthouse setup. Supplied PageSpeed screenshot scores are not treated as the local baseline.
- Mobile LCP improved substantially but was still around 2.7 seconds in the measured optimized run; the good field target is 2.5 seconds or less. The shared application still has an unused-JavaScript diagnostic. No perfect score or real-user Core Web Vitals pass is promised.

## Running and maintaining the assets

The normal workflow remains:

```sh
npm run dev
npm run build
npm test
```

Fonts and image variants are checked-in static assets. Production builds need no image service, API key, Python package or new environment variable. After adding/replacing source product photos, regenerate the derivatives before committing and building:

```sh
python3 -m venv /private/tmp/ecoloura-image-tools
/private/tmp/ecoloura-image-tools/bin/python -m pip install Pillow
/private/tmp/ecoloura-image-tools/bin/python scripts/optimize_images.py
npm run build
```

The square catalogue convention is 1024×1024 source photos. The generator does not upscale smaller sources; update the helper's candidate widths if introducing a different source size. Existing non-square lifestyle photography is capped below its source dimensions.

Deploy the reviewed source and generated public assets using the existing Vercel workflow in [b2b-launch.md](b2b-launch.md). Then rerun public mobile PageSpeed for home, the Kerala landing page and a product page, and monitor actual Search Console/Core Web Vitals data. This task does not deploy to production or change business credentials.

Guidance consulted: [responsive images](https://web.dev/articles/serve-responsive-images), [font loading](https://web.dev/articles/optimize-webfont-loading), [Lighthouse](https://developer.chrome.com/docs/lighthouse/overview).

Complete changed-file list: [performance-changed-files.md](performance-changed-files.md).

## Local Lighthouse snapshots

| Metric | Before mobile | Optimized mobile | Optimized desktop |
| --- | ---: | ---: | ---: |
| Performance | 69 | 95 | 100 |
| Accessibility | 96 | 100 | 100 |
| Best Practices | 96 | 100 | 100 |
| Seo | 100 | 100 | 100 |
| First Contentful Paint | 3.4 s | 1.7 s | 0.4 s |
| Largest Contentful Paint | 7.1 s | 2.7 s | 0.7 s |
| Cumulative Layout Shift | 0 | 0 | 0 |
