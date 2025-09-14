/// <reference path="../.astro/types.d.ts" />

declare global {
  interface SDKTypeMode {
    strict: true;
  }

  interface ImportMetaEnv {
    readonly VITE_FB_API_KEY?: string;
    readonly VITE_FB_AUTH_DOMAIN?: string;
    readonly VITE_FB_PROJECT_ID?: string;
    readonly VITE_FB_STORAGE_BUCKET?: string;
    readonly VITE_FB_MESSAGING_SENDER_ID?: string;
    readonly VITE_FB_APP_ID?: string;
    readonly VITE_FB_MEASUREMENT_ID?: string;
  readonly PUBLIC_FB_API_KEY?: string;
  readonly PUBLIC_FB_AUTH_DOMAIN?: string;
  readonly PUBLIC_FB_PROJECT_ID?: string;
  readonly PUBLIC_FB_STORAGE_BUCKET?: string;
  readonly PUBLIC_FB_MESSAGING_SENDER_ID?: string;
  readonly PUBLIC_FB_APP_ID?: string;
  readonly PUBLIC_FB_MEASUREMENT_ID?: string;
    readonly VITE_BASE_NAME?: string;
    readonly VITE_API_AI_BASE_URL?: string;
    readonly VITE_API_TRUST_BASE_URL?: string;
    // Gemini / Google Generative AI (server-side only; do NOT expose publicly)
    readonly GEMINI_API_KEY?: string;
    readonly GEMINI_MODEL?: string;
  // server-only env are not typed here intentionally; but you may define process.env types via vite-env.d.ts if needed
  }
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}
