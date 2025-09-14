import { useCallback, useEffect, useState } from 'react';
import { getDb } from '@/integrations/members/firebase';
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import { useMember } from '@/integrations';

export interface OrderItem {
  name: string;
  artist?: string;
  image?: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: string;
  date: number;
  status: string;
  total: number;
  buyerId: string;
  sellerId?: string;
  items: OrderItem[];
}

interface UseOrdersResult {
  orders: Order[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useOrders(): UseOrdersResult {
  const { user } = useMember();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user?.uid) return;
    setLoading(true); setError(null);
    try {
      const db = getDb();
      const qBuyer = query(collection(db, 'orders'), where('buyerId', '==', user.uid), orderBy('date', 'desc'));
      const snap = await getDocs(qBuyer);
      setOrders(snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })) as Order[]);
    } catch (e: any) {
      setError(e?.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => { void load(); }, [load]);

  return { orders, loading, error, refresh: load };
}
