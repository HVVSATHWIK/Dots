import { runWithTrace } from '@/lib/tracing';
import { isFlagEnabled } from '@/lib/feature-flags';

export interface ModerationInput { text?: string; }
export interface ModerationResult { decision: 'allow' | 'flag' | 'block'; reasons: string[]; confidence: number; }

// Configurable pattern storage (can be hot reloaded / tuned at runtime)
let BLOCK_PATTERNS: RegExp[] = [/\bweapon\b/i, /terror/i];
let FLAG_PATTERNS: RegExp[] = [/refund scam/i, /hate/i];

// Confidence thresholds (allow simple tuning and property tests)
let thresholds = { block: 0.9, flag: 0.6 };

export function configureModeration(opts: { block?: (string|RegExp)[]; flag?: (string|RegExp)[]; thresholds?: Partial<typeof thresholds>; }) {
  if (opts.block) BLOCK_PATTERNS = opts.block.map(p => typeof p === 'string' ? new RegExp(p, 'i') : p);
  if (opts.flag) FLAG_PATTERNS = opts.flag.map(p => typeof p === 'string' ? new RegExp(p, 'i') : p);
  if (opts.thresholds) thresholds = { ...thresholds, ...opts.thresholds };
}

export async function moderate(input: ModerationInput): Promise<ModerationResult> {
  if (!isFlagEnabled('moderation')) return { decision: 'allow', reasons: ['disabled'], confidence: 0 };
  return runWithTrace(async () => {
    const txt = (input.text || '').slice(0, 4000);
    if (!txt) return { decision: 'allow', reasons: ['empty'], confidence: 0 };
    for (const r of BLOCK_PATTERNS) if (r.test(txt)) return { decision: 'block', reasons: ['pattern:' + r.source], confidence: Math.max(thresholds.block, 0.9) };
    for (const r of FLAG_PATTERNS) if (r.test(txt)) return { decision: 'flag', reasons: ['pattern:' + r.source], confidence: Math.max(thresholds.flag, 0.6) };
    return { decision: 'allow', reasons: [], confidence: 0.05 };
  }, { span: 'moderation.check' });
}