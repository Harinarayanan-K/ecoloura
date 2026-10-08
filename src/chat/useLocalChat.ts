import { useCallback, useEffect, useRef, useState } from 'react';
import { CHAT_CONFIG, type ModelProfile } from './config';
import { checkLocalAI } from './capabilities';
import { completionMessages } from './knowledge';
import { friendlyChatError } from './errors';
import { publicAsset } from '../lib/publicAsset';
import type { ChatMessage, ChatRequest, ChatResponse, ModelProgress } from './protocol';

export type ChatStatus = 'checking' | 'idle' | 'loading' | 'ready' | 'generating' | 'resetting' | 'unsupported' | 'error';
const INITIAL_PROGRESS: ModelProgress = { phase: 'preparing', percent: 0, detail: 'Preparing AI assistant…' };

export function useLocalChat(open: boolean) {
  const [status, setStatusState] = useState<ChatStatus>('checking');
  const statusRef = useRef<ChatStatus>('checking');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const history = useRef<ChatMessage[]>([]);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState<ModelProgress>(INITIAL_PROGRESS);
  const [profile, setProfile] = useState<ModelProfile>(CHAT_CONFIG.defaultModel);
  const [modelId, setModelId] = useState('');
  const [mobile, setMobile] = useState(false);
  const worker = useRef<Worker | null>(null);
  const generation = useRef<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  const epoch = useRef(0);
  const mounted = useRef(true);
  const [stopping, setStopping] = useState(false);
  const statusUpdate = useCallback((next: ChatStatus) => { statusRef.current = next; if (mounted.current) setStatusState(next); }, []);
  const updateHistory = useCallback((next: ChatMessage[] | ((previous: ChatMessage[]) => ChatMessage[])) => {
    const result = typeof next === 'function' ? next(history.current) : next;
    history.current = result;
    if (mounted.current) setMessages(result);
  }, []);
  const clearTimer = useCallback(() => { if (timer.current) clearTimeout(timer.current); timer.current = undefined; }, []);
  const post = (request: ChatRequest) => worker.current?.postMessage(request);

  const release = useCallback(() => {
    clearTimer(); epoch.current++; generation.current = null;
    const previous = worker.current; worker.current = null;
    if (previous) {
      // Give an idle engine a chance to destroy GPU resources; always terminate.
      const terminateTimer = setTimeout(() => previous.terminate(), 1000);
      previous.onmessage = (event: MessageEvent<ChatResponse>) => {
        if (event.data.type === 'unloaded') { clearTimeout(terminateTimer); previous.terminate(); }
      };
      previous.onerror = null;
      previous.postMessage({ type: 'unload' } satisfies ChatRequest);
    }
  }, [clearTimer]);

  useEffect(() => {
    mounted.current = true;
    let active = true;
    checkLocalAI(CHAT_CONFIG.defaultModel).then(info => {
      if (active) { setMobile(info.mobile); statusUpdate('idle'); }
    }).catch(reason => {
      if (active) { setError(reason.message); statusUpdate(reason.code === 'memory' ? 'error' : 'unsupported'); }
    });
    return () => { active = false; mounted.current = false; release(); };
  }, [release, statusUpdate]);

  const fail = useCallback((message: string) => {
    const id = generation.current;
    if (id) updateHistory(previous => previous.map(item => item.id === id ? { ...item, incomplete: true } : item));
    release(); setError(message); setStopping(false); statusUpdate('error');
  }, [release, statusUpdate, updateHistory]);

  const start = useCallback(async () => {
    if (['loading', 'generating', 'resetting', 'checking', 'ready'].includes(statusRef.current)) return;
    release(); const currentEpoch = epoch.current;
    setError(''); setStopping(false); setProgress(INITIAL_PROGRESS); statusUpdate('loading');
    timer.current = setTimeout(() => fail(friendlyChatError('timeout')), CHAT_CONFIG.loadingTimeoutMs);
    try {
      const info = await checkLocalAI(profile);
      if (!mounted.current || currentEpoch !== epoch.current) return;
      setMobile(info.mobile);
      const instance = new Worker(new URL('./llm.worker.ts', import.meta.url), { type: 'module', name: 'ecoloura-local-ai' });
      worker.current = instance;
      instance.onmessage = ({ data }: MessageEvent<ChatResponse>) => {
        if (!mounted.current || worker.current !== instance) return;
        if (data.type === 'progress') setProgress(data.progress);
        else if (data.type === 'ready') { clearTimer(); setModelId(data.modelId); setProgress({ phase: 'loading', percent: 100, detail: 'AI assistant ready.' }); statusUpdate('ready'); }
        else if (data.type === 'delta' && data.id === generation.current) updateHistory(previous => previous.map(item => item.id === data.id ? { ...item, content: item.content + data.text } : item));
        else if (data.type === 'done' && data.id === generation.current) {
          clearTimer(); generation.current = null;
          updateHistory(previous => previous.map(item => item.id === data.id ? { ...item, content: item.content || (data.stopped ? 'Generation stopped.' : 'I could not produce a response. Please try another question.'), incomplete: data.stopped } : item));
          setStopping(false); statusUpdate('ready');
        } else if (data.type === 'reset') { clearTimer(); statusUpdate('ready'); }
        else if (data.type === 'error') {
          if (data.code === 'context') {
            clearTimer(); generation.current = null;
            updateHistory(previous => previous.map(item => item.id === data.id ? { ...item, incomplete: true } : item));
            setError(data.message); setStopping(false); statusUpdate('ready');
          } else fail(data.message);
        }
      };
      instance.onerror = event => { event.preventDefault(); fail('The browser could not run the local AI worker. Try a recent browser, or reload the assistant.'); };
      instance.onmessageerror = () => fail('The local AI worker could not read a message. Please reload the assistant.');
      instance.postMessage({ type: 'load', profile, assetBase: new URL(publicAsset(`${CHAT_CONFIG.localAssetDirectory}/`), window.location.href).href } satisfies ChatRequest);
    } catch (reason) {
      if (currentEpoch !== epoch.current || !mounted.current) return;
      const issue = reason as { code?: string; message?: string };
      fail(issue.code ? issue.message || friendlyChatError(issue.code) : friendlyChatError('runtime', issue.message));
      if (issue.code === 'unsupported' || issue.code === 'insecure') statusUpdate('unsupported');
    }
  }, [profile, clearTimer, fail, release, statusUpdate, updateHistory]);

  const send = useCallback((text: string) => {
    const question = text.trim();
    if (!question || question.length > CHAT_CONFIG.maxInputCharacters || statusRef.current !== 'ready' || !worker.current) return false;
    const id = crypto.randomUUID();
    const context = completionMessages(history.current, question);
    generation.current = id; setError(''); setStopping(false); statusUpdate('generating');
    updateHistory(previous => [...previous, { id: crypto.randomUUID(), role: 'user', content: question }, { id, role: 'assistant', content: '', incomplete: true }]);
    timer.current = setTimeout(() => fail(friendlyChatError('timeout')), CHAT_CONFIG.generationTimeoutMs);
    post({ type: 'generate', id, messages: context });
    return true;
  }, [fail, statusUpdate, updateHistory]);

  const stop = useCallback(() => {
    if (statusRef.current !== 'generating') return;
    setStopping(true); post({ type: 'stop' }); clearTimer();
    timer.current = setTimeout(() => fail('Generation was cancelled. Load the assistant again to continue; your conversation is still here.'), 12_000);
  }, [clearTimer, fail]);

  const cancel = useCallback(() => {
    release(); setError(''); setStopping(false); setProgress(INITIAL_PROGRESS); statusUpdate('idle');
  }, [release, statusUpdate]);

  const newChat = useCallback(() => {
    if (statusRef.current === 'generating' || statusRef.current === 'loading' || statusRef.current === 'resetting') return;
    updateHistory([]); setError('');
    if (worker.current && statusRef.current === 'ready') {
      statusUpdate('resetting'); post({ type: 'reset' });
      timer.current = setTimeout(() => fail('The local conversation could not reset. Load the assistant again.'), 10_000);
    }
  }, [fail, statusUpdate, updateHistory]);

  useEffect(() => {
    if (open) return;
    if (statusRef.current === 'loading') cancel();
    else if (statusRef.current === 'generating') stop();
    const idleTimer = setTimeout(() => {
      if (worker.current) { release(); setStopping(false); statusUpdate('idle'); }
    }, CHAT_CONFIG.releaseAfterCloseMs);
    return () => clearTimeout(idleTimer);
  }, [open, cancel, stop, release, statusUpdate]);

  return { status, messages, progress, error, profile, setProfile, modelId, mobile, stopping, start, send, stop, cancel, newChat };
}
