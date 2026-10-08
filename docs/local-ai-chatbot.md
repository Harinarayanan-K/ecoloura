> Archived: this browser-AI implementation has been replaced by Groq. See [current setup](groq-chatbot.md). The instructions and tests below describe the former architecture.

# Local AI assistant

The existing site is a React 18 + TypeScript + Vite static frontend. Its entry point is `index.html` → `src/main.tsx` → `src/App.tsx`. Existing styles remain in `src/styles/index.css` and `src/styles/premium.css`; the widget has its own `src/styles/chatbot.css`. No backend, database, API endpoint, AI subscription, or API key was added.

## Architecture and privacy

The small floating launcher is in the normal frontend bundle. The chat panel is dynamically imported only after it is opened. Opening it checks WebGPU and explains the download; **nothing downloads from the model hosts until the visitor explicitly expands “Optional local AI” and clicks “Enable local AI.”** That click creates a dedicated module worker. WebLLM runs its WebAssembly runtime and WebGPU inference there, while the page receives streamed text through worker messages.

Conversation history exists only in JavaScript memory. It is not put in localStorage, IndexedDB, cookies, analytics, telemetry, or any request. Model artifacts use the browser **Cache API**, not a conversation database. New Chat clears the transcript and the engine’s local conversation state. Refreshing the page clears the transcript. Closing the panel stops generation/cancels loading; after three minutes closed, its worker/GPU resources are released. The transcript remains in memory until New Chat or refresh.

The default configuration fetches public model weights/tokenizer files from Hugging Face and the compiled model WASM from MLC’s GitHub repository. These services can see ordinary file-download metadata such as the visitor’s IP address; **they do not receive messages or run inference**. There are no CDN JavaScript imports: WebLLM is pinned and bundled with the static site. The runtime bundle is approximately 6 MB uncompressed and loads only when the model is requested. The initial site JavaScript grew by only a few KB; the chat panel is a separate roughly 19 KB uncompressed chunk.

Generated answers and user messages are rendered as React text nodes, with no Markdown renderer, raw HTML, `dangerouslySetInnerHTML`, `eval`, external tools, or model-generated actions. A model response containing `<script>` remains literal text. There are no secrets to expose. The existing enquiry forms open email/WhatsApp only when a visitor explicitly uses those separate controls; the chatbot cannot send an enquiry or order.

## Models

| Setting | Exact model | First-use download | WebLLM GPU-memory estimate at 4K context |
| --- | --- | --- | --- |
| Default Compact, shader-f16 | `Qwen2.5-0.5B-Instruct-q4f16_1-MLC` | About 300 MB including runtime/tokenizer | 944.62 MB |
| Compact compatibility fallback | `Qwen2.5-0.5B-Instruct-q4f32_1-MLC` | About 300 MB | 1060.20 MB |
| Optional Enhanced, shader-f16 | `Qwen2.5-1.5B-Instruct-q4f16_1-MLC` | About 900 MB | 1629.75 MB |
| Enhanced compatibility fallback | `Qwen2.5-1.5B-Instruct-q4f32_1-MLC` | About 900 MB | 1888.97 MB |

Download estimates include the public model artifacts plus the lazy runtime/library and are approximate. The Compact f16 repository contains 277,996,288 bytes of weight shards and roughly 290 MB of total files; Enhanced f16 is roughly 880 MB before runtime overhead. Host transfer compression and tokenizer files used can change actual transfer. Memory estimates are from the pinned WebLLM model registry, not measurements of free memory. Allow extra system/browser memory and GPU-driver headroom. No browser API reliably reports free VRAM.

Both are instruction-tuned open-weight Qwen models. Compact is deliberately the default for consumer devices; it is less accurate than larger assistants. Enhanced is an explicit choice and is disabled on detected mobile devices. Devices reporting less than 4 GB system memory are blocked for Compact, and less than 8 GB for Enhanced. Unknown memory is not treated as a guarantee: the first-use notice still requires consent. GPU allocation/device failures are caught where the browser permits, but an OS-level tab kill cannot be caught by JavaScript.

Expect initial download/preparation to take seconds to several minutes, depending on connection/device. Subsequent loads can reuse cached assets but still need GPU initialization. Replies stream locally; time to first token and tokens per second depend strongly on hardware, drivers, and prompt length. No throughput guarantee is made.

## Browser requirements

- HTTPS static hosting, or localhost for development. `file://` is not supported for module workers/WebGPU.
- A recent WebGPU-capable browser with hardware acceleration enabled and a usable GPU adapter. Chrome/Edge are the primary tested path; other browsers are accepted when their runtime capabilities pass the checks.
- WebAssembly, module workers, sufficient free RAM/VRAM, and browser storage for model caching.
- WebGPU is checked in both the page and the inference worker. A missing adapter or unsuitable buffer limit produces an in-panel message without breaking the site.
- No CPU fallback: silently running a slow, memory-heavy model via CPU/WASM would be poor mobile UX. WebAssembly is used as part of WebLLM’s WebGPU runtime, not as a separate unsupported-browser inference engine.

Private browsing, blocked storage, cache eviction, network failures, unsupported GPU drivers, and restricted devices can prevent use. Site browsing, PDF downloads, and human contact continue to work.

## Setup and static deployment

The existing build system was reused:

```sh
npm ci
npm run dev -- --host 127.0.0.1 --port 3001
npm run build
```

`npm`/Node are **development/build tools only**. Upload **the contents of `dist/`**, including every `assets/` chunk, images, and downloads, to GitHub Pages, Cloudflare Pages, Netlify, a Vercel static deployment, or any HTTPS static file host. There is no server-side runtime, function, API route, database, or environment secret. For providers with a build step, use `npm run build` and output directory `dist`. For upload-only hosting, build locally once and upload `dist`.

Vite uses a relative base (`./`); public image/catalogue paths now resolve relative to it, including project-subdirectory hosting. The application uses hash links, so no SPA route server is necessary. The worker is emitted as a static JavaScript asset and uses the correct URL relative to its lazy-loaded module.

Static hosting does not mean opening files directly from disk, nor does it mean model files appear without a first download. Internet is needed for uncached files unless they are supplied from the same static host. Once loaded, inference does not need a network connection. Offline page reload is not guaranteed because the whole website is not installed as a PWA.

If configuring CSP, allow this site’s scripts and worker (`script-src 'self' 'wasm-unsafe-eval'; worker-src 'self'`), plus asset `connect-src` for the configured model hosts and any Hugging Face redirect hosts. `unsafe-eval` is not needed. The existing site separately uses Google Fonts; retain its style/font permissions. A root CSP or proxy that blocks model files/CORS will produce a friendly loading error.

## Optional self-hosted model files

WebLLM JavaScript is always bundled locally. To eliminate third-party model downloads as well, vendor the model artifacts during development:

```sh
node scripts/vendor-chat-model.mjs compact f16
node scripts/vendor-chat-model.mjs compact f32
```

This helper is a download script, not a server. It requires no key. It downloads the model’s chat config, tokenizer files, weight manifests/shards, and compatible compiled WASM into:

```text
public/ai-models/<exact-model-id>/weights/
public/ai-models/<exact-model-id>/model.wasm
```

Set `CHAT_CONFIG.assetSource` to `'self-hosted'` in `src/chat/config.ts` and rebuild. Host these files with the rest of `dist`. Both compact precisions are needed to preserve automatic shader-f16 fallback. For Enhanced, repeat with `enhanced f16` and `enhanced f32`, or remove that UI option. Large files can exceed static-host per-file/repository quotas; choose a free host whose limits fit the model shards. Keep model/license notices when redistributing. Public upstream model hosts remain the default to avoid adding hundreds of MB to the repository.

## Customization

- **Model/options:** `src/chat/config.ts`. Change the profile IDs to IDs supported by the pinned WebLLM model registry, update sizes/memory thresholds, and vendor matching assets if self-hosting. `defaultModel` selects the initial profile. The worker prefers f16 when supported and uses f32 otherwise; it never automatically loads a larger model.
- **System prompt:** edit `CHAT_CONFIG.systemPrompt`. It includes explicit instructions not to invent prices, certification, MOQ, materials, reviews, or delivery claims.
- **Website facts:** `src/chat/knowledge.ts`. Verified company/contact facts and up to three relevant product descriptions are selected by a small local keyword match. This is not a RAG backend. Products come from the existing `productsData.ts`. Update facts when the business changes; mock reviews are explicitly not endorsements.
- **UI/title:** `src/chat/LocalChatPanel.tsx`, `src/components/AIChatbot.tsx`, and `src/styles/chatbot.css`. It uses the site’s ivory/forest palette and typography. The AI launcher sits above WhatsApp; opening one closes the other.
- **Performance/history:** `CHAT_CONFIG` controls max output tokens, input length, context size, recent history budget, timeout, and release delay. Older turns remain visible but only recent completed user/assistant pairs fit into the small model context. Partial/stopped/error responses are excluded from future context.

## Accessibility and recovery

The panel has a labelled modeless dialog, status text, progress bar, named controls, a labelled textarea, visible focus states, conversation log, and loading/typing feedback. Enter submits; Shift+Enter adds a newline; composition events are respected. Escape closes the open panel. Focus returns to the launcher. Streaming announcements are held while the log is busy, and motion follows `prefers-reduced-motion`. Automatic scrolling stops when the visitor scrolls up to read older turns.

Download cancellation releases the worker and leaves existing cache files intact. Stop uses WebLLM interruption; a stalled stop falls back to releasing the worker. New Chat clears browser-memory history and resets engine state without downloading the model again. Download/runtime/worker errors are displayed in the panel, with retry where supported. Generation and loading timeouts stop stalled work.

## Validation

See `docs/local-ai-test-results.md` for the actual completed tests and any environment limitations. Tests do not send chatbot messages to an AI provider. This implementation does not substitute mock text for a real model in production.

## Upstream references

- WebLLM worker/caching: https://webllm.mlc.ai/docs/user/advanced_usage.html
- WebLLM streaming: https://webllm.mlc.ai/docs/user/basic_usage.html
- Model registry: https://github.com/mlc-ai/web-llm/blob/main/src/config.ts
- Compact weights: https://huggingface.co/mlc-ai/Qwen2.5-0.5B-Instruct-q4f16_1-MLC
- Qwen model/license: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct

## Files created or modified

Created:

- `src/components/AIChatbot.tsx` — lightweight floating launcher and lazy panel import.
- `src/chat/LocalChatPanel.tsx` — responsive accessible chat UI, messages, controls, privacy notice.
- `src/chat/useLocalChat.ts` — worker lifecycle, loading, streaming, cancellation, history, error recovery.
- `src/chat/llm.worker.ts` — actual WebLLM/WebGPU inference in a dedicated worker.
- `src/chat/config.ts` — model choices, size/memory guidance, system prompt, performance settings.
- `src/chat/protocol.ts` — typed page/worker messages.
- `src/chat/knowledge.ts` — local website facts, small keyword-based product selection, bounded context.
- `src/chat/capabilities.ts` — HTTPS, WebGPU, workers, WASM, buffer and memory checks.
- `src/chat/errors.ts` — friendly error descriptions.
- `src/styles/chatbot.css` — widget styling and reduced-motion behavior.
- `src/lib/publicAsset.ts` — static public-file resolution for root/subdirectory hosting.
- `src/vite-env.d.ts` — compile-time Vite/WebGPU types.
- `scripts/vendor-chat-model.mjs` — optional build-time download helper for self-hosting artifacts.
- `playwright.config.ts` — reproducible static-preview browser-test configuration.
- `tests/chat-ui.spec.ts` — browser UI/error/security/regression checks.
- `tests/chat-real.spec.ts` — opt-in actual GPU/model test.
- `docs/local-ai-chatbot.md` — this setup/customization/deployment guide.
- `docs/local-ai-test-results.md` — actual validation results.
- `.gitignore` — generated tooling, test output, and optional large vendored weights.

Modified:

- `src/App.tsx` — integrate assistant and coordinate it with the existing WhatsApp widget.
- `src/components/RevealImage.tsx` — resolve existing photos correctly under static subdirectories and normalize the React 18 fetch-priority attribute.
- `src/lib/contact.ts` — resolve the existing downloadable catalogue under static subdirectories.
- `vite.config.ts` — relative static base and module-worker output.
- `index.html` — relative favicon/social-image asset paths.
- `package.json`, `package-lock.json` — pinned WebLLM and development-only WebGPU/test dependencies; test commands.
- `dist/` — regenerated static output, including the lazy panel and worker chunks.

Existing original product photos, catalogue content, enquiry handling, client badges, hero visuals, and text/image animations remain in place. No hosting deployment was performed.

## Re-running checks

Install a recent Chrome (the test configuration uses the installed Chrome channel), then:

```sh
npm ci
npm run build
npm run test:chat
```

The ordinary suite uses controlled worker outcomes only to exercise errors, accessibility, and rendering; it skips the real-model test to avoid a surprise 300 MB test download. To explicitly run real inference:

```sh
npm run test:chat:real
```

The real-model test needs an actual WebGPU adapter and first-time model-file network access. It skips with an explicit reason if no GPU is available. Once ready, it blocks external traffic while checking two real responses. On CI without an installed Chrome, use Playwright’s browser installation and update the `channel` setting as appropriate. No API key is needed for any test.

The panel width/position was also verified under a `/ecoloura/` static subdirectory. If placing the page at a nested directory, retain its trailing slash so relative assets resolve as intended.

Simple catalogue questions use verified local product answers before LLM generation (src/chat/catalogueAnswers.ts). This distinguishes listed supply, branding on enquiry, and unknown live stock. These factual replies appear immediately; broader conversations stream from WebLLM. Unlisted toiletries are referred to the team without a sourcing promise. Product context also includes catalogue specifications, MOQ, and lead-time notes. No additional network requests are involved.

Website knowledge now shares `src/data/siteData.ts` with the rendered site: selected clients, FAQs, sample reviews, company facts, contact details, enquiry instructions, and catalogue notes. `src/chat/websiteAnswers.ts` provides verified answers for common business questions and searchable topic sections for broader LLM questions. `src/chat/knowledge.ts` retrieves matching sections and uses the previous user topic for follow-up context. Product details continue to come from `src/data/productsData.ts`. Update these shared files when changing business information; rebuild the static site. No model retraining, backend, embeddings, or database is needed. Client transaction details from the supplied PDF are not included. Unknown stock/prices and mock reviews remain clearly identified. Complex LLM answers can still be mistaken.

Mobile fallback: “Use website help” is available before model loading and after compatibility/loading errors. It answers common website questions using local verified facts, not LLM inference, and does not download a model or create a worker. This is explicitly labelled in status/messages/privacy copy. Normal AI mode remains WebGPU-only. Test mobile AI through HTTPS; an HTTP LAN IP is not a secure context, even when localhost works on the development computer. Physical phone GPU/model loading still depends on the browser/device and is not verified by viewport emulation.

Performance default: the assistant now starts in instant website-help mode, without a GPU check, runtime worker, or model download. Expand Optional local AI and click Enable local AI to download and use generative AI. This preserves local inference as an optional feature while keeping common business answers responsive on older phones. Deploy a new build to Vercel for these changes to reach the live site.
