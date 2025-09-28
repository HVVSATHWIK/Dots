import { describe, it, expect } from 'vitest';
import { WishlistItemSchema } from '@/entities/schemas';

describe('WishlistItemSchema', () => {
  it('valid item parses', () => {
    const parsed = WishlistItemSchema.parse({ id: 'p1', name: 'Art Piece', price: 100 });
    expect(parsed.name).toBe('Art Piece');
  });
  it('rejects negative price', () => {
    expect(() => WishlistItemSchema.parse({ id: 'p2', name: 'Bad', price: -1 })).toThrow();
  });
});
