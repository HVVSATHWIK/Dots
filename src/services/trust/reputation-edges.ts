import { getDb } from '@/integrations/members/firebase';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { incr, METRIC } from '@/lib/metrics';
import { runWithTrace } from '@/lib/tracing';
import { isFlagEnabled } from '@/lib/feature-flags';
import { persistTrustScore } from './score';

export interface ReputationEdge { from: string; to: string; weight: number; kind: 'order_fulfilled' | 'endorsement'; at: number; }

export async function addReputationEdge(fromUserId: string, toSellerId: string, kind: ReputationEdge['kind'] = 'order_fulfilled') {
  if (!isFlagEnabled('reputationEdges')) return;
  return runWithTrace(async () => {
    const db = getDb();
    const edge: ReputationEdge = { from: fromUserId, to: toSellerId, weight: 1, kind, at: Date.now() };
    await addDoc(collection(db, 'reputationEdges'), edge);
    try {
      const now = Date.now();
      const cutoff30 = now - 30 * 24 * 3600 * 1000;
      const decayTau = 45 * 24 * 3600 * 1000;
      const [edgesSnap, listingsSnap, ordersSnap, disputesSnap] = await Promise.all([
        getDocs(query(collection(db, 'reputationEdges'), where('to', '==', toSellerId))),
        getDocs(query(collection(db, 'listings'), where('ownerId', '==', toSellerId))),
        getDocs(query(collection(db, 'orders'), where('sellerId', '==', toSellerId))),
        getDocs(query(collection(db, 'trustDisputes'), where('sellerId', '==', toSellerId)))
      ]);
      let fulfilledOrders = 0; let recentFulfillments30d = 0; let decayedSum = 0; let endorsements = 0;
      const endorsementSet = new Set<string>();
      edgesSnap.docs.forEach(d => {
        const data: any = d.data();
        const at: number = data.at || 0;
        if (data.kind === 'order_fulfilled') fulfilledOrders++;
        if (data.kind === 'endorsement' && data.from) endorsementSet.add(data.from);
        if (at >= cutoff30 && data.kind === 'order_fulfilled') recentFulfillments30d++;
        if (data.kind === 'order_fulfilled') {
          const age = Math.max(0, now - at);
          decayedSum += Math.exp(-age / decayTau);
        }
      });
      endorsements = endorsementSet.size;
      // Latency (avg) from last 50 fulfilled orders with fulfilledAt timestamp
      let totalLatency = 0; let latencyCount = 0;
      ordersSnap.docs.map(d => d.data() as any)
        .filter(o => typeof o.fulfilledAt === 'number' && typeof o.date === 'number')
        .sort((a,b) => b.fulfilledAt - a.fulfilledAt)
        .slice(0, 50)
        .forEach(o => {
          const dt = o.fulfilledAt - o.date;
            if (dt > 0) { totalLatency += dt; latencyCount++; }
        });
      const avgFulfillmentMs = latencyCount ? Math.round(totalLatency / latencyCount) : undefined;
  const listingCount = listingsSnap.size;
  let openDisputes = 0; let totalDisputes = 0;
  disputesSnap.docs.forEach(d => { const data: any = d.data(); if (data) { totalDisputes++; if (data.status === 'open') openDisputes++; } });
      await persistTrustScore(toSellerId, {
        listingCount,
        fulfilledOrders,
        recentFulfillments30d,
        decayedFulfillments: Math.round(decayedSum * 100) / 100,
  disputes: openDisputes + Math.max(0, Math.round((totalDisputes - openDisputes) * 0.3)),
        tenureDays: 30,
        avgFulfillmentMs,
        endorsementsCount: endorsements,
      });
      incr(METRIC.TRUST_RECOMPUTE);
    } catch (e) {
      if (import.meta.env.DEV) console.warn('[trust] incremental recompute failed', (e as any)?.message);
    }
    return edge;
  }, { span: 'reputation.edge.add', metaStart: { fromUserId, toSellerId, kind } });
}

export async function recordDispute(sellerId: string, orderId: string, reason: string) {
  if (!isFlagEnabled('reputationEdges')) return;
  return runWithTrace(async () => {
    const db = getDb();
    await addDoc(collection(db, 'trustDisputes'), { sellerId, orderId, reason, at: Date.now(), status: 'open' });
    await addReputationEdge(orderId, sellerId, 'order_fulfilled'); // triggers recompute (semantic reuse)
    return { ok: true };
  }, { span: 'trust.dispute.record', metaStart: { sellerId } });
}

export const addFulfillmentEdge = (buyerId: string, sellerId: string) => addReputationEdge(buyerId, sellerId, 'order_fulfilled');
export const addEndorsementEdge = (endorserId: string, sellerId: string) => addReputationEdge(endorserId, sellerId, 'endorsement');