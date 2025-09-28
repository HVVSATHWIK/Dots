import { incr, METRIC } from '@/lib/metrics';

export interface GuardrailInput { recommended: number; min: number; max: number; costFloor: number; currency: string; }
export interface GuardrailResult { recommended: number; min: number; max: number; adjustments: string[]; }

// Enforces monotonic floors, clamps extreme ratios, and ensures recommended within bounds.
export function applyPricingGuardrails(input: GuardrailInput): GuardrailResult {
  const adjustments: string[] = [];
  let { recommended, min, max, costFloor } = input;
  // Ensure floor above cost
  if (min < costFloor) { adjustments.push(`min raised to cost floor ${costFloor.toFixed(2)}`); min = costFloor; }
  // Ensure recommended >= min
  if (recommended < min) { adjustments.push('recommended raised to min'); recommended = min; }
  // Prevent absurd spread (e.g., max > 3x recommended)
  const maxAllowed = recommended * 3;
  if (max > maxAllowed) { adjustments.push(`max clamped from ${max.toFixed(2)} to ${maxAllowed.toFixed(2)}`); max = maxAllowed; }
  // Ensure ordering
  if (max < recommended) { adjustments.push('max raised to recommended'); max = recommended; }
  if (adjustments.length) incr(METRIC.PRICING_GUARDRAIL_ADJUST);
  return { recommended, min, max, adjustments };
}