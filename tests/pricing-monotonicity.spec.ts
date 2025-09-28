import { describe, it, expect } from 'vitest';
import { suggestPrice } from '@/services/pricing/engine';

describe('pricing monotonicity', () => {
  it('higher materialCost never decreases recommendedPrice (holding others constant)', () => {
    const base = suggestPrice({ baseCost: 50, materialCost: 10, laborHours: 1, demandScore: 0.5, rarityScore: 0.5, marginTarget: 0.35, currency: 'INR' });
    const higher = suggestPrice({ baseCost: 50, materialCost: 20, laborHours: 1, demandScore: 0.5, rarityScore: 0.5, marginTarget: 0.35, currency: 'INR' });
    expect(higher.recommendedPrice).toBeGreaterThanOrEqual(base.recommendedPrice);
  });
});