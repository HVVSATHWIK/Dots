import type { APIRoute } from 'astro';
import { listExperiments, getExperimentVariant } from '@/lib/experiments';
import { getCurrentUserIdOptional } from '@/lib/server-auth';

// Returns experiment definitions and (if user) assigned variant for each.
export const GET: APIRoute = async ({ request }) => {
  try {
    const userId = await getCurrentUserIdOptional?.(request).catch(() => undefined);
    const defs = listExperiments();
    const experiments = defs.map(def => ({
      key: def.key,
      variants: def.variants,
      rolloutPercent: def.rolloutPercent ?? 0,
      variant: userId ? getExperimentVariant(def.key, userId) : 'control'
    }));
    return new Response(JSON.stringify({ experiments }), { status: 200, headers: { 'content-type': 'application/json' } });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: true, message: err?.message || 'experiments fetch failed' }), { status: 500 });
  }
};
