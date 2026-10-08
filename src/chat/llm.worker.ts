import { MLCEngine, prebuiltAppConfig } from '@mlc-ai/web-llm';
import type { ModelRecord, InitProgressReport } from '@mlc-ai/web-llm';
import { CHAT_CONFIG, CHAT_MODELS } from './config';
import type { ChatRequest, ChatResponse } from './protocol';
import { friendlyChatError } from './errors';
import { catalogueAnswer } from './catalogueAnswers';
import { websiteAnswer } from './websiteAnswers';

const scope = self as unknown as {
  onmessage: ((event: MessageEvent<ChatRequest>) => void) | null;
  postMessage: (message: ChatResponse) => void;
  location: Location;
  navigator: Navigator;
};
let engine: MLCEngine | null = null;
let busy = false;
let stopped = false;
const post = (message: ChatResponse) => scope.postMessage(message);

function reportProgress(report: InitProgressReport) {
  const text = report.text;
  const phase = /from cache/i.test(text) ? 'cached' : /fetch|download/i.test(text) ? 'downloading' : /shader|loading|initializ/i.test(text) ? 'loading' : 'preparing';
  post({ type: 'progress', progress: { phase, percent: Math.min(99, Math.max(0, Math.round(report.progress * 100))), detail: text } });
}

async function load(profile: keyof typeof CHAT_MODELS, assetBase: string) {
  const gpu = scope.navigator.gpu;
  if (!gpu) throw Object.assign(new Error('WebGPU unavailable in this worker.'), { code: 'unsupported' });
  const adapter = await gpu.requestAdapter();
  if (!adapter) throw Object.assign(new Error('No usable GPU adapter.'), { code: 'unsupported' });
  const selected = CHAT_MODELS[profile];
  const modelId = adapter.features.has('shader-f16') ? selected.f16 : selected.f32;
  const original = prebuiltAppConfig.model_list.find(record => record.model_id === modelId);
  if (!original) throw new Error('The configured model is not in this WebLLM version.');
  let record: ModelRecord = { ...original };
  if (CHAT_CONFIG.assetSource === 'self-hosted') {
    const base = new URL(`${modelId}/`, assetBase);
    record = { ...record, model: new URL('weights/', base).href, model_lib: new URL('model.wasm', base).href };
  }
  engine = new MLCEngine({
    initProgressCallback: reportProgress,
    appConfig: { model_list: [record], cacheBackend: 'cache' },
    logLevel: 'ERROR',
  });
  await engine.reload(modelId, { context_window_size: CHAT_CONFIG.contextWindow });
  post({ type: 'ready', modelId });
}

async function generate(request: Extract<ChatRequest, { type: 'generate' }>) {
  if (!engine) throw new Error('Model is not loaded.');
  stopped = false;
  const latest = request.messages[request.messages.length - 1];
  const verified = latest?.role === 'user' && typeof latest.content === 'string' ? (catalogueAnswer(latest.content) || websiteAnswer(latest.content)) : null;
  if (verified) {
    post({ type: 'delta', id: request.id, text: verified });
    post({ type: 'done', id: request.id, stopped: false });
    return;
  }
  const chunks = await engine.chat.completions.create({
    messages: request.messages,
    stream: true,
    max_tokens: CHAT_CONFIG.maxOutputTokens,
    temperature: CHAT_CONFIG.temperature,
    top_p: 0.9,
  });
  let pending = '', lastFlush = 0;
  for await (const chunk of chunks) {
    pending += chunk.choices[0]?.delta.content || '';
    // Batch tiny tokens so React renders at most about 25 times per second.
    if (pending && performance.now() - lastFlush > 40) {
      post({ type: 'delta', id: request.id, text: pending });
      pending = ''; lastFlush = performance.now();
    }
  }
  if (pending) post({ type: 'delta', id: request.id, text: pending });
  post({ type: 'done', id: request.id, stopped });
}

scope.onmessage = async ({ data }) => {
  if (data.type === 'stop') { stopped = true; void engine?.interruptGenerate(); return; }
  if (busy) return;
  busy = true;
  try {
    if (data.type === 'load') await load(data.profile, data.assetBase);
    else if (data.type === 'generate') await generate(data);
    else if (data.type === 'reset') { await engine?.resetChat(); post({ type: 'reset' }); }
    else { await engine?.unload(); engine = null; post({ type: 'unloaded' }); }
  } catch (error) {
    const raw = error instanceof Error ? error.message : String(error);
    const code = (error as { code?: string })?.code || (/context|prompt.*long/i.test(raw) ? 'context' : 'runtime');
    const operation = data.type === 'generate' ? 'generate' : data.type === 'reset' ? 'reset' : data.type === 'unload' ? 'unload' : 'load';
    post({ type: 'error', operation, code, message: friendlyChatError(code, raw), id: data.type === 'generate' ? data.id : undefined });
  } finally { busy = false; }
};
