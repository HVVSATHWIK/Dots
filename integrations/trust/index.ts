import type { BirthCertificate, MintInput } from './types';

const trustApi = import.meta.env.VITE_API_TRUST_BASE_URL ?? '/api/trust';

export async function mintBirthCertificate(input: MintInput): Promise<BirthCertificate> {
  if (trustApi) {
    const fd = new FormData();
    fd.append('title', input.title);
    fd.append('artisanName', input.artisanName);
    input.images.forEach((u, i) => fd.append(`images[${i}]`, u));
    if (input.rawEvidence.voiceNote) fd.append('voiceNote', input.rawEvidence.voiceNote);
    input.rawEvidence.workInProgress.forEach((f, i) => fd.append(`workInProgress[${i}]`, f));
  const res = await fetch(`${trustApi}/mint`, { method: 'POST', body: fd });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Trust API error (${res.status}): ${text.slice(0, 240)}`);
    }
    const ct = res.headers.get('content-type') || '';
    if (!ct.includes('application/json')) {
      const text = await res.text().catch(() => '');
      throw new Error(`Trust API non-JSON response: ${text.slice(0, 240)}`);
    }
    return await res.json();
  }
  await new Promise(r => setTimeout(r, 800));
  return {
    tokenId: 'polygon:0xABCDEF...1234',
    qrUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https%3A%2F%2Fpolygonscan.com%2Ftx%2F0xABC',
    explorerUrl: 'https://polygonscan.com/tx/0xABCDEF000...',
  };
}
