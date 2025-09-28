import { describe, it, expect } from 'vitest';
import { cosineSimilarity } from '@/lib/embeddings';

describe('semantic search utilities', () => {
  it('cosineSimilarity returns higher score for identical vectors', () => {
    const a = [0.1, 0.2, 0.3];
    const b = [0.1, 0.2, 0.3];
    const c = [0.3, -0.2, 0.1];
    expect(cosineSimilarity(a, b)).toBeGreaterThan(cosineSimilarity(a, c));
  });
});
