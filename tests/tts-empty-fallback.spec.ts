import { describe, it, expect } from 'vitest';
vi.mock('../src/lib/feature-flags', () => ({ isFlagEnabled: (k: string) => k === 'aiTTS' }));

describe('tts empty fallback', () => {
  it('returns error for missing text', async () => {
    const mod = await import('../src/pages/api/ai/tts');
    const res = await mod.POST({ request: new Request('http://local/api/ai/tts', { method: 'POST', body: JSON.stringify({ }) }) } as any);
    const json = await res.json();
    expect(json.error).toBeTruthy();
  }, 15000);
});
