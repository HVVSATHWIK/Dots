/** Edge KV cache abstraction (in-memory placeholder). */
interface CacheEntry<T> { value: T; expiresAt: number; }
const store = new Map<string, CacheEntry<any>>();
export function cacheGet<T>(key: string): T | undefined { const e = store.get(key); if (!e) return; if (Date.now() > e.expiresAt) { store.delete(key); return; } return e.value; }
export function cacheSet<T>(key: string, value: T, ttlMs = 60000) { store.set(key, { value, expiresAt: Date.now() + ttlMs }); }
