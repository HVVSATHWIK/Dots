// Centralized Gemini model routing logic.
// Selects candidate models per task with optional latency / quality biases and
// remembers last successful model during the current runtime.

export type AiTask = 'chat' | 'generate' | 'listing_pack' | 'design_variations' | 'caption' | 'pricing_advice' | 'bulk' | 'image_generate' | 'tts';

interface SelectOptions {
  latencyBias?: 'low' | 'balanced' | 'quality';
  allowPro?: boolean;
  forceModel?: string; // explicit override (dev/testing)
}

interface Selection {
  candidates: string[];
  override?: string;
  cached?: string;
}

const successCache: Partial<Record<AiTask, string>> = {};

function normalize(name?: string | null): string | undefined {
  if (!name) return undefined;
  return name.startsWith('models/') ? name.slice('models/'.length) : name;
}

export function selectModels(task: AiTask, opts: SelectOptions = {}): Selection {
  const override = normalize(opts.forceModel || process.env.GEMINI_MODEL_OVERRIDE || (import.meta as any).env?.GEMINI_MODEL_OVERRIDE);
  const latency = opts.latencyBias || 'balanced';
  const allowPro = opts.allowPro ?? true;

  const base: string[] = (() => {
    switch (task) {
      case 'bulk':
        return ['gemini-2.5-flash-lite', 'gemini-2.5-flash', 'gemini-flash-latest'];
      case 'pricing_advice':
        return allowPro ? ['gemini-2.5-pro', 'gemini-2.5-flash', 'gemini-flash-latest'] : ['gemini-2.5-flash', 'gemini-flash-latest'];
      case 'listing_pack':
        return allowPro ? ['gemini-2.5-pro', 'gemini-2.5-flash', 'gemini-2.5-flash-lite'] : ['gemini-2.5-flash', 'gemini-2.5-flash-lite'];
      case 'design_variations':
      case 'caption':
        return ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-2.5-flash-lite'];
      case 'image_generate':
        return ['imagen-4.0-generate-001', 'imagen-3.0-generate-002', 'gemini-2.0-flash-exp-image-generation', 'gemini-2.5-flash'];
      case 'tts':
        return ['gemini-2.5-flash-preview-tts', 'gemini-2.5-pro-preview-tts', 'gemini-2.5-flash'];
      case 'chat':
      case 'generate':
      default:
        return ['gemini-2.5-flash', 'gemini-flash-latest', 'gemini-2.5-flash-lite'];
    }
  })();

  let ordered = base;
  if (latency === 'low') ordered = [...new Set(['gemini-2.5-flash-lite', ...ordered])];
  else if (latency === 'quality' && allowPro) ordered = [...new Set(['gemini-2.5-pro', ...ordered])];

  const cached = successCache[task];
  if (cached && ordered.includes(cached)) {
    ordered = [cached, ...ordered.filter(m => m !== cached)];
  }

  if (override) {
    return { candidates: [override], override, cached };
  }

  return { candidates: ordered.map(normalize).filter(Boolean) as string[], cached };
}

export function recordModelSuccess(task: AiTask, model: string) {
  successCache[task] = normalize(model);
}

export function snapshotModelCache() {
  return { ...successCache };
}
