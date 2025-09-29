import { describe, it, expect } from 'vitest';

describe('generate-stream fallback', () => {
  it('streams fallback tokens without API key', async () => {
    const mod = await import('../src/pages/api/ai/generate-stream');
    const res = await mod.POST({ request: new Request('http://local/api/ai/generate-stream', { method: 'POST', body: JSON.stringify({ prompt: 'Hello world' }) }) } as any);
    expect(res.status).toBe(200);
    const text = await res.text();
    // Expect at least one token line
    expect(/data: \{.*token/.test(text)).toBe(true);
  });
});
