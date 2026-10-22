import { createServer } from 'vite';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import Beasties from 'beasties';
const origin = 'https://www.ecoloura.in';
// Components mark the initial content and permanent controls as critical.
// Retain their responsive rules rather than optimizing for just one viewport.
// Never prune the shared file:
// other routes and interactive states still need its complete contents.
const criticalCss = new Beasties({
  path: resolve('dist'),
  preload: 'media',
  noscriptFallback: true,
  pruneSource: false,
  reduceInlineStyles: false,
  // The authored font-face block is inserted separately. The selector extractor
  // cannot resolve font families referenced through CSS custom properties.
  inlineFonts: false,
  preloadFonts: false,
  keyframes: 'critical',
  // These states are added after hydration, so they are absent from static HTML.
  allowRules: [
    /^\.premium-site$/, /text-reveal/, /mobile-navigation/,
    /welcome-hero/, /announcement/, /skip-link/, /^section\[id\]/,
    /premium-header/, /product-detail/, /privacy-notice/, /section-shell/,
    /^\.container$/, /contact-banner/,
    /inquiry-/, /whatsapp-/, /b2b-form/, /product-options/, /form-/, /check-label/,
    /modal-/, /measurement-/,
  ],
  logLevel: 'warn',
});
const server = await createServer({ mode: 'production', server: { middlewareMode: true, ws: false, hmr: false }, appType: 'custom' });
const escape = value => value.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
try {
  const { pages, render, imagePreloads } = await server.ssrLoadModule('/src/prerender.tsx');
  const fonts = await readFile('src/styles/fonts.css', 'utf8');
  const template = (await readFile('dist/index.html', 'utf8')).replace('</head>', `<style>${fonts}</style></head>`);
  // Fail the build if a linked stylesheet is missing; never ship an unstyled
  // page because the extractor could not read an asset.
  for (const [, href] of template.matchAll(/<link[^>]*rel="stylesheet"[^>]*href="([^"]+)"/g)) {
    await readFile(resolve('dist', '.' + href), 'utf8');
  }
  for (const page of pages) {
    const canonical = origin + page.path;
    const preloads = imagePreloads(page.path).map(attributes => '<link rel="preload" as="image" fetchpriority="high" ' + Object.entries(attributes).map(([key,value]) => `${key}="${escape(value)}"`).join(' ') + ' />').join('');
    // Discover the route's LCP image before parsing any inlined CSS.
    let html = template.replace(/(<meta name="viewport"[^>]*>)/, `$1${preloads}`)
      .replace(/<title>[\s\S]*?<\/title>/, `<title>${escape(page.title)}</title>`)
      .replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${escape(page.description)}" />`)
      .replace(/<meta property="og:title"[^>]*>/, `<meta property="og:title" content="${escape(page.title)}" />`)
      .replace(/<meta property="og:description"[^>]*>/, `<meta property="og:description" content="${escape(page.description)}" />`)
      .replace('<div id="root"></div>', `<div id="root">${render(page.path)}</div>`)
      .replace('</head>', `<link rel="canonical" href="${canonical}" /><meta property="og:url" content="${canonical}" /><meta name="robots" content="index, follow" /><script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@type': 'Organization', name: 'Ecolourà', url: origin, logo: origin + '/assets/images/logo.png', email: 'ecolourahotelsuppliers@gmail.com', telephone: '+918939540771' })}</script></head>`);
    const file = resolve('dist', '.' + page.path, 'index.html');
    html = await criticalCss.process(html);
    await mkdir(dirname(file), { recursive: true }); await writeFile(file, html);
  }
  await writeFile('dist/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${pages.map(p => `<url><loc>${origin}${p.path}</loc></url>`).join('')}</urlset>\n`);
  // Do not fabricate review, offer, address or local-business schema.
  console.log(`Prerendered ${pages.length} pages and sitemap.xml`);
} finally { await server.close(); }
