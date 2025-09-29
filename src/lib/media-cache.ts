// In-memory LRU media cache (reset on reload). Not production-grade persistence.
// Adds TTL + max entries with least-recently-used eviction.

interface CacheEntry<T> { created: number; items: T[]; key: string; last: number }
const IMAGE_CACHE = new Map<string, CacheEntry<any>>();
const TTL_MS = 1000 * 60 * 15; // 15 min
const MAX_ITEMS = 200; // configurable upper bound

export function createMediaCacheKey(prompt: string, size: string) {
  return `${size}:${prompt.toLowerCase().trim()}`;
}

export function getCachedImage(key: string) {
  const entry = IMAGE_CACHE.get(key);
  if (!entry) return null;
  if (Date.now() - entry.created > TTL_MS) { IMAGE_CACHE.delete(key); return null; }
  entry.last = Date.now();
  return entry.items;
}

export function setCachedImage(key: string, items: any[]) {
  // Evict stale first
  for (const [k, v] of IMAGE_CACHE) {
    if (Date.now() - v.created > TTL_MS) IMAGE_CACHE.delete(k);
  }
  // LRU eviction if exceeding max
  if (IMAGE_CACHE.size >= MAX_ITEMS) {
    let oldestKey: string | null = null;
    let oldestLast = Infinity;
    for (const [k, v] of IMAGE_CACHE) {
      if (v.last < oldestLast) { oldestLast = v.last; oldestKey = k; }
    }
    if (oldestKey) IMAGE_CACHE.delete(oldestKey);
  }
  IMAGE_CACHE.set(key, { created: Date.now(), last: Date.now(), items, key });
}

export function snapshotMediaCacheMeta() {
  return { size: IMAGE_CACHE.size, ttlMs: TTL_MS, max: MAX_ITEMS };
}
