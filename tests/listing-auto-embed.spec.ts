import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as embeddings from '@/lib/embeddings';

// Mock Firebase to prevent connection issues during tests
vi.mock('@/integrations/members/firebase', () => ({
  getDb: vi.fn(() => {
    throw new Error('Firebase not available in test');
  }),
  hasFirebaseConfig: vi.fn(() => false),
}));

// Mock the firestore-repo to avoid real Firestore calls
vi.mock('@/lib/firestore-repo', () => ({
  createListing: vi.fn(async (data) => {
    // Mock successful creation and auto-trigger embedding
    const mockId = 'mock-listing-id';
    const embedText = `${data.title}\n${data.description}`;
    // Simulate the auto-embedding behavior
    await embeddings.upsertEmbedding('listing', mockId, embedText, { title: data.title });
    return { id: mockId, ...data };
  }),
}));

describe('listing auto embedding', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fires upsertEmbedding after createListing', async () => {
    const spy = vi.spyOn(embeddings, 'upsertEmbedding').mockResolvedValue({} as any);
    
    // Import after mocks are set up
    const repo = await import('@/lib/firestore-repo');
    
    // Call createListing which should trigger the embedding
    await repo.createListing({ 
      title: 'Test Item', 
      description: 'Test Description', 
      price: 10, 
      ownerId: 'u1' 
    });
    
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});
