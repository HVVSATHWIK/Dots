// Simple in-memory rate limiter per key+task.
// Not distributed; resets on reload. Burst friendly token bucket approximation.

interface Bucket { tokens: number; lastRefill: number }
const buckets = new Map<string, Bucket>();

const DEFAULT_LIMIT = 10; // tokens per window
const WINDOW_MS = 60_000; // 1 minute

export function consumeRate(key: string, task: string, limit = DEFAULT_LIMIT): boolean {
  const now = Date.now();
  const id = `${task}:${key}`;
  let b = buckets.get(id);
  if (!b) { b = { tokens: limit, lastRefill: now }; buckets.set(id, b); }
  // Refill linearly
  const elapsed = now - b.lastRefill;
  if (elapsed > WINDOW_MS) {
    const cycles = Math.floor(elapsed / WINDOW_MS);
    b.tokens = Math.min(limit, b.tokens + cycles * limit);
    b.lastRefill = now;
  }
  if (b.tokens <= 0) return false;
  b.tokens -= 1;
  return true;
}

export function snapshotRateLimiter() {
  return { size: buckets.size, windowMs: WINDOW_MS };
}
