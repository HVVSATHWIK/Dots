import { describe, it, expect } from 'vitest';
import { applyPricingGuardrails } from '@/services/pricing/guardrails';

describe('pricing guardrails', () => {
  it('raises min to cost floor and recommended to min', () => {
    const r = applyPricingGuardrails({ recommended: 90, min: 50, max: 500, costFloor: 120, currency: 'INR' });
    expect(r.min).toBe(120);
    expect(r.recommended).toBe(120);
    expect(r.max).toBeLessThanOrEqual(120*3);
    expect(r.adjustments.length).toBeGreaterThan(0);
  });
  it('clamps max to 3x recommended', () => {
    const r = applyPricingGuardrails({ recommended: 100, min: 100, max: 1000, costFloor: 80, currency: 'INR' });
    expect(r.max).toBe(300);
  });
});
