/**
 * Taste vector scaffold: store & retrieve user preference embeddings derived from interactions.
 */
export interface TasteVector { userId: string; vector: number[]; updatedAt: number; dim: number; source: string; }

export async function updateTasteVector(_userId: string, _signals: any[]): Promise<TasteVector> {
  // TODO: derive embedding from listing interactions, favorites, assistant queries.
  return { userId: _userId, vector: [], updatedAt: Date.now(), dim: 0, source: 'stub' };
}

export async function getTasteVector(_userId: string): Promise<TasteVector | null> { return null; }
