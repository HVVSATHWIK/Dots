import { z } from 'zod';
import { runWithTraceSync, recordTokenUsage } from '@/lib/tracing';
import { applyPricingGuardrails } from './guardrails';
import { publish } from '@/lib/event-bus';
import { getExperimentVariant } from '@/lib/experiments';
import { isFlagEnabled } from '@/lib/feature-flags';
import { incr, METRIC } from '@/lib/metrics';

export function trackPriceExposure(listingId: string, suggested: number) {
  incr(METRIC.PRICE_SUGGEST_EXPOSURE);
  // Placeholder: could push to in-memory ring buffer for offline elasticity script.
  (globalThis as any).__priceExposure = (globalThis as any).__priceExposure || [];
  (globalThis as any).__priceExposure.push({ listingId, suggested, at: Date.now() });
}

export function recordPriceOverride(listingId: string, suggested: number, chosen: number) {
  if (chosen !== suggested) incr(METRIC.PRICE_SUGGEST_OVERRIDE);
  (globalThis as any).__priceOverride = (globalThis as any).__priceOverride || [];
  (globalThis as any).__priceOverride.push({ listingId, suggested, chosen, at: Date.now() });
}

export const PriceInputSchema = z.object({
  baseCost: z.number().nonnegative(),
  materialCost: z.number().nonnegative(),
  laborHours: z.number().nonnegative().default(0),
  demandScore: z.number().min(0).max(1).default(0.5),
  rarityScore: z.number().min(0).max(1).default(0.5),
  marginTarget: z.number().min(0.05).max(0.95).default(0.35),
  currency: z.string().length(3).default('INR'),
});
export type PriceInput = z.infer<typeof PriceInputSchema>;

export interface PriceSuggestion {
  recommendedPrice: number;
  minPrice: number;
  maxPrice: number;
  currency: string;
  rationale: string[];
  modelVersion: string;
}

// Simple heuristic engine (placeholder for ML model)
// Principles:
//  - Base cost floor (baseCost + materialCost)
//  - Labor uplift (laborHours * hourlyRate)
//  - Demand & rarity multiplicative factor
//  - Margin applied afterward with guardrails
export function suggestPrice(raw: PriceInput & { userId?: string }): PriceSuggestion {
  return runWithTraceSync(() => {
    const input = PriceInputSchema.parse(raw);
    const rationale: string[] = [];
    const cost = input.baseCost + input.materialCost;
    rationale.push(`Base+Material cost = ${cost.toFixed(2)}`);
    const hourlyRate = 300; // placeholder – could be regionally dynamic later
    const laborComponent = input.laborHours * hourlyRate;
    if (laborComponent > 0) rationale.push(`Labor component (${input.laborHours}h @ ${hourlyRate}) = ${laborComponent.toFixed(2)}`);

    let preMargin = cost + laborComponent;
    const demandFactor = 0.9 + input.demandScore * 0.6; // 0.9 – 1.5
    const rarityFactor = 0.95 + input.rarityScore * 0.5; // 0.95 – 1.45
    preMargin *= demandFactor * rarityFactor;
    rationale.push(`Demand factor=${demandFactor.toFixed(2)}, Rarity factor=${rarityFactor.toFixed(2)}`);

    const margin = input.marginTarget;
    let recommended = preMargin / (1 - margin);
    rationale.push(`Margin target ${(margin*100).toFixed(0)}% => Recommended = ${recommended.toFixed(2)}`);

    // Boundaries
    let minPrice = Math.max(cost * 1.05, recommended * 0.75);
    let maxPrice = recommended * 1.35;

    // Experiment: elasticity adjustment variant may nudge recommended by small factor (placeholder)
    const elasticityVariant = getExperimentVariant('pricing_elasticity_algo', raw.userId);
    if (elasticityVariant !== 'control' && isFlagEnabled('pricingElasticityPreview', { userId: raw.userId })) {
      recommended *= 1.02; // +2% uplift placeholder
      rationale.push('Elasticity variant uplift +2%');
      incr(METRIC.EXPERIMENT_EXPOSURE + ':pricing_elasticity_algo:' + elasticityVariant);
    }

    const guardrails = applyPricingGuardrails({ recommended, min: minPrice, max: maxPrice, costFloor: cost, currency: input.currency });
    if (guardrails.adjustments.length) rationale.push(...guardrails.adjustments.map(a => 'guardrail: ' + a));
    recommended = guardrails.recommended; minPrice = guardrails.min; maxPrice = guardrails.max;
    // heuristic token usage: treat input fields as tiny tokens
    recordTokenUsage(10, 5, 'pricing.suggest');
  publish('price.suggested', { listingId: 'temp', recommended: recommended, currency: input.currency }).catch(()=>{});
  trackPriceExposure('temp', recommended);
    incr(METRIC.PRICING_SUGGEST);
    return {
      recommendedPrice: round2(recommended),
      minPrice: round2(minPrice),
      maxPrice: round2(maxPrice),
      currency: input.currency,
      rationale,
      modelVersion: 'heuristic-v1',
    };
  }, { span: 'pricing.suggest', metaStart: { currency: raw.currency } });
}

function round2(n: number) { return Math.round(n * 100) / 100; }
