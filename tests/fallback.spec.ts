import { describe, it, expect } from 'vitest';
import { classifyFallbackIntent, FallbackIntent, FallbackChatMessage } from '@/services/assistant/fallback';

function u(content: string): FallbackChatMessage { return { role: 'user', content }; }

describe('fallback classifyFallbackIntent', () => {
  it('detects greeting', () => {
    const { intent } = classifyFallbackIntent([u('hi')]);
    expect(intent).toBe(FallbackIntent.Greeting);
  });
  it('detects services', () => {
    const { intent } = classifyFallbackIntent([u('what services do you provide')]);
    expect(intent).toBe(FallbackIntent.Services);
  });
  it('detects pottery misspelling', () => {
    const { intent } = classifyFallbackIntent([u('how is potterry pricing?')]);
    expect(intent).toBe(FallbackIntent.Pottery);
  });
  it('detects pricing', () => {
    const { intent } = classifyFallbackIntent([u('need pricing help for a macrame wall hanging')]);
    expect(intent).toBe(FallbackIntent.Pricing);
  });
  it('marks vague short input', () => {
    const { intent } = classifyFallbackIntent([u('tags?')]);
    expect([FallbackIntent.Vague, FallbackIntent.Tags]).toContain(intent); // could evolve
  });
});