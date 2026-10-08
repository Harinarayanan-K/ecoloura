# Local AI validation — 8 October 2026

Tests were run on the built **static** site, served locally for verification. The runtime was not replaced with a mock for the real-inference checks.

## Real WebGPU / model test

Installed Chrome, headless mode, actual WebGPU adapter with `shader-f16`; the browser reported 16 GB device memory. Default model: `Qwen2.5-0.5B-Instruct-q4f16_1-MLC`.

| Check | Observed result |
| --- | --- |
| Website page load | No model host, compiled model WASM, or worker requests |
| Opening panel | First-use notice and explicit Load button; no model-host requests |
| Initial download | Actual model loaded successfully; progress included 36% and downloaded MB |
| Readiness | Exact default model loaded; input enabled |
| Streaming | Response began with `Your` and expanded progressively into the final sentence |
| First reply | `Your contact email is ecolourahotelsuppliers@gmail.com.` |
| Follow-up/history | Model correctly repeated the email from the previous turn |
| Privacy/network trace | Zero network requests during either response; external asset requests were GET with no request bodies |
| New Chat | Transcript cleared; model stayed loaded |
| Stop | Actual generation interrupted; partial response marked and excluded from later context |
| Close/reopen | Panel hid and restored the in-memory transcript |
| Mobile 390 × 844 | Panel fit inside viewport; no horizontal page overflow |
| Browser runtime errors | None |

## Cache and offline-inference check

A second browser launch reused the same temporary browser profile/cache:

- Cache API entries present: `webllm/config`, `webllm/wasm`, `webllm/model`.
- Cached model became ready in approximately **1.5 seconds** on the test device.
- **Zero weight-shard network requests** on the cached load.
- After loading, external requests were blocked. The actual model still streamed a response to a question about toothbrush/toothpaste amenities.

This confirms network-independent inference after loading; it does not claim the whole website is installed for offline page reload. Cache eviction, private browsing, and different origins may require downloads again.

## Saved regression suite

`npm run build` passed TypeScript checking and static production bundling.

`npm run test:chat`: **7 passed, 1 explicitly skipped**. The skipped test is the opt-in real-model test; the real-model checks above were executed separately, not skipped.

The saved ordinary tests cover:

- No eager runtime/model loading; existing nine products still render.
- Missing WebGPU: friendly message; existing product filtering still works.
- Known 2 GB device: blocked before any model worker starts.
- Progress, loading cancellation, failed download, and successful retry.
- Enter to send and Shift+Enter for a newline.
- Streaming/history and New Chat without another model load.
- Literal malicious-looking user/model output: no `<script>` or `<img>` is inserted; no injected code executes.
- Generation failures and Stop keep the website usable.
- Mobile geometry, Escape, focus restoration, and mutual exclusion with WhatsApp.

Controlled worker responses in the ordinary suite simulate failure/edge cases only. The production implementation always runs WebLLM. Additional standalone browser checks verified email/WhatsApp/PDF functions earlier in this project; this change preserves those paths.

## Limits of validation

- Actual inference was tested on one macOS/Chrome GPU device, not all supported browsers or physical phones.
- The f32 fallback, Enhanced 1.5B model, and optional self-hosted artifact mode are configured and documented but were not downloaded/executed in this validation run.
- Known low memory and browser errors are tested as controlled scenarios. A real OS/browser termination caused by severe memory pressure cannot be caught or guaranteed away.
- Model accuracy is limited. A small model can omit details or hallucinate despite the system prompt; order details should be confirmed with the team.
- No external hosting account was deployed to; deployment output is the static `dist/` folder.

## Static subdirectory hosting

A separate static preview was mounted at `/ecoloura/` to simulate a project-style hosting path. Product images resolved under `/ecoloura/assets/images/`, the catalogue link was relative, the lazy chat panel opened, Escape closed it, and there were no failed network requests. No route/API backend was needed.
