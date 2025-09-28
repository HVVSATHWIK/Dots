import { describe, it, expect } from 'vitest';
import { suggestPrice } from '@/services/pricing/engine';

// Baseline pricing spec (alias of pricing-engine coverage) required by strategic blueprint Section 12.
// Ensures heuristic reacts to demand & respects cost floors; acts as guard for future model replacements.

describe('pricing baseline (alias)', () => {
  it('increases recommended price with higher rarity', () => {
    const low = suggestPrice({ baseCost: 100, materialCost: 40, demandScore: 0.5, rarityScore: 0.1, laborHours: 2 });
    const high = suggestPrice({ baseCost: 100, materialCost: 40, demandScore: 0.5, rarityScore: 0.9, laborHours: 2 });
    expect(high.recommendedPrice).toBeGreaterThan(low.recommendedPrice);
  });
  it('never outputs minPrice below sum of base + material', () => {
    const r = suggestPrice({ baseCost: 50, materialCost: 25, demandScore: 0.2, rarityScore: 0.3, laborHours: 0 });
    expect(r.minPrice).toBeGreaterThan(75);
  });
});
