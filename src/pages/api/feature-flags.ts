import type { APIRoute } from 'astro';
import { getAllFlags, setFlag, loadFlagsOnce } from '@/lib/feature-flags';

export const GET: APIRoute = async () => {
  await loadFlagsOnce();
  return new Response(JSON.stringify({ flags: getAllFlags() }), { status: 200, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
  const { key, value, rolloutPercent, cohorts, type } = body || {};
  if (!key) return new Response(JSON.stringify({ error: 'Missing key' }), { status: 400 });
  const patch: any = { key };
  if (typeof value === 'boolean') patch.value = value;
  if (typeof rolloutPercent === 'number') patch.rolloutPercent = rolloutPercent;
  if (Array.isArray(cohorts)) patch.cohorts = cohorts;
  if (type) patch.type = type; // trust caller; merging with existing definition
  setFlag(patch);
    return new Response(JSON.stringify({ ok: true, flags: getAllFlags() }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || 'Bad Request' }), { status: 400 });
  }
};

export const prerender = false;
