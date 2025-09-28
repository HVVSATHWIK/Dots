// Event Bus v2 - in-memory (dev/runtime) with typed events, middleware, and metrics
import { incr, METRIC } from '@/lib/metrics';

export interface EventMap {
  'listing.created': { listingId: string; ownerId: string };
  'listing.updated': { listingId: string; changed: string[] };
  'order.created': { orderId: string; sellerId: string; buyerId: string; total: number };
  'trust.score.updated': { sellerId: string; score: number };
  'price.suggested': { listingId: string; recommended: number; currency: string };
  'assistant.interaction': { mode: string; userId?: string };
  'endorsement.added': { endorserId: string; sellerId: string; weight: number };
  'dispute.opened': { disputeId: string; sellerId: string; orderId: string };
  'generation.requested': { kind: string; userId?: string };
}

export type EventName = keyof EventMap;
export interface BusEvent<K extends EventName = EventName> { name: K; payload: EventMap[K]; ts: number; meta?: Record<string, any>; }
type Handler<K extends EventName = EventName> = (evt: BusEvent<K>) => void | Promise<void>;
type Middleware = (evt: BusEvent, next: () => Promise<void>) => Promise<void>;

const handlers: { [K in EventName]: Handler<K>[] } = {
  'listing.created': [],
  'listing.updated': [],
  'order.created': [],
  'trust.score.updated': [],
  'price.suggested': [],
  'assistant.interaction': [],
  'endorsement.added': [],
  'dispute.opened': [],
  'generation.requested': [],
};
const middleware: Middleware[] = [];

// Lightweight diagnostics ring buffer (in-memory, non-persistent)
const RING_CAP = 200;
const ring: BusEvent[] = [];
function pushRing(evt: BusEvent) {
  ring.push(evt);
  if (ring.length > RING_CAP) ring.splice(0, ring.length - RING_CAP);
}
export function getRecentEvents(limit = 100) {
  const slice = ring.slice(-limit);
  return slice.reverse(); // newest first
}

export function subscribe<K extends EventName>(name: K, fn: Handler<K>) {
  (handlers[name] as Handler<K>[]).push(fn);
  return () => {
    const arr = handlers[name] as Handler<K>[];
    const idx = arr.indexOf(fn); if (idx >= 0) arr.splice(idx, 1);
  };
}

export function registerMiddleware(fn: Middleware) { middleware.push(fn); }

export async function publish<K extends EventName>(name: K, payload: EventMap[K], meta?: Record<string, any>) {
  const evt: BusEvent<K> = { name, payload, ts: Date.now(), meta };
  const runHandlers = async () => {
    const list = (handlers[name] as Handler<K>[]).slice();
    for (const h of list) {
      try { await h(evt); } catch (e) { if (import.meta.env.DEV) console.warn('[event-bus] handler error', name, (e as any)?.message); }
    }
  };
  let idx = -1;
  const runner = async (): Promise<void> => {
    idx++;
    if (idx < middleware.length) {
      await middleware[idx](evt, runner);
    } else {
      await runHandlers();
    }
  };
  // Always push to diagnostics ring before middleware chain for visibility even if middleware errors
  pushRing(evt);
  await runner();
  incr(METRIC.EVENT_PUBLISHED + ':' + name);
  return evt;
}

export function handlerCount(name: EventName) { return handlers[name].length; }