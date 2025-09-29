import type { APIRoute } from 'astro';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { selectModels, recordModelSuccess } from '@/lib/ai-model-router';
import { createVariationCacheKey, getCachedImage, setCachedImage } from '@/lib/media-cache';
import { incr, METRIC } from '@/lib/metrics';
import { publish } from '@/lib/event-bus';
import { createHash } from 'node:crypto';

// This endpoint produces design/background variation suggestions. We avoid ever
// surfacing a 500 to the UI by returning stub variations if model calls fail.

export const prerender = false;

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
    const apiKey = (import.meta.env.GEMINI_API_KEY as string | undefined) ?? (process.env.GEMINI_API_KEY as string | undefined);
    if (!apiKey) return json({ ...stubVariations(), fallback: true, note: 'missing api key', attempts }, 200);
  if (!(baseImage instanceof File)) return json({ ...stubVariations(), fallback: true, note: 'missing base image', attempts }, 200);

    // Model candidate loop restricted to Imagen family only per user request
    const { candidates: rawCandidates, override, cached: routerCached } = selectModels('image_generate');
    const candidates = rawCandidates.filter(m => m.startsWith('imagen-'));
    if (!candidates.length) {
      attempts.push({ ok: false, error: 'no-imagen-models-available' });
      return json({ ...stubVariations(), fallback: true, attempts, note: 'No Imagen models present in router candidates. Configure imagen-* access.' }, 200);
    }
    const genAI = new GoogleGenerativeAI(apiKey);
    let baseB64: string;
    try {
      baseB64 = await fileToBase64(baseImage);
    } catch (e: any) {
      attempts.push({ stage: 'encode', ok: false, error: e?.message || 'encode failed' });
      return json({ ...stubVariations(), fallback: true, attempts, note: 'encoding failed' }, 200);
    }

    // Variation cache lookup (hash file content minimal fast hash)
    const buffForHash = Buffer.from(await baseImage.arrayBuffer());
    const hash = createHash('sha1').update(buffForHash).digest('hex').slice(0,16);
    const cacheKey = createVariationCacheKey(hash, prompt + `|${strengthParam}|${cfgParam}|${stepsParam}`);
    const cachedVariations = getCachedImage(cacheKey);
    if (cachedVariations) {
      attempts.push({ cache: true, ok: true, via: 'memory-cache' });
      return json({ variations: cachedVariations, attempts, model: 'cache', cached: true }, 200);
    }

    // For each candidate model, attempt inline image variation generation.
    for (const model of candidates) {
      try {
        const m = genAI.getGenerativeModel({ model });
        const instruction = `You are an image variation engine. Produce 3-4 high-quality variation images derived from the base product/motif while preserving the core subject identity. Variation prompt: ${prompt}. DO NOT return textual descriptions. Return ONLY images.`;
        const result: any = await m.generateContent({
          contents: [{ role: 'user', parts: [ { text: instruction }, { inlineData: { mimeType: baseImage.type || 'image/jpeg', data: baseB64 } } ] }]
        } as any);
        const parts: any[] = result?.response?.candidates?.[0]?.content?.parts || [];
        const imgs = parts.filter(p => p.inlineData?.data).slice(0, 4).map(p => ({ b64: p.inlineData.data, mime: p.inlineData.mimeType || 'image/png' }));
        if (imgs.length) {
          attempts.push({ model, ok: true });
          recordModelSuccess('image_generate', model);
          // Return as data URLs for UI convenience
            const variations = imgs.map(i => `data:${i.mime};base64,${i.b64}`);
          return json({ variations, attempts, model, override: !!override, cachedRouter: !!routerCached }, 200);
        }
        // If no inline images, fall back to parsing URLs from any text (rare case)
        const txt = result?.response?.text?.() || '';
        const urlRegex = /(https?:\/\/[^\s)\]]+)/g;
        const urls = Array.from(txt.matchAll(urlRegex)).map(m => m[1]).slice(0,4);
        if (urls.length) {
          attempts.push({ model, ok: true, via: 'urls' });
          recordModelSuccess('image_generate', model);
          setCachedImage(cacheKey, urls);
          return json({ variations: urls, attempts, model, override: !!override, cachedRouter: !!routerCached }, 200);
        }
        attempts.push({ model, ok: false, error: 'no inline images' });
      } catch (e: any) {
        attempts.push({ model, ok: false, error: e?.message || 'generation failed' });
        continue;
      }
    }
    const errorSummary = attempts.filter(a => a.ok === false && a.error).map(a => `${a.model || a.stage || 'stage'}:${a.error}`).slice(0,6).join('; ');
    return json({ ...stubVariations(), attempts, fallback: true, note: 'all imagen models failed' + (errorSummary ? ' – ' + errorSummary : '') }, 200);
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
