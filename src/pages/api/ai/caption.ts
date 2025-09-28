import type { APIRoute } from 'astro';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { publish } from '@/lib/event-bus';
import { incr, METRIC } from '@/lib/metrics';

export const prerender = false;

type Caption = {
  title: string;
  shortCaption: string;
  tags: string[];
  materials: string[];
  techniques: string[];
  colors: string[];
  style?: string;
  suggestedPriceRange?: { min: number; max: number; currency?: string };
  confidence?: number;
};

function pickModel(model?: string | null) {
  return (
    model || (import.meta.env.GEMINI_MODEL as string | undefined) || (process.env.GEMINI_MODEL as string | undefined) || 'gemini-1.5-flash'
  );
}

function toBase64(ab: ArrayBuffer): string {
  // Cross-runtime base64 (Node or Workers)
  // @ts-ignore
  if (typeof Buffer !== 'undefined') return Buffer.from(ab).toString('base64');
  // @ts-ignore
  if (typeof btoa !== 'undefined') {
    let binary = '';
    const bytes = new Uint8Array(ab);
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    // @ts-ignore
    return btoa(binary);
  }
  throw new Error('No base64 encoder available in this runtime');
}

async function fileToInlineData(file: File): Promise<{ data: string; mimeType: string }> {
  const ab = await file.arrayBuffer();
  return { data: toBase64(ab), mimeType: file.type || 'image/png' };
}

async function urlToInlineData(url: string): Promise<{ data: string; mimeType: string }> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch image url (${res.status})`);
  const mimeType = res.headers.get('content-type') || 'image/png';
  const ab = await res.arrayBuffer();
  return { data: toBase64(ab), mimeType };
}

export const POST: APIRoute = async ({ request }) => {
  try {
    publish('generation.requested', { kind: 'caption' });
    incr(METRIC.ASSISTANT_RUN);
    // Accept multipart/form-data or JSON { urls: string[] }
    const ct = request.headers.get('content-type') || '';
    const apiKey = (import.meta.env.GEMINI_API_KEY as string | undefined) ?? (process.env.GEMINI_API_KEY as string | undefined);
    const modelName = pickModel(null);

    if (!apiKey) {
      // Safe stub
      const stub: Caption = {
        title: 'Handmade Artisan Bowl',
        shortCaption: 'A hand-thrown ceramic bowl with natural glaze and rustic finish.',
        tags: ['ceramic', 'handmade', 'bowl', 'rustic'],
        materials: ['clay', 'natural glaze'],
        techniques: ['wheel-thrown', 'kiln-fired'],
        colors: ['earth brown', 'sage'],
        style: 'minimal, earthy',
        suggestedPriceRange: { min: 1200, max: 2200, currency: 'INR' },
        confidence: 0.4,
      };
      return new Response(JSON.stringify({ captions: [stub], note: 'No GEMINI_API_KEY set; returning stub.' }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: modelName });

    let inlineImages: Array<{ data: string; mimeType: string }> = [];

    if (ct.includes('multipart/form-data')) {
      const form = await request.formData();
      const files = form.getAll('images') as File[];
      const urls = (form.getAll('urls') as string[]).filter(Boolean);
      const blobs: Array<Promise<{ data: string; mimeType: string }>> = [];
      for (const f of files) blobs.push(fileToInlineData(f));
      for (const u of urls) blobs.push(urlToInlineData(u));
      inlineImages = await Promise.all(blobs);
    } else if (ct.includes('application/json')) {
      const body = await request.json().catch(() => ({}));
      const urls: string[] = Array.isArray(body?.urls) ? body.urls : [];
      inlineImages = await Promise.all(urls.slice(0, 3).map(urlToInlineData));
    } else {
      return new Response(JSON.stringify({ error: 'Send multipart/form-data (images) or JSON { urls: string[] }' }), {
        status: 415,
        headers: { 'content-type': 'application/json' },
      });
    }

    if (!inlineImages.length) {
      return new Response(JSON.stringify({ error: 'No images provided' }), {
        status: 400,
        headers: { 'content-type': 'application/json' },
      });
    }

    // Process up to 3 images to cap latency
    inlineImages = inlineImages.slice(0, 3);

    const captions: Caption[] = [];
    for (const img of inlineImages) {
      const prompt = `You are an expert cataloguer for an artisan marketplace (Indian handicrafts).
Return STRICT JSON only, with keys:
{
  "title": string,
  "shortCaption": string,
  "tags": string[],
  "materials": string[],
  "techniques": string[],
  "colors": string[],
  "style": string,
  "suggestedPriceRange": { "min": number, "max": number, "currency": "INR" },
  "confidence": number
}
Be concise and realistic. If unsure, leave arrays empty and confidence lower.`;

      const parts: any[] = [
        { text: prompt },
        { inlineData: img },
      ];

      const result = await model.generateContent({ contents: [{ role: 'user', parts }] });
      const text = result.response.text() || '';
      let parsed: Caption | null = null;
      try {
        // Try to extract JSON from the response
        const match = text.match(/\{[\s\S]*\}/);
        parsed = JSON.parse(match ? match[0] : text);
      } catch {
        parsed = {
          title: 'Untitled Artisan Work',
          shortCaption: text.slice(0, 240),
          tags: [],
          materials: [],
          techniques: [],
          colors: [],
          style: '',
          suggestedPriceRange: undefined,
          confidence: 0.2,
        };
      }
      captions.push(parsed!);
    }

    return new Response(JSON.stringify({ captions }), { status: 200, headers: { 'content-type': 'application/json' } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message ?? 'error' }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }
};
