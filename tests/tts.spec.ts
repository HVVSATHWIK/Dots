import { describe, it, expect } from 'vitest';

describe('tts endpoint', () => {
  it('returns fallback audio without API key', async () => {
  const mod = await import('../src/pages/api/ai/tts');
    const body = { text: 'Hello artisan world' };
    const res = await mod.POST({ request: new Request('http://local/api/ai/tts', { method: 'POST', body: JSON.stringify(body) }) } as any);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.audio).toBeTruthy();
    expect(json.fallback).toBeTruthy();
    expect(json.audio.b64).toMatch(/^[A-Za-z0-9+/=]+$/);
  }, 15000);
});
