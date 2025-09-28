import { isFlagEnabled } from '@/lib/feature-flags';
import { incr, METRIC } from '@/lib/metrics';

export type ExperimentKey = 'pricing_elasticity_algo' | 'search_personalization_v1' | 'assistant_streaming_mode';
export interface ExperimentDefinition { key: ExperimentKey; variants: string[]; rolloutPercent?: number; flagGate?: string; }

const defs: Record<ExperimentKey, ExperimentDefinition> = {
  pricing_elasticity_algo: { key: 'pricing_elasticity_algo', variants: ['control', 'elasticity_v1'], rolloutPercent: 10, flagGate: 'pricingElasticityPreview' },
  search_personalization_v1: { key: 'search_personalization_v1', variants: ['control', 'personalized'], rolloutPercent: 0 },
  assistant_streaming_mode: { key: 'assistant_streaming_mode', variants: ['control', 'streaming'], rolloutPercent: 0, flagGate: 'assistantStreaming' },
};

function hash(str: string) { let h=0; for (let i=0;i<str.length;i++) h=(Math.imul(31,h)+str.charCodeAt(i))|0; return Math.abs(h); }

export function getExperimentVariant(key: ExperimentKey, userId?: string, log = false) {
  const def = defs[key]; if (!def) return 'control';
  if (def.flagGate && !isFlagEnabled(def.flagGate as any, { userId })) return 'control';
  if (!userId) return 'control';
  const bucket = hash(userId + ':' + key) % 100;
  const pct = def.rolloutPercent ?? 0;
  if (bucket >= pct) return 'control';
  // Simple 50/50 split for non-control variants if 2 total, else hash map
  if (def.variants.length <= 1) return 'control';
  const nonControl = def.variants.filter(v => v !== 'control');
  const pick = nonControl[hash('v:' + userId + ':' + key) % nonControl.length];
  if (log) incr(METRIC.EXPERIMENT_EXPOSURE + ':' + key + ':' + pick);
  return pick;
}

export function listExperiments() { return Object.values(defs); }
