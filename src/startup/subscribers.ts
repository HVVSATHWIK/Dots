// Runtime subscribers registration (side-effect import).
// Wires domain events to reputation edges and future listeners.
import { subscribe } from '@/lib/event-bus';
import { addFulfillmentEdge } from '@/services/trust/reputation-edges';
import { preloadTopSellerTrust, startTrustCacheRefresh } from '@/lib/embeddings';

// Guard to avoid double registration in edge cases (HMR / test isolation).
let registered = false;
if (!registered) {
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
  // Warm trust scores & schedule refresh
  preloadTopSellerTrust(50).then(()=> startTrustCacheRefresh()).catch(()=>{});
  if (import.meta.env.DEV) console.log('[startup] subscribers registered & trust preload scheduled');
  } catch (e) {
    if (import.meta.env.DEV) console.warn('[startup] subscriber registration error', (e as any)?.message);
  }
}

export {}; // ensure module treated as ES module with side effects only
