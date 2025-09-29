import type { APIRoute } from 'astro';
import { snapshotCounters } from '@/lib/metrics';
import { snapshotModelCache } from '@/lib/ai-model-router';
import { snapshotMediaCacheMeta } from '@/lib/media-cache';
import { snapshotRateLimiter } from '@/lib/rate-limit';

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  const token = request.headers.get('x-metrics-token');
  const expected = (import.meta.env.METRICS_TOKEN as string | undefined) || (process.env.METRICS_TOKEN as string | undefined);
  if (!expected || token !== expected) {
    return json({ error: 'unauthorized' }, 401);
  }
  return json({
    counters: snapshotCounters(),
    models: snapshotModelCache(),
    mediaCache: snapshotMediaCacheMeta(),
    rate: snapshotRateLimiter(),
    ts: Date.now()
  });
};

function json(obj: any, status = 200) { return new Response(JSON.stringify(obj), { status, headers: { 'content-type': 'application/json' } }); }
