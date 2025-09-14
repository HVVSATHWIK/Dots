# API Keys & Configuration Security

This project uses Firebase (client SDK) and Gemini (server only). Follow these guidelines to keep secrets safe:

## 1. Firebase Config
Firebase web config values (apiKey, authDomain, etc.) are NOT true secrets. They identify your project. However:
- DO NOT commit configs for projects you do not intend to expose publicly.
- Restrict usage in Firebase Console (Authentication domains, Storage & Firestore security rules, etc.).

Env prefix convention used here:
- `PUBLIC_FB_*` – Preferred. Exposed to the browser.
- Legacy fallback `VITE_FB_*` still supported by `integrations/members/firebase.ts` for backward compatibility.

## 2. Gemini API Key
- `GEMINI_API_KEY` MUST remain server-only.
- Never add it with a `PUBLIC_` prefix.
- Do not log it or echo it to the browser.
- Local dev: create a `.env` file (never commit) and set `GEMINI_API_KEY=...`.

## 3. Environment Files
`.env.example` provides placeholders. Copy to a local `.env` file:

```
cp .env.example .env
```

Then fill real values (do NOT commit the real `.env`).

## 4. Runtime Access
- Server routes (e.g. `src/pages/api/ai/chat.ts` & `src/pages/api/ai/generate.ts`) read the Gemini key from `import.meta.env` or `process.env`.
- Client code must never reference `GEMINI_API_KEY`.

## 5. Auditing & Safety
- Rotate Gemini key if accidentally exposed.
- Use Firebase security rules to protect data – API key alone does not grant write access without proper rules.

## 6. Adding New Secrets
For any new secret:
1. Add a placeholder to `.env.example`.
2. Do NOT add a `PUBLIC_` prefix unless it is safe for clients.
3. Consume it only in server code (API routes, integrations executed server-side).
4. Add type declaration in `src/env.d.ts` if you want TypeScript autocomplete.

## 7. Git Hygiene
Already in `.gitignore`:
- `.env` and environment variants.

If you accidentally commit a real key:
1. Remove it and force-push a purge PR (or history rewrite if necessary).
2. Rotate / revoke the key in the provider console.

---
For questions on hardening, see:
- Firebase Security Rules: https://firebase.google.com/docs/rules
- Gemini Safety Guidance: https://ai.google.dev
