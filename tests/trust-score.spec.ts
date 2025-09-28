import { describe, it, expect } from 'vitest';
import { computeTrustScoreRaw } from '@/services/trust/score';

describe('trust score', () => {
  it('computes higher score with more positive factors', () => {
  const low = computeTrustScoreRaw({ listingCount: 1, fulfilledOrders: 2, recentFulfillments30d: 0, avgFulfillmentMs: 5*24*3600*1000, disputes: 2, tenureDays: 10 });
  const high = computeTrustScoreRaw({ listingCount: 25, fulfilledOrders: 120, recentFulfillments30d: 20, avgFulfillmentMs: 2*24*3600*1000, disputes: 0, tenureDays: 400 });
    expect(high.score).toBeGreaterThan(low.score);
    expect(['bronze','silver','gold','platinum']).toContain(high.grade);
  });
  
  it('higher recent fulfillments increases score', () => {
    // Keep other factors minimal to isolate recent impact
    const base = computeTrustScoreRaw({ listingCount: 0, fulfilledOrders: 0, recentFulfillments30d: 1, disputes: 0, tenureDays: 0, decayedFulfillments: 0 });
    const higherRecent = computeTrustScoreRaw({ listingCount: 0, fulfilledOrders: 0, recentFulfillments30d: 5, disputes: 0, tenureDays: 0, decayedFulfillments: 0 });
    expect(higherRecent.score).toBeGreaterThan(base.score);
  });
  
  it('decayed fulfillments contribute positively but less than raw total for same count', () => {
    const totalOnly = computeTrustScoreRaw({ listingCount: 0, fulfilledOrders: 10, recentFulfillments30d: 0, disputes: 0, tenureDays: 0, decayedFulfillments: 0 });
    const decayedSame = computeTrustScoreRaw({ listingCount: 0, fulfilledOrders: 0, recentFulfillments30d: 0, disputes: 0, tenureDays: 0, decayedFulfillments: 10 });
    expect(decayedSame.score).toBeLessThan(totalOnly.score);
    const zero = computeTrustScoreRaw({ listingCount: 0, fulfilledOrders: 0, recentFulfillments30d: 0, disputes: 0, tenureDays: 0, decayedFulfillments: 0 });
    expect(decayedSame.score).toBeGreaterThan(zero.score);
  });
});
