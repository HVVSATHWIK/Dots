# Dots: Auth + AI Setup

Quick steps to run locally with Firebase Auth and AI stubs.

1) Copy .env.example to .env and fill Firebase web config (safe client vars).
2) In Firebase Console, enable Google and Email/Password providers.
3) Start dev server and open /sell → go to Copilot.

Server-side keys like GEMINI_API_KEY should be configured in your hosting provider (Cloudflare pages functions / wrangler secrets) or local process env, not in .env with VITE_.
