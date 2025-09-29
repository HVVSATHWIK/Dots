import type { APIRoute } from 'astro';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { selectModels, recordModelSuccess } from '@/lib/ai-model-router';

function normalizeModelName(name: string | undefined): string | undefined {
  if (!name) return name;
  return name.startsWith('models/') ? name.slice('models/'.length) : name;
}
import { publish } from '@/lib/event-bus';
import { incr, METRIC } from '@/lib/metrics';
import { fallbackGenerate } from '@/services/assistant/fallback';

export const prerender = false;

/*
 Generic text generation endpoint
 Body: { prompt: string; model?: string; system?: string }
 Returns: { reply: string }
*/
export const POST: APIRoute = async ({ request }) => {
  try {
    publish('generation.requested', { kind: 'generate' });
    incr(METRIC.ASSISTANT_RUN);
    const { prompt, model, system } = await request.json();
    if (!prompt || typeof prompt !== 'string') {
      return new Response(JSON.stringify({ error: 'Missing prompt' }), { status: 400 });
    }
    const apiKey = (import.meta.env.GEMINI_API_KEY as string | undefined) ?? (process.env.GEMINI_API_KEY as string | undefined);
    if (!apiKey) {
      const reply = fallbackGenerate(prompt);
      return new Response(JSON.stringify({ reply, fallback: true }), { status: 200, headers: { 'content-type': 'application/json' } });
    }
    const genAI = new GoogleGenerativeAI(apiKey);
  const providedRaw = model || (import.meta.env.GEMINI_MODEL as string | undefined) || (process.env.GEMINI_MODEL as string | undefined);
    // Updated list aligned with your /api/ai/models output (preferring 2.5 flash tiers, then 2.0, then legacy fallbacks)
  const { candidates, override, cached } = selectModels('generate', { forceModel: providedRaw });
    const baseSystem = system || 'You are a helpful assistant.';
    const attempts: { model: string; ok: boolean; error?: string }[] = [];
    let lastErr: any;
    for (const candidate of candidates) {
      try {
  const m = genAI.getGenerativeModel({ model: normalizeModelName(candidate)! });
        const result = await m.generateContent({
          contents: [
            { role: 'user', parts: [{ text: `${baseSystem}\nUser: ${prompt}\nAssistant:` }] },
          ],
        });
        const reply = result.response.text();
        attempts.push({ model: candidate, ok: true });
        recordModelSuccess('generate', candidate);
        return new Response(JSON.stringify({ reply, model: candidate, attempts }), { status: 200, headers: { 'content-type': 'application/json' } });
      } catch (err: any) {
        const msg = err?.message || String(err);
        attempts.push({ model: candidate, ok: false, error: msg.slice(0, 240) });
        lastErr = err;
        // If permission/unauthorized, no point in trying alternates
        if (/unauth|denied|permission/i.test(msg)) break;
        continue;
      }
    }
    // All attempts failed -> heuristic fallback
    const reply = fallbackGenerate(prompt);
    return new Response(JSON.stringify({ reply, fallback: true, attempts, error: lastErr?.message || 'model-failed', override: !!override, cached }), { status: 200, headers: { 'content-type': 'application/json' } });
  } catch (e: any) {
    const msg = e?.message || 'error';
    console.error('[ai/generate] unhandled error', msg);
    const fallback = fallbackGenerate('');
    return new Response(JSON.stringify({ error: msg, status: 500, fallback: true, reply: fallback }), { status: 200, headers: { 'content-type': 'application/json' } });
  }
};
