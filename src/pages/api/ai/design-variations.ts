import type { APIRoute } from 'astro';
import { GoogleGenerativeAI } from '@google/generative-ai';

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
  const attempts: any[] = [];
  try {
    const form = await request.formData();
    const prompt = String(form.get('prompt') ?? 'Refine background and lighting, keep product intact.');
    const baseImage = form.get('baseImage') as File | null;

    if (prompt.length > 1200) {
      return new Response(JSON.stringify({ error: 'prompt too long', fallback: true, attempts }), { status: 400, headers: { 'content-type': 'application/json' } });
    }

    const apiKey = (import.meta.env.GEMINI_API_KEY as string | undefined) ?? (process.env.GEMINI_API_KEY as string | undefined);
    if (!apiKey || !(baseImage instanceof File)) {
      return new Response(JSON.stringify({ ...stubVariations(), fallback: true, note: 'missing api key or base image', attempts }), { status: 200, headers: { 'content-type': 'application/json' } });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const modelName = (import.meta.env.GEMINI_MODEL as string | undefined) || (process.env.GEMINI_MODEL as string | undefined) || 'gemini-1.5-flash';
    const model = genAI.getGenerativeModel({ model: modelName });

    let b64: string | null = null;
    try {
      b64 = await fileToBase64(baseImage);
    } catch (e: any) {
      attempts.push({ stage: 'encode', ok: false, error: e?.message || 'encode failed' });
      return new Response(JSON.stringify({ ...stubVariations(), fallback: true, attempts, note: 'image encoding failed' }), { status: 200, headers: { 'content-type': 'application/json' } });
    }

    const parts: any[] = [
      { text: `Using this product image, generate 3-4 alternative designs or backgrounds.\nReturn only data URLs (base64) if you directly output images; otherwise respond with absolute URLs.\nIf not capable of outputting images in this environment, reply with four example URLs representative of variations.` },
      { inlineData: { mimeType: baseImage.type || 'image/jpeg', data: b64 } },
      { text: `Style instructions: ${prompt}` },
    ];

    let text: string | null = null;
    try {
      const result = await model.generateContent({ contents: [{ role: 'user', parts }] });
      text = result.response.text();
      attempts.push({ model: modelName, ok: true });
    } catch (e: any) {
      attempts.push({ model: modelName, ok: false, error: e?.message || 'generation failed' });
    }

    if (!text) {
      return new Response(JSON.stringify({ ...stubVariations(), fallback: true, attempts, note: 'model generation failed' }), { status: 200, headers: { 'content-type': 'application/json' } });
    }

    const urlRegex = /(https?:\/\/[^\s)\]]+)/g;
    const urls = Array.from(text.matchAll(urlRegex)).map(m => m[1]).slice(0, 4);
    const variations = urls.length > 0 ? urls : stubVariations().variations;
    return new Response(JSON.stringify({ variations, attempts, model: modelName, fallback: urls.length === 0 }), { status: 200, headers: { 'content-type': 'application/json' } });
  } catch (e: any) {
    attempts.push({ ok: false, fatal: true, error: e?.message || 'fatal error' });
    return new Response(JSON.stringify({ ...stubVariations(), fallback: true, attempts, note: 'fatal error' }), { status: 200, headers: { 'content-type': 'application/json' } });
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
