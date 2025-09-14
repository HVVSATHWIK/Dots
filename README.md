# Dots
Connecting Arts to Hearts
## Environment Setup

1. Install deps (Node 18+ recommended):
```
npm install
```
2. Copy env template:
```
cp .env.example .env
```
3. Fill Firebase public config + Gemini server key (do NOT prefix Gemini key with PUBLIC_).
4. Run dev server:
```
npm run dev
```

See `SECURITY_KEYS.md` for key handling & guidance.

## AI Endpoints

- `POST /api/ai/chat` – structured chat using Gemini.
- `POST /api/ai/generate` – generic one-shot prompt completion.
- Other endpoints: `listing-pack`, `design-variations`, `image`, `caption`.

If `GEMINI_API_KEY` is missing, endpoints return stubbed responses for local UX.

## Firebase

Initialization lives in `integrations/members/firebase.ts` and supports both `PUBLIC_FB_*` and legacy `VITE_FB_*` variable names. A safe `getAnalyticsSafe()` helper lazily loads analytics only in the browser.

## Onboarding & Roles

Flow (high-level):

```
Sign Up / Login → (auto user doc create) → /choose-role →
	Buyer → /dashboard
	Artisan → /profile/setup → (persist profile, mark profileComplete) → /copilot & /dashboard
```

Key Points:
- New route: `/choose-role` lets user pick Buyer or Artisan (stored in session + Firestore).
- Firestore `users/{uid}` doc is auto-created on first auth with default role `buyer`.
- Selecting Artisan and completing profile writes: `role='artisan'`, `profileComplete=true` plus structured profile fields.
- Artisan dashboards are gated: if `role='artisan'` but `profileComplete=false`, a prompt to finish setup is shown instead of stats.
- Session markers:
	- `dots_role` (pending desired role before merge)
	- `dots_role_chosen` (prevents re-prompting later)

User Document Shape (partial):
```ts
interface UserDoc {
	email: string;
	role: 'buyer' | 'artisan' | 'admin';
	profileComplete?: boolean;
	profile?: {
		firstName?: string; lastName?: string; phone?: string;
		bio?: string; specialization?: string; experience?: string;
		location?: { city?: string; state?: string; pincode?: string | null };
		social?: { instagram?: string; facebook?: string; website?: string };
		portfolio?: string | null;
	};
}
```

Next Enhancements (not yet implemented): wishlist persistence, listing CRUD, seller metrics, streaming AI responses.

## Newly Added Features (2025-09)

### Wishlist
- Hook: `useWishlist` (`src/hooks/use-wishlist.ts`) provides `items, add, remove, toggle, refresh`.
- Data stored under `users/{uid}/wishlist/{productId}` with fields (name, artist, image, pricing, inStock, addedAt).
- `ProfilePage` wishlist tab now live: loads real data, shows fallback sample if empty.

### Listings Service
- Hook: `useListings` (`src/hooks/use-listings.ts`) for artisans to `create, update, remove, refresh` their listings.
- Firestore collection: `listings` (public read; owner restricted writes) aligned with `firestore.rules`.

### Orders (Placeholder)
- Hook: `useOrders` (`src/hooks/use-orders.ts`) reads buyer orders (`orders` collection) – future expansion for seller views.

### Streaming Assistant
- Endpoint: `POST /api/ai/generate-stream` (SSE) simulates streamed tokens if Gemini key missing; replace logic with real SDK for production.
- `AssistantWidget` now attempts streaming first; falls back to one-shot `/api/ai/generate`.

### Security Rules
- Added `firestore.rules` with:
	- User docs: owner read/write (no delete) + admin override.
	- Wishlist: user-only access.
	- Listings: public read; owner artisan create/update/delete.
	- Orders: buyer or seller (or admin) read; immutable after create.

### Server Role Guard (Prototype)
- `integrations/members/role-guard.ts` – lightweight header-based role gate placeholder; swap with verified Firebase ID token claims in production.

### Change Role UX
- `ProfilePage` settings tab now provides a Change Role link to `/choose-role`.

## Follow-Up Ideas
- Replace simulated streaming with actual Gemini streaming API.
- Add optimistic UI + offline queue for wishlist & listings.
- Expand orders hook for seller-side fulfillment views.
- Add image upload & storage integration for listings.


## Contributing

Open a PR with a clear description. Avoid committing any real secrets. Run lint & type check before submitting.
