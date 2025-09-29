import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getLatestTrustScoreMap } from '@/lib/embeddings';
import type { Listing } from '@/entities/schemas';

// Mock Firebase to prevent connection issues during tests
vi.mock('@/integrations/members/firebase', () => ({
  getDb: vi.fn(() => {
    // Return a mock database that doesn't actually connect
    return {
      collection: vi.fn(() => ({})),
    };
  }),
  hasFirebaseConfig: vi.fn(() => true),
}));

// Mock Firestore functions to avoid real database calls
vi.mock('firebase/firestore', () => ({
  collection: vi.fn(() => ({})),
  query: vi.fn(() => ({})),
  where: vi.fn(() => ({})),
  orderBy: vi.fn(() => ({})),
  getDocs: vi.fn(() => Promise.resolve({ docs: [] })), // Return empty docs to simulate no trust data
}));

async function api() {
  const mod: any = await import('@/lib/embeddings');
  return mod;
}

describe('trust cache', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    const mod = await api();
    mod.__resetTrustCacheStats();
  });

  it('hit recorded when cached trust present', async () => {
    const mod = await api();
    
    // Seed sellerA trust so first lookup is a hit, sellerB remains miss
    mod.__seedTrustCache('sellerA', 80);
    const before = mod.getTrustCacheStats();
    
    // Directly test the trust score map function
    await getLatestTrustScoreMap(['sellerA', 'sellerB']);
    
    const after = mod.getTrustCacheStats();
    expect(after.hits).toBe(before.hits + 1); // sellerA hit
    expect(after.misses).toBe(before.misses + 1); // sellerB miss
  });

  it('bypass forces misses even if cache seeded', async () => {
    const mod = await api();
    
    mod.__seedTrustCache('sellerA', 90);
    const before = mod.getTrustCacheStats();
    
    // Test with bypass cache option
    await getLatestTrustScoreMap(['sellerA', 'sellerB'], { bypassCache: true });
    
    const after = mod.getTrustCacheStats();
    // Both sellers treated as misses due to bypass
    expect(after.misses).toBe(before.misses + 2);
    expect(after.hits).toBe(before.hits); // no new hits
  });
});
