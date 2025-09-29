// Simple in-memory media cache (resets on dev reload). Not for production persistence.

interface CacheEntry<T> { created: number; items: T[] }
const IMAGE_CACHE = new Map<string, CacheEntry<any>>();
const TTL_MS = 1000 * 60 * 15; // 15 min

export function createMediaCacheKey(prompt: string, size: string) {
  return `${size}:${prompt.toLowerCase().trim()}`;
}

export function getCachedImage(key: string) {
  const entry = IMAGE_CACHE.get(key);
  if (!entry) return null;
  if (Date.now() - entry.created > TTL_MS) { IMAGE_CACHE.delete(key); return null; }
  return entry.items;
}

export function setCachedImage(key: string, items: any[]) {
  IMAGE_CACHE.set(key, { created: Date.now(), items });
}

export function snapshotMediaCacheMeta() {
  return { size: IMAGE_CACHE.size, ttlMs: TTL_MS };
}
