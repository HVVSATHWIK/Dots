import type { APIRoute } from 'astro';
import { getTrustCacheStats, hybridSearchListings } from '@/lib/embeddings';
import { listAllListings } from '@/lib/firestore-repo';

// Optional: if bypass=1, trigger a hybrid search with cache bypass to force misses for diagnostic.
export const GET: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const bypass = url.searchParams.get('bypass') === '1';
    if (bypass) {
      const listings = await listAllListings();
      // Use a tiny query token to invoke trust fetch path; focus on side effect not relevance.
      await hybridSearchListings('a', listings.slice(0, 10), 5, { bypassCache: true });
    }
    return new Response(JSON.stringify({ stats: getTrustCacheStats(), bypass }), { status: 200, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || 'Error' }), { status: 500 });
  }
};

export const prerender = false;
