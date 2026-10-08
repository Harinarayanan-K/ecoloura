import React, { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, RotateCcw, Send, ShieldCheck, Square, X } from 'lucide-react';
import { CHAT_CONFIG } from './config';
import { useGroqChat } from './useGroqChat';

interface Props { open: boolean; onClose: () => void; }
export default function LocalChatPanel({ open, onClose }: Props) {
  const chat = useGroqChat(open);
  const [input, setInput] = useState('');
  const closeButton = useRef<HTMLButtonElement>(null);
  const composer = useRef<HTMLTextAreaElement>(null);
  const end = useRef<HTMLDivElement>(null);
  const follow = useRef(true);
  useEffect(() => {
    if (!open) return;
    composer.current?.focus();
    const key = (event: KeyboardEvent) => { if (event.key === 'Escape') { event.stopPropagation(); onClose(); } };
    document.addEventListener('keydown', key);
    return () => document.removeEventListener('keydown', key);
  }, [open, onClose]);
  useEffect(() => { if (open && follow.current) end.current?.scrollIntoView({ block: 'end', behavior: 'instant' }); }, [chat.messages, chat.busy, open]);
  const send = (value = input) => { follow.current = true; if (chat.send(value)) setInput(''); };
  const newChat = () => { chat.newChat(); setInput(''); follow.current = true; composer.current?.focus(); };
  return <section className="local-chat-panel" id="local-ai-panel" role="dialog" aria-modal="false" aria-labelledby="local-ai-title" hidden={!open}>
    <header className="local-chat-header"><div><span className="local-chat-kicker">THOUGHTFUL HELP, FOR YOUR PROPERTY</span><h2 id="local-ai-title">{CHAT_CONFIG.title}</h2><p className="local-chat-status" role="status"><span className="local-chat-dot is-ready" aria-hidden="true" />{chat.busy ? 'AI is replying…' : 'AI assistant ready'}</p></div><button ref={closeButton} className="local-chat-icon-button" onClick={onClose} aria-label="Close AI assistant"><X size={19} /></button></header>
    <div className="local-chat-tools"><span>Powered by Groq · no model download</span><button onClick={newChat} disabled={chat.busy}><RotateCcw size={13} /> New Chat</button></div>
    <div className="local-chat-conversation" onScroll={event => { const area = event.currentTarget; follow.current = area.scrollHeight - area.scrollTop - area.clientHeight < 80; }}>
      {chat.messages.length === 0 && <div className="local-chat-ready-intro"><h3>How can I help?</h3><p>Ask about our amenities, branding, clients, or your next order.</p><div>{['What amenities do you supply?', 'Who are your clients?', 'Can you add our hotel logo?'].map(question => <button key={question} onClick={() => send(question)}>{question}<ArrowUpRight size={13} /></button>)}</div></div>}
      <div className="local-chat-messages" role="log" aria-label="AI conversation" aria-live="polite" aria-relevant="additions text" aria-busy={chat.busy}>
        {chat.messages.map(message => <article key={message.id} className={`local-chat-message local-chat-message-${message.role}`}><span className="local-chat-message-label">{message.role === 'user' ? 'You' : 'Ecolourà AI'}</span>
          {/* Render untrusted user and model output only as React text nodes. */}
          {message.content ? <p>{message.content}</p> : chat.busy ? <p className="local-chat-typing" aria-label="Assistant is thinking"><span /><span /><span /></p> : <p>Response interrupted. Please try again.</p>}
          {message.incomplete && message.content && !chat.busy && <small>Partial response</small>}
        </article>)}
      </div>
      {chat.error && <div className="local-chat-error" role="alert">{chat.error}</div>}<div ref={end} />
    </div>
    <form className="local-chat-composer" onSubmit={event => { event.preventDefault(); send(); }}><label className="local-chat-sr-only" htmlFor="local-ai-input">Message the AI assistant</label><textarea id="local-ai-input" ref={composer} value={input} onChange={event => setInput(event.target.value)} rows={2} maxLength={CHAT_CONFIG.maxInputCharacters} disabled={chat.busy} placeholder="Ask about our amenities…" onKeyDown={event => { if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); send(); } }} /><div className="local-chat-composer-bottom"><span>{input.length}/{CHAT_CONFIG.maxInputCharacters} · Shift+Enter for a new line</span>{chat.busy ? <button type="button" className="local-chat-send" onClick={chat.stop}><Square size={12} /> Stop</button> : <button type="submit" className="local-chat-send" disabled={!input.trim()}><Send size={14} /> Send</button>}</div></form>
    <footer className="local-chat-privacy"><ShieldCheck size={13} /><p>Messages and recent conversation are sent through our website to Groq to generate AI replies. Avoid sharing sensitive information. AI can make mistakes; confirm order details with our team.</p></footer>
  </section>;
}
