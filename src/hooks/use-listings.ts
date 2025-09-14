import { useCallback, useEffect, useState } from 'react';
import { getDb } from '@/integrations/members/firebase';
import { addDoc, collection, deleteDoc, doc, getDocs, orderBy, query, updateDoc, where, type Query } from 'firebase/firestore';
import { useMember } from '@/integrations';

export interface Listing {
  id: string;
  title: string;
  description?: string;
  price: number;
  currency?: string;
  images?: string[];
  tags?: string[];
  ownerId: string;
  createdAt?: number;
  updatedAt?: number;
  status?: 'draft' | 'active' | 'archived';
}

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
      const db = getDb();
  let qRef: Query;
      if (ownerOnly) {
        qRef = query(collection(db, 'listings'), where('ownerId', '==', user!.uid), orderBy('createdAt', 'desc'));
      } else {
        qRef = query(collection(db, 'listings'), orderBy('createdAt', 'desc'));
      }
      const snap = await getDocs(qRef);
      setListings(snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })) as Listing[]);
    } catch (e: any) {
      setError(e?.message || 'Failed to load listings');
    } finally {
      setLoading(false);
    }
  }, [user?.uid, ownerOnly]);

  useEffect(() => { void load(); }, [load]);

  const create = useCallback(async (input: Omit<Listing, 'id' | 'ownerId' | 'createdAt' | 'updatedAt'>) => {
    if (!user?.uid) return null;
    const db = getDb();
    const createdAt = Date.now();
    const updatedAt = createdAt;
    const ref = await addDoc(collection(db, 'listings'), {
      ...input,
      ownerId: user.uid,
      createdAt,
      updatedAt,
      status: input.status || 'draft',
      currency: input.currency || 'INR'
    });
    setListings(prev => [{ id: ref.id, ownerId: user.uid, createdAt, updatedAt, ...input }, ...prev]);
    return ref.id;
  }, [user?.uid]);

  const update = useCallback(async (id: string, patch: Partial<Listing>) => {
    const db = getDb();
    await updateDoc(doc(db, 'listings', id), { ...patch, updatedAt: Date.now() });
    setListings(prev => prev.map(l => l.id === id ? { ...l, ...patch } : l));
  }, []);

  const remove = useCallback(async (id: string) => {
    const db = getDb();
    await deleteDoc(doc(db, 'listings', id));
    setListings(prev => prev.filter(l => l.id !== id));
  }, []);

  return { listings, loading, error, create, update, remove, refresh: load };
}
