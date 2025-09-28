import { describe, it, expect } from 'vitest';
import { publish, subscribe, registerMiddleware, handlerCount } from '@/lib/event-bus';

// Ensure middleware order and metrics increment side-effects do not throw.

describe('event bus v2', () => {
  it('invokes middleware then handlers', async () => {
    const order: string[] = [];
    registerMiddleware(async (_evt, next) => { order.push('mw1'); await next(); order.push('mw1.after'); });
    registerMiddleware(async (_evt, next) => { order.push('mw2'); await next(); order.push('mw2.after'); });
    let handled = false;
    subscribe('listing.created', (e) => { handled = true; order.push('handler'); expect(e.payload.listingId).toBe('x'); });
    await publish('listing.created', { listingId: 'x', ownerId: 'o1' });
    expect(handled).toBe(true);
    expect(order).toEqual(['mw1','mw2','handler','mw2.after','mw1.after']);
    expect(handlerCount('listing.created')).toBeGreaterThan(0);
  });
});
