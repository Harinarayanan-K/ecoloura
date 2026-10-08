/** Build-time asset download only. This is NOT a server.
 * Usage: node scripts/vendor-chat-model.mjs compact f16
 *        node scripts/vendor-chat-model.mjs compact f32
 *        node scripts/vendor-chat-model.mjs enhanced f16
 */
import { prebuiltAppConfig } from '@mlc-ai/web-llm';
import { mkdir, writeFile } from 'node:fs/promises';
import { createWriteStream, existsSync } from 'node:fs';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const profile = process.argv[2] || 'compact';
const precision = process.argv[3] || 'f16';
if (!['compact', 'enhanced'].includes(profile) || !['f16', 'f32'].includes(precision)) {
  throw new Error('Use: node scripts/vendor-chat-model.mjs [compact|enhanced] [f16|f32]');
}
const modelId = `Qwen2.5-${profile === 'compact' ? '0.5' : '1.5'}B-Instruct-q4${precision}_1-MLC`;
const model = prebuiltAppConfig.model_list.find(record => record.model_id === modelId);
if (!model) throw new Error(`Model ${modelId} not found in pinned WebLLM.`);
const root = fileURLToPath(new URL('../', import.meta.url));
const directory = resolve(root, 'public', 'ai-models', modelId);
const weights = resolve(directory, 'weights');
await mkdir(weights, { recursive: true });

async function download(url, destination) {
  // Resume at the file level without overwriting already completed artifacts.
  if (existsSync(destination)) { console.log(`Already present: ${destination}`); return; }
  console.log(`Downloading ${url}`);
  const response = await fetch(url);
  if (!response.ok || !response.body) throw new Error(`HTTP ${response.status}: ${url}`);
  const temporary = `${destination}.partial`;
  await pipeline(Readable.fromWeb(response.body), createWriteStream(temporary));
  const { rename } = await import('node:fs/promises');
  await rename(temporary, destination);
}
const prefix = `${model.model}/resolve/main/`;
await download(`${prefix}mlc-chat-config.json`, resolve(weights, 'mlc-chat-config.json'));
const { readFile } = await import('node:fs/promises');
const config = JSON.parse(await readFile(resolve(weights, 'mlc-chat-config.json'), 'utf8'));
let manifest;
for (const name of ['tensor-cache.json', 'ndarray-cache.json']) {
  await download(`${prefix}${name}`, resolve(weights, name));
  const content = JSON.parse(await readFile(resolve(weights, name), 'utf8'));
  manifest ||= content;
}
const files = new Set([
  ...(config.tokenizer_files || ['tokenizer.json']),
  ...manifest.records.map(record => record.dataPath),
]);
for (const filename of files) {
  if (!/^[a-zA-Z0-9_.-]+$/.test(filename)) throw new Error(`Unexpected artifact path: ${filename}`);
  await download(`${prefix}${filename}`, resolve(weights, filename));
}
await download(model.model_lib, resolve(directory, 'model.wasm'));
await writeFile(resolve(directory, 'source.json'), JSON.stringify({ webllm: '0.2.85', modelId, upstreamModel: model.model, upstreamWasm: model.model_lib }, null, 2));
console.log(`Ready: ${directory}\nSet CHAT_CONFIG.assetSource to 'self-hosted', then rebuild. Download both compact precisions if you want the automatic shader-f16 fallback.`);
