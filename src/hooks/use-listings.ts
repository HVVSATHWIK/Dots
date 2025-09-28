import { useCallback, useEffect, useState } from 'react';
import { useMember } from '@/integrations';
import { createListing, deleteListing, listAllListings, listListingsForOwner, updateListing } from '@/lib/firestore-repo';
import type { Listing } from '@/entities/schemas';

// Listing type now sourced from central schema file for consistency

interface UseListingsResult {
  listings: Listing[];
  loading: boolean;
  error: string | null;
  create: (input: Omit<Listing, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>) => Promise<string | null>;
  update: (id: string, patch: Partial<Listing>) => Promise<void>;
  remove: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useListings(ownerOnly = true): UseListingsResult {
  const { user } = useMember();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    if (ownerOnly && !user?.uid) return;
    setLoading(true);
    try {
      const data = ownerOnly ? await listListingsForOwner(user!.uid) : await listAllListings();
      setListings(data);
    } catch (e: any) {
      setError(e?.message || 'Failed to load listings');
    } finally {
      setLoading(false);
    }
  }, [user?.uid, ownerOnly]);

  useEffect(() => { void load(); }, [load]);

  const create = useCallback(async (input: Omit<Listing, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>) => {
    if (!user?.uid) return null;
    const created = await createListing({ ...input, ownerId: user.uid } as any);
    setListings(prev => [created, ...prev]);
    return created.id;
  }, [user?.uid]);

  const update = useCallback(async (id: string, patch: Partial<Listing>) => {
    const updated = await updateListing(id, patch);
    setListings(prev => prev.map(l => l.id === id ? updated : l));
  }, []);

  const remove = useCallback(async (id: string) => {
    await deleteListing(id);
    setListings(prev => prev.filter(l => l.id !== id));
  }, []);

  return { listings, loading, error, create, update, remove, refresh: load };
}
