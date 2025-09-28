import type { APIRoute } from 'astro';
import { getDb } from '@/integrations/members/firebase';
import { doc, getDoc } from 'firebase/firestore';

function dateKey(ts = Date.now()) { const d = new Date(ts); return d.toISOString().slice(0,10); }

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const days = Math.min(30, Math.max(1, Number(url.searchParams.get('days')) || 7));
  const out: any[] = [];
  try {
    const db = getDb();
    for (let i=0;i<days;i++) {
      const ts = Date.now() - i*24*3600*1000;
      const ref = doc(db, 'metricsDaily', dateKey(ts));
      const snap = await getDoc(ref);
      out.push({ day: dateKey(ts), data: snap.exists() ? snap.data() : null });
    }
    return new Response(JSON.stringify({ ok: true, days: out }), { headers: { 'content-type': 'application/json' } });
  } catch (e: any) {
    return new Response(JSON.stringify({ ok: false, error: e?.message || 'history fetch failed' }), { status: 500 });
  }
};
