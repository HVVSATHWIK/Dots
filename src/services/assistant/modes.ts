import { runWithTrace } from '@/lib/tracing';
import { incr, METRIC } from '@/lib/metrics';
import { suggestPrice, PriceInputSchema } from '@/services/pricing/engine';
import { listAllListings } from '@/lib/firestore-repo';
import { publish } from '@/lib/event-bus';

export enum AssistantMode {
  General = 'general',
  Negotiation = 'negotiation',
  Pricing = 'pricing'
}

export interface AssistantContext {
  userId?: string;
  locale?: string;
  mode: AssistantMode;
  // raw user input
  input: string;
  // optional structured payload (e.g., listingId, offer value, etc.)
  payload?: Record<string, any>;
}

export interface AssistantResponse {
  mode: AssistantMode;
  text: string;
  meta?: Record<string, any>;
}

type ModeHandler = (ctx: AssistantContext) => Promise<AssistantResponse>;

const handlers: Record<AssistantMode, ModeHandler> = {
  [AssistantMode.General]: async (ctx) => ({ mode: ctx.mode, text: 'General assistant placeholder response.', meta: { echo: ctx.input } }),
  [AssistantMode.Negotiation]: async (ctx) => {
    // Expect payload: { listPrice, offer, floorPrice?, marginTarget? }
    const listPrice = Number(ctx.payload?.listPrice ?? 0);
    const offer = Number(ctx.payload?.offer ?? 0);
    const floor = Number(ctx.payload?.floorPrice ?? (listPrice * 0.6));
    const marginTarget = Number(ctx.payload?.marginTarget ?? 0.3);
    if (!listPrice || !offer) {
      return { mode: ctx.mode, text: 'Provide listPrice and offer to negotiate.', meta: { payload: ctx.payload } };
    }
    const midpoint = (offer + listPrice) / 2;
    // Constrain midpoint by floor & listPrice
    let counter = Math.max(floor, Math.min(listPrice * 0.98, midpoint));
    // If offer very low (<70% list), anchor higher (80% of list)
    if (offer < listPrice * 0.7) counter = Math.max(counter, listPrice * 0.8);
    // Ensure margin target roughly respected (if we had cost, we'd enforce; here symbolic)
    const explanation = [] as string[];
    explanation.push(`Offer ${offer} vs list ${listPrice}`);
    explanation.push('Applied midpoint and guardrails');
    if (offer < listPrice * 0.7) explanation.push('Low offer → raised counter to protect value');
    explanation.push(`Counter = ${counter.toFixed(2)}`);
    return { mode: ctx.mode, text: `Counter-offer: ${counter.toFixed(2)}`, meta: { listPrice, offer, counter, floor, marginTarget, rationale: explanation } };
  },
  [AssistantMode.Pricing]: async (ctx) => {
    // Expect structured payload with pricing factors; fallback defaults.
    const raw = { baseCost: 0, materialCost: 0, ...ctx.payload };
    let suggestion; let error: string | undefined;
    try {
      const parsed = PriceInputSchema.partial({ currency: true }).merge(PriceInputSchema.pick({ currency: true })).parse(raw);
      suggestion = suggestPrice({
        baseCost: parsed.baseCost ?? 0,
        materialCost: parsed.materialCost ?? 0,
        laborHours: parsed.laborHours ?? 0,
        demandScore: parsed.demandScore ?? 0.5,
        rarityScore: parsed.rarityScore ?? 0.5,
        marginTarget: parsed.marginTarget ?? 0.35,
        currency: parsed.currency || 'INR'
      });
    } catch (e: any) {
      error = e?.message || 'Invalid pricing input';
    }
    if (!suggestion) {
      return { mode: ctx.mode, text: 'Unable to compute price suggestion.', meta: { error, payload: ctx.payload } };
    }
    // Fetch some listings for rough comps (non-semantic baseline). In future: filter by tags/material.
    let comps: { id: string; title: string; price: number }[] = [];
    try {
      const all = await listAllListings();
      // crude similarity: share at least one tag; else random slice
      const targetTags = (ctx.payload?.tags || []) as string[];
      const filtered = targetTags.length ? all.filter(l => l.tags?.some(t => targetTags.includes(t))) : all;
      comps = (filtered.length ? filtered : all).slice(0, 10)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3)
        .map(l => ({ id: l.id, title: l.title, price: l.price }));
    } catch {}
    const compsText = comps.map(c => `• ${c.title} — ${c.price}`).join('\n');
    const rationaleLines = suggestion.rationale?.slice(0, 3).join(' | ');
    const text = `Recommended price: ${suggestion.recommendedPrice} ${suggestion.currency} (range ${suggestion.minPrice}-${suggestion.maxPrice})\nRationale: ${rationaleLines}${comps.length ? `\nSample comps:\n${compsText}` : ''}`;
    return { mode: ctx.mode, text, meta: { suggestion, comps } };
  }
};

export async function runAssistant(ctx: AssistantContext): Promise<AssistantResponse> {
  const handler = handlers[ctx.mode] || handlers[AssistantMode.General];
  return runWithTrace(async () => {
    const res = await handler(ctx);
    publish('assistant.interaction', { mode: ctx.mode, userId: ctx.userId }).catch(()=>{});
    incr(METRIC.ASSISTANT_RUN);
    return res;
  }, { span: 'assistant.run', metaStart: { mode: ctx.mode } });
}
