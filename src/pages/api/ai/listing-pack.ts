import type { APIRoute } from 'astro';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { publish } from '@/lib/event-bus';
import { incr, METRIC } from '@/lib/metrics';

// NOTE: This endpoint predates the unified model router used elsewhere. We keep direct usage
// for now because it expects a structured JSON object, but add robust fallback + attempts
// metadata similar to newer endpoints so the UI never sees a raw 500.

export const prerender = false;

// Small helpers
async function fileToBase64(file: File) {
  const ab = await file.arrayBuffer();
  if (typeof Buffer !== 'undefined') return Buffer.from(ab).toString('base64');
  // Fallback for runtimes without Buffer
  let binary = '';
  const bytes = new Uint8Array(ab);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) binary += String.fromCharCode(bytes[i]);
  // @ts-ignore btoa exists in web runtimes
  return btoa(binary);
}

function extractJson(text: string) {
  // Try to robustly extract the first JSON object from model output (handles code fences)
  const codeFence = text.match(/```(?:json)?\n([\s\S]*?)```/i);
  const raw = codeFence ? codeFence[1] : text;
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start >= 0 && end > start) {
    return JSON.parse(raw.slice(start, end + 1));
  }
  // Last resort
  return JSON.parse(raw);
}

export const POST: APIRoute = async ({ request }) => {
  publish('generation.requested', { kind: 'listing-pack' });
  incr(METRIC.ASSISTANT_RUN);
  const attempts: any[] = [];
  try {
    const form = await request.formData();
    const languages = JSON.parse(String(form.get('languages') ?? '[]')) as string[];
    const photoTheme = String(form.get('photoTheme') ?? '');
    const voiceNote = form.get('voiceNote') as File | null;
    const images: File[] = [];
    for (const [key, val] of form.entries()) {
      if (key.startsWith('images[') && val instanceof File) images.push(val);
    }

    // Input guardrails
    if (photoTheme.length > 400) {
      return new Response(JSON.stringify({ error: 'photoTheme too long', attempts, fallback: true }), { status: 400, headers: { 'content-type': 'application/json' } });
    }

    const apiKey = (import.meta.env.GEMINI_API_KEY as string | undefined) ?? (process.env.GEMINI_API_KEY as string | undefined);
    if (!apiKey) {
      const wantsHindi = languages.includes('hi');
      const stub = buildStubListingPack(wantsHindi);
      return new Response(JSON.stringify({ ...stub, fallback: true, attempts, note: 'No GEMINI_API_KEY configured.' }), { status: 200, headers: { 'content-type': 'application/json' } });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const modelName = (import.meta.env.GEMINI_MODEL as string | undefined) || (process.env.GEMINI_MODEL as string | undefined) || 'gemini-1.5-flash';
    const model = genAI.getGenerativeModel({ model: modelName });

    const parts: any[] = [];
    parts.push({
      text: `You are a listing and storytelling copilot for artisans.
Produce a concise JSON matching this TypeScript type (no extra text):
type ListingPack = {
  title: { en: string; hi?: string };
  description: { en: string; hi?: string };
  tags: string[];
  price: { min: number; max: number; rationale: string };
  assets: { cleanedImages: string[]; poster?: string; catalogCard?: string };
  social: { caption: { en: string; hi?: string } };
  meta: { artisanName: string };
};

Guidance:
- Use any attached images to infer product details, style, colors.
- If an audio note is attached, first transcribe it and use the content for title/description.
- Languages requested: ${languages.join(', ') || 'en'}.
- If 'hi' is requested, include high-quality Hindi for title/description/caption.
- Use '${photoTheme || 'natural light'}' as the preferred photo theme in suggestions (do not invent URLs).
- assets.cleanedImages should echo back one or more representative images as data URLs only if the input images were data URLs; otherwise leave cleanedImages empty and focus on text outputs.
- Keep tags relevant and minimal (4-6).
- price should be reasonable INR min/max with one sentence rationale.
- social.caption should be WhatsApp-ready, short, and include 2-3 relevant hashtags.
` });

    for (const img of images) {
      try {
        const b64 = await fileToBase64(img);
        parts.push({ inlineData: { mimeType: img.type || 'image/jpeg', data: b64 } });
      } catch (e: any) {
        attempts.push({ stage: 'image-encode', name: img.name, error: e?.message || 'encode failed' });
      }
    }

    if (voiceNote instanceof File) {
      try {
        const b64v = await fileToBase64(voiceNote);
        parts.push({ inlineData: { mimeType: voiceNote.type || 'audio/mpeg', data: b64v } });
      } catch (e: any) {
        attempts.push({ stage: 'audio-encode', name: voiceNote.name, error: e?.message || 'encode failed' });
      }
    }

    let json: any | null = null;
    try {
      const result = await model.generateContent({ contents: [{ role: 'user', parts }] });
      const text = result.response.text();
      json = extractJson(text);
      attempts.push({ model: modelName, ok: true });
    } catch (e: any) {
      attempts.push({ model: modelName, ok: false, error: e?.message || 'generation failed' });
    }

    if (!json) {
      const wantsHindi = languages.includes('hi');
      const stub = buildStubListingPack(wantsHindi);
      return new Response(JSON.stringify({ ...stub, fallback: true, attempts, note: 'Model generation failed; returning stub.' }), { status: 200, headers: { 'content-type': 'application/json' } });
    }

    if (!languages.includes('hi')) {
      if (json?.title) delete json.title?.hi;
      if (json?.description) delete json.description?.hi;
      if (json?.social?.caption) delete json.social.caption?.hi;
    }
    return new Response(JSON.stringify({ ...json, attempts, model: modelName }), { status: 200, headers: { 'content-type': 'application/json' } });
  } catch (e: any) {
    // Absolute last-resort catch; never emit 500 for UX-critical path.
    const wantsHindi = false; // unknown here
    const stub = buildStubListingPack(wantsHindi);
    attempts.push({ ok: false, fatal: true, error: e?.message || 'fatal error' });
    return new Response(JSON.stringify({ ...stub, fallback: true, attempts, note: 'Fatal error; stub provided.' }), { status: 200, headers: { 'content-type': 'application/json' } });
  }
};

function buildStubListingPack(wantsHindi: boolean) {
  return {
    title: { en: 'Handcrafted Artisan Piece', ...(wantsHindi ? { hi: 'हस्तनिर्मित कला वस्तु' } : {}) },
    description: {
      en: 'A unique, handcrafted item made with care by an Indian artisan. Perfect for gifting or adding charm to your home.',
      ...(wantsHindi ? { hi: 'एक अनोखी, हस्तनिर्मित वस्तु जो भारतीय कारीगर द्वारा प्रेम से बनाई गई है। उपहार देने या घर की शोभा बढ़ाने के लिए उत्तम।' } : {})
    },
    tags: ['handmade', 'artisan', 'craft', 'heritage'],
    price: { min: 1200, max: 2800, rationale: 'Estimated INR range for similar handmade crafts.' },
    assets: { cleanedImages: [], poster: undefined, catalogCard: undefined },
    social: {
      caption: {
        en: 'Discover authentic handcrafted beauty. #Handmade #Artisan #Craft',
        ...(wantsHindi ? { hi: 'ख़री सच्ची हस्तनिर्मित खूबसूरती देखें। #हस्तनिर्मित #कारीगर #कला' } : {})
      }
    },
    meta: { artisanName: 'Unknown Artisan' }
  };
}
