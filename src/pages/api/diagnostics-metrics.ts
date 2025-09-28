import type { APIRoute } from 'astro';
import { snapshotCounters } from '@/lib/metrics';
import { getTrustCacheStats } from '@/lib/embeddings';

export const GET: APIRoute = async () => {
  const counters = snapshotCounters();
  const trust = getTrustCacheStats();
  return new Response(JSON.stringify({ ok: true, counters, trust }), { headers: { 'content-type': 'application/json' } });
};
