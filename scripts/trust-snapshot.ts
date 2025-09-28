// Manual script to compute & persist trust snapshots for all users (rudimentary).
// Later: run via cron / Cloud Scheduler hitting an endpoint.
import { getDb } from '@/integrations/members/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { persistTrustScore } from '@/services/trust/score';
import { runWithTrace } from '@/lib/tracing';

/**
 * Optimized trust snapshot job:
 * - Single scan of listings & orders instead of per-user re-queries (previously O(U * (L + O))).
 * - Builds aggregation maps, then batches persistence to avoid Firestore write storm.
 * - Still heuristic: counts all orders for seller (status not filtered yet) & all listings per owner.
 */
async function main() {
  const db = getDb();

  // Fetch all core collections in parallel (could add pagination later if very large).
  const [usersSnap, listingsSnap, ordersSnap] = await Promise.all([
    getDocs(collection(db, 'users')),
    getDocs(collection(db, 'listings')),
    getDocs(collection(db, 'orders')),
  ]);

  const listingCounts = new Map<string, number>();
  for (const d of listingsSnap.docs) {
    const ownerId = (d.data() as any)?.ownerId;
    if (ownerId) listingCounts.set(ownerId, (listingCounts.get(ownerId) || 0) + 1);
  }

  const fulfilledCounts = new Map<string, number>();
  for (const d of ordersSnap.docs) {
    const sellerId = (d.data() as any)?.sellerId;
    if (sellerId) fulfilledCounts.set(sellerId, (fulfilledCounts.get(sellerId) || 0) + 1);
  }

  // Batch persist to limit concurrent writes (tune batchSize if needed).
  const batchSize = 25;
  const tasks: Promise<any>[] = [];
  for (const userDoc of usersSnap.docs) {
    const userId = userDoc.id;
    const listingCount = listingCounts.get(userId) || 0;
    const fulfilledOrders = fulfilledCounts.get(userId) || 0;
    tasks.push(persistTrustScore(userId, { listingCount, fulfilledOrders, disputes: 0, tenureDays: 30 }));
    if (tasks.length >= batchSize) {
      await Promise.allSettled(tasks.splice(0, tasks.length));
    }
  }
  if (tasks.length) await Promise.allSettled(tasks);
}

runWithTrace(main, { span: 'script.trustSnapshots' }).then(() => {
  // eslint-disable-next-line no-console
  console.log('Trust snapshots complete');
}).catch((e: unknown) => {
  // eslint-disable-next-line no-console
  console.error('Trust snapshot script failed', e);
});
