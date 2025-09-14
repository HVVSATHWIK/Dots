import { useCallback, useEffect, useState } from 'react';
import { getDb } from '@/integrations/members/firebase';
import { collection, doc, getDocs, query, setDoc, deleteDoc, orderBy } from 'firebase/firestore';
import { useMember } from '@/integrations';

export interface WishlistItem {
  id: string; // product id reference
  name: string;
  artist?: string;
  image?: string;
  price?: number;
  originalPrice?: number;
  inStock?: boolean;
  addedAt?: number;
}

interface UseWishlistResult {
  items: WishlistItem[];
  loading: boolean;
  error: string | null;
  add: (item: Omit<WishlistItem, 'addedAt'>) => Promise<void>;
  remove: (id: string) => Promise<void>;
  toggle: (item: Omit<WishlistItem, 'addedAt'>) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useWishlist(): UseWishlistResult {
  const { user } = useMember();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user?.uid) return;
    setLoading(true); setError(null);
    try {
      const db = getDb();
      const q = query(collection(db, 'users', user.uid, 'wishlist'), orderBy('addedAt', 'desc'));
      const snap = await getDocs(q);
      const data: WishlistItem[] = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
      setItems(data);
    } catch (e: any) {
      setError(e?.message || 'Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => { void load(); }, [load]);

  const add = useCallback(async (item: Omit<WishlistItem, 'addedAt'>) => {
    if (!user?.uid) return;
    const db = getDb();
    const ref = doc(db, 'users', user.uid, 'wishlist', item.id);
    await setDoc(ref, { ...item, addedAt: Date.now() }, { merge: true });
    setItems(prev => [{ ...item, addedAt: Date.now() }, ...prev.filter(p => p.id !== item.id)]);
  }, [user?.uid]);

  const remove = useCallback(async (id: string) => {
    if (!user?.uid) return;
    const db = getDb();
    await deleteDoc(doc(db, 'users', user.uid, 'wishlist', id));
    setItems(prev => prev.filter(i => i.id !== id));
  }, [user?.uid]);

  const toggle = useCallback(async (item: Omit<WishlistItem, 'addedAt'>) => {
    const exists = items.some(i => i.id === item.id);
    if (exists) return remove(item.id);
    return add(item);
  }, [items, add, remove]);

  return { items, loading, error, add, remove, toggle, refresh: load };
}
