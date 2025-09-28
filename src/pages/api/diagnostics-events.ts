import type { APIRoute } from 'astro';
import { getRecentEvents } from '@/lib/event-bus';

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const limit = Math.min(500, Math.max(1, Number(url.searchParams.get('limit')) || 100));
  const events = getRecentEvents(limit);
  return new Response(JSON.stringify({ ok: true, events }), { headers: { 'content-type': 'application/json' } });
};
