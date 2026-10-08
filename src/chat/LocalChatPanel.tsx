import React, { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, LoaderCircle, RotateCcw, Send, ShieldCheck, Square, X } from 'lucide-react';
import { CHAT_CONFIG, CHAT_MODELS } from './config';
import { useLocalChat } from './useLocalChat';
import type { ModelProfile } from './config';

interface Props { open: boolean; onClose: () => void; }

export default function LocalChatPanel({ open, onClose }: Props) {
  const chat = useLocalChat(open);
  const [input, setInput] = useState('');
  const panel = useRef<HTMLElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const composer = useRef<HTMLTextAreaElement>(null);
  const end = useRef<HTMLDivElement>(null);
  const scrollArea = useRef<HTMLDivElement>(null);
  const follow = useRef(true);
  const busy = chat.status === 'generating';
  const ready = chat.status === 'ready';
  const loading = chat.status === 'loading';
  const model = CHAT_MODELS[chat.profile];

  useEffect(() => {
    if (!open) return;
    closeButton.current?.focus();
    const key = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.stopPropagation(); onClose(); }
    };
    document.addEventListener('keydown', key);
    return () => document.removeEventListener('keydown', key);
  }, [open, onClose]);
  useEffect(() => {
    if (ready && open) composer.current?.focus();
  }, [ready, open]);
  useEffect(() => {
    if (open && follow.current) end.current?.scrollIntoView({ block: 'end', behavior: 'instant' });
  }, [chat.messages, chat.status, open]);

  const send = (value = input) => {
    follow.current = true;
    if (chat.send(value)) setInput('');
  };
  const newChat = () => { chat.newChat(); setInput(''); follow.current = true; };
  const stateLabel = busy ? (chat.stopping ? 'Stopping…' : 'Replying on your device') : ready ? 'AI assistant ready' : loading ? 'Preparing local AI' : chat.status === 'checking' ? 'Checking browser' : chat.status === 'resetting' ? 'Starting a new chat' : chat.status === 'unsupported' ? 'WebGPU unavailable' : chat.status === 'error' ? 'Assistant needs attention' : 'Ready when you are';
  const loadingLabel = chat.progress.phase === 'downloading' ? `Preparing your assistant · ${chat.progress.percent}%` : chat.progress.phase === 'cached' ? `Getting ready · ${chat.progress.percent}%` : chat.progress.phase === 'loading' ? 'Almost ready…' : 'Preparing AI assistant…';

  return <section ref={panel} className="local-chat-panel" id="local-ai-panel" role="dialog" aria-modal="false" aria-labelledby="local-ai-title" hidden={!open}>
    <header className="local-chat-header">
      <div><span className="local-chat-kicker">THOUGHTFUL HELP, ON YOUR DEVICE</span><h2 id="local-ai-title">{CHAT_CONFIG.title}</h2>
        <p className="local-chat-status" role="status"><span className={`local-chat-dot ${ready || busy ? 'is-ready' : ''}`} aria-hidden="true" />{stateLabel}</p></div>
      <button ref={closeButton} className="local-chat-icon-button" onClick={onClose} aria-label="Close AI assistant"><X size={19} /></button>
    </header>
    <div className="local-chat-tools"><span>Private, browser-only AI</span><button onClick={newChat} disabled={loading || busy || chat.status === 'resetting'}><RotateCcw size={13} /> New Chat</button></div>
    <div ref={scrollArea} className="local-chat-conversation" onScroll={() => {
      const area = scrollArea.current;
      if (area) follow.current = area.scrollHeight - area.scrollTop - area.clientHeight < 80;
    }}>
      {!ready && !busy && chat.status !== 'resetting' && <div className="local-chat-welcome">
        <span className="eyebrow">A LITTLE HELP, PRIVATELY</span><h3>Ask about your<br /><em>next great welcome.</em></h3>
        <p>I can help with our amenities, custom branding, and how to enquire. The AI runs on your device.</p>
        {chat.status === 'checking' && <p className="local-chat-checking"><LoaderCircle size={15} className="local-chat-spinner" /> Checking WebGPU support…</p>}
        {(chat.status === 'idle' || chat.status === 'error') && <div className="local-chat-download">
          <p className="local-chat-first-use">A one-time download of about <strong>{model.downloadMB} MB</strong> lets you chat privately on your device. It may take a few minutes; your browser can save it for next time.</p>
          <button className="premium-button" onClick={() => void chat.start()}>{chat.status === 'error' ? 'Try again' : 'Start chatting'} <ArrowUpRight size={15} /></button>
          <details className="local-chat-options">
            <summary>AI settings &amp; device requirements</summary>
            <label htmlFor="local-ai-model">Choose a model</label>
            <select id="local-ai-model" value={chat.profile} onChange={event => chat.setProfile(event.target.value as ModelProfile)}>
              <option value="compact">{CHAT_MODELS.compact.label}</option><option value="enhanced" disabled={chat.mobile}>{CHAT_MODELS.enhanced.label}{chat.mobile ? ' · desktop only' : ''}</option>
            </select>
            <p>Allow {model.gpuMemoryGB} of GPU memory, plus browser memory. Available GPU memory cannot be measured reliably.</p>
            {chat.mobile && <p>Compact is recommended for mobile. Use Wi-Fi and close memory-heavy tabs.</p>}
          </details>
        </div>}
        {loading && <div className="local-chat-loading">
          <p role="status"><LoaderCircle className="local-chat-spinner" size={16} />{loadingLabel}</p>
          <progress max={100} value={chat.progress.percent} aria-label={loadingLabel} />
          <small>{chat.progress.phase === 'downloading' ? 'Saving the assistant to your browser.' : 'Preparing private chat on your device.'}</small>
          <p>You can keep browsing while we get things ready.</p>
          <button className="local-chat-small-button" onClick={chat.cancel}>Cancel loading</button>
        </div>}
      </div>}
      {chat.error && <div className="local-chat-error" role="alert">{chat.error}</div>}
      {(ready || busy) && chat.messages.length === 0 && <div className="local-chat-ready-intro"><h3>How can I help?</h3><p>Try a question about your property’s guest essentials.</p><div>{['What amenities do you supply?', 'Can you add our hotel logo?', 'How do I request a quotation?'].map(question => <button key={question} onClick={() => send(question)} disabled={!ready}>{question}<ArrowUpRight size={13} /></button>)}</div></div>}
      <div className="local-chat-messages" role="log" aria-label="AI conversation" aria-live="polite" aria-relevant="additions text" aria-busy={busy}>
        {chat.messages.map(message => <article key={message.id} className={`local-chat-message local-chat-message-${message.role}`}>
          <span className="local-chat-message-label">{message.role === 'user' ? 'You' : 'Ecolourà AI'}</span>
          {/* React text nodes only: never render model/user content as HTML. */}
          {message.content ? <p>{message.content}</p> : busy ? <p className="local-chat-typing" aria-label="Assistant is thinking"><span /><span /><span /></p> : <p>Response interrupted. Please try again.</p>}
          {message.incomplete && message.content && !busy && <small>Partial response</small>}
        </article>)}
      </div>
      <div ref={end} />
    </div>
    {(ready || busy || chat.messages.length > 0) && <form className="local-chat-composer" onSubmit={event => { event.preventDefault(); send(); }}>
      <label className="local-chat-sr-only" htmlFor="local-ai-input">Message the AI assistant</label>
      <textarea id="local-ai-input" ref={composer} value={input} onChange={event => setInput(event.target.value)} rows={2} maxLength={CHAT_CONFIG.maxInputCharacters} disabled={!ready} placeholder={ready ? 'Ask about our amenities…' : 'Your conversation will start here…'} onKeyDown={event => {
        if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); send(); }
      }} />
      <div className="local-chat-composer-bottom"><span>{input.length}/{CHAT_CONFIG.maxInputCharacters} · Shift+Enter for a new line</span>{busy ? <button type="button" className="local-chat-send" onClick={chat.stop} disabled={chat.stopping}><Square size={12} /> Stop</button> : <button type="submit" className="local-chat-send" disabled={!ready || !input.trim()}><Send size={14} /> Send</button>}</div>
    </form>}
    <footer className="local-chat-privacy"><ShieldCheck size={13} /><p>AI runs locally in your browser. Your messages are not sent to our server. AI can make mistakes; confirm order details with our team.</p></footer>
    {chat.modelId && <span className="local-chat-sr-only">Loaded model: {chat.modelId}</span>}
  </section>;
}
