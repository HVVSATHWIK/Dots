import type { APIRoute } from 'astro';
import { snapshotModelCache } from '@/lib/ai-model-router';

export const prerender = false;

export const GET: APIRoute = async () => {
  try {
    // Intentionally avoid exposing the full key. We only provide prefix + length for debug.
    const raw = (import.meta.env.GEMINI_API_KEY as string | undefined) || (process.env.GEMINI_API_KEY as string | undefined);
    const model = (import.meta.env.GEMINI_MODEL as string | undefined) || (process.env.GEMINI_MODEL as string | undefined) || 'gemini-1.5-flash';
  const info = raw ? { present: true, length: raw.length, prefix: raw.slice(0, 6) + '***' } : { present: false };
  const cache = snapshotModelCache();
  return new Response(JSON.stringify({ ok: true, geminiKey: info, model, cache }), { status: 200, headers: { 'content-type': 'application/json' } });
  } catch (e: any) {
    return new Response(JSON.stringify({ ok: false, error: e?.message || 'health-failed' }), { status: 500, headers: { 'content-type': 'application/json' } });
  }
};
