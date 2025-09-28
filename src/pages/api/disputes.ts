import type { APIRoute } from 'astro';
import { z } from 'zod';
import { runWithTrace } from '@/lib/tracing';
import { getDb } from '@/integrations/members/firebase';
import { addDoc, collection, doc, updateDoc, getDoc } from 'firebase/firestore';
import { addReputationEdge } from '@/services/trust/reputation-edges';
import { publish } from '@/lib/event-bus';
import { incr, METRIC } from '@/lib/metrics';

const OpenSchema = z.object({ orderId: z.string(), sellerId: z.string(), buyerId: z.string(), reason: z.string().min(3) });
const ResolveSchema = z.object({ id: z.string(), resolution: z.enum(['buyer_favor', 'seller_favor', 'mutual']) });

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = OpenSchema.parse(await request.json());
    const db = getDb();
  const ref = await addDoc(collection(db, 'trustDisputes'), { ...data, status: 'open', openedAt: Date.now() });
  await runWithTrace(async () => { await addReputationEdge(data.orderId, data.sellerId, 'order_fulfilled'); }, { span: 'api.dispute.open' });
  incr(METRIC.EVENT_PUBLISHED + ':dispute.opened');
  publish('dispute.opened', { disputeId: ref.id, sellerId: data.sellerId, orderId: data.orderId }).catch(()=>{});
  return new Response(JSON.stringify({ ok: true, id: ref.id }), { status: 200 });
  } catch (e: any) {
    return new Response(JSON.stringify({ ok: false, code: 'DISPUTE_OPEN_FAIL', message: e?.message || 'Failed' }), { status: 400 });
  }
};

export const PATCH: APIRoute = async ({ request }) => {
  try {
    const data = ResolveSchema.parse(await request.json());
    const db = getDb();
    const disputeRef = doc(db, 'trustDisputes', data.id);
    const snap = await getDoc(disputeRef);
    if (!snap.exists()) return new Response(JSON.stringify({ ok: false, code: 'NOT_FOUND' }), { status: 404 });
    const payload = { status: 'resolved', resolution: data.resolution, resolvedAt: Date.now() };
  await updateDoc(disputeRef, payload);
  // Recompute trust indirectly by adding a zero-weight semantic edge (reuse existing recompute path)
  await runWithTrace(async () => { await addReputationEdge(data.id, (snap.data() as any).sellerId, 'order_fulfilled'); }, { span: 'api.dispute.resolve' });
  return new Response(JSON.stringify({ ok: true, resolved: true }), { status: 200 });
  } catch (e: any) {
    return new Response(JSON.stringify({ ok: false, code: 'DISPUTE_RESOLVE_FAIL', message: e?.message || 'Failed' }), { status: 400 });
  }
};
