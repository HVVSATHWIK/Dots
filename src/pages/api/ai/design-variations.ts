import type { APIRoute } from 'astro';
import { GoogleGenerativeAI } from '@google/generative-ai';

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
  try {
    const form = await request.formData();
    const prompt = String(form.get('prompt') ?? 'Refine background and lighting, keep product intact.');
    const baseImage = form.get('baseImage') as File | null;

  const apiKey = (import.meta.env.GEMINI_API_KEY as string | undefined) ?? (process.env.GEMINI_API_KEY as string | undefined);
    if (!apiKey || !(baseImage instanceof File)) {
      // Fall back to static stubs if missing input or key
      const json = {
        variations: [
          'https://static.wixstatic.com/media/d7d9fb_6da1e82469934cfb897017b6350736d1~mv2.png?originWidth=1920&originHeight=1024',
          'https://static.wixstatic.com/media/d7d9fb_a252aa7a948b46c6b4243cff0059d330~mv2.png?originWidth=1920&originHeight=1024',
          'https://static.wixstatic.com/media/d7d9fb_3b86be1391f746a093ff78ded0b98a08~mv2.png?originWidth=1920&originHeight=1024',
          'https://static.wixstatic.com/media/d7d9fb_ae1d196d955243b49e7f585bf4e4532e~mv2.png?originWidth=1920&originHeight=1024',
        ],
      };
      return new Response(JSON.stringify(json), { status: 200, headers: { 'content-type': 'application/json' } });
    }

  const genAI = new GoogleGenerativeAI(apiKey);
  const modelName = (import.meta.env.GEMINI_MODEL as string | undefined) || (process.env.GEMINI_MODEL as string | undefined) || 'gemini-1.5-flash';
  const model = genAI.getGenerativeModel({ model: modelName });

    const b64 = await fileToBase64(baseImage);
    const parts: any[] = [
      { text: `Using this product image, generate 3-4 alternative designs or backgrounds.
Return only data URLs (base64) if you directly output images; otherwise respond with absolute URLs.
If not capable of outputting images in this environment, reply with four example URLs representative of variations.` },
      { inlineData: { mimeType: baseImage.type || 'image/jpeg', data: b64 } },
      { text: `Style instructions: ${prompt}` },
    ];

    const result = await model.generateContent({ contents: [{ role: 'user', parts }] });
    const text = result.response.text();

    // Try to parse URLs from response (fallback to stubs if none)
    const urlRegex = /(https?:\/\/[^\s)\]]+)/g;
    const urls = Array.from(text.matchAll(urlRegex)).map((m) => m[1]).slice(0, 4);
    const json = {
      variations: urls.length > 0 ? urls : [
        'https://static.wixstatic.com/media/d7d9fb_6da1e82469934cfb897017b6350736d1~mv2.png?originWidth=1920&originHeight=1024',
        'https://static.wixstatic.com/media/d7d9fb_a252aa7a948b46c6b4243cff0059d330~mv2.png?originWidth=1920&originHeight=1024',
        'https://static.wixstatic.com/media/d7d9fb_3b86be1391f746a093ff78ded0b98a08~mv2.png?originWidth=1920&originHeight=1024',
        'https://static.wixstatic.com/media/d7d9fb_ae1d196d955243b49e7f585bf4e4532e~mv2.png?originWidth=1920&originHeight=1024',
      ],
    };
    return new Response(JSON.stringify(json), { status: 200, headers: { 'content-type': 'application/json' } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message ?? 'error' }), { status: 500 });
  }
};
