export function extractJson<T = any>(text: string): T | null {
  if (!text) return null;
  const trimmed = text.trim();
  // If the payload is clearly HTML, bail out
  if (trimmed.startsWith('<!DOCTYPE') || trimmed.startsWith('<html') || trimmed.startsWith('<')) {
    return null;
  }

  // Try code fence first
  const fence = trimmed.match(/```(?:json)?\n([\s\S]*?)```/i);
  const raw = fence ? fence[1] : trimmed;

  // Try to find the first JSON object or array boundaries
  const firstBrace = raw.indexOf('{');
  const lastBrace = raw.lastIndexOf('}');
  const firstBracket = raw.indexOf('[');
  const lastBracket = raw.lastIndexOf(']');

  const segments: string[] = [];
  if (firstBrace >= 0 && lastBrace > firstBrace) segments.push(raw.slice(firstBrace, lastBrace + 1));
  if (firstBracket >= 0 && lastBracket > firstBracket) segments.push(raw.slice(firstBracket, lastBracket + 1));

  for (const seg of segments) {
    try {
      return JSON.parse(seg);
    } catch {}
  }

  // Last attempt: parse whole string
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function isHtmlPayload(text: string): boolean {
  const t = (text || '').trim().toLowerCase();
  return t.startsWith('<!doctype') || t.startsWith('<html') || t.startsWith('<head') || t.startsWith('<body');
}