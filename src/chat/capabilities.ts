import { CHAT_MODELS, type ModelProfile } from './config';
import { friendlyChatError } from './errors';

export async function checkLocalAI(profile: ModelProfile) {
  if (!window.isSecureContext) throw Object.assign(new Error(friendlyChatError('insecure')), { code: 'insecure' });
  if (!navigator.gpu || typeof Worker === 'undefined' || typeof WebAssembly === 'undefined') {
    throw Object.assign(new Error(friendlyChatError('unsupported')), { code: 'unsupported' });
  }
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
  if (memory && memory < CHAT_MODELS[profile].minimumDeviceMemoryGB) {
    throw Object.assign(new Error(`This device reports ${memory} GB of memory. ${profile === 'enhanced' ? 'Choose the Compact model, or try a higher-memory device.' : 'Please use a device with at least 4 GB of memory for local AI. You can still contact our team on WhatsApp.'}`), { code: 'memory' });
  }
  const adapter = await navigator.gpu.requestAdapter();
  if (!adapter || adapter.limits.maxStorageBufferBindingSize < 128 * 1024 * 1024) {
    throw Object.assign(new Error(friendlyChatError('unsupported')), { code: 'unsupported' });
  }
  // Browsers do not expose reliable free VRAM; the UI requests explicit consent.
  return { hasF16: adapter.features.has('shader-f16'), memory, mobile: /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || (navigator.maxTouchPoints > 1 && /Macintosh/.test(navigator.userAgent)) };
}
