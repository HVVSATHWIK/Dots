import type { APIRoute } from 'astro';

const jobs: Record<string, any> = (globalThis as any).__GEN3D_JOBS__ || {};

export const GET: APIRoute = async ({ params }) => {
  const id = params.id as string;
  const job = jobs[id];
  if (!job) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });
  return new Response(JSON.stringify(job), { status: 200, headers: { 'content-type': 'application/json' } });
};

export const prerender = false;
