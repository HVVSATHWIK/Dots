import type { APIRoute } from 'astro';
import { getDb } from '@/integrations/members/firebase';
import { doc, getDoc } from 'firebase/firestore';

function dateKey(ts = Date.now()) { const d = new Date(ts); return d.toISOString().slice(0,10); }

export const GET: APIRoute = async () => {
  try {
    const db = getDb();
    const ref = doc(db, 'metricsDaily', dateKey());
    const snap = await getDoc(ref);
    return new Response(JSON.stringify({ ok: true, data: snap.exists() ? snap.data() : null }), { headers: { 'content-type': 'application/json' } });
  } catch (e: any) {
    return new Response(JSON.stringify({ ok: false, error: e?.message || 'metrics fetch failed' }), { status: 500 });
  }
};
