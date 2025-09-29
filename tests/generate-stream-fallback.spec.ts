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
  },
}));

vi.mock('@/lib/event-bus', () => ({
  publish: vi.fn(),
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

vi.mock('@/services/assistant/fallback', () => ({
  fallbackGenerate: vi.fn(() => 'fallback response'),
}));

describe('generate-stream fallback', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('streams fallback tokens without API key', async () => {
    const mod = await import('../src/pages/api/ai/generate-stream');
    const res = await mod.POST({ request: new Request('http://local/api/ai/generate-stream', { method: 'POST', body: JSON.stringify({ prompt: 'Hello world' }) }) } as any);
    expect(res.status).toBe(200);
    const text = await res.text();
    // Expect at least one token line
    expect(/data: \{.*token/.test(text)).toBe(true);
  }, 10000); // Add timeout
});
