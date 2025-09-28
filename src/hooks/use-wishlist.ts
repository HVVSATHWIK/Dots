import { useCallback, useEffect, useState } from 'react';
import { listWishlist, addWishlistItem, removeWishlistItem, toggleWishlistItem } from '@/lib/firestore-repo';
import { useMember } from '@/integrations';

import type { WishlistItem } from '@/entities/schemas';

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
  const data = await listWishlist(user.uid);
  setItems(data as WishlistItem[]);
    } catch (e: any) {
      setError(e?.message || 'Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => { void load(); }, [load]);

  const add = useCallback(async (item: Omit<WishlistItem, 'addedAt'>) => {
    if (!user?.uid) return;
  const added = await addWishlistItem(user.uid, item);
  setItems(prev => [added, ...prev.filter(p => p.id !== item.id)]);
  }, [user?.uid]);

  const remove = useCallback(async (id: string) => {
    if (!user?.uid) return;
    await removeWishlistItem(user.uid, id);
    setItems(prev => prev.filter(i => i.id !== id));
  }, [user?.uid]);

  const toggle = useCallback(async (item: Omit<WishlistItem, 'addedAt'>) => {
    toggleWishlistItem(user!.uid, item).then(res => {
      if (res.removed) {
        setItems(prev => prev.filter(i => i.id !== item.id));
      } else if ('item' in res) {
        setItems(prev => [res.item, ...prev.filter(i => i.id !== item.id)]);
      }
    }).catch(e => setError(e?.message || 'Wishlist toggle failed'));
  }, [items, user?.uid]);

  return { items, loading, error, add, remove, toggle, refresh: load };
}
