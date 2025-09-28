import { describe, it, expect } from 'vitest';
import { summarizeInteractions } from '@/services/assistant/memory';

describe('assistant memory summarizer', () => {
  it('reduces length vs raw concatenation', () => {
    const history = Array.from({ length: 15 }).map((_,i) => ({ role: i%2?'assistant':'user', content: `Message number ${i} with some additional descriptive text`, ts: Date.now()+i }));
    const summary = summarizeInteractions('u1', history as any);
    const rawLen = history.map(h=>h.content).join('\n').length;
    expect(summary.summary.length).toBeLessThan(rawLen);
    expect(summary.interactions).toBeLessThanOrEqual(20);
  });
});