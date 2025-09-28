import { describe, it, expect } from 'vitest';
import { hybridSearchListings } from '@/lib/embeddings';
import type { Listing } from '@/entities/schemas';

const listings: Listing[] = [
  { id: '1', title: 'Walnut coffee table', description: 'Handmade dark walnut modern design', price: 300, ownerId: 'u1' },
  { id: '2', title: 'Ceramic vase', description: 'Minimalist white matte finish', price: 80, ownerId: 'u2' },
  { id: '3', title: 'Walnut side table', description: 'Compact table matching coffee table', price: 150, ownerId: 'u1' }
];

describe('hybrid search', () => {
  it('ranks similar lexical items higher for query (lexical fallback)', async () => {
    const res = await hybridSearchListings('walnut table', listings, 3);
    expect(res.length).toBeGreaterThan(0);
    const top = res[0];
    expect(['1','3']).toContain(top.refId);
  }, 5000);
});