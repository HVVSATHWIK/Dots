// Placeholder perceptual hash (pHash-like) using average hash approach on a canvas (browser only fallback).
export function simpleHash(pixels: Uint8ClampedArray) {
  // Expect grayscale 8x8 = 64 values
  let sum = 0; for (let i=0;i<pixels.length;i++) sum += pixels[i];
  const avg = sum / pixels.length;
  let bits = '';
  for (let i=0;i<pixels.length;i++) bits += pixels[i] > avg ? '1' : '0';
  return bits;
}

export function hamming(a: string, b: string) { let d=0; for (let i=0;i<a.length;i++) if (a[i]!==b[i]) d++; return d; }

export function isNearDuplicate(a: string, b: string, threshold = 8) { return hamming(a,b) <= threshold; }

export interface HashRecord { listingId: string; hash: string; }
const hashes: HashRecord[] = [];

export function recordImageHash(listingId: string, hash: string) { hashes.push({ listingId, hash }); }
export function findSimilar(hash: string, maxDist = 10) { return hashes.filter(h => isNearDuplicate(h.hash, hash, maxDist)); }