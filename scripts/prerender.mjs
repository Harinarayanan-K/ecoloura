import { createServer } from 'vite';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
const origin = 'https://www.ecoloura.in';
const server = await createServer({ mode: 'production', server: { middlewareMode: true, ws: false, hmr: false }, appType: 'custom' });
const escape = value => value.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
try {
  const { pages, render, imagePreloads } = await server.ssrLoadModule('/src/prerender.tsx');
  const template = await readFile('dist/index.html', 'utf8');
  for (const page of pages) {
    const canonical = origin + page.path;
    const preloads = imagePreloads(page.path).map(attributes => '<link rel="preload" as="image" fetchpriority="high" ' + Object.entries(attributes).map(([key,value]) => `${key}="${escape(value)}"`).join(' ') + ' />').join('');
    let html = template.replace(/<title>[\s\S]*?<\/title>/, `<title>${escape(page.title)}</title>`)
      .replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${escape(page.description)}" />`)
      .replace(/<meta property="og:title"[^>]*>/, `<meta property="og:title" content="${escape(page.title)}" />`)
      .replace(/<meta property="og:description"[^>]*>/, `<meta property="og:description" content="${escape(page.description)}" />`)
      .replace('<div id="root"></div>', `<div id="root">${render(page.path)}</div>`)
      .replace('</head>', `${preloads}<link rel="canonical" href="${canonical}" /><meta property="og:url" content="${canonical}" /><meta name="robots" content="index, follow" /><script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@type': 'Organization', name: 'Ecolourà', url: origin, logo: origin + '/assets/images/logo.png', email: 'ecolourahotelsuppliers@gmail.com', telephone: '+918939540771' })}</script></head>`);
    const file = resolve('dist', '.' + page.path, 'index.html');
    await mkdir(dirname(file), { recursive: true }); await writeFile(file, html);
  }
  await writeFile('dist/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${pages.map(p => `<url><loc>${origin}${p.path}</loc></url>`).join('')}</urlset>\n`);
  // Do not fabricate review, offer, address or local-business schema.
  console.log(`Prerendered ${pages.length} pages and sitemap.xml`);
} finally { await server.close(); }
