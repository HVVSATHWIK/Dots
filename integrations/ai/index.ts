import type { DesignVariationInput, DesignVariationResult, GenerateListingInput, ListingPack, GenerateImageInput, GenerateImageResult } from './types';
import { runWithTrace, recordTokenUsage } from '@/lib/tracing';
import { publish } from '@/lib/event-bus';
import { incr, METRIC } from '@/lib/metrics';

const api = import.meta.env.VITE_API_AI_BASE_URL ?? '/api/ai';

function toFormData(obj: Record<string, any>) {
  const fd = new FormData();
  Object.entries(obj).forEach(([k, v]) => {
    if (v == null) return;
    if (Array.isArray(v)) {
      v.forEach((iv: any, i: number) => {
        if (iv instanceof File || iv instanceof Blob) fd.append(`${k}[${i}]`, iv);
        else fd.append(`${k}[${i}]`, typeof iv === 'object' ? JSON.stringify(iv) : String(iv));
      });
    } else if (v instanceof File || v instanceof Blob) fd.append(k, v);
    else if (typeof v === 'object') fd.append(k, JSON.stringify(v));
    else fd.append(k, String(v));
  });
  return fd;
}

export async function generateListingPack(input: GenerateListingInput): Promise<ListingPack> {
  publish('generation.requested', { kind: 'listing-pack' });
  incr(METRIC.ASSISTANT_RUN);
  if (api) {
    const fd = toFormData({
      languages: input.languages,
      photoTheme: input.photoTheme,
      voiceNote: input.voiceNote,
      images: input.images,
    });
    const res = await fetch(`${api}/listing-pack`, { method: 'POST', body: fd });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`AI API error (${res.status}): ${text.slice(0, 240)}`);
    }
    const ct = res.headers.get('content-type') || '';
    if (!ct.includes('application/json')) {
      const text = await res.text().catch(() => '');
      throw new Error(`AI API non-JSON response: ${text.slice(0, 240)}`);
    }
    return await res.json();
  }
  await new Promise(r => setTimeout(r, 900));
  return {
    title: { en: 'Handpainted Madhubani Art – Peacock Motif', hi: 'हैंडपेंटेड मधुबनी कला – मोर आकृति' },
    description: {
      en: 'Authentic Madhubani artwork hand-painted on handmade paper using natural pigments. Size: ~16x12 inches.',
      hi: 'हैंडमेड पेपर पर प्राकृतिक रंगों से बनी असली मधुबनी कलाकृति। आकार ~16x12 इंच।',
    },
    tags: ['Madhubani', 'Handmade', 'Traditional', 'Home Décor'],
    price: { min: 2200, max: 2800, rationale: 'Est. 6–8 hrs labor @ fair wage + materials + margin.' },
    assets: {
      cleanedImages: [
        'https://static.wixstatic.com/media/d7d9fb_77d45693ce2b4e57b7c5311fb3049fde~mv2.png?originWidth=256&originHeight=192',
      ],
      poster: 'https://static.wixstatic.com/media/d7d9fb_ad3f9457377f4bc081242fa7abbdcbe9~mv2.png?originWidth=384&originHeight=192',
    },
    social: {
      caption: {
        en: 'Authentic handpainted Madhubani art. Peacock motif, natural pigments, ~16x12”. DM to order. #Madhubani #Handmade #IndianArt',
        hi: 'असली हैंडपेंटेड मधुबनी कला। मोर आकृति, प्राकृतिक रंग, ~16x12”. ऑर्डर के लिए DM करें। #Madhubani #Handmade #IndianArt',
      },
    },
    meta: { artisanName: 'Priya Sharma' },
  };
}

export async function generateDesignVariations(input: DesignVariationInput): Promise<DesignVariationResult> {
  publish('generation.requested', { kind: 'design-variations' });
  incr(METRIC.ASSISTANT_RUN);
  if (api) {
    const fd = toFormData({ baseImage: input.baseImage, prompt: input.prompt });
    const res = await fetch(`${api}/design-variations`, { method: 'POST', body: fd });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`AI API error (${res.status}): ${text.slice(0, 240)}`);
    }
    const ct = res.headers.get('content-type') || '';
    if (!ct.includes('application/json')) {
      const text = await res.text().catch(() => '');
      throw new Error(`AI API non-JSON response: ${text.slice(0, 240)}`);
    }
    return await res.json();
  }
  await new Promise(r => setTimeout(r, 700));
  return {
    variations: [
      'https://static.wixstatic.com/media/d7d9fb_6da1e82469934cfb897017b6350736d1~mv2.png?originWidth=1920&originHeight=1024',
      'https://static.wixstatic.com/media/d7d9fb_a252aa7a948b46c6b4243cff0059d330~mv2.png?originWidth=1920&originHeight=1024',
      'https://static.wixstatic.com/media/d7d9fb_3b86be1391f746a093ff78ded0b98a08~mv2.png?originWidth=1920&originHeight=1024',
      'https://static.wixstatic.com/media/d7d9fb_ae1d196d955243b49e7f585bf4e4532e~mv2.png?originWidth=1920&originHeight=1024',
    ],
  };
}

// Simple chat helper reused by the global Assistant widget
export type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string };

export async function chat(messages: ChatMessage[], model?: string): Promise<string> {
  return runWithTrace(async () => {
    publish('assistant.interaction', { mode: 'batch' });
    incr(METRIC.ASSISTANT_RUN);
    const url = `${api}/chat`;
    const inputTokensApprox = messages.reduce((n, m) => n + Math.ceil(m.content.length / 4), 0);
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ messages, model }),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`AI chat error (${res.status}): ${text.slice(0, 240)}`);
    }
    const ct = res.headers.get('content-type') || '';
    if (!ct.includes('application/json')) {
      const text = await res.text().catch(() => '');
      throw new Error(`AI chat non-JSON response: ${text.slice(0, 240)}`);
    }
    const json = await res.json();
    const reply: string = String(json.reply ?? '');
    const outputTokensApprox = Math.ceil(reply.length / 4);
    recordTokenUsage(inputTokensApprox, outputTokensApprox, 'assistant.chat');
    return reply;
  }, { span: 'assistant.chat', metaStart: { turns: messages.length } });
}

// Generic text generation via the /api/ai/generate endpoint.
// Accepts a single prompt (caller can concatenate prior context) and optional model/system.
export async function generate(prompt: string, opts?: { model?: string; system?: string }): Promise<string> {
  return runWithTrace(async () => {
    publish('generation.requested', { kind: 'text-generate' });
    incr(METRIC.ASSISTANT_RUN);
    const url = `${api}/generate`;
    const inputTokensApprox = Math.ceil(prompt.length / 4);
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ prompt, model: opts?.model, system: opts?.system }),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`AI generate error (${res.status}): ${text.slice(0, 240)}`);
    }
    const ct = res.headers.get('content-type') || '';
    if (!ct.includes('application/json')) {
      const text = await res.text().catch(() => '');
      throw new Error(`AI generate non-JSON response: ${text.slice(0, 240)}`);
    }
    const json = await res.json();
    const reply: string = String(json.reply ?? json.text ?? '');
    const outputTokensApprox = Math.ceil(reply.length / 4);
    recordTokenUsage(inputTokensApprox, outputTokensApprox, 'assistant.generate');
    return reply;
  }, { span: 'assistant.generate', metaStart: { hasSystem: !!opts?.system, model: opts?.model } });
}

// Raw variant returning metadata (used by AssistantWidget to detect fallback mode)
export async function generateRaw(prompt: string, opts?: { model?: string; system?: string }): Promise<{ reply: string; fallback?: boolean; model?: string; attempts?: any[] }> {
  publish('generation.requested', { kind: 'text-generate' });
  incr(METRIC.ASSISTANT_RUN);
  const url = `${api}/generate`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ prompt, model: opts?.model, system: opts?.system }),
  });
  const ct = res.headers.get('content-type') || '';
  // Attempt to parse JSON even if status not OK so we can surface heuristic fallback reply
  if (ct.includes('application/json')) {
    const json = await res.json().catch(() => ({}));
    const reply = String(json.reply ?? json.text ?? '');
    if (!res.ok && !reply) {
      const text = JSON.stringify(json).slice(0, 240);
      throw new Error(`AI generate error (${res.status}): ${text}`);
    }
    return { reply, fallback: !!json.fallback, model: json.model, attempts: json.attempts };
  }
  // Non-JSON failure path
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`AI generate error (${res.status}): ${text.slice(0, 240)}`);
  }
  const text = await res.text().catch(() => '');
  return { reply: text.slice(0, 240), fallback: true };
}

export async function generateImage(input: GenerateImageInput): Promise<GenerateImageResult> {
  publish('generation.requested', { kind: 'image-generate' });
  incr(METRIC.ASSISTANT_RUN);
  const url = `${api}/image`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ prompt: input.prompt, model: input.model }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`AI image error (${res.status}): ${text.slice(0, 240)}`);
  }
  const ct = res.headers.get('content-type') || '';
  if (!ct.includes('application/json')) {
    const text = await res.text().catch(() => '');
    throw new Error(`AI image non-JSON response: ${text.slice(0, 240)}`);
  }
  return await res.json();
}

// Image captioning (Gemini vision): send files or URLs; returns structured captions
export type Caption = {
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

export async function captionImages(input: { files?: File[]; urls?: string[] }): Promise<{ captions: Caption[]; note?: string }> {
  publish('generation.requested', { kind: 'caption' });
  incr(METRIC.ASSISTANT_RUN);
  const url = `${api}/caption`;
  const hasFiles = !!(input.files && input.files.length > 0);
  if (hasFiles) {
    const fd = new FormData();
    for (const f of input.files!) fd.append('images', f);
    for (const u of input.urls ?? []) fd.append('urls', u);
    const res = await fetch(url, { method: 'POST', body: fd });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`AI caption error (${res.status}): ${text.slice(0, 240)}`);
    }
    const ct = res.headers.get('content-type') || '';
    if (!ct.includes('application/json')) {
      const text = await res.text().catch(() => '');
      throw new Error(`AI caption non-JSON response: ${text.slice(0, 240)}`);
    }
    return await res.json();
  }
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ urls: input.urls ?? [] }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`AI caption error (${res.status}): ${text.slice(0, 240)}`);
  }
  const ct = res.headers.get('content-type') || '';
  if (!ct.includes('application/json')) {
    const text = await res.text().catch(() => '');
    throw new Error(`AI caption non-JSON response: ${text.slice(0, 240)}`);
  }
  return await res.json();
}
