import type { APIRoute } from 'astro';
import { listAllListings, getListing } from '@/lib/firestore-repo';
import { ensureListingEmbeddings, semanticSearchListings } from '@/lib/embeddings';

// POST (preferred) body: { query: string, limit?: number, hydrate?: boolean }
// GET alternative: /api/search-listings?query=...&limit=5

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const q = url.searchParams.get('query') || '';
  const limit = parseInt(url.searchParams.get('limit') || '5', 10);
  return runSearch(q, limit);
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json().catch(() => ({}));
    const query = (body.query || '').toString();
    const limit = Number(body.limit) || 5;
    return runSearch(query, limit);
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || 'Bad Request' }), { status: 400 });
  }
};

async function runSearch(query: string, limit: number) {
  if (!query || query.trim().length < 2) {
    return new Response(JSON.stringify({ error: 'Query too short' }), { status: 400 });
  }
  const listings = await listAllListings();
  await ensureListingEmbeddings(listings.slice(0, 200)); // limit embedding generation burst
  const scored = await semanticSearchListings(query, limit);
  const hydrated = [] as any[];
  for (const s of scored) {
    const listing = await getListing(s.refId);
    if (listing) hydrated.push({ listing, score: Number(s.score.toFixed(4)) });
  }
  return new Response(JSON.stringify({ query, count: hydrated.length, results: hydrated }), {
    status: 200,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}

export const prerender = false; // ensure this is always an SSR / dynamic endpoint
