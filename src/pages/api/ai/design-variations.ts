import type { APIRoute } from 'astro';
import { createVariationCacheKey, getCachedImage, setCachedImage } from '@/lib/media-cache';
import { incr, METRIC } from '@/lib/metrics';
import { publish } from '@/lib/event-bus';
import { vertexPredict, getVertexEnv } from '@/lib/vertex-imagen';
import { createHash } from 'node:crypto';

// This endpoint produces design/background variation suggestions. We avoid ever
// surfacing a 500 to the UI by returning stub variations if model calls fail.

export const prerender = false;

const DEFAULT_VARIATION_MODEL = 'imagen-3.0-vary-002';
const MAX_VARIATIONS = 4;

async function fileToBase64(file: File) {
  const ab = await file.arrayBuffer();
  if (typeof Buffer !== 'undefined') return Buffer.from(ab).toString('base64');
  let binary = '';
  const bytes = new Uint8Array(ab);
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  // @ts-ignore
  return btoa(binary);
}

export const POST: APIRoute = async ({ request }) => {
  publish('generation.requested', { kind: 'design-variations' });
  incr(METRIC.ASSISTANT_RUN);
  const attempts: any[] = [];
  try {
    const form = await request.formData();
    const prompt = String(form.get('prompt') ?? 'Refine background and lighting, keep product intact.');
    const baseImage = form.get('baseImage') as File | null;
    // Optional tuning parameters (sliders in future UI)
    const strengthParam = Number(form.get('strength') ?? '0.30');
    const cfgParam = Number(form.get('cfg') ?? '9');
    const stepsParam = Number(form.get('steps') ?? '40');

    if (prompt.length > 1200) {
      return json({ error: 'prompt too long', fallback: true, attempts }, 400);
    }
    if (!(baseImage instanceof File)) {
      return json({ ...stubVariations(), fallback: true, note: 'missing base image', attempts }, 200);
    }

    let baseB64: string;
    try {
      baseB64 = await fileToBase64(baseImage);
    } catch (e: any) {
      attempts.push({ stage: 'encode', ok: false, error: e?.message || 'encode failed' });
      return json({ ...stubVariations(), fallback: true, attempts, note: 'encoding failed' }, 200);
    }

    // Variation cache lookup (hash file content minimal fast hash)
    const buffForHash = Buffer.from(await baseImage.arrayBuffer());
    const hash = createHash('sha1').update(buffForHash).digest('hex').slice(0, 16);
    const cacheKey = createVariationCacheKey(hash, prompt + `|${strengthParam}|${cfgParam}|${stepsParam}`);
    const cachedVariations = getCachedImage(cacheKey);
    if (cachedVariations) {
      attempts.push({ cache: true, ok: true, via: 'memory-cache' });
      return json({ variations: cachedVariations, attempts, model: 'cache', cached: true }, 200);
    }

    const vertexModel = getVertexEnv('VARIATION_MODEL') || getVertexEnv('IMAGEN_VARIATION_MODEL') || getVertexEnv('IMAGEN_MODEL') || DEFAULT_VARIATION_MODEL;
    const variationCount = MAX_VARIATIONS;
    try {
      const vertex = await vertexPredict({
        prompt,
        sampleCount: variationCount,
        model: vertexModel,
        imageBase64: baseB64,
        imageMimeType: baseImage.type || 'image/jpeg',
      });
      if (vertex.images.length) {
        const variations = vertex.images.slice(0, variationCount).map(img => `data:${img.mime || 'image/png'};base64,${img.b64}`);
        attempts.push({ model: `vertex:${vertex.model}`, ok: true, source: 'vertex', params: { strength: strengthParam, cfg: cfgParam, steps: stepsParam } });
        setCachedImage(cacheKey, variations);
        return json({ variations, attempts, model: `vertex:${vertex.model}`, vertex: true }, 200);
      }
      attempts.push({ model: `vertex:${vertex.model}`, ok: false, source: 'vertex', error: 'no images returned' });
    } catch (err: any) {
      if (err?.message === 'vertex-missing-credentials') {
        attempts.push({ ok: false, source: 'vertex', error: 'vertex-missing-credentials' });
        return json({ ...stubVariations(), fallback: true, attempts, note: 'Vertex credentials missing – set VERTEX_SERVICE_ACCOUNT_JSON / GOOGLE_APPLICATION_CREDENTIALS or VERTEX_ACCESS_TOKEN.' }, 200);
      }
      const msg = err?.message || 'vertex-error';
      attempts.push({ model: `vertex:${vertexModel}`, ok: false, source: 'vertex', error: msg.slice(0, 240) });
    }

    const errorSummary = attempts
      .filter((a: any) => a.ok === false && a.error)
      .map((a: any) => `${a.model || a.stage || 'stage'}:${a.error}`)
      .slice(0, 6)
      .join('; ');
    return json({ ...stubVariations(), attempts, fallback: true, note: 'vertex attempt failed' + (errorSummary ? ' – ' + errorSummary : '') }, 200);
  } catch (e: any) {
    attempts.push({ ok: false, fatal: true, error: e?.message || 'fatal error' });
    return json({ ...stubVariations(), fallback: true, attempts, note: 'fatal error' }, 200);
  }
};

function stubVariations() {
  return {
    variations: [
      'https://static.wixstatic.com/media/d7d9fb_6da1e82469934cfb897017b6350736d1~mv2.png?originWidth=1920&originHeight=1024',
      'https://static.wixstatic.com/media/d7d9fb_a252aa7a948b46c6b4243cff0059d330~mv2.png?originWidth=1920&originHeight=1024',
      'https://static.wixstatic.com/media/d7d9fb_3b86be1391f746a093ff78ded0b98a08~mv2.png?originWidth=1920&originHeight=1024',
      'https://static.wixstatic.com/media/d7d9fb_ae1d196d955243b49e7f585bf4e4532e~mv2.png?originWidth=1920&originHeight=1024',
    ],
  };
}

function json(obj: any, status = 200) {
  return new Response(JSON.stringify(obj), { status, headers: { 'content-type': 'application/json' } });
}
