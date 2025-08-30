import { getDb } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import type { ListingPack } from '@/integrations/ai/types';

export async function saveListingPack(userId: string, pack: ListingPack) {
  const db = getDb();
  const col = collection(db, 'users', userId, 'listings');
  const doc = await addDoc(col, {
    pack,
    createdAt: serverTimestamp(),
  });
  return doc.id;
}
