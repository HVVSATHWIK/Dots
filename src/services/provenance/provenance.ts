/**
 * Portfolio provenance hashing and (future) attestations.
 */
export interface ProvenanceRecord { id: string; userId: string; artifactHash: string; createdAt: number; algo: string; signature?: string; }

export function hashArtifact(content: ArrayBuffer | string, algo: 'sha256' = 'sha256'): string {
  // Placeholder deterministic hashing (NOT cryptographically secure for production) – replace with SubtleCrypto.
  const str = typeof content === 'string' ? content : new TextDecoder().decode(content as ArrayBuffer);
  let h = 0; for (let i = 0; i < str.length; i++) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  return `${algo}:${(h >>> 0).toString(16)}`;
}

export async function createProvenance(_userId: string, _hash: string): Promise<ProvenanceRecord> {
  return { id: 'prov-temp', userId: _userId, artifactHash: _hash, createdAt: Date.now(), algo: 'sha256' };
}
