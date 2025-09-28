import { describe, it, expect } from 'vitest';
import { suggestPrice } from '@/services/pricing/engine';

describe('pricing engine heuristic', () => {
  it('produces higher price with higher demand', () => {
    const low = suggestPrice({ baseCost: 100, materialCost: 50, demandScore: 0.1, rarityScore: 0.2, laborHours: 1 });
    const high = suggestPrice({ baseCost: 100, materialCost: 50, demandScore: 0.9, rarityScore: 0.2, laborHours: 1 });
    expect(high.recommendedPrice).toBeGreaterThan(low.recommendedPrice);
  });

  it('respects cost floor', () => {
    const res = suggestPrice({ baseCost: 10, materialCost: 5, demandScore: 0.2, rarityScore: 0.2, laborHours: 0 });
    expect(res.minPrice).toBeGreaterThan(10 + 5);
  });
});
