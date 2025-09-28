/**
 * Generic Firestore repository layer with Zod validation boundaries.
 * Only this file (and firebase config) should import firebase/firestore directly.
 */
import { getDb } from '@/integrations/members/firebase';
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, orderBy, query, updateDoc, where, setDoc, type QueryConstraint } from 'firebase/firestore';
import { z } from 'zod';
import { ListingSchema, OrderSchema, UserSchema, WishlistItemSchema, assertParse, type Listing, type Order, type User, type WishlistItem } from '@/entities/schemas';
import { upsertEmbedding } from '@/lib/embeddings';
import { runWithTrace } from '@/lib/tracing';
import { publish } from '@/lib/event-bus';
import '@/startup/subscribers'; // side-effect: register event subscribers

export interface RepoOptions<T extends z.ZodTypeAny> {
  collection: string;
  schema: T;
  idField?: string; // defaults to 'id'
}

function now() { return Date.now(); }

export function createRepository<T extends z.ZodTypeAny>(opts: RepoOptions<T>) {
  const db = () => getDb();
  const idField = opts.idField || 'id';

  async function get(id: string) {
    const ref = doc(db(), opts.collection, id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
  const raw = snap.data() || {};
  const data = { [idField]: snap.id, ...(raw as Record<string, unknown>) };
    return assertParse(opts.schema, data, `${opts.collection}.get`);
  }

  async function list(constraints: QueryConstraint[] = []) {
    const q = constraints.length
      ? query(collection(db(), opts.collection), ...constraints)
      : collection(db(), opts.collection);
    const snap = await getDocs(q as any);
    return snap.docs.map(d => {
  const raw = d.data() || {};
  const data = { [idField]: d.id, ...(raw as Record<string, unknown>) };
      return assertParse(opts.schema, data, `${opts.collection}.list`);
    });
  }

  async function create(input: Record<string, unknown>) {
    const base = { ...input } as any;
    if (!base.createdAt) base.createdAt = now();
    base.updatedAt = base.createdAt;
    const parsed = assertParse(opts.schema, { [idField]: 'temp', ...base }, `${opts.collection}.create:pre`);
    const { [idField]: _ignore, ...toStore } = parsed as any;
    const ref = await addDoc(collection(db(), opts.collection), toStore);
    const finalDoc = await get(ref.id);
    return finalDoc!;
  }

  async function update(id: string, patch: Record<string, unknown>) {
    const ref = doc(db(), opts.collection, id);
    const existing = await get(id);
    if (!existing) throw new Error(`[Repo] ${opts.collection}#${id} not found`);
    const merged = { ...existing, ...patch, updatedAt: now() } as any;
    const parsed = assertParse(opts.schema, merged, `${opts.collection}.update:pre`);
    const { [idField]: _ignore, ...toStore } = parsed as any;
    await updateDoc(ref, toStore);
    return parsed;
  }

  async function remove(id: string) {
    await deleteDoc(doc(db(), opts.collection, id));
  }

  return { get, list, create, update, remove };
}

// Specialized repositories
const listingRepo = createRepository({ collection: 'listings', schema: ListingSchema });
const orderRepo = createRepository({ collection: 'orders', schema: OrderSchema });
const userRepo = createRepository({ collection: 'users', schema: UserSchema });

export async function listListingsForOwner(ownerId: string) {
  const db = getDb();
  const snap = await getDocs(query(collection(db, 'listings'), where('ownerId', '==', ownerId), orderBy('createdAt', 'desc')));
  return snap.docs.map(d => assertParse(ListingSchema, { id: d.id, ...d.data() }, 'listings.owner'));
}

export async function listAllListings() {
  return listingRepo.list([orderBy('createdAt', 'desc')]);
}

export async function createListing(input: Omit<Listing, 'id' | 'createdAt' | 'updatedAt'>) {
  const created = await listingRepo.create(input as any) as Listing;
  // Fire-and-forget embedding generation (do not block listing creation on failure)
  runWithTrace(async () => {
    const text = [created.title, created.description].filter(Boolean).join(' \n ');
    try { await upsertEmbedding('listing', created.id, text, { title: created.title }); } catch (e) { /* swallowed, logged by tracing */ }
  }, { span: 'listing.autoEmbed', metaStart: { id: created.id } });
  return created;
}

export async function updateListing(id: string, patch: Partial<Listing>) {
  const updated = await listingRepo.update(id, patch as any) as Listing;
  runWithTrace(async () => {
    const text = [updated.title, updated.description].filter(Boolean).join(' \n ');
    try { await upsertEmbedding('listing', updated.id, text, { title: updated.title }); } catch {}
  }, { span: 'listing.autoEmbed', metaStart: { id } });
  return updated;
}

export async function deleteListing(id: string) {
  await listingRepo.remove(id);
}
export async function getListing(id: string) { return listingRepo.get(id) as Promise<Listing | null>; }

// Wishlist (subcollection under users/{uid}/wishlist)
export async function listWishlist(userId: string): Promise<WishlistItem[]> {
  const db = getDb();
  const snap = await getDocs(query(collection(db, 'users', userId, 'wishlist'), orderBy('addedAt', 'desc')));
  return snap.docs.map(d => assertParse(WishlistItemSchema, { id: d.id, ...d.data() }, 'wishlist.list')) as WishlistItem[];
}

export async function addWishlistItem(userId: string, item: Omit<WishlistItem, 'addedAt'>) {
  const db = getDb();
  const ref = doc(db, 'users', userId, 'wishlist', item.id);
  const data = { ...item, addedAt: Date.now() };
  const parsed = assertParse(WishlistItemSchema, data, 'wishlist.add');
  await setDoc(ref, parsed, { merge: true });
  return parsed;
}

export async function removeWishlistItem(userId: string, itemId: string) {
  const db = getDb();
  await deleteDoc(doc(db, 'users', userId, 'wishlist', itemId));
}

export async function toggleWishlistItem(userId: string, item: Omit<WishlistItem, 'addedAt'>) {
  const items = await listWishlist(userId);
  const exists = items.some(i => i.id === item.id);
  if (exists) {
    await removeWishlistItem(userId, item.id);
    return { removed: true } as const;
  }
  const added = await addWishlistItem(userId, item);
  return { removed: false, item: added } as const;
}

// Orders
export async function listOrdersForBuyer(buyerId: string) {
  const db = getDb();
  const snap = await getDocs(query(collection(db, 'orders'), where('buyerId', '==', buyerId), orderBy('date', 'desc')));
  return snap.docs.map(d => assertParse(OrderSchema, { id: d.id, ...d.data() }, 'orders.buyer')) as Order[];
}
export async function getOrder(id: string) { return orderRepo.get(id) as Promise<Order | null>; }
export async function createOrder(input: Omit<Order, 'id'>) { 
  const order = await orderRepo.create(input as any) as Order; 
  publish('order.created', { orderId: order.id, buyerId: order.buyerId, sellerId: order.sellerId || '', total: order.total });
  return order; 
}
export async function updateOrder(id: string, patch: Partial<Order>) { return orderRepo.update(id, patch as any) as Promise<Order>; }

// Users (basic)
export async function getUser(id: string) { return userRepo.get(id) as Promise<User | null>; }
export async function updateUser(id: string, patch: Partial<User>) { return userRepo.update(id, patch as any) as Promise<User>; }
