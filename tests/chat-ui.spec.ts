import { test, expect, type Page } from '@playwright/test';

test('website stays fast, with no model/runtime requests before explicit loading', async ({ page }) => {
  const remote: string[] = [];
  page.on('request', request => { if (/huggingface|binary-mlc|llm\.worker/.test(request.url())) remote.push(request.url()); });
  await page.goto('/');
  await expect(page.locator('.product-card')).toHaveCount(9);
  await page.getByRole('button', { name: 'Open AI assistant', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Ecolourà assistant' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Start chatting', exact: true })).toBeVisible();
  expect(remote).toEqual([]);
});

test('missing WebGPU is friendly and leaves product filtering working', async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(navigator, 'gpu', { value: undefined, configurable: true }));
  await page.goto('/');
  await page.getByRole('button', { name: 'Open AI assistant', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('hardware acceleration');
  await expect(page.getByRole('button', { name: 'Start chatting', exact: true })).toHaveCount(0);
  await page.getByRole('dialog').getByRole('button', { name: 'Close AI assistant', exact: true }).click();
  await page.getByRole('button', { name: 'Grooming Sets', exact: true }).click();
  await expect(page.locator('.product-card')).toHaveCount(3);
});

test('known low-memory devices are blocked before a worker/model starts', async ({ page }) => {
  const workers: string[] = [];
  page.on('worker', worker => workers.push(worker.url()));
  await page.addInitScript(() => Object.defineProperty(navigator, 'deviceMemory', { value: 2, configurable: true }));
  await page.goto('/');
  await page.getByRole('button', { name: 'Open AI assistant', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('2 GB');
  await page.getByRole('button', { name: 'Try again', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('2 GB');
  expect(workers).toEqual([]);
});

async function controlledWorker(page: Page) {
  await page.addInitScript(() => {
    const state = window as unknown as { calls: Record<string, unknown>[]; scenario: string; injected: boolean };
    state.calls = []; state.scenario = 'normal'; state.injected = false;
    // Tests simulate hardware and worker outcomes; production always uses WebLLM.
    Object.defineProperty(navigator, 'gpu', { configurable: true, value: {
      requestAdapter: async () => ({ features: new Set(['shader-f16']), limits: { maxStorageBufferBindingSize: 256 * 1024 * 1024 } }),
    } });
    Object.defineProperty(navigator, 'deviceMemory', { value: 8, configurable: true });
    const Native = window.Worker;
    class FakeWorker {
      onmessage: ((event: { data: unknown }) => void) | null = null;
      onerror = null;
      onmessageerror = null;
      timers: ReturnType<typeof setTimeout>[] = [];
      active = '';
      constructor(source: string | URL, options?: WorkerOptions) {
        if (!String(source).includes('llm.worker')) return new Native(source, options) as unknown as FakeWorker;
      }
      emit(data: unknown, delay = 0) { this.timers.push(setTimeout(() => this.onmessage?.({ data }), delay)); }
      terminate() { this.timers.forEach(clearTimeout); }
      postMessage(data: { type: string; id?: string; messages?: unknown[] }) {
        state.calls.push(data);
        if (data.type === 'load') {
          if (state.scenario === 'download-error') this.emit({ type: 'error', operation: 'load', code: 'network', message: 'The model download could not finish. Check your connection and try again.' }, 40);
          else {
            this.emit({ type: 'progress', progress: { phase: 'downloading', percent: 35, detail: 'Downloading public model files' } }, 20);
            if (state.scenario !== 'pending') this.emit({ type: 'ready', modelId: 'Qwen2.5-0.5B-Instruct-q4f16_1-MLC' }, 60);
          }
        } else if (data.type === 'generate') {
          this.active = data.id || '';
          if (state.scenario === 'generation-error') this.emit({ type: 'error', operation: 'generate', id: data.id, code: 'runtime', message: 'The local AI encountered a problem. Reload the assistant and try again.' }, 40);
          else if (state.scenario !== 'stalled') {
            this.emit({ type: 'delta', id: data.id, text: '<img src="x" onerror="window.injected=true">' }, 40);
            this.emit({ type: 'delta', id: data.id, text: '<script>window.injected=true</script> Safe text.' }, 80);
            this.emit({ type: 'done', id: data.id, stopped: false }, 180);
          }
        } else if (data.type === 'stop') { this.terminate(); this.emit({ type: 'done', id: this.active, stopped: true }, 20); }
        else if (data.type === 'reset') this.emit({ type: 'reset' }, 20);
        else if (data.type === 'unload') this.emit({ type: 'unloaded' });
      }
    }
    window.Worker = FakeWorker as unknown as typeof Worker;
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'Open AI assistant', exact: true }).click();
  const panel = page.getByRole('dialog', { name: 'Ecolourà assistant' });
  await expect(panel.getByRole('button', { name: 'Start chatting', exact: true })).toBeVisible();
  return panel;
}

async function scenario(page: Page, value: string) {
  await page.evaluate(value => { (window as unknown as { scenario: string }).scenario = value; }, value);
}

test('progress, cancel, failed download, and retry are visible', async ({ page }) => {
  const panel = await controlledWorker(page);
  await scenario(page, 'pending');
  await panel.getByRole('button', { name: 'Start chatting', exact: true }).click();
  await expect(panel.getByRole('progressbar')).toHaveAttribute('value', '35');
  await panel.getByRole('button', { name: 'Cancel loading', exact: true }).click();
  await expect(panel.getByRole('button', { name: 'Start chatting', exact: true })).toBeVisible();
  await scenario(page, 'download-error');
  await panel.getByRole('button', { name: 'Start chatting', exact: true }).click();
  await expect(panel.getByRole('alert')).toContainText('download could not finish');
  await scenario(page, 'normal');
  await panel.getByRole('button', { name: 'Try again', exact: true }).click();
  await expect(panel.locator('.local-chat-status')).toContainText('AI assistant ready');
});

test('keyboard submission, streamed text, history, New Chat, and injection safety', async ({ page }) => {
  const panel = await controlledWorker(page);
  await panel.getByRole('button', { name: 'Start chatting', exact: true }).click();
  await expect(panel.locator('.local-chat-status')).toContainText('AI assistant ready');
  const input = panel.getByLabel('Message the AI assistant');
  await input.fill('First line'); await input.press('Shift+Enter'); await input.type('<script>window.injected=true</script>');
  await expect(input).toHaveValue(/\n/);
  await input.press('Enter');
  await expect(panel.locator('.local-chat-message-assistant')).toContainText('<script>');
  await expect(panel.locator('.local-chat-status')).toContainText('AI assistant ready');
  await expect(panel.locator('.local-chat-messages img,.local-chat-messages script')).toHaveCount(0);
  expect(await page.evaluate(() => (window as unknown as { injected: boolean }).injected)).toBe(false);
  await input.fill('Follow up'); await input.press('Enter');
  await expect(panel.locator('.local-chat-status')).toContainText('AI assistant ready');
  const requests = await page.evaluate(() => (window as unknown as { calls: { type: string; messages: unknown[] }[] }).calls.filter(item => item.type === 'generate'));
  expect(requests.at(-1)?.messages).toHaveLength(4);
  await panel.getByRole('button', { name: 'New Chat', exact: true }).click();
  await expect(panel.locator('.local-chat-message')).toHaveCount(0);
  await expect(panel.locator('.local-chat-status')).toContainText('AI assistant ready');
  await input.fill('New question'); await input.press('Enter');
  await expect(panel.locator('.local-chat-status')).toContainText('AI assistant ready');
  expect(await page.evaluate(() => (window as unknown as { calls: { type: string; messages: unknown[] }[] }).calls.filter(item => item.type === 'generate').at(-1)?.messages.length)).toBe(2);
});

test('generation errors and Stop do not crash the page', async ({ page }) => {
  const panel = await controlledWorker(page);
  await panel.getByRole('button', { name: 'Start chatting', exact: true }).click();
  await expect(panel.locator('.local-chat-status')).toContainText('AI assistant ready');
  await scenario(page, 'stalled');
  await panel.getByLabel('Message the AI assistant').fill('A long answer'); await panel.getByLabel('Message the AI assistant').press('Enter');
  await panel.getByRole('button', { name: 'Stop', exact: true }).click();
  await expect(panel.locator('.local-chat-status')).toContainText('AI assistant ready');
  await scenario(page, 'generation-error');
  await panel.getByLabel('Message the AI assistant').fill('Test error'); await panel.getByLabel('Message the AI assistant').press('Enter');
  await expect(panel.getByRole('alert')).toContainText('encountered a problem');
  await panel.getByRole('button', { name: 'Close AI assistant', exact: true }).click();
  await page.getByRole('button', { name: 'Open WhatsApp enquiry', exact: true }).click();
  await expect(page.getByRole('region', { name: 'How can we help?' })).toBeVisible();
});

test('mobile fits the viewport, Escape returns focus, and WhatsApp panels do not overlap', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const panel = await controlledWorker(page);
  const fits = await panel.evaluate(element => {
    const box = element.getBoundingClientRect();
    return box.left >= 0 && box.right <= innerWidth && box.top >= 0 && box.bottom <= innerHeight;
  });
  expect(fits).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
  await page.keyboard.press('Escape');
  await expect(panel).toBeHidden();
  await expect(page.getByRole('button', { name: 'Open AI assistant', exact: true })).toBeFocused();
  await page.getByRole('button', { name: 'Open WhatsApp enquiry', exact: true }).click();
  await expect(page.getByRole('region', { name: 'How can we help?' })).toBeVisible();
  await page.getByRole('button', { name: 'Open AI assistant', exact: true }).click();
  await expect(panel).toBeVisible();
  await expect(page.getByRole('region', { name: 'How can we help?' })).toHaveCount(0);
});
