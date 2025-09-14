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

## Contributing

Open a PR with a clear description. Avoid committing any real secrets. Run lint & type check before submitting.
