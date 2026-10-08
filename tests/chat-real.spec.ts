import { test, expect } from '@playwright/test';
import { createChatHandler } from '../api/chat';

test('actual Groq model answers clients and follow-up with website facts', async () => {
  test.skip(process.env.CHAT_REAL_MODEL !== '1' || !process.env.GROQ_API_KEY, 'Requires a server-side GROQ_API_KEY and explicit opt-in.');
  const handler = createChatHandler({ apiKey: process.env.GROQ_API_KEY, model: process.env.GROQ_MODEL });
  const send = async (question: string, history: { role: string; content: string }[] = []) => {
    const response = await handler(new Request('https://ecoloura.example/api/chat', { method: 'POST', headers: { Origin: 'https://ecoloura.example', 'Content-Type': 'application/json' }, body: JSON.stringify({ question, history }) }));
    expect(response.status).toBe(200);
    const events = (await response.text()).trim().split('\n').map(line => JSON.parse(line));
    expect(events.some(event => event.done)).toBe(true);
    return events.map(event => event.text || '').join('');
  };
  const question = 'Who are your healthcare clients?'; const answer = await send(question);
  expect(answer).toContain('Aster'); expect(answer).toContain('KIMS');
  const followup = await send('Which of those is in Perinthalmanna?', [{ role: 'user', content: question }, { role: 'assistant', content: answer }]);
  expect(followup).toContain('KIMS');
});
