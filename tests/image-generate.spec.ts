import { describe, it, expect, beforeEach, vi } from 'vitest';

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

// Mock all modules that might cause hanging
vi.mock('@/lib/metrics', () => ({
  incr: vi.fn(),
  METRIC: {
    ASSISTANT_RUN: 'assistant.run',
    IMAGE_CACHE_HIT: 'image.cache.hit',
    IMAGE_CACHE_MISS: 'image.cache.miss',
    MODEL_SUCCESS_PREFIX: 'model.success',
    MODEL_FAIL_PREFIX: 'model.fail',
  },
}));

vi.mock('@/lib/event-bus', () => ({
  publish: vi.fn(),
}));

vi.mock('@/lib/media-cache', () => ({
  createMediaCacheKey: vi.fn(() => 'test-key'),
  getCachedImage: vi.fn(() => null),
  setCachedImage: vi.fn(),
}));

vi.mock('@/lib/rate-limit', () => ({
  consumeRate: vi.fn(() => true),
}));

vi.mock('@/lib/ai-model-router', () => ({
  selectModels: vi.fn(() => ({
    candidates: ['gemini-2.5-flash'],
    override: false,
    cached: false,
  })),
  recordModelSuccess: vi.fn(),
}));

vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: vi.fn(),
}));

// These tests invoke the endpoint module directly. Astro's runtime objects are mocked minimally.

describe('image-generate endpoint', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns placeholder images without API key', async () => {
    const mod = await import('../src/pages/api/ai/image-generate');
    const body = { prompt: 'handmade ceramic mug', variants: 1 };
    const res = await mod.POST({ request: new Request('http://local/api/ai/image-generate', { method: 'POST', body: JSON.stringify(body) }) } as any);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(Array.isArray(json.images)).toBe(true);
    expect(json.images.length).toBe(1);
    expect(json.fallback).toBeTruthy();
  }, 20000); // Increase timeout to 20 seconds
});
