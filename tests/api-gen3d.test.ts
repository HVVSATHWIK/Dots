import { describe, it, expect } from 'vitest';
import { POST as create } from '@/pages/api/gen3d/index';

describe('gen3d API', () => {
  it('creates a job with a prompt', async () => {
    const req = new Request('http://localhost/api/gen3d', { method: 'POST', body: JSON.stringify({ prompt: 'test object' }) });
    const res = await create({ request: req } as any);
    expect(res.status).toBe(202);
    const json: any = await res.json();
    expect(json.id).toBeTruthy();
    expect(json.status).toBe('queued');
  });
  it('rejects missing prompt', async () => {
    const req = new Request('http://localhost/api/gen3d', { method: 'POST', body: JSON.stringify({}) });
    const res = await create({ request: req } as any);
    expect(res.status).toBe(400);
  });
});
