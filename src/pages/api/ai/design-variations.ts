import type { APIRoute } from 'astro';
import { GoogleGenerativeAI } from '@google/generative-ai';
// Optional local transformation fallback (non-AI) using sharp if available.
let sharp: any = null;
try { sharp = (await import('sharp')).default; } catch { /* sharp not installed in some runtimes */ }
import { selectModels, recordModelSuccess } from '@/lib/ai-model-router';
import { incr, METRIC } from '@/lib/metrics';
import { publish } from '@/lib/event-bus';

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
    if (prompt.length > 1200) {
      return json({ error: 'prompt too long', fallback: true, attempts }, 400);
    }
    const apiKey = (import.meta.env.GEMINI_API_KEY as string | undefined) ?? (process.env.GEMINI_API_KEY as string | undefined);
    if (!apiKey) return json({ ...stubVariations(), fallback: true, note: 'missing api key', attempts }, 200);
    if (!(baseImage instanceof File)) return json({ ...stubVariations(), fallback: true, note: 'missing base image', attempts }, 200);

    // Model candidate loop (reuses image_generate task routing for consistency)
    const { candidates, override, cached } = selectModels('image_generate');
    const genAI = new GoogleGenerativeAI(apiKey);
    let baseB64: string;
    try {
      baseB64 = await fileToBase64(baseImage);
    } catch (e: any) {
      attempts.push({ stage: 'encode', ok: false, error: e?.message || 'encode failed' });
      return json({ ...stubVariations(), fallback: true, attempts, note: 'encoding failed' }, 200);
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
          return json({ variations, attempts, model, override: !!override, cachedRouter: !!cached }, 200);
        }
        // If no inline images, fall back to parsing URLs from any text (rare case)
        const txt = result?.response?.text?.() || '';
        const urlRegex = /(https?:\/\/[^\s)\]]+)/g;
        const urls = Array.from(txt.matchAll(urlRegex)).map(m => m[1]).slice(0,4);
        if (urls.length) {
          attempts.push({ model, ok: true, via: 'urls' });
          recordModelSuccess('image_generate', model);
          return json({ variations: urls, attempts, model, override: !!override, cachedRouter: !!cached }, 200);
        }
        attempts.push({ model, ok: false, error: 'no inline images' });
      } catch (e: any) {
        attempts.push({ model, ok: false, error: e?.message || 'generation failed' });
        continue;
      }
    }
    // All Gemini/Imagen style candidates failed – attempt Stability AI image-to-image if configured
    const stabilityKey = (process.env.STABILITY_API_KEY || (import.meta as any).env?.STABILITY_API_KEY) as string | undefined;
    if (!stabilityKey) {
      attempts.push({ model: 'stability-image2image', ok: false, error: 'STABILITY_API_KEY missing' });
    }
    if (stabilityKey) {
      try {
        const engine = (process.env.STABILITY_ENGINE || (import.meta as any).env?.STABILITY_ENGINE) || 'stable-diffusion-xl-1024-v1-0';
        // Prepare multipart form
        const buf = Buffer.from(await baseImage.arrayBuffer());
        const form = new FormData();
        form.append('init_image', new Blob([buf], { type: baseImage.type || 'image/jpeg' }), baseImage.name || 'init.jpg');
        form.append('image_strength', '0.30'); // retain core motif
        form.append('steps', '40');
        form.append('cfg_scale', '9');
        form.append('samples', '4');
        form.append('text_prompts[0][text]', `${prompt}. Preserve the main subject identity.`);
        form.append('text_prompts[0][weight]', '1');
        const resp = await fetch(`https://api.stability.ai/v1/generation/${engine}/image-to-image`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${stabilityKey}`, 'Accept': 'application/json' },
          body: form as any
        });
        if (!resp.ok) {
          const txt = await resp.text().catch(()=> '');
          attempts.push({ model: 'stability-image2image', ok: false, error: `HTTP ${resp.status}: ${txt.slice(0,140)}` });
        } else {
          const data: any = await resp.json().catch(()=>null);
          const arts = data?.artifacts || [];
            const vars = arts.filter((a: any)=>a.base64).slice(0,4).map((a: any)=>`data:image/png;base64,${a.base64}`);
          if (vars.length) {
            attempts.push({ model: 'stability-image2image', ok: true });
            return json({ variations: vars, attempts, model: 'stability-image2image' }, 200);
          } else {
            attempts.push({ model: 'stability-image2image', ok: false, error: 'no artifacts' });
          }
        }
      } catch (e: any) {
        attempts.push({ model: 'stability-image2image', ok: false, error: e?.message || 'stability-error' });
      }
    }
    // All candidates + Stability failed – try local deterministic transforms if sharp present
    if (sharp && baseImage instanceof File) {
      try {
        const buff = Buffer.from(await baseImage.arrayBuffer());
        const variants: string[] = [];
        // Simple transforms: original resize, rotate, color tint, blur
        const pipelineFns: ((img: any) => any)[] = [
          (img) => img.resize(512, 512, { fit: 'cover' }),
          (img) => img.resize(512,512,{fit:'cover'}).rotate(5),
          (img) => img.resize(512,512,{fit:'cover'}).modulate({ saturation: 1.3, brightness: 1.05 }),
          (img) => img.resize(512,512,{fit:'cover'}).blur(1)
        ];
        for (const fn of pipelineFns) {
          const out = await fn(sharp(buff)).toFormat('png').toBuffer();
          variants.push(`data:image/png;base64,${out.toString('base64')}`);
          if (variants.length >= 4) break;
        }
        attempts.push({ local: true, ok: true, via: 'sharp-fallback' });
        return json({ variations: variants, attempts, fallback: true, note: 'local sharp fallback (no model images)' }, 200);
      } catch (e: any) {
        attempts.push({ local: true, ok: false, error: e?.message || 'sharp-fallback-failed' });
      }
    }
    const errorSummary = attempts.filter(a => a.ok === false && a.error).map(a => `${a.model || a.stage || 'stage'}:${a.error}`).slice(0,6).join('; ');
    return json({ ...stubVariations(), attempts, fallback: true, note: 'all models failed' + (errorSummary ? ' – ' + errorSummary : '') }, 200);
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
