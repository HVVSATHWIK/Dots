import { describe, it, expect } from 'vitest';
import { OrderSchema } from '@/entities/schemas';

describe('OrderSchema', () => {
  it('valid order parses', () => {
    const parsed = OrderSchema.parse({
      id: 'o1',
      date: Date.now(),
      status: 'new',
      total: 500,
      buyerId: 'b1',
      items: [{ name: 'Item', price: 100, quantity: 2 }],
    });
    expect(parsed.total).toBe(500);
  });

  it('requires at least one item', () => {
    expect(() => OrderSchema.parse({ id: 'o2', date: Date.now(), status: 'x', total: 0, buyerId: 'b1', items: [] })).toThrow();
  });
});
