import { describe, it, expect } from 'vitest';
import { parseIntent } from '@/services/search/intent-parse';

describe('intent parsing', () => {
  it('extracts budget range and materials', () => {
    const p = parseIntent('walnut desk under 500 in 2 weeks');
    expect(p.budgetMax).toBe(500);
    expect(p.timeframeDays).toBe(14);
    expect(p.materials).toContain('walnut');
  });
});