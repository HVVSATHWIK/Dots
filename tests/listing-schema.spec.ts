import { describe, it, expect } from 'vitest';
import { ListingSchema } from '@/entities/schemas';

describe('ListingSchema', () => {
  it('accepts a valid listing', () => {
    const parsed = ListingSchema.parse({
      id: 'abc',
      title: 'Handmade Vase',
      price: 1200,
      ownerId: 'user1',
      images: ['https://example.com/img1.jpg'],
    });
    expect(parsed.title).toBe('Handmade Vase');
  });

  it('rejects negative price', () => {
    expect(() => ListingSchema.parse({ id: 'x', title: 'Bad', price: -5, ownerId: 'u' })).toThrow();
  });
});
