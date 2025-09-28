import { describe, it, expect } from 'vitest';
import { addEndorsementEdge, addFulfillmentEdge } from '@/services/trust/reputation-edges';
import { isFlagEnabled, setFlag } from '@/lib/feature-flags';

// NOTE: These tests exercise logic paths; Firestore operations may no-op in offline test env.

describe('trust endorsements & disputes scaffolding', () => {
  it('flags reputation feature is enabled by default', () => {
    expect(isFlagEnabled('reputationEdges')).toBe(true);
  });
  it('short-circuits cleanly when feature disabled (offline safe)', async () => {
    setFlag({ key: 'reputationEdges', type: 'boolean', value: false });
    await addEndorsementEdge('endorser-x', 'seller-y');
    await addFulfillmentEdge('buyer-a', 'seller-b');
  });
});
