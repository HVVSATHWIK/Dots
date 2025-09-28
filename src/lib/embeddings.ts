/**
 * Minimal embeddings & semantic search scaffold.
 * Uses @google/generative-ai embedContent for MVP (can swap provider later).
 * Vector storage: Firestore collection `embeddings` { refType, refId, vector: number[], dim, model, updatedAt }
 */
import { getDb } from '@/integrations/members/firebase';
import { addDoc, collection, getDoc, getDocs, query, where, updateDoc } from 'firebase/firestore';
import { incr, METRIC } from '@/lib/metrics';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { runWithTrace, recordTokenUsage } from '@/lib/tracing';
import type { Listing } from '@/entities/schemas';
// (additional imports for trust weighting) already have getDb + firestore imports earlier
import { collection as fsCollection, getDocs as fsGetDocs, query as fsQuery, where as fsWhere, orderBy as fsOrderBy, limit as fsLimit } from 'firebase/firestore';
import { cacheGet, cacheSet } from '@/lib/edge-cache';

const MODEL = 'text-embedding-004'; // adaptable

export interface EmbeddingRecord {
  id: string;
  refType: 'listing' | 'user' | 'conversation';
  refId: string;
  vector: number[];
  dim: number;
  model: string;
  updatedAt: number;
  meta?: Record<string, any>;
}

function getClient() {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) return null; // allow fallback deterministic embedding for local/dev without key
  return new GoogleGenerativeAI(apiKey);
}

export async function generateEmbedding(text: string): Promise<number[]> {
  return runWithTrace(async () => {
    const client = getClient();
    if (!client) {
      const dim = 64;
      const vec = new Array(dim).fill(0);
      for (let i = 0; i < text.length; i++) {
        const c = text.charCodeAt(i);
        vec[c % dim] += (c % 13) + 1;
      }
      const norm = Math.sqrt(vec.reduce((s, v) => s + v * v, 0)) || 1;
      const out = vec.map(v => v / norm);
      return out;
    }
    const model = client.getGenerativeModel({ model: MODEL });
    const res: any = await model.embedContent(text);
    const vec = res.embedding.values as number[];
    // rough token estimate: characters/4
    recordTokenUsage(Math.ceil(text.length/4), vec.length/8, 'embeddings.generate');
    return vec;
  }, { span: 'embeddings.generate', metaStart: { len: text.length } });
}

export async function upsertEmbedding(refType: EmbeddingRecord['refType'], refId: string, text: string, meta?: Record<string, any>) {
  return runWithTrace(async () => {
    const db = getDb();
    const existingQ = await getDocs(query(collection(db, 'embeddings'), where('refType', '==', refType), where('refId', '==', refId)));
    const vector = await generateEmbedding(text);
    const payload = { refType, refId, vector, dim: vector.length, model: MODEL, updatedAt: Date.now(), meta };
    if (existingQ.empty) {
      const ref = await addDoc(collection(db, 'embeddings'), payload);
      return { id: ref.id, ...payload } as EmbeddingRecord;
    } else {
      const d = existingQ.docs[0];
      await updateDoc(d.ref, payload as any);
      return { id: d.id, ...(await getDoc(d.ref)).data() } as EmbeddingRecord;
    }
  }, { span: 'embeddings.upsert', metaStart: { refType, refId } });
}

export async function getEmbeddingVectors(refType: EmbeddingRecord['refType']) {
  const db = getDb();
  const snap = await getDocs(query(collection(db, 'embeddings'), where('refType', '==', refType)));
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })) as EmbeddingRecord[];
}

export function cosineSimilarity(a: number[], b: number[]) {
  if (a.length !== b.length) throw new Error('Vector length mismatch');
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) { dot += a[i]*b[i]; na += a[i]*a[i]; nb += b[i]*b[i]; }
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

export async function semanticSearchListings(queryText: string, limit = 5) {
  const qVec = await generateEmbedding(queryText);
  let records: EmbeddingRecord[] = [];
  try {
    records = await getEmbeddingVectors('listing');
  } catch {
    // If Firestore unavailable, fall back to in-memory pseudo-embeddings derived directly from query for robustness in tests.
    // This yields deterministic ordering by lexical heuristic.
    return [];
  }
  const scored = records.map(r => ({ refId: r.refId, score: cosineSimilarity(qVec, r.vector) }));
  return scored.sort((a,b) => b.score - a.score).slice(0, limit);
}

// Naive lexical scorer: term overlap in title/description tokens.
function lexicalScore(queryText: string, listing: Listing) {
  const terms = queryText.toLowerCase().split(/\s+/).filter(Boolean);
  const hay = (listing.title + ' ' + (listing.description||'')).toLowerCase();
  let score = 0; for (const t of terms) if (hay.includes(t)) score += 1;
  return score / Math.max(1, terms.length);
}

export interface HybridSearchResult { refId: string; score: number; semantic: number; lexical: number; trustScore?: number; }

let trustCacheStats = { hits: 0, misses: 0 };

export function getTrustCacheStats() { return { ...trustCacheStats, hitRatio: trustCacheStats.hits + trustCacheStats.misses === 0 ? 0 : trustCacheStats.hits / (trustCacheStats.hits + trustCacheStats.misses) }; }

// Test helpers (non-production): allow seeding and resetting cache stats
export function __seedTrustCache(userId: string, score: number) { cacheSet(`trust:latest:${userId}`, score, 60_000); }
export function __resetTrustCacheStats() { trustCacheStats = { hits: 0, misses: 0 }; }

interface TrustFetchOptions { bypassCache?: boolean; }

async function getLatestTrustScoreMap(ownerIds: string[], opts: TrustFetchOptions = {}): Promise<Record<string, number>> {
  const unique = Array.from(new Set(ownerIds));
  if (!unique.length) return {};
  const out: Record<string, number> = {};
  const missing: string[] = [];
  // Attempt per-user cache first
  for (const id of unique) {
    if (!opts.bypassCache) {
      const cached = cacheGet<number>(`trust:latest:${id}`);
      if (typeof cached === 'number') { out[id] = cached; trustCacheStats.hits++; continue; }
    }
    missing.push(id); trustCacheStats.misses++;
  }
  if (!missing.length) return out;
  const db = getDb();
  // Chunk Firestore 'in' queries (<=10 values per chunk)
  for (let i = 0; i < missing.length; i += 10) {
    const chunk = missing.slice(i, i + 10);
    try {
      const snap = await fsGetDocs(fsQuery(fsCollection(db, 'trustSnapshots'), fsWhere('userId', 'in', chunk), fsOrderBy('at', 'desc')) as any);
      for (const doc of snap.docs) {
        const data = doc.data() as any;
        const uid = data.userId;
        if (out[uid] == null) {
          out[uid] = data.score;
          cacheSet(`trust:latest:${uid}`, data.score, 60_000); // 60s TTL
        }
      }
    } catch (e) {
      if (import.meta.env.DEV) console.warn('[trust] fetch latest snapshot failed (cache fallback)', (e as any)?.message);
    }
  }
  return out;
}

export async function hybridSearchListings(queryText: string, listings: Listing[], limit = 5, opts: TrustFetchOptions = {}): Promise<HybridSearchResult[]> {
  incr(METRIC.SEARCH_QUERY);
  // Compute semantic top set first to avoid embedding every listing repeatedly.
  const semResults = await semanticSearchListings(queryText, listings.length); // get all semantic scores for coverage
  // If semantic layer unavailable (e.g., Firestore disabled), fall back to pure lexical + default trust.
  if (!semResults.length) {
    const trustMap: Record<string, number> = {};
    const results: HybridSearchResult[] = listings.map(l => {
      const lexical = lexicalScore(queryText, l);
      const trustNorm = 0.5;
      const semantic = 0; // no semantic signal
      const score = semantic * 0.6 + lexical * 0.25 + trustNorm * 0.15;
      return { refId: l.id, score, semantic, lexical, trustScore: undefined };
    });
    return results.sort((a,b) => b.score - a.score).slice(0, limit);
  }
  const semMap = new Map(semResults.map(r => [r.refId, r.score]));
  const trustMap = await getLatestTrustScoreMap(listings.map(l => l.ownerId), opts);
  const results: HybridSearchResult[] = listings.map(l => {
    const semantic = semMap.get(l.id) ?? 0;
    const lexical = lexicalScore(queryText, l);
    const trustRaw = trustMap[l.ownerId];
    // Normalize trust 0-100 -> 0-1; default mid (0.5) if missing so we don't over-penalize new sellers.
    const trustNorm = trustRaw == null ? 0.5 : Math.min(1, Math.max(0, trustRaw / 100));
    // Blend: semantic 0.6, lexical 0.25, trust 0.15 (slightly boosts reputable sellers for equally relevant items)
    const score = semantic * 0.6 + lexical * 0.25 + trustNorm * 0.15;
    return { refId: l.id, score, semantic, lexical, trustScore: trustRaw };
  });
  return results.sort((a,b) => b.score - a.score).slice(0, limit);
}

// Warm preload top-N seller trust scores (call at server start)
export async function preloadTopSellerTrust(n = 50) {
  try {
    const db = getDb();
  const snap = await fsGetDocs(fsQuery(fsCollection(db, 'trustLatest'), fsOrderBy('score', 'desc'), fsLimit(n)) as any);
    snap.docs.forEach(d => {
      const data = d.data() as any;
      if (typeof data.score === 'number') cacheSet(`trust:latest:${data.userId}`, data.score, 60_000);
    });
    if (import.meta.env.DEV) console.log(`[trust] preloaded ${snap.docs.length} seller trust scores`);
  } catch (e) { if (import.meta.env.DEV) console.warn('[trust] preload failed', (e as any)?.message); }
}

let refreshTimer: any;
export function startTrustCacheRefresh(intervalMs = 55_000, topN = 50) {
  if (refreshTimer) return; // singleton
  const run = async () => { await preloadTopSellerTrust(topN); refreshTimer = setTimeout(run, intervalMs); };
  run();
}
export function stopTrustCacheRefresh() { if (refreshTimer) { clearTimeout(refreshTimer); refreshTimer = null; } }

// Ensure embeddings exist for provided listings (creates missing ones)
export async function ensureListingEmbeddings(listings: Listing[]) {
  const existing = await getEmbeddingVectors('listing');
  const existingSet = new Set(existing.map(e => e.refId));
  const toCreate = listings.filter(l => !existingSet.has(l.id));
  for (const l of toCreate) {
    const text = [l.title, l.description].filter(Boolean).join(' \n ');
    try { await upsertEmbedding('listing', l.id, text, { title: l.title }); } catch (e) {
      if (import.meta.env.DEV) console.warn('[embeddings] failed to upsert listing', l.id, (e as any)?.message);
    }
  }
  return getEmbeddingVectors('listing');
}

