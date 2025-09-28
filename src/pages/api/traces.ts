import type { APIRoute } from 'astro';
import { getRecentTraces } from '@/lib/tracing';

export const GET: APIRoute = async () => {
  const traces = getRecentTraces(200);
  return new Response(JSON.stringify({ traces }), { status: 200, headers: { 'content-type': 'application/json' } });
};
