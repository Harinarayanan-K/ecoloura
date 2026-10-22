import { test, expect } from '@playwright/test';

for (const deviceScaleFactor of [1, 2]) test(`mobile uses portrait hero and small catalogue images at ${deviceScaleFactor}x`, async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor });
  const page = await context.newPage(); const requests: string[] = [];
  page.on('request', request => requests.push(request.url()));
  await page.goto('http://127.0.0.1:3002/');
  const hero = page.locator('.welcome-hero-image');
  await expect.poll(() => hero.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
  const heroSrc = await hero.evaluate((img: HTMLImageElement) => img.currentSrc);
  expect(heroSrc).toMatch(/hero-hospitality-v2-mobile-(360|564)\.webp$/);
  const card = page.locator('.product-card img').first(); await card.scrollIntoViewIfNeeded();
  await expect.poll(() => card.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
  expect(await card.evaluate((img: HTMLImageElement) => img.currentSrc)).toMatch(/-square-(320|480)\.webp$/);
  expect(requests.some(url => /fonts\.googleapis\.com|fonts\.gstatic\.com/.test(url))).toBe(false);
  expect(requests.filter(url => /hero-hospitality-v2.*\.webp/.test(url))).toEqual([heroSrc]);
  await context.close();
});

test('fonts load locally and chat panel styles load only when opened', async ({ page }) => {
  const requested: string[] = []; page.on('request', request => requested.push(request.url()));
  await page.goto('/'); await page.evaluate(() => document.fonts.ready);
  for (const family of ['DM Sans', 'Cormorant Garamond', 'Manrope']) {
    expect(await page.evaluate(family => document.fonts.check(`16px "${family}"`), family)).toBe(true);
  }
  expect(requested.some(url => /LocalChatPanel-.*\.css/.test(url))).toBe(false);
  await page.getByRole('button', { name: 'Open AI assistant', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Ecolourà assistant' })).toBeVisible();
  expect(requested.some(url => /LocalChatPanel-.*\.css/.test(url))).toBe(true);
});

test('detail and quick view use responsive variants with working source files', async ({ page, request }) => {
  await page.goto('/products/dental-kit/');
  const image = page.locator('.product-detail-grid>img');
  await expect.poll(() => image.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
  expect(await image.evaluate((img: HTMLImageElement) => img.currentSrc)).toMatch(/dental-kit-square-(320|480|768|1024)\.webp$/);
  await page.goto('/#products'); await page.getByRole('button', { name: 'Quick inspect Dental Kit', exact: true }).click();
  const modal = page.getByRole('dialog', { name: 'Dental Kit' }); await expect(modal).toBeVisible();
  const sources = await modal.locator('img').getAttribute('srcset');
  for (const candidate of sources!.split(', ')) expect((await request.get(candidate.split(' ')[0])).ok()).toBe(true);
});
