import { describe, it, expect } from 'vitest';
import { cosineSimilarity } from '@/lib/embeddings';

describe('cosineSimilarity', () => {
  it('equals 1 for identical vectors', () => {
    expect(cosineSimilarity([1,2,3],[1,2,3])).toBeCloseTo(1, 5);
  });
  it('handles orthogonal vectors', () => {
    const sim = cosineSimilarity([1,0],[0,1]);
    expect(sim).toBeCloseTo(0, 5);
  });
});
