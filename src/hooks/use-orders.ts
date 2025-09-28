import { useCallback, useEffect, useState } from 'react';
import { listOrdersForBuyer } from '@/lib/firestore-repo';
import { useMember } from '@/integrations';

import type { Order } from '@/entities/schemas';

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
      const data = await listOrdersForBuyer(user.uid);
      setOrders(data);
    } catch (e: any) {
      setError(e?.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => { void load(); }, [load]);

  return { orders, loading, error, refresh: load };
}
