# Groq chatbot for Ecolourà

The active chatbot now uses real generative AI hosted by Groq. The old browser-model download and WebGPU requirement have been removed. The existing design, products, client badges, contact form, catalogue, and WhatsApp features are preserved.

## Activate on Vercel

1. Create a Groq account on https://console.groq.com and stay on the Free plan.
2. Create an API key at https://console.groq.com/keys.
3. In your Vercel project, open **Settings → Environment Variables**. Add `GROQ_API_KEY` with that key as the value for Production (and Preview if you want preview deployments to work). Never use a `VITE_` prefix or put it in frontend code. Do not paste the key into chat.
4. Optional: add `GROQ_MODEL`. The default is `qwen/qwen3.8-27b`, currently listed by Groq. This model uses `reasoning_effort: none` for short, quick business answers. If changing models, confirm the chosen model is available to your Free account.
5. Deploy/redeploy the **whole repository** to Vercel. Framework: Vite; build: `npm run build`; output: `dist`. `vercel.json` configures the serverless API at `/api/chat`. Uploading only `dist` will not deploy that function.
6. Open the deployed site, open the assistant, and ask “Who are your clients?” and a follow-up. No load button or model download is needed. If it says “not configured,” verify the variable is assigned to the correct deployment environment and redeploy.

This changes the original static-only architecture: the pages are static, but AI replies require a Vercel serverless function and Groq. No Express service, database, or separate always-running server is added.

## Architecture and privacy

Browser → same-origin POST `/api/chat` → Vercel function → Groq chat-completions API → streamed text → browser.

The browser sends the question and a bounded selection of completed conversation pairs. The function constructs the trusted system prompt and website context itself, rather than trusting a client-provided system prompt or model. Every submitted question uses Groq for generation; prepared-answer functions are not used in the live chat path.

Display history stays in JavaScript memory, not localStorage or a database. New Chat clears that browser history. The application does not log prompts, answers, or API keys, and responses have `Cache-Control: no-store`. Messages are nevertheless transmitted to Vercel and Groq, as the visible privacy notice states. Clearing browser history cannot retract information already processed by a provider. Avoid sending sensitive information. Groq's provider retention/metadata policies apply; its Data Controls offer Zero Data Retention. See https://console.groq.com/docs/your-data.

The key is read only in `api/chat.ts`, from `GROQ_API_KEY`. It is not included in the Vite build. There are no direct browser requests to Groq and no API keys in browser request bodies.

## Website knowledge and customization

- `src/data/siteData.ts`: clients, FAQs, sample reviews, company/contact facts, enquiry instructions.
- `src/data/productsData.ts`: original catalogue product details and photographs.
- `src/chat/knowledge.ts`: selects relevant website sections and product facts, using the previous user topic for follow-ups.
- `src/chat/websiteAnswers.ts`: website topic sections. Legacy prepared-answer helpers are retained for unit checks but not used to answer live chat requests.
- `src/chat/config.ts`: title, system prompt, 800-character input limit, history and timeout settings. The API uses this prompt on the server.
- `api/chat.ts`: provider model, 256-token reply cap, timeout, validation and streaming. `GROQ_MODEL` overrides only the model on the server.
- `src/chat/LocalChatPanel.tsx`: panel content and controls.
- `src/styles/chatbot.css`: colors, typography, dimensions, mobile layout and animations.

Live stock, exact prices, MOQ, delivery schedules, certificates, and unlisted product availability are not known unless you add verified facts. Sample reviews must not be presented as genuine endorsements. AI can still make mistakes.

## Free limits and endpoint protection

This does not make Groq unlimited or guarantee ongoing free access. Groq currently lists Qwen's Free limits as 1,000 requests/day, 30 requests/minute, 200,000 tokens/day and 8,000 tokens/minute. All visitors share the organization quota, and website context/history count toward tokens. Your account's exact limits are authoritative: https://console.groq.com/docs/rate-limits. Stay on the Free plan if you do not want paid inference. Vercel hosting/function plan limits and costs are separate.

The endpoint accepts only same-origin JSON POSTs, caps body size and history, refuses user-provided system roles, fixes the model/token settings server-side, and applies a best-effort 10-request/minute per-IP limit per function instance. This in-memory limiter is not a global distributed quota, and Origin headers are not authentication. Configure Vercel WAF rate limits on `/api/chat` if public traffic or abuse needs stronger protection. No database is used. Quota failures appear inside the chat with a WhatsApp next step; there is no automatic switch to a paid provider or retry storm.

Stop/close aborts the browser request; Vercel cancellation is enabled and the function aborts the upstream request when cancellation propagates. Requests already processed may still count against provider quota.

## Development and tests

`npm install` and `npm run build` check TypeScript (including the function) and build the frontend. `npm run dev -- --port 3001` previews the website only. Vite/static preview does not execute `/api/chat`; without a Vercel runtime the UI will display an endpoint error if you send a question. For local live AI, use `npx vercel dev`, configure your private local environment through Vercel or `.env.local`, and use the URL it prints. `.env*` files and `.vercel/` are ignored by git, apart from the placeholder `.env.example`.

`npm run test:chat` runs server validation/streaming tests against mocked Groq, browser interaction tests against mocked API responses, and shared website knowledge checks. Verified on 8 October 2026: **13 passed, 1 skipped**, and production build passed. Tests cover no eager API/model request, trusted context/history, credentials staying server-side, quotas, malformed requests, streamed partial output, Stop, New Chat, safe literal HTML/script rendering, mobile viewport without GPU, Escape focus and normal product filtering.

`npm run test:chat:real` additionally requires `GROQ_API_KEY` in the process environment and makes real provider requests, using a small portion of your quota. The live test is skipped without both the key and explicit opt-in. A real Groq call was not run during implementation because no key was configured. Physical iPhone and deployed Vercel function execution have not yet been verified. The interface uses Fetch/ReadableStream rather than WebGPU and should be usable on iOS 16; network/service availability still matters.

## Files

Created: `api/chat.ts`, `vercel.json`, `.env.example`, `src/chat/useGroqChat.ts`, `tests/chat-api.spec.ts`, this guide.

Modified: `src/chat/LocalChatPanel.tsx`, `src/chat/config.ts`, `src/chat/protocol.ts`, `src/chat/websiteAnswers.ts`, `src/components/AIChatbot.tsx`, `tsconfig.json`, package files, `.gitignore`, browser/live tests and the production build.

Removed obsolete browser model runtime: `src/chat/useLocalChat.ts`, `src/chat/llm.worker.ts`, `src/chat/capabilities.ts`, `src/chat/errors.ts`, `scripts/vendor-chat-model.mjs`, WebLLM and WebGPU type dependencies. Earlier local-AI docs/test results describe the superseded implementation, not this Groq deployment.

Official API references: https://console.groq.com/docs/api-reference and https://vercel.com/docs/functions/runtimes/node-js.
