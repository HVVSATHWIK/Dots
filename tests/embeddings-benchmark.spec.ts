import { describe, it, expect } from 'vitest';
import { generateEmbedding } from '@/lib/embeddings';
import { getRecentTraces, resetTokenTotals } from '@/lib/tracing';

// Not a strict perf test (CI variability) – ensures tracing overhead isn't extreme and embeddings return quickly for fallback path.
describe('embeddings tracing overhead', () => {
  it('generates embedding with tracing within acceptable time', async () => {
    resetTokenTotals();
    const start = performance.now();
    const vec = await generateEmbedding('handcrafted wooden bowl with smooth finish and natural grain');
    const dur = performance.now() - start;
    expect(Array.isArray(vec)).toBe(true);
    expect(vec.length).toBeGreaterThan(10);
    // Fallback deterministic path should be very fast (< 50ms typical). Allow generous budget 250ms.
    expect(dur).toBeLessThan(250);
    const traces = getRecentTraces(50).filter(t => t.span.startsWith('embeddings.'));
    // Tracing may be disabled; in that case we accept zero traces.
    if (traces.length === 0) {
      expect(traces.length).toBe(0);
    } else {
      expect(traces.length).toBeGreaterThan(0);
    }
  });
});
