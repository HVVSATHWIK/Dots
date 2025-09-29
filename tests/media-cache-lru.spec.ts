import { describe, it, expect } from 'vitest';
import { setCachedImage, getCachedImage, createMediaCacheKey } from '../src/lib/media-cache';

// Note: MAX_ITEMS is 200; we will simulate smaller by inserting >200 and checking earliest eviction.

describe('media-cache LRU basics', () => {
  it('evicts oldest when exceeding max', () => {
    for (let i=0;i<205;i++) {
      const key = createMediaCacheKey('p'+i,'square');
      setCachedImage(key, [{ b64: 'x', mime:'image/png', model:'m'}]);
    }
    // Oldest keys (p0..p4) should likely be gone; recent key present
    const oldest = getCachedImage(createMediaCacheKey('p0','square'));
    const recent = getCachedImage(createMediaCacheKey('p204','square'));
    expect(recent).toBeTruthy();
    // Cannot guarantee exact eviction boundary but oldest should not exist
    expect(oldest).toBeNull();
  });
});
