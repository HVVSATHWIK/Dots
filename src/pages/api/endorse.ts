import type { APIRoute } from 'astro';
import { z } from 'zod';
import { addEndorsementEdge } from '@/services/trust/reputation-edges';
import { runWithTrace } from '@/lib/tracing';
import { getDb } from '@/integrations/members/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { publish } from '@/lib/event-bus';
import { incr, METRIC } from '@/lib/metrics';

const EndorseRequest = z.object({ fromUserId: z.string(), sellerId: z.string(), strength: z.number().min(1).max(5).optional() });

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { fromUserId, sellerId, strength } = EndorseRequest.parse(body);
    if (fromUserId === sellerId) return new Response(JSON.stringify({ ok: false, code: 'SELF_ENDORSE', message: 'Cannot endorse self' }), { status: 400 });
    // Dedupe: if an endorsement from same user already exists (basic scan)
    try {
      const db = getDb();
      const snap = await getDocs(query(collection(db, 'reputationEdges'), where('from', '==', fromUserId), where('to', '==', sellerId), where('kind', '==', 'endorsement')));
      if (snap.size > 0) {
        return new Response(JSON.stringify({ ok: true, deduped: true }), { status: 200 });
      }
    } catch {/* ignore offline */}
    await runWithTrace(async () => { await addEndorsementEdge(fromUserId, sellerId); }, { span: 'api.endorse' });
    incr(METRIC.EVENT_PUBLISHED + ':endorsement.added');
    publish('endorsement.added', { endorserId: fromUserId, sellerId, weight: strength || 1 }).catch(()=>{});
    return new Response(JSON.stringify({ ok: true, weight: strength || 1 }), { status: 200 });
  } catch (e: any) {
    return new Response(JSON.stringify({ ok: false, code: 'ENDORSE_ERROR', message: e?.message || 'Failed' }), { status: 400 });
  }
};
