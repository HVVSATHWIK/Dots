import { describe, it, expect } from 'vitest';
import { selectModels } from '../src/lib/ai-model-router';

describe('router override precedence', () => {
  it('uses forced override when provided', () => {
    const sel = selectModels('generate', { forceModel: 'gemini-x-test' as any });
    expect(sel.candidates).toEqual(['gemini-x-test']);
    expect(sel.override).toBe('gemini-x-test');
  });
});
