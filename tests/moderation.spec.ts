import { describe, it, expect } from 'vitest';
import { moderate } from '@/services/moderation';

describe('moderation', () => {
  it('allows neutral text', async () => {
    const res = await moderate({ text: 'Handcrafted wooden bowl' });
    expect(res.decision).toBe('allow');
  });
  it('blocks weapon references', async () => {
    const res = await moderate({ text: 'This weapon is great' });
    expect(['block','flag']).toContain(res.decision);
  });
  it('does not false-positive on similar substrings (e.g., neweapon as fake)', async () => {
    const res = await moderate({ text: 'Innovative neweapon design word (nonsense) plus handcrafted art' });
    expect(res.decision).toBe('allow');
  });
  it('keeps benign commerce terms allowed', async () => {
    const benign = 'Handcrafted sustainable eco friendly bamboo utensils and artisan pottery bundle';
    const res = await moderate({ text: benign });
    expect(res.decision).toBe('allow');
  });
});