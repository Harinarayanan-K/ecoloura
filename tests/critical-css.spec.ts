import { test, expect } from '@playwright/test';
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { productsData } from '../src/data/productsData';

test('every prerendered page includes inline CSS and a complete no-JavaScript fallback', async () => {
  async function pages(directory: string): Promise<string[]> {
    const entries = await readdir(directory, { withFileTypes: true });
    const nested = await Promise.all(entries.filter(e => e.isDirectory() && !['assets', 'catalogue'].includes(e.name)).map(e => pages(join(directory, e.name))));
    return [...entries.filter(e => e.name === 'index.html').map(e => join(directory, e.name)), ...nested.flat()];
  }
  const files = await pages('dist');
  expect(files).toHaveLength(productsData.length + 3);
  for (const file of files) {
    const html = await readFile(file, 'utf8');
    expect(html, file).toMatch(/<style>[^<]*\.premium-header/);
    expect(html, file).toMatch(/<link[^>]+rel="stylesheet"[^>]+media="print"[^>]+onload="this.media='all'"/);
    expect(html, file).toMatch(/<noscript><link[^>]+rel="stylesheet"[^>]+href="\/assets\/index-[^"]+\.css"[^>]*><\/noscript>/);
    // Preserve the existing visibility fallback for progressively enhanced images.
    expect(html, file).toContain('opacity:1!important');
  }
});

for (const width of [390, 1440]) for (const path of ['/', '/hotel-amenities-kerala/', '/products/dental-kit/', '/privacy/']) {
  test(`inline CSS preserves layout before the shared stylesheet arrives: ${path} at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    let release!: () => void;
    const pending = new Promise<void>(resolve => { release = resolve; });
    await page.route('**/assets/index-*.css', async route => { await pending; await route.continue(); });
    const failures: string[] = [];
    page.on('pageerror', error => failures.push(error.message));
    try {
      await page.goto(path, { waitUntil: 'domcontentloaded' });
      await page.evaluate(() => document.fonts.ready);
      expect(await page.evaluate(() => [...document.fonts].some(font => font.family.includes('DM Sans') && font.status === 'loaded'))).toBe(true);
      await expect(page.locator('h1')).toBeVisible();
      const overflow = await page.evaluate(() => ({
        fits: document.documentElement.scrollWidth <= innerWidth,
        elements: [...document.querySelectorAll('body *')].filter(el => el.getBoundingClientRect().right > innerWidth + 1).slice(0, 8).map(el => el.className),
      }));
      expect(overflow.fits, JSON.stringify(overflow.elements)).toBe(true);
      const layout = () => page.locator('.premium-header, h1, .welcome-hero, .product-detail-grid, .privacy-notice, .whatsapp-widget, .local-chat-widget').evaluateAll(elements => elements.map(el => {
        const box = el.getBoundingClientRect(), style = getComputedStyle(el);
        return { width: Math.round(box.width), height: Math.round(box.height), color: style.color, background: style.backgroundColor, display: style.display, font: style.fontFamily };
      }));
      const before = await layout();
      // The header's mobile navigation must also work during slow CSS delivery.
      if (width === 390) {
        await page.getByRole('button', { name: 'Open navigation', exact: true }).click();
        await expect(page.getByRole('navigation', { name: 'Mobile navigation' })).toHaveCSS('position', 'absolute');
        await page.getByRole('button', { name: 'Close navigation', exact: true }).click();
      }
      const loaded = page.waitForResponse(response => /\/assets\/index-.*\.css$/.test(response.url()));
      release(); await loaded;
      await expect(page.locator('link[onload]')).toHaveAttribute('media', 'all');
      await page.evaluate(() => document.fonts.ready);
      expect(await layout()).toEqual(before);
      expect(failures).toEqual([]);
    } finally { release(); }
  });
}

test('no-JavaScript visitors get the regular stylesheet and visible catalogue content', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:3002/hotel-amenities-kerala/');
  await expect(page.locator('.product-card').first()).toHaveCSS('display', 'flex');
  await expect(page.locator('.product-card img').first()).toHaveCSS('opacity', '1');
  await expect(page.locator('.premium-header')).toHaveCSS('position', 'sticky');
  await context.close();
});
