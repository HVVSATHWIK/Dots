import { z } from 'zod';

/**
 * Central Zod schemas for domain entities.
 * Keep these lean & data-layer oriented (no view-only props).
 * Firestore timestamps are represented as numbers (ms epoch) at the edge.
 */

export const UserProfileSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  phone: z.string().min(6).max(32).optional(),
  bio: z.string().max(2000).optional(),
  specialization: z.string().max(200).optional(),
  experience: z.string().max(200).optional(),
  location: z.object({
    city: z.string().optional(),
    state: z.string().optional(),
    pincode: z.string().max(12).nullable().optional(),
  }).optional(),
  social: z.object({
    instagram: z.string().url().optional(),
    facebook: z.string().url().optional(),
    website: z.string().url().optional(),
  }).partial().optional(),
  portfolio: z.string().url().nullable().optional(),
});

export const UserSchema = z.object({
  id: z.string(), // Firestore document id
  email: z.string().email(),
  name: z.string().optional(),
  role: z.enum(['buyer', 'artisan', 'admin']),
  profileComplete: z.boolean().optional(),
  profile: UserProfileSchema.optional(),
  joinedOn: z.number().optional(),
  updatedAt: z.number().optional(),
  metadata: z.object({
    provider: z.string().optional(),
    lastLogin: z.number().optional(),
  }).optional(),
});
export type User = z.infer<typeof UserSchema>;

export const ListingSchema = z.object({
  id: z.string(),
  title: z.string().min(2).max(140),
  description: z.string().max(4000).optional(),
  price: z.number().nonnegative(),
  currency: z.string().length(3).default('INR').optional(),
  images: z.array(z.string().url()).max(20).optional(),
  tags: z.array(z.string().min(1).max(40)).max(25).optional(),
  ownerId: z.string(),
  createdAt: z.number().optional(),
  updatedAt: z.number().optional(),
  status: z.enum(['draft', 'active', 'archived']).default('draft').optional(),
});
export type Listing = z.infer<typeof ListingSchema>;

export const OrderItemSchema = z.object({
  name: z.string(),
  artist: z.string().optional(),
  image: z.string().url().optional(),
  price: z.number().nonnegative(),
  quantity: z.number().int().positive(),
});

export const OrderSchema = z.object({
  id: z.string(),
  date: z.number(),
  status: z.string(), // could be refined later
  total: z.number().nonnegative(),
  buyerId: z.string(),
  sellerId: z.string().optional(),
  items: z.array(OrderItemSchema).min(1),
  fulfilledAt: z.number().optional(),
});
export type Order = z.infer<typeof OrderSchema>;

// Wishlist
export const WishlistItemSchema = z.object({
  id: z.string(), // product/listing id
  name: z.string(),
  artist: z.string().optional(),
  image: z.string().url().optional(),
  price: z.number().nonnegative().optional(),
  originalPrice: z.number().nonnegative().optional(),
  inStock: z.boolean().optional(),
  addedAt: z.number().optional(),
});
export type WishlistItem = z.infer<typeof WishlistItemSchema>;

// Pricing / AI related
export const PriceSuggestionSchema = z.object({
  listingId: z.string(),
  recommendedPrice: z.number().positive(),
  minPrice: z.number().positive(),
  maxPrice: z.number().positive(),
  currency: z.string().length(3).default('INR').optional(),
  rationale: z.array(z.string()).default([]).optional(),
  modelVersion: z.string().optional(),
  createdAt: z.number().optional(),
});
export type PriceSuggestion = z.infer<typeof PriceSuggestionSchema>;

// Utility safe parse helper (throws with annotated error for consistent logging)
export function assertParse<T extends z.ZodTypeAny>(schema: T, data: unknown, ctx: string): z.infer<T> {
  const res = schema.safeParse(data);
  if (!res.success) {
    const message = `[SchemaError:${ctx}] ${res.error.issues.map(i => i.path.join('.') + ' ' + i.message).join('; ')}`;
    throw new Error(message);
  }
  return res.data as any;
}
