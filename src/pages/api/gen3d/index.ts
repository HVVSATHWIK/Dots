import type { APIRoute } from 'astro';

// In-memory job store (ephemeral). In production replace with Firestore or Redis.
interface Gen3DJob {
  id: string;
  prompt: string;
  status: 'queued' | 'processing' | 'succeeded' | 'failed';
  createdAt: number;
  updatedAt: number;
  progress: number; // 0-100
  url?: string; // URL to generated GLB/GLTF (optional for now)
  mode?: 'procedural' | 'asset';
  error?: string;
}

const jobs: Record<string, Gen3DJob> = (globalThis as any).__GEN3D_JOBS__ || {};
(globalThis as any).__GEN3D_JOBS__ = jobs;

function schedule(job: Gen3DJob) {
  // Simulate async progress.
  const step = () => {
    const j = jobs[job.id];
    if (!j) return;
    if (j.status === 'succeeded' || j.status === 'failed') return;
    if (j.progress < 100) {
      j.progress = Math.min(100, j.progress + Math.random() * 35);
      j.status = j.progress >= 100 ? 'succeeded' : (j.progress > 5 ? 'processing' : 'queued');
      j.mode = 'procedural';
      j.updatedAt = Date.now();
      if (j.status === 'succeeded') {
        // In a real integration, set j.url to a CDN GLB link.
      } else {
        setTimeout(step, 750 + Math.random() * 600);
      }
    }
  };
  setTimeout(step, 500);
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json().catch(() => ({}));
    const prompt: string = (body.prompt || '').toString().trim();
    if (!prompt) {
      return new Response(JSON.stringify({ error: 'Missing prompt' }), { status: 400 });
    }
    const id = 'job_' + Math.random().toString(36).slice(2, 10);
    const job: Gen3DJob = {
      id,
      prompt,
      status: 'queued',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      progress: 0,
      mode: 'procedural'
    };
    jobs[id] = job;
    schedule(job);
    return new Response(JSON.stringify({ id, status: job.status }), { status: 202, headers: { 'content-type': 'application/json' } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || 'Internal error' }), { status: 500 });
  }
};

export const prerender = false;
