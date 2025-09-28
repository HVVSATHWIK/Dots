import { z } from 'zod';

/**
 * Environment variable validation.
 * Only PUBLIC_* values are exposed to the client bundle (Astro/Vite rule).
 * This module should be imported early (e.g., in top-level layout or entry) to fail-fast in dev.
 */

export const EnvSchema = z.object({
  PUBLIC_FB_API_KEY: z.string().min(10),
  PUBLIC_FB_AUTH_DOMAIN: z.string().includes('.firebaseapp.com'),
  PUBLIC_FB_PROJECT_ID: z.string().min(3),
  PUBLIC_FB_STORAGE_BUCKET: z.string().includes('.appspot.com'),
  PUBLIC_FB_MESSAGING_SENDER_ID: z.string().regex(/^\d+$/),
  PUBLIC_FB_APP_ID: z.string().startsWith('1:'),
  PUBLIC_FB_MEASUREMENT_ID: z.string().startsWith('G-').optional(),
  // Feature flag style env toggles (string booleans)
  PUBLIC_FLAG_EXPERIMENTAL_TRUST: z.string().optional(),
  PUBLIC_FLAG_ENABLE_DECAY: z.string().optional(),
});

export type Env = z.infer<typeof EnvSchema>;

let _validated: Env | null = null;

export function resetEnvCache() { _validated = null; }

export function validateEnvObject(raw: Record<string, unknown>) {
  return EnvSchema.safeParse(raw);
}

export function getEnv(): Env {
  if (_validated) return _validated;
  const raw: Record<string, unknown> = {
    PUBLIC_FB_API_KEY: import.meta.env.PUBLIC_FB_API_KEY,
    PUBLIC_FB_AUTH_DOMAIN: import.meta.env.PUBLIC_FB_AUTH_DOMAIN,
    PUBLIC_FB_PROJECT_ID: import.meta.env.PUBLIC_FB_PROJECT_ID,
    PUBLIC_FB_STORAGE_BUCKET: import.meta.env.PUBLIC_FB_STORAGE_BUCKET,
    PUBLIC_FB_MESSAGING_SENDER_ID: import.meta.env.PUBLIC_FB_MESSAGING_SENDER_ID,
    PUBLIC_FB_APP_ID: import.meta.env.PUBLIC_FB_APP_ID,
    PUBLIC_FB_MEASUREMENT_ID: import.meta.env.PUBLIC_FB_MEASUREMENT_ID,
  };
  const parsed = validateEnvObject(raw);
  if (!parsed.success) {
    const issues = parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('\n');
    // In production we throw; in dev we log a clear multi-line error for quick fix.
    const message = `Environment validation failed:\n${issues}`;
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.error(message);
    } else {
      throw new Error(message);
    }
  } else {
    _validated = parsed.data;
  }
  return _validated as Env; // may be partial if dev + errors; consumers should handle undefined fields.
}

// Convenience accessors (optional) – keep minimal to avoid stale copies.
export const ENV = new Proxy({}, {
  get(_t, prop: string) {
    const env = getEnv();
    return (env as any)[prop];
  },
}) as Env;

export function flagEnabled(name: keyof Env) {
  const env = getEnv();
  const v = (env as any)[name];
  if (typeof v !== 'string') return false;
  return ['1','true','yes','on'].includes(v.toLowerCase());
}
