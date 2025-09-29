import type { APIRoute } from 'astro';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { selectModels, recordModelSuccess } from '@/lib/ai-model-router';
import { incr, METRIC } from '@/lib/metrics';
import { publish } from '@/lib/event-bus';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    publish('generation.requested', { kind: 'tts' });
    incr(METRIC.ASSISTANT_RUN);
    const { text, voice = 'neutral' } = await request.json();
    if (!text || typeof text !== 'string') return json({ error: 'Missing text' }, 400);
    const apiKey = (import.meta.env.GEMINI_API_KEY as string | undefined) || (process.env.GEMINI_API_KEY as string | undefined);
    if (!apiKey) {
      incr(METRIC.TTS_FALLBACK);
      return json(heuristicVoice(text), 200);
    }
    const { candidates, override, cached } = selectModels('tts');
    const genAI = new GoogleGenerativeAI(apiKey);
    const attempts: { model: string; ok: boolean; error?: string }[] = [];
    let lastErr: any;
    for (const model of candidates) {
      try {
        const m = genAI.getGenerativeModel({ model });
        const result = await m.generateContent({
          contents: [{ role: 'user', parts: [{ text: `Voice:${voice}\n${text}` }] }],
        } as any);
        const parts: any[] = result?.response?.candidates?.[0]?.content?.parts || [];
        const audio = parts.find(p => p.inlineData?.data && p.inlineData?.mimeType?.startsWith('audio/'));
        if (!audio) throw new Error('No audio data');
        attempts.push({ model, ok: true });
        recordModelSuccess('tts', model);
        incr(METRIC.MODEL_SUCCESS_PREFIX + ':' + model);
        return json({ audio: { b64: audio.inlineData.data, mime: audio.inlineData.mimeType }, model, attempts, override: !!override, cachedRouter: !!cached }, 200);
      } catch (err: any) {
        const msg = err?.message || String(err);
        attempts.push({ model, ok: false, error: msg.slice(0,200) });
        incr(METRIC.MODEL_FAIL_PREFIX + ':' + model);
        lastErr = err;
        if (/unauth|denied|permission/i.test(msg)) break;
        continue;
      }
    }
    incr(METRIC.TTS_FALLBACK);
    return json({ ...heuristicVoice(text), attempts, fallback: true, error: lastErr?.message || 'tts-failed' }, 200);
  } catch (e: any) {
    incr(METRIC.TTS_FALLBACK);
    return json({ ...heuristicVoice(''), error: e?.message || 'tts-error', fallback: true }, 200);
  }
};

function heuristicVoice(text: string) {
  const snippet = text.slice(0, 80) || 'No text';
  return {
    audio: {
      mime: 'text/plain',
      b64: Buffer.from(`[fallback-tts]\n${snippet}`).toString('base64')
    },
    fallback: true,
    note: 'Placeholder speech synthesis – configure Gemini TTS model for real audio.'
  };
}

function json(obj: any, status = 200) { return new Response(JSON.stringify(obj), { status, headers: { 'content-type': 'application/json' } }); }
