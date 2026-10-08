import { test, expect, type Page } from '@playwright/test';

async function openChat(page: Page) {
  await page.goto('/');
  await page.getByRole('button', { name: 'Open AI assistant', exact: true }).click();
  return page.getByRole('dialog', { name: 'Ecolourà assistant' });
}
const reply = (text: string) => JSON.stringify({ text }) + '\n' + JSON.stringify({ done: true }) + '\n';

test('website and assistant open immediately without model downloads or API requests', async ({ page }) => {
  const calls: string[] = [];
  page.on('request', req => { if (/huggingface|binary-mlc|llm\.worker|\/api\/chat/.test(req.url())) calls.push(req.url()); });
  const panel = await openChat(page);
  await expect(page.locator('.product-card')).toHaveCount(9);
  await expect(panel.getByLabel('Message the AI assistant')).toBeEnabled();
  await expect(panel.locator('.local-chat-status')).toContainText('AI assistant ready');
  await expect(panel.locator('footer')).toContainText('sent through our website to Groq');
  expect(calls).toEqual([]);
});

test('keyboard, safe streamed text, bounded history and New Chat', async ({ page }) => {
  const bodies: any[] = [];
  await page.route('**/api/chat', async route => {
    bodies.push(route.request().postDataJSON());
    await route.fulfill({ contentType: 'application/x-ndjson', body: reply('<img src="x" onerror="window.injected=true"><script>window.injected=true</script>') });
  });
  const panel = await openChat(page); const input = panel.getByLabel('Message the AI assistant');
  await input.fill('Tell me about'); await input.press('Shift+Enter'); await input.type('clients'); await input.press('Enter');
  await expect(panel.locator('.local-chat-message-assistant')).toContainText('<script>');
  expect(bodies[0].question).toBe('Tell me about\nclients');
  expect(bodies[0].history).toEqual([]);
  await expect(panel.locator('.local-chat-message-assistant img, .local-chat-message-assistant script')).toHaveCount(0);
  expect(await page.evaluate(() => (window as any).injected)).toBeUndefined();
  await input.fill('Which hospitals?'); await input.press('Enter');
  await expect(panel.locator('.local-chat-message-assistant')).toHaveCount(2);
  expect(bodies[1].history).toHaveLength(2);
  expect(bodies[1]).not.toHaveProperty('systemPrompt');
  await panel.getByRole('button', { name: 'New Chat', exact: true }).click();
  await expect(panel.locator('.local-chat-message')).toHaveCount(0);
});

test('stream deltas appear before completion and Stop cancels a pending request', async ({ page }) => {
  await page.addInitScript(() => {
    const original = window.fetch.bind(window);
    window.fetch = async (url, init) => {
      if (url !== '/api/chat') return original(url, init);
      const encoder = new TextEncoder(); let timer: ReturnType<typeof setTimeout>;
      return new Response(new ReadableStream({ start(controller) {
        controller.enqueue(encoder.encode('{"text":"First words"}\n'));
        timer = setTimeout(() => { controller.enqueue(encoder.encode('{"text":" later"}\n{"done":true}\n')); controller.close(); }, 5000);
        init?.signal?.addEventListener('abort', () => { clearTimeout(timer); controller.error(new DOMException('Aborted', 'AbortError')); });
      } }), { headers: { 'Content-Type': 'application/x-ndjson' } });
    };
  });
  const panel = await openChat(page);
  await panel.getByLabel('Message the AI assistant').fill('Hello'); await panel.getByLabel('Message the AI assistant').press('Enter');
  await expect(panel.locator('.local-chat-message-assistant')).toContainText('First words');
  await expect(panel.getByRole('button', { name: 'Stop', exact: true })).toBeVisible();
  await panel.getByRole('button', { name: 'Stop', exact: true }).click();
  await expect(panel.locator('.local-chat-message-assistant')).toContainText('Partial response');
  await expect(panel.getByLabel('Message the AI assistant')).toBeEnabled();
});

test('quota and missing-key errors stay inside the assistant; website still works', async ({ page }) => {
  let status = 429;
  await page.route('**/api/chat', route => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify({ error: status === 429 ? 'Our free AI allowance is temporarily exhausted.' : 'The AI assistant is not configured yet.' }) }));
  const panel = await openChat(page); const input = panel.getByLabel('Message the AI assistant');
  await input.fill('Hello'); await input.press('Enter');
  await expect(panel.getByRole('alert')).toContainText('free AI allowance');
  status = 503;
  await input.fill('Try again'); await input.press('Enter');
  await expect(panel.getByRole('alert')).toContainText('not configured');
  await panel.getByRole('button', { name: 'Close AI assistant', exact: true }).click();
  await page.getByRole('button', { name: 'Grooming Sets', exact: true }).click();
  await expect(page.locator('.product-card')).toHaveCount(3);
});

test('mobile without GPU works, fits screen, Escape restores focus and WhatsApp stays separate', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => Object.defineProperty(navigator, 'gpu', { value: undefined, configurable: true }));
  await page.route('**/api/chat', route => route.fulfill({ contentType: 'application/x-ndjson', body: reply('Our clients include Aster and KIMS Al Shifa.') }));
  const panel = await openChat(page);
  await panel.getByRole('button', { name: 'Who are your clients?', exact: true }).click();
  await expect(panel.locator('.local-chat-message-assistant')).toContainText('KIMS Al Shifa');
  const box = await panel.boundingBox(); expect(box!.x).toBeGreaterThanOrEqual(0); expect(box!.x + box!.width).toBeLessThanOrEqual(390);
  await page.keyboard.press('Escape'); await expect(panel).toBeHidden();
  await expect(page.getByRole('button', { name: 'Open AI assistant', exact: true })).toBeFocused();
  await page.getByRole('button', { name: 'Open AI assistant', exact: true }).click();
  await expect(panel.locator('.local-chat-message-assistant')).toContainText('KIMS Al Shifa');
});
