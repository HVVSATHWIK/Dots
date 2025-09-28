import { describe, it, expect } from 'vitest';
import { runAssistant, AssistantMode } from '@/services/assistant/modes';

describe('assistant modes', () => {
  it('handles negotiation counter-offer and pricing suggestion with comps', async () => {
    const negotiation = await runAssistant({ mode: AssistantMode.Negotiation, input: 'negotiate', payload: { listPrice: 100, offer: 60 } });
    const pricing = await runAssistant({ mode: AssistantMode.Pricing, input: 'price this', payload: { baseCost: 10, materialCost: 5, laborHours: 1 } });
    expect(negotiation.mode).toBe(AssistantMode.Negotiation);
    expect(negotiation.text).toContain('Counter-offer');
    expect(pricing.mode).toBe(AssistantMode.Pricing);
    expect(pricing.meta?.suggestion?.recommendedPrice).toBeGreaterThan(0);
    expect(pricing.text).toContain('Recommended price');
  });
});
