import { describe, it, expect } from 'vitest';
import { validateEnvObject } from '@/env';

// These tests run with whatever env Vitest provides. We simulate failures by temporarily mutating import.meta.env.

describe('environment validation', () => {
  it('fails when required keys missing', () => {
    const res = validateEnvObject({});
    expect(res.success).toBe(false);
  });

  it('succeeds with minimal valid set', () => {
    const res = validateEnvObject({
      PUBLIC_FB_API_KEY: 'AIzaMockKey12345',
      PUBLIC_FB_AUTH_DOMAIN: 'proj.firebaseapp.com',
      PUBLIC_FB_PROJECT_ID: 'proj',
      PUBLIC_FB_STORAGE_BUCKET: 'proj.appspot.com',
      PUBLIC_FB_MESSAGING_SENDER_ID: '1234567890',
      PUBLIC_FB_APP_ID: '1:1234567890:web:abcdef',
    });
    expect(res.success).toBe(true);
    if (res.success) expect(res.data.PUBLIC_FB_PROJECT_ID).toBe('proj');
  });
});
