import type { APIRoute } from 'astro';

// Lightweight endpoint to introspect which Gemini model IDs are visible to the current API key.
// Uses raw fetch rather than the SDK because we only need the list response and want
// to surface the raw upstream error if access is restricted.
export const prerender = false;

export const GET: APIRoute = async () => {
  const apiKey = (import.meta.env.GEMINI_API_KEY as string | undefined) || (process.env.GEMINI_API_KEY as string | undefined);
  if (!apiKey) {
    return new Response(JSON.stringify({ ok: false, error: 'missing_api_key' }), { status: 200, headers: { 'content-type': 'application/json' } });
  }
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
  try {
    const res = await fetch(url);
    const text = await res.text();
    let json: any = null;
    try { json = JSON.parse(text); } catch { /* keep text */ }
    if (!res.ok) {
      return new Response(JSON.stringify({ ok: false, status: res.status, error: json?.error || text.slice(0, 400) }), { status: 200, headers: { 'content-type': 'application/json' } });
    }
    const models: any[] = Array.isArray(json?.models) ? json.models : [];
    const slim = models.map(m => ({ name: m.name, displayName: m.displayName, inputTokenLimit: m.inputTokenLimit, outputTokenLimit: m.outputTokenLimit, supportedGenerationMethods: m.supportedGenerationMethods }));
    return new Response(JSON.stringify({ ok: true, count: slim.length, models: slim }), { status: 200, headers: { 'content-type': 'application/json' } });
  } catch (e: any) {
    return new Response(JSON.stringify({ ok: false, error: e?.message || 'models_failed' }), { status: 200, headers: { 'content-type': 'application/json' } });
  }
};
