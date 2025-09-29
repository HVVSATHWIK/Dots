import type { APIRoute } from 'astro';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { selectModels, recordModelSuccess } from '@/lib/ai-model-router';
import { incr, METRIC } from '@/lib/metrics';
import { publish } from '@/lib/event-bus';
import { createMediaCacheKey, getCachedImage, setCachedImage } from '@/lib/media-cache';
import { consumeRate } from '@/lib/rate-limit';
import { isFlagEnabled } from '@/lib/feature-flags';

export const prerender = false;

const MAX_VARIANTS = 3;
const DEFAULT_MIME = 'image/png';

export const POST: APIRoute = async ({ request }) => {
  try {
    publish('generation.requested', { kind: 'image-generate' });
    incr(METRIC.ASSISTANT_RUN);
    const { prompt, variants = 1, size = 'square' } = await request.json();
    if (!isFlagEnabled('aiImageGen')) return json({ error: 'disabled' }, 403);
    if (!prompt || typeof prompt !== 'string') return json({ error: 'Missing prompt' }, 400);
    if (prompt.length > 4000) return json({ error: 'Prompt too long (max 4000 chars)' }, 400);
    // Basic per-IP rate limit (best-effort; trust x-forwarded-for else remote address when available)
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anon';
    if (!consumeRate(ip, 'image')) {
      return json({ error: 'rate_limited' }, 429);
    }
    const apiKey = (import.meta.env.GEMINI_API_KEY as string | undefined) || (process.env.GEMINI_API_KEY as string | undefined);
  const count = Math.min(Math.max(1, variants), MAX_VARIANTS);
    if (!apiKey) return json(heuristicImageFallback(prompt, count), 200);

    const { candidates, override, cached } = selectModels('image_generate');
    const cacheKey = createMediaCacheKey(prompt, size);
    const cachedImgs = getCachedImage(cacheKey);
    if (cachedImgs) {
      incr(METRIC.IMAGE_CACHE_HIT);
      return json({ images: cachedImgs, cached: true, model: cachedImgs[0]?.model, attempts: [] }, 200);
    }
    incr(METRIC.IMAGE_CACHE_MISS);

    const genAI = new GoogleGenerativeAI(apiKey);
    const attempts: { model: string; ok: boolean; error?: string }[] = [];
    let lastErr: any;
    for (const model of candidates) {
      try {
        const m = genAI.getGenerativeModel({ model });
        const result = await m.generateContent({
          contents: [{ role: 'user', parts: [{ text: imagePrompt(prompt, size) }] }],
        } as any);
        const parts: any[] = result?.response?.candidates?.[0]?.content?.parts || [];
        const imgs = parts.filter(p => p.inlineData?.data).slice(0, count).map(p => ({
          b64: p.inlineData.data,
          mime: p.inlineData.mimeType || DEFAULT_MIME,
          model
        }));
        if (!imgs.length) throw new Error('No image data');
        attempts.push({ model, ok: true });
        recordModelSuccess('image_generate', model);
        setCachedImage(cacheKey, imgs);
        incr(METRIC.MODEL_SUCCESS_PREFIX + ':' + model);
        return json({ images: imgs, attempts, model, override: !!override, cachedRouter: !!cached }, 200);
      } catch (err: any) {
        const msg = err?.message || String(err);
        attempts.push({ model, ok: false, error: msg.slice(0,240) });
        incr(METRIC.MODEL_FAIL_PREFIX + ':' + model);
        lastErr = err;
        if (/unauth|denied|permission/i.test(msg)) break;
        continue;
      }
    }
    const fb = heuristicImageFallback(prompt, count);
    return json({ ...fb, attempts, error: lastErr?.message || 'image-model-failed', fallback: true }, 200);
  } catch (e: any) {
    // Fallback with single placeholder image when an unexpected top-level error occurs
    return json({ ...heuristicImageFallback('', 1), error: e?.message || 'image-error', fallback: true }, 200);
  }
};

function imagePrompt(user: string, size: string) {
  return `Generate a high-quality product photo (size:${size}). Subject: ${user.trim()}`;
}

function heuristicImageFallback(prompt: string, count: number) {
  const transparent = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIW2NgYGD4DwABBAEAOt4f8QAAAABJRU5ErkJggg==';
  const images = Array.from({ length: count }, () => ({ b64: transparent, mime: 'image/png', model: 'fallback' }));
  const snippet = (prompt || '').trim().slice(0, 60);
  return { images, fallback: true, note: `Placeholder image${snippet ? ' (prompt snippet: ' + snippet + ')' : ''} – configure Imagen/Gemini image model for real output.` };
}

function json(obj: any, status = 200) { return new Response(JSON.stringify(obj), { status, headers: { 'content-type': 'application/json' } }); }
