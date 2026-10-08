import React, { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { Sparkles, X } from 'lucide-react';
import '../styles/chatbot.css';

const LocalChatPanel = lazy(() => import('../chat/LocalChatPanel'));
interface Props { open: boolean; onOpen: () => void; onClose: () => void; }

export function AIChatbot({ open, onOpen, onClose }: Props) {
  const [visited, setVisited] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  useEffect(() => { if (open) setVisited(true); }, [open]);
  const close = useCallback(() => { onClose(); trigger.current?.focus(); }, [onClose]);
  return <aside className="local-chat-widget" aria-label="AI assistant">
    {visited && <Suspense fallback={open ? <div className="local-chat-fallback" role="status">Opening assistant…<button onClick={close} aria-label="Close AI assistant"><X size={18} /></button></div> : null}>
      <LocalChatPanel open={open} onClose={close} />
    </Suspense>}
    <button ref={trigger} className={`local-chat-trigger ${open ? 'is-open' : ''}`} aria-label={open ? 'Close AI assistant' : 'Open AI assistant'} aria-expanded={open} aria-controls="local-ai-panel" onClick={open ? close : onOpen}>
      {open ? <X size={21} /> : <Sparkles size={22} />}<span>AI</span>
    </button>
  </aside>;
}
