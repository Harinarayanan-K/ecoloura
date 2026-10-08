export function friendlyChatError(code: string, detail = '') {
  if (code === 'unsupported') return 'Your browser does not support the hardware acceleration required for the AI assistant. Please try a recent version of Chrome, Edge, or another WebGPU-compatible browser with hardware acceleration enabled.';
  if (code === 'insecure') return 'Local AI needs a secure connection. Open this website over HTTPS (or localhost when testing).';
  if (code === 'memory' || /out of memory|allocation|insufficient|device lost|device.*removed/i.test(detail)) return 'The device could not reserve enough memory for local AI. Try the Compact model, close other tabs, or use a device with more available memory. No message was sent to an AI server.';
  if (code === 'storage' || /quota|cache|storage/i.test(detail)) return 'The browser could not cache the model. Free some device storage, leave private browsing, or allow site storage, then try again.';
  if (code === 'network' || /fetch|network|download|cors|http/i.test(detail)) return 'The model download could not finish. Check your connection and try again. Previously cached model files can be reused.';
  if (code === 'context' || /context|prompt.*long|token.*limit/i.test(detail)) return 'This conversation is too long for the small local model. Start a New Chat or shorten your question.';
  if (code === 'timeout') return 'The local AI took too long to respond and was stopped. Try loading it again, or choose the Compact model.';
  return 'The local AI encountered a problem. Reload the assistant and try again. You can still browse the site or contact our team.';
}
