// Runtime subscribers registration (side-effect import).
// Wires domain events to reputation edges and future listeners.
import { subscribe } from '@/lib/event-bus';
import { addFulfillmentEdge } from '@/services/trust/reputation-edges';
import { preloadTopSellerTrust, startTrustCacheRefresh, getTrustPreloadState } from '@/lib/embeddings';

// Guard to avoid double registration in edge cases (HMR / test isolation).
let registered = false;
export function registerRuntimeSubscribers() {
  if (registered) return;
  registered = true;
  try {
    subscribe('order.created', async (evt) => {
      const { buyerId, sellerId } = (evt.payload || {}) as any;
      if (buyerId && sellerId) {
        try { await addFulfillmentEdge(buyerId, sellerId); } catch (e) {
          if (import.meta.env.DEV) console.warn('[subscribers] reputation edge failed', (e as any)?.message);
        }
      }
    });
    // Warm trust scores & schedule refresh (guard inside implementation prevents spam)
    preloadTopSellerTrust(50).then(()=> startTrustCacheRefresh()).catch(()=>{});
    if (import.meta.env.DEV) console.log('[startup] subscribers registered & trust preload scheduled');
  } catch (e) {
    if (import.meta.env.DEV) console.warn('[startup] subscriber registration error', (e as any)?.message);
  }
}

// Immediately register on import (side-effect), but keep function exported for testing / HMR clarity.
registerRuntimeSubscribers();

if (import.meta.hot) {
  // Provide quick dev insight into trust preload state after HMR cycles
  setTimeout(() => {
    const st = getTrustPreloadState();
    if (import.meta.env.DEV) console.log('[startup] trust preload state', st);
  }, 2000);
}

export {}; // ensure module treated as ES module with side effects only
