import { describe, it, expect } from 'vitest';
import { getExperimentVariant } from '@/lib/experiments';

function distribution(key: any, users: string[]) {
  const counts: Record<string, number> = {};
  users.forEach(u => { const v = getExperimentVariant(key, u); counts[v] = (counts[v]||0)+1; });
  return counts;
}

describe('experiments bucketing', () => {
  it('is deterministic per user', () => {
    const user = 'user-123';
    const v1 = getExperimentVariant('pricing_elasticity_algo', user);
    const v2 = getExperimentVariant('pricing_elasticity_algo', user);
    expect(v1).toBe(v2);
  });
  it('keeps majority in control at low rolloutPercent', () => {
    const users = Array.from({ length: 500 }, (_, i) => 'u'+i);
    const dist = distribution('pricing_elasticity_algo', users);
    const controlShare = (dist.control || 0) / users.length;
    expect(controlShare).toBeGreaterThan(0.8);
  });
});
