import { useCallback, useEffect, useRef, useState } from 'react';
import { CHAT_CONFIG } from './config';
import type { ChatMessage } from './protocol';

const messageId = () => globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
export function useGroqChat(open: boolean) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const history = useRef<ChatMessage[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const active = useRef<AbortController | null>(null);
  const mounted = useRef(true);
  const update = useCallback((next: ChatMessage[]) => { history.current = next; if (mounted.current) setMessages(next); }, []);
  const stop = useCallback(() => active.current?.abort(), []);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; active.current?.abort(); }; }, []);
  useEffect(() => { if (!open) stop(); }, [open, stop]);

  const send = useCallback((text: string) => {
    const question = text.trim();
    if (!question || question.length > CHAT_CONFIG.maxInputCharacters || active.current) return false;
    const controller = new AbortController(); active.current = controller;
    // Completed pairs only, bound bytes before sending; truncated replies stay visible.
    const pairs: { role: 'user' | 'assistant'; content: string }[][] = [];
    for (let i = 0; i < history.current.length - 1; i++) {
      const user = history.current[i], assistant = history.current[i + 1];
      if (user.role === 'user' && assistant.role === 'assistant') {
        if (!assistant.incomplete && assistant.content.trim()) pairs.push([{ role: 'user', content: user.content }, { role: 'assistant', content: assistant.content }]);
        i++;
      }
    }
    let bytes = 0;
    const recent: typeof pairs = [];
    for (const pair of pairs.slice(-CHAT_CONFIG.maxHistoryPairs).reverse()) {
      const size = new TextEncoder().encode(pair.map(item => item.content).join('\n')).length;
      if (bytes + size > CHAT_CONFIG.historyByteBudget) break;
      recent.unshift(pair); bytes += size;
    }
    const id = messageId();
    update([...history.current, { id: messageId(), role: 'user', content: question }, { id, role: 'assistant', content: '', incomplete: true }]);
    setError(''); setBusy(true);
    let timedOut = false;
    const timeout = setTimeout(() => { timedOut = true; controller.abort(); }, CHAT_CONFIG.generationTimeoutMs);
    void (async () => {
      let complete = false;
      try {
        const response = await fetch(CHAT_CONFIG.endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question, history: recent.flat() }), signal: controller.signal });
        if (!response.ok) {
          let detail = '';
          try { detail = (await response.json()).error || ''; } catch { /* Static previews do not serve /api. */ }
          throw new Error(detail || (response.status === 429 ? 'Our AI allowance is temporarily exhausted. Please try later.' : 'The AI assistant is unavailable. Please try again or contact our team.'));
        }
        if (!response.body || !response.headers.get('content-type')?.includes('application/x-ndjson')) throw new Error('The AI endpoint is unavailable. Please check the Vercel deployment.');
        const reader = response.body.getReader(), decoder = new TextDecoder(); let pending = '';
        try {
          while (true) {
            const { done, value } = await reader.read(); if (done) break;
            pending += decoder.decode(value, { stream: true });
            let newline;
            while ((newline = pending.indexOf('\n')) >= 0) {
              const line = pending.slice(0, newline); pending = pending.slice(newline + 1);
              if (!line.trim()) continue;
              const event = JSON.parse(line);
              if (event.error) throw new Error(event.error);
              if (typeof event.text === 'string') update(history.current.map(item => item.id === id ? { ...item, content: item.content + event.text } : item));
              if (event.done) complete = true;
            }
          }
          if (!complete) throw new Error('The AI response was interrupted. Please try again.');
        } finally { await reader.cancel().catch(() => {}); }
        update(history.current.map(item => item.id === id ? { ...item, incomplete: false } : item));
      } catch (reason) {
        if (mounted.current) setError(controller.signal.aborted ? (timedOut ? 'The AI took too long to respond. Please try again.' : '') : reason instanceof Error ? reason.message : 'Could not connect to AI. Please check your connection.');
      } finally {
        clearTimeout(timeout);
        if (active.current === controller) { active.current = null; if (mounted.current) setBusy(false); }
      }
    })();
    return true;
  }, [update]);
  const newChat = useCallback(() => { if (active.current) return; update([]); setError(''); }, [update]);
  return { messages, busy, error, send, stop, newChat };
}
