import { describe, it, expect } from 'vitest';
import { isFlagEnabled, setFlag } from '@/lib/feature-flags';

describe('feature flags advanced', () => {
  it('percent rollout respects boundaries', () => {
    setFlag({ key: 'assistantStreaming', type: 'percent', rolloutPercent: 25 });
    const sample = Array.from({ length: 400 }, (_, i) => isFlagEnabled('assistantStreaming', { userId: 'u'+i }));
    const enabled = sample.filter(Boolean).length;
    const pct = enabled / sample.length;
    expect(pct).toBeGreaterThan(0.15);
    expect(pct).toBeLessThan(0.35);
  });
  it('cohort flag enables only listed users', () => {
    setFlag({ key: 'negotiationBeta', type: 'cohort', cohorts: ['alpha', 'beta'] });
    expect(isFlagEnabled('negotiationBeta', { userId: 'alpha' })).toBe(true);
    expect(isFlagEnabled('negotiationBeta', { userId: 'zzz' })).toBe(false);
  });
});
