import { describe, it, expect } from 'vitest';

// These tests invoke the endpoint module directly. Astro's runtime objects are mocked minimally.

describe('image-generate endpoint', () => {
  it('returns placeholder images without API key', async () => {
  const mod = await import('../src/pages/api/ai/image-generate');
    const body = { prompt: 'handmade ceramic mug', variants: 1 };
    const res = await mod.POST({ request: new Request('http://local/api/ai/image-generate', { method: 'POST', body: JSON.stringify(body) }) } as any);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(Array.isArray(json.images)).toBe(true);
    expect(json.images.length).toBe(1);
    expect(json.fallback).toBeTruthy();
  });
});
