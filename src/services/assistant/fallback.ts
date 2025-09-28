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

export function classifyFallbackIntent(messages: FallbackChatMessage[]): { intent: FallbackIntent; reply: string } {
  const user = lastUserMessage(messages) || '';
  const turn = messages.filter(m => m.role === 'user').length;
  const lower = user.toLowerCase();

  if (!user) {
    return { intent: FallbackIntent.Greeting, reply: "Hi! I'm the DOTS Assistant. Ask me about pricing, tags, photography tips, or how to improve a listing." };
  }

  if (turn <= 1 && contains(lower, ['hi', 'hello', 'hey', 'hola'])) {
    return { intent: FallbackIntent.Greeting, reply: "Hi! Ready to help with your handmade product listings. What would you like to work on—title, tags, pricing, or photos?" };
  }

  if (contains(lower, ['service', 'services', 'what can you do', 'help you provide', 'capabilities'])) {
    return { intent: FallbackIntent.Services, reply: SERVICES_EXPLAIN };
  }

  if (contains(lower, ['potter', 'pottery', 'ceramic', 'clay'])) {
    return { intent: FallbackIntent.Pottery, reply: "Pottery guidance: provide clay type (stoneware / earthenware), firing temp, glaze style, dimensions & functional care (dishwasher / microwave safe). I can help you turn that into a compelling title, description, and tag set—just share a short description of the piece." };
  }

  if (contains(lower, ['price', 'pricing', 'cost', 'how much'])) {
    return { intent: FallbackIntent.Pricing, reply: "For pricing: break down (materials + labor hours × fair hourly rate + overhead + margin). Tell me materials, time spent, and target margin and I can draft a suggested range." };
  }

  if (contains(lower, ['tag', 'keyword'])) {
    return { intent: FallbackIntent.Tags, reply: "Give me 1–2 sentences about the item (material, style, use, region) and I'll suggest 8–12 high-signal tags ordered by relevance." };
  }

  if (contains(lower, ['photo', 'photography', 'images', 'pictures'])) {
    return { intent: FallbackIntent.Photography, reply: "Photography tips: use diffuse natural side light, neutral backdrop, 3–5 angles (front, detail, scale with hand/object, in-context). I can also draft a shot list—just tell me the product type." };
  }

  if (lower.length < 16) {
    return { intent: FallbackIntent.Vague, reply: `Could you add a bit more detail? Tell me the product type, materials, and what you need (pricing, tags, description, photos, etc.).` };
  }

  // Generic adaptive reply
  return { intent: FallbackIntent.Generic, reply: `Got it. You said: "${user.slice(0, 140)}". Let me know if you want: (1) better title, (2) tag suggestions, (3) price range, (4) description polish, or (5) photography tips.` };
}

export function fallbackChatReply(messages: FallbackChatMessage[]): string {
  return classifyFallbackIntent(messages).reply;
}

export function fallbackGenerate(prompt: string): string {
  const p = prompt.toLowerCase();
  if (p.includes('title')) {
    return 'Handcrafted Ceramic Mug – Speckled Stoneware, 12oz, Minimal Rustic Finish';
  }
  if (p.includes('tags')) {
    return 'ceramic mug, handmade pottery, stoneware cup, rustic kitchen, artisan drinkware, speckled glaze, coffee lover gift, sustainable craft';
  }
  if (p.includes('pricing')) {
    return 'Suggested price range: ₹850–₹1050 (materials ~₹150, labor 1.5h @ ₹350/h, overhead & margin included).';
  }
  return 'Local development fallback: provide more context (e.g. "Generate tags for a handwoven cotton table runner with geometric pattern").';
}
