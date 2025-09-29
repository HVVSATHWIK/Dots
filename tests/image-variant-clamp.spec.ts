import { describe, it, expect } from 'vitest';
// Mock flag module to force enable image generation
vi.mock('../src/lib/feature-flags', () => ({ isFlagEnabled: (k: string) => k === 'aiImageGen' }));

describe('image variant clamp', () => {
  it('clamps variant count to max', async () => {
    const mod = await import('../src/pages/api/ai/image-generate');
    const body = { prompt: 'artisan bowl', variants: 99 };
    const res = await mod.POST({ request: new Request('http://local/api/ai/image-generate', { method: 'POST', body: JSON.stringify(body) }) } as any);
    const json = await res.json();
    expect(json.images.length).toBeLessThanOrEqual(3);
  }, 15000);
});
