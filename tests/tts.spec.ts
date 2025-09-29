import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Firebase to prevent connection issues during tests
vi.mock('@/integrations/members/firebase', () => ({
  getDb: vi.fn(() => {
    throw new Error('Firebase not available in test');
  }),
  hasFirebaseConfig: vi.fn(() => false),
}));

// Mock feature flags to avoid Firebase dependency
vi.mock('@/lib/feature-flags', () => ({
  isFlagEnabled: vi.fn(() => true), // Enable all flags for testing
}));

describe('tts endpoint', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns fallback audio without API key', async () => {
  const mod = await import('../src/pages/api/ai/tts');
    const body = { text: 'Hello artisan world' };
    const res = await mod.POST({ request: new Request('http://local/api/ai/tts', { method: 'POST', body: JSON.stringify(body) }) } as any);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.audio).toBeTruthy();
    expect(json.fallback).toBeTruthy();
    expect(json.audio.b64).toMatch(/^[A-Za-z0-9+/=]+$/);
  }, 20000);
});
