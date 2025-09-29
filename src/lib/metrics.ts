/** Lightweight in-memory metrics registry (reset on reload). */
type CounterMap = Record<string, number>;
const counters: CounterMap = Object.create(null);

export function incr(name: string, delta = 1) {
  counters[name] = (counters[name] || 0) + delta;
}

export function getCounter(name: string) {
  return counters[name] || 0;
}

export function snapshotCounters() {
  return { ...counters };
}

// Domain helper wrappers
export const METRIC = {
  SEARCH_QUERY: 'search.query.count',
  TRUST_RECOMPUTE: 'trust.recompute.count',
  PRICING_SUGGEST: 'pricing.suggest.count',
  ASSISTANT_RUN: 'assistant.run.count',
  EVENT_PUBLISHED: 'event.published.count',
  FEATURE_FLAG_EXPOSURE: 'feature.flag.exposure.count',
  EXPERIMENT_EXPOSURE: 'experiment.exposure.count',
  PRICING_GUARDRAIL_ADJUST: 'pricing.guardrail.adjust.count',
  ASSISTANT_STREAM_LAT_TOTAL_MS: 'assistant.stream.latency.totalMs',
  ASSISTANT_STREAM_LAT_SAMPLES: 'assistant.stream.latency.samples',
  PRICE_SUGGEST_EXPOSURE: 'price.suggest.exposure.count',
  PRICE_SUGGEST_OVERRIDE: 'price.suggest.override.count',
  MODEL_SUCCESS_PREFIX: 'model.success',
  MODEL_FAIL_PREFIX: 'model.fail',
  IMAGE_CACHE_HIT: 'image.cache.hit.count',
  IMAGE_CACHE_MISS: 'image.cache.miss.count',
  TTS_FALLBACK: 'tts.fallback.count'
};
