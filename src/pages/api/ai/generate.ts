import type { APIRoute } from 'astro';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const prerender = false;

/*
 Generic text generation endpoint
 Body: { prompt: string; model?: string; system?: string }
 Returns: { reply: string }
*/
export const POST: APIRoute = async ({ request }) => {
  try {
    const { prompt, model, system } = await request.json();
    if (!prompt || typeof prompt !== 'string') {
      return new Response(JSON.stringify({ error: 'Missing prompt' }), { status: 400 });
    }
    const apiKey = (import.meta.env.GEMINI_API_KEY as string | undefined) ?? (process.env.GEMINI_API_KEY as string | undefined);
    if (!apiKey) {
      // Safe stub for local dev when key not configured
      return new Response(JSON.stringify({ reply: `(stub) You asked: ${prompt.slice(0, 180)}` }), { status: 200, headers: { 'content-type': 'application/json' } });
    }
    const genAI = new GoogleGenerativeAI(apiKey);
    const modelName = model || (import.meta.env.GEMINI_MODEL as string | undefined) || (process.env.GEMINI_MODEL as string | undefined) || 'gemini-1.5-flash';
    const m = genAI.getGenerativeModel({ model: modelName });
    const baseSystem = system || 'You are a helpful assistant.';
    const result = await m.generateContent({
      contents: [
        { role: 'user', parts: [{ text: `${baseSystem}\nUser: ${prompt}\nAssistant:` }] },
      ],
    });
    const reply = result.response.text();
    return new Response(JSON.stringify({ reply }), { status: 200, headers: { 'content-type': 'application/json' } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message ?? 'error' }), { status: 500 });
  }
};
