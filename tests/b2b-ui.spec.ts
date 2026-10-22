import { productsData } from '../src/data/productsData';
import { test, expect, type Page } from '@playwright/test';
async function fillForm(page: Page) {
  const form = page.locator('#bulk-quote form');
  await form.getByLabel('Hotel or resort name').fill('Test Hotel');
  await form.getByLabel('Contact person’s name').fill('Test Buyer');
  await form.getByLabel('Business email').fill('buyer@example.com');
  await form.getByLabel('Phone or WhatsApp number').fill('+919876543210');
  await form.getByLabel('City in Kerala').fill('Kochi');
  await form.getByLabel('District in Kerala').selectOption('Ernakulam');
  await form.getByLabel('Dental Kit', { exact: true }).check();
  await form.getByLabel(/I agree/).check(); return form;
}
for (const width of [320, 390, 768, 1440]) test(`Kerala page, products and contact actions fit ${width}px`, async ({ page }, testInfo) => {
  await page.setViewportSize({ width, height: 900 });
  const failures: string[] = []; page.on('pageerror', e => failures.push(e.message));
  await page.goto('/hotel-amenities-kerala/');
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('h1')).toContainText('Custom-Branded');
  await expect(page.locator('.product-card')).toHaveCount(productsData.length);
  await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href', 'https://www.ecoloura.in/hotel-amenities-kerala/');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath(`kerala-${width}.png`), fullPage: false });
  const link = page.locator('.welcome-hero-actions a[href^="https://wa.me"]');
  const url = new URL((await link.getAttribute('href'))!);
  expect(url.pathname).toBe('/918939540771'); expect(url.searchParams.get('text')).toContain('Hello Ecolourà');
  await page.locator('.product-card').first().getByRole('link', { name: 'Sewing Kit', exact: true }).click();
  await expect(page).toHaveURL(/products\/sewing-kit\//);
  await expect(page.locator('h1')).toHaveText('Sewing Kit');
  await expect(page.getByText('Contact for Pricing', { exact: true })).toBeVisible();
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('.product-detail-grid>img')).toBeVisible();
  expect(await page.locator('.product-detail-grid>img').evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath(`product-${width}.png`), fullPage: false });
  expect(failures).toEqual([]);
});

test('static content, image assets, sitemap and product links work without JavaScript', async ({ browser, request }) => {
  const context = await browser.newContext({ javaScriptEnabled: false }); const page = await context.newPage();
  await page.goto('http://127.0.0.1:3002/hotel-amenities-kerala/');
  await expect(page.locator('h1')).toBeVisible();
  const products = await page.locator('.product-title a').evaluateAll(links => links.map(a => (a as HTMLAnchorElement).getAttribute('href')!));
  for (const path of products) { const response = await request.get(path); expect(response.ok()).toBe(true); expect(await response.text()).toContain('Contact for Pricing'); }
  for (const path of ['/privacy/', '/robots.txt', '/sitemap.xml', '/downloads/ecoloura-product-catalogue.pdf']) expect((await request.get(path)).ok()).toBe(true);
  const sitemap = await (await request.get('/sitemap.xml')).text(); expect(sitemap).toContain('/hotel-amenities-kerala/');
  const images = await page.locator('img').evaluateAll(images => images.map(i => i.getAttribute('src')!));
  for (const src of new Set(images)) expect((await request.get(src)).ok()).toBe(true);
  await context.close();
});

test('WhatsApp fallback validates fields and prepares details without claiming submission', async ({ page }) => {
  await page.goto('/hotel-amenities-kerala/');
  const form = page.locator('#bulk-quote form');
  await form.getByRole('button', { name: 'Continue with these details in WhatsApp' }).click();
  await expect(form.getByRole('alert')).toContainText('highlighted');
  await expect(form.getByLabel('Hotel or resort name')).toBeFocused();
  await fillForm(page);
  await page.evaluate(() => { (window as any).opened = ''; window.open = (url) => { (window as any).opened = String(url); return null; }; });
  await form.getByRole('button', { name: 'Continue with these details in WhatsApp' }).click();
  const url = new URL(await page.evaluate(() => (window as any).opened));
  expect(url.searchParams.get('text')).toContain('Location: Kochi, Ernakulam, Kerala');
  expect(url.searchParams.get('text')).toContain('Dental Kit');
  await expect(form).not.toContainText('was accepted');
});

test('form success requires server acknowledgement; failure preserves details and retry key', async ({ page }) => {
  await page.goto('/hotel-amenities-kerala/');
  const form = await fillForm(page); const submit = form.getByRole('button', { name: 'Send quotation request', exact: true });
  if (await submit.isDisabled()) { await expect(form).toContainText('Online form delivery is not enabled'); return; }
  const ids: string[] = []; let calls = 0;
  await page.route('**/api/enquiry', async route => {
    const body = route.request().postDataJSON(); ids.push(body.requestId); calls++;
    await route.fulfill({ status: calls === 1 ? 502 : 200, contentType: 'application/json', body: JSON.stringify(calls === 1 ? { error: 'Test provider failure' } : { submissionId: body.requestId }) });
  });
  await submit.click(); await expect(form.getByRole('alert')).toContainText('could not confirm delivery');
  await expect(form.getByLabel('Hotel or resort name')).toHaveValue('Test Hotel');
  await submit.click(); await expect(form.getByRole('status')).toContainText('was accepted by our email service');
  expect(ids[0]).toBe(ids[1]); await expect(form.getByRole('button', { name: 'Request accepted' })).toBeDisabled();
});

test('unconfigured analytics sends no Google requests or events', async ({ page }) => {
  const google: string[] = []; page.on('request', r => { if (/google-analytics|googletagmanager/.test(r.url())) google.push(r.url()); });
  await page.goto('/hotel-amenities-kerala/');
  await page.getByRole('button', { name: 'Open WhatsApp enquiry', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'How can we help?' })).toBeVisible();
  expect(google).toEqual([]);
  expect(await page.evaluate(() => (window as any).dataLayer)).toBeUndefined();
});
