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

## Multimodal Features (v0.4.x)

The platform now supports foundational multimodal capabilities (text + image + TTS) with resilience, feature flags, caching, metrics, and diagnostics.

### Endpoints

| Endpoint | Method | Purpose | Notes |
|----------|--------|---------|-------|
| `/api/ai/image-generate` | POST | Generate 1–3 product concept images | Fallback returns placeholder 1x1 PNGs if no API key or all models fail. Respects feature flag `aiImageGen`. Rate limited per IP. |
| `/api/ai/design-variations` | POST | Produce 3–4 motif-preserving variations from a base image | Calls Vertex Imagen variation models (default `imagen-3.0-vary-002`) using service-account OAuth. Configure credentials via `VERTEX_SERVICE_ACCOUNT_JSON`, `GOOGLE_APPLICATION_CREDENTIALS`, or `VERTEX_ACCESS_TOKEN`. |
| `/api/ai/tts` | POST | Text-to-speech synthesis | Fallback returns base64 encoded plain text stub (mime `text/plain`). Flag: `aiTTS`. Rate limited per IP. |
| `/api/ai/generate-stream` | POST (SSE) | Streaming text completion | Multi-model routing + fallback streaming tokens. |
| `/api/ai/metrics` | GET | Runtime counters & cache/meta snapshot | Requires `x-metrics-token` header matching `METRICS_TOKEN` env. |

`VERTEX_VARIATION_MODEL` (optional) lets you pick a specific Imagen variation model; falls back to `imagen-3.0-vary-002` when unset.

### Input Limits
- Image prompt max length: 4000 chars.
- TTS text max length: 4000 chars.
- (Text generate/chat can be similarly bounded in future; UI naturally constrains typical usage.)

### Variant Selector
- UI exposes 1–3 variant dropdown (flag: `aiImageVariants`).
- Server clamps `variants` to `[1,3]` (defense-in-depth). Requested >3 => 3.

### Feature Flags
Defined in `src/lib/feature-flags.ts`:
```
aiImageGen        # enable/disable image generation button & endpoint
aiTTS             # enable/disable TTS button & endpoint
aiImageVariants   # show variant selector UI (1–3)
aiAudioControls   # reserved for future extended audio controls (currently unused placeholder)
```
Flags are boolean by default (on) and can be modified in Firestore collection `featureFlags` or via `setFlag()` server utility.

### Caching
- Image results cached in-memory with LRU + TTL (15 min, max 200 entries) keyed by `(size + normalized prompt)`.
- Cache hits return instantly with `cached: true`.
- This is not persistent across deployments / server restarts.

### Rate Limiting
- Simple in-memory token bucket per IP & task (image or tts) (10 / minute default).
- Exceeding limit returns HTTP 429 `{ error: "rate_limited" }`.
- Stateless scaling consideration: move to shared store (Redis) in production.

### Metrics & Observability
Counters (in-memory):
```
model.success.<model>
model.fail.<model>
image.cache.hit.count
image.cache.miss.count
tts.fallback.count
assistant.run.count
assistant.stream.latency.totalMs / samples
feature.flag.exposure.count:<flag>
```
Metrics snapshot: `GET /api/ai/metrics` (requires header). Returns:
```
{
	counters: { ... },
	models: { taskSuccessCache },
	mediaCache: { size, ttlMs, max },
	rate: { size, windowMs },
	ts: epochMs
}
```

### Debug Drawer
- In `AssistantWidget` click `DBG` to toggle a model attempt log for last image generation (success/failure reasons).
- Helpful for diagnosing which model served the final media.

### UI Interactions
- IMG button: shows spinner while awaiting response, inserts up to N variants into a gallery (most recent first).
- Gallery: select an image (ring highlight), copy base64 Data URI or download as `image.png`.
- TTS: attempts synthesis, spinner shown while pending; fallback always returns stub to keep UX deterministic.

### Error Handling
- Structured fallback responses always return 200 except validation (400) and rate limiting (429) or disabled (403).
- `error` field present when failure or disabled state.

### Example Usage

Image (fetch):
```ts
const res = await fetch('/api/ai/image-generate', { method: 'POST', headers: { 'content-type':'application/json' }, body: JSON.stringify({ prompt: 'hand carved wooden bowl', variants: 3 })});
const data = await res.json();
// data.images => [{ b64, mime, model? }, ...]
```

TTS (fetch):
```ts
const res = await fetch('/api/ai/tts', { method:'POST', headers:{ 'content-type':'application/json' }, body: JSON.stringify({ text: 'Welcome to the artisan marketplace' }) });
const speech = await res.json();
if (speech.audio?.b64) {
	const audio = new Audio(`data:${speech.audio.mime};base64,${speech.audio.b64}`);
	await audio.play();
}
```

Metrics:
```bash
curl -H "x-metrics-token: $METRICS_TOKEN" http://localhost:4321/api/ai/metrics
```

### Test Coverage (Added in v0.4.1)
- LRU eviction: `media-cache-lru.spec.ts`
- Variant clamp: `image-variant-clamp.spec.ts`
- Router override: `router-override.spec.ts`
- TTS missing text handling: `tts-empty-fallback.spec.ts`
- Streaming fallback tokens: `generate-stream-fallback.spec.ts`
- Existing fallback tests for image & TTS retained.

### Limitations / Future Hardening
- In-memory only (stateless) caches & rate limits.
- No persistent media store yet.
- Audio controls flag reserved; extended controls not built.
- Consider adding auth gating for generation endpoints in multi-tenant scenarios.


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
