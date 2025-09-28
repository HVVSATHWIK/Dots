// Lightweight heuristic fallback logic used when GEMINI_API_KEY is not configured.
// This prevents the assistant from repeating the same canned greeting every turn.

export type FallbackChatMessage = { role: 'system' | 'user' | 'assistant'; content: string };

export enum FallbackIntent {
  Greeting = 'greeting',
  Services = 'services',
  Pottery = 'pottery',
  Pricing = 'pricing',
  Tags = 'tags',
  Photography = 'photography',
  Vague = 'vague',
  Generic = 'generic'
}

import { publish } from '@/lib/event-bus';

function lastUserMessage(messages: FallbackChatMessage[]): string | undefined {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === 'user') return messages[i].content.trim();
  }
  return undefined;
}

function contains(hay: string, words: string[]): boolean {
  const h = hay.toLowerCase();
  return words.some(w => h.includes(w));
}

const SERVICES_EXPLAIN = `I can help you with:
• Crafting product titles & descriptions
• Suggesting tags & categories
• Pricing guidance & rationale ranges
• Photography tips & style prompts
• Materials / techniques / care suggestions
• Social caption drafts & hashtag ideas
Ask me anything related to your handmade listings or the DOTS platform.`;

// Small in-memory cache to avoid recomputing heuristic replies for repeated inputs
const MAX_CACHE = 50;
const cache = new Map<string, { intent: FallbackIntent; reply: string }>();
function getCached(key: string) { return cache.get(key); }
function setCached(key: string, value: { intent: FallbackIntent; reply: string }) {
  if (cache.has(key)) cache.delete(key); // refresh order
  cache.set(key, value);
  if (cache.size > MAX_CACHE) {
    const oldest = cache.keys().next().value; cache.delete(oldest);
  }
}

export function classifyFallbackIntent(messages: FallbackChatMessage[]): { intent: FallbackIntent; reply: string } {
  const user = lastUserMessage(messages) || '';
  const turn = messages.filter(m => m.role === 'user').length;
  const lower = user.toLowerCase();
  const key = lower || '__empty__';
  const cached = getCached(key);
  if (cached) return cached;

  if (!user) {
    const out = { intent: FallbackIntent.Greeting, reply: "Hi! I'm the DOTS Assistant. Ask me about pricing, tags, photography tips, or how to improve a listing." };
    setCached(key, out); publish('assistant.fallback', { intent: out.intent }); return out;
  }

  if (turn <= 1 && contains(lower, ['hi', 'hello', 'hey', 'hola'])) {
    const out = { intent: FallbackIntent.Greeting, reply: "Hi! Ready to help with your handmade product listings. What would you like to work on—title, tags, pricing, or photos?" };
    setCached(key, out); publish('assistant.fallback', { intent: out.intent }); return out;
  }

  if (contains(lower, ['service', 'services', 'what can you do', 'help you provide', 'capabilities'])) {
    const out = { intent: FallbackIntent.Services, reply: SERVICES_EXPLAIN };
    setCached(key, out); publish('assistant.fallback', { intent: out.intent }); return out;
  }

  if (contains(lower, ['potter', 'pottery', 'ceramic', 'clay'])) {
    const out = { intent: FallbackIntent.Pottery, reply: "Pottery guidance: provide clay type (stoneware / earthenware), firing temp, glaze style, dimensions & functional care (dishwasher / microwave safe). I can help you turn that into a compelling title, description, and tag set—just share a short description of the piece." };
    setCached(key, out); publish('assistant.fallback', { intent: out.intent }); return out;
  }

  if (contains(lower, ['price', 'pricing', 'cost', 'how much'])) {
    const out = { intent: FallbackIntent.Pricing, reply: "For pricing: break down (materials + labor hours × fair hourly rate + overhead + margin). Tell me materials, time spent, and target margin and I can draft a suggested range." };
    setCached(key, out); publish('assistant.fallback', { intent: out.intent }); return out;
  }

  if (contains(lower, ['tag', 'keyword'])) {
    const out = { intent: FallbackIntent.Tags, reply: "Give me 1–2 sentences about the item (material, style, use, region) and I'll suggest 8–12 high-signal tags ordered by relevance." };
    setCached(key, out); publish('assistant.fallback', { intent: out.intent }); return out;
  }

  if (contains(lower, ['photo', 'photography', 'images', 'pictures'])) {
    const out = { intent: FallbackIntent.Photography, reply: "Photography tips: use diffuse natural side light, neutral backdrop, 3–5 angles (front, detail, scale with hand/object, in-context). I can also draft a shot list—just tell me the product type." };
    setCached(key, out); publish('assistant.fallback', { intent: out.intent }); return out;
  }

  if (lower.length < 16) {
    const out = { intent: FallbackIntent.Vague, reply: `Could you add a bit more detail? Tell me the product type, materials, and what you need (pricing, tags, description, photos, etc.).` };
    setCached(key, out); publish('assistant.fallback', { intent: out.intent }); return out;
  }

  // Generic adaptive reply
  const out = { intent: FallbackIntent.Generic, reply: `Got it. You said: "${user.slice(0, 140)}". Let me know if you want: (1) better title, (2) tag suggestions, (3) price range, (4) description polish, or (5) photography tips.` };
  setCached(key, out); publish('assistant.fallback', { intent: out.intent }); return out;
}

export function fallbackChatReply(messages: FallbackChatMessage[]): string {
  return classifyFallbackIntent(messages).reply;
}

export function fallbackGenerate(prompt: string): string {
  // The generate endpoint passes a flattened transcript like:
  //   User(general): hi\nAssistant(general): <reply>\nUser(general): what is pottery\nAssistant(general):
  // We only want to look at the LAST user turn – otherwise earlier assistant text containing words like
  // "tags" or "pricing" can incorrectly trigger tag/pricing heuristics.
  function extractLastUserTurn(input: string): string {
    const re = /User(?:\([^)]*\))?:\s*(.*)/g;
    let m: RegExpExecArray | null; let last: string | null = null;
    while ((m = re.exec(input)) !== null) { last = m[1]; }
    return (last || input).trim();
  }
  const lastUser = extractLastUserTurn(prompt);
  const p = lastUser.toLowerCase();

  // Direct generation intents
  if (/(^|\b)(generate|suggest|make).*(title)/.test(p) || (p.includes('title') && p.length < 140)) {
    return 'Handcrafted Ceramic Mug – Speckled Stoneware, 12oz, Minimal Rustic Finish';
  }
  if (/(^|\b)(generate|suggest|give|list).*(tags|keywords)/.test(p) || /\btags?\b/.test(p)) {
    return 'ceramic mug, handmade pottery, stoneware cup, rustic kitchen, artisan drinkware, speckled glaze, coffee lover gift, sustainable craft';
  }
  if (/pricing|price range|how much|cost/i.test(p)) {
    return 'Suggested price range: ₹850–₹1050 (materials ~₹150, labor 1.5h @ ₹350/h, overhead & margin included).';
  }
  if (/what is pottery|what.*pottery|define pottery|pottery basics|pottery meaning/.test(p)) {
    return 'Pottery is the craft of shaping clay (earthenware, stoneware, porcelain) and firing it to create functional or decorative pieces. Key factors: clay body, forming method (wheel, handbuild), firing temperature, glaze chemistry, and finishing. I can help you turn a specific piece description into a title, tags, and pricing guidance—just describe the item.';
  }
  if (/pottery|ceramic|stoneware|earthenware|clay/.test(p)) {
    return 'Share the piece details (form, clay type, glaze/style, size, functional use). I can suggest a title, description outline, tag list, and pricing range.';
  }
  if (p.length < 4) {
    return 'Local development fallback: add more detail (e.g. "Generate tags for a handwoven cotton table runner with geometric pattern").';
  }
  return 'Local development fallback: provide more context (e.g. "Generate tags for a handwoven cotton table runner with geometric pattern").';
}
