import { describe, it, expect, beforeEach } from 'vitest';
import { hybridSearchListings } from '@/lib/embeddings';
import type { Listing } from '@/entities/schemas';

// We rely on the in-memory edge-cache implementation. Each test uses distinct ownerIds to avoid interference.

const baseListings: Listing[] = [
  { id: 'l1', title: 'Oak chair', description: 'sturdy oak seating', price: 50, ownerId: 'sellerA' },
  { id: 'l2', title: 'Pine desk', description: 'light pine writing desk', price: 120, ownerId: 'sellerB' },
];

async function api() {
  const mod: any = await import('@/lib/embeddings');
  return mod;
}

describe('trust cache', () => {
  beforeEach(async () => {
    const mod = await api();
    mod.__resetTrustCacheStats();
  });

  it('hit recorded when cached trust present', async () => {
    const mod = await api();
    // Seed sellerA trust so first lookup is a hit, sellerB remains miss
    mod.__seedTrustCache('sellerA', 80);
    const before = mod.getTrustCacheStats();
    await hybridSearchListings('oak chair', baseListings, 5);
    const after = mod.getTrustCacheStats();
    expect(after.hits).toBe(before.hits + 1); // sellerA hit
    expect(after.misses).toBe(before.misses + 1); // sellerB miss
  });

  it('bypass forces misses even if cache seeded', async () => {
    const mod = await api();
    mod.__seedTrustCache('sellerA', 90);
    const before = mod.getTrustCacheStats();
    await hybridSearchListings('oak chair', baseListings, 5, { bypassCache: true });
    const after = mod.getTrustCacheStats();
    // Both sellers treated as misses due to bypass
    expect(after.misses).toBe(before.misses + 2);
    expect(after.hits).toBe(before.hits); // no new hits
  });
});
