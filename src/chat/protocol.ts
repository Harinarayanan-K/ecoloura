import type { ModelProfile } from './config';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  incomplete?: boolean;
}
export interface ModelProgress {
  phase: 'preparing' | 'downloading' | 'cached' | 'loading';
  percent: number;
  detail: string;
}
export type ChatRequest =
  | { type: 'load'; profile: ModelProfile; assetBase: string }
  | { type: 'generate'; id: string; messages: { role: 'system' | 'user' | 'assistant'; content: string }[] }
  | { type: 'stop' }
  | { type: 'reset' }
  | { type: 'unload' };
export type ChatResponse =
  | { type: 'progress'; progress: ModelProgress }
  | { type: 'ready'; modelId: string }
  | { type: 'delta'; id: string; text: string }
  | { type: 'done'; id: string; stopped: boolean }
  | { type: 'reset' }
  | { type: 'unloaded' }
  | { type: 'error'; operation: 'load' | 'generate' | 'reset' | 'unload'; code: string; message: string; id?: string };
