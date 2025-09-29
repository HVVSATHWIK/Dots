export type FlagKey = 'hybridSearch' | 'moderation' | 'reputationEdges' | 'pricingElasticityPreview' | 'negotiationBeta' | 'assistantStreaming' | 'searchPersonalization' | 'moderationV2' | 'aiImageGen' | 'aiTTS' | 'aiImageVariants' | 'aiAudioControls';

export type FlagDefinition = {
  key: FlagKey;
  type: 'boolean' | 'percent' | 'cohort';
  value?: boolean;             // for boolean
  rolloutPercent?: number;     // for percent (0-100)
  cohorts?: string[];          // for cohort type
  updatedAt?: number;
};

// In-memory store
let flagDefs: Record<FlagKey, FlagDefinition> = {
  hybridSearch: { key: 'hybridSearch', type: 'boolean', value: true },
  moderation: { key: 'moderation', type: 'boolean', value: true },
  reputationEdges: { key: 'reputationEdges', type: 'boolean', value: true },
  pricingElasticityPreview: { key: 'pricingElasticityPreview', type: 'percent', rolloutPercent: 0 },
  negotiationBeta: { key: 'negotiationBeta', type: 'cohort', cohorts: [] },
  assistantStreaming: { key: 'assistantStreaming', type: 'percent', rolloutPercent: 0 },
  searchPersonalization: { key: 'searchPersonalization', type: 'percent', rolloutPercent: 0 },
  moderationV2: { key: 'moderationV2', type: 'percent', rolloutPercent: 0 },
  aiImageGen: { key: 'aiImageGen', type: 'boolean', value: true },
  aiTTS: { key: 'aiTTS', type: 'boolean', value: true },
  aiImageVariants: { key: 'aiImageVariants', type: 'boolean', value: true },
  aiAudioControls: { key: 'aiAudioControls', type: 'boolean', value: true },
};

let loaded = false;
import { incr, METRIC } from '@/lib/metrics';

// Deterministic hash (simple FNV-1a like) for bucketing
function hashToPercent(str: string) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return (h >>> 0) % 100; // 0-99
}

interface FlagContext { userId?: string; logExposure?: boolean }
export function isFlagEnabled(key: FlagKey, ctx?: FlagContext): boolean {
  const def = flagDefs[key];
  if (!def) return false;
  if (def.type === 'boolean') {
    const enabled = !!def.value;
    if (enabled && ctx?.logExposure && ctx?.userId) incr(METRIC.FEATURE_FLAG_EXPOSURE + ':' + key);
    return enabled;
  }
  if (def.type === 'percent') {
    const pct = def.rolloutPercent ?? 0;
    if (pct >= 100) return true;
    if (pct <= 0) return false;
    const basis = ctx?.userId || 'anonymous';
    const enabled = hashToPercent(key + ':' + basis) < pct;
    if (enabled && ctx?.logExposure && ctx?.userId) incr(METRIC.FEATURE_FLAG_EXPOSURE + ':' + key);
    return enabled;
  }
  if (def.type === 'cohort') {
    if (!def.cohorts || def.cohorts.length === 0) return false;
    const basis = ctx?.userId; 
    if (!basis) return false;
    const enabled = def.cohorts.includes(basis);
    if (enabled && ctx?.logExposure && ctx?.userId) incr(METRIC.FEATURE_FLAG_EXPOSURE + ':' + key);
    return enabled;
  }
  return false;
}

export function setFlag(def: Partial<FlagDefinition> & { key: FlagKey }) {
  const existing = flagDefs[def.key];
  flagDefs[def.key] = { ...existing, ...def, updatedAt: Date.now() } as FlagDefinition;
  persistDefinition(flagDefs[def.key]).catch(()=>{});
}

export function getAllFlags() { return Object.values(flagDefs).reduce<Record<FlagKey, any>>((acc, f) => { acc[f.key] = f; return acc; }, {} as any); }

// Persistence (best effort; if Firestore unavailable we remain in-memory)
import { getDb } from '@/integrations/members/firebase';
import { collection, doc, getDocs, setDoc, onSnapshot } from 'firebase/firestore';

async function persistDefinition(def: FlagDefinition) {
  try {
    const db = getDb();
    await setDoc(doc(db, 'featureFlags', def.key), def, { merge: true });
  } catch {}
}

export async function loadFlagsOnce() {
  if (loaded) return getAllFlags();
  try {
    const db = getDb();
    const snap = await getDocs(collection(db, 'featureFlags'));
    for (const d of snap.docs) {
      const data = d.data() as any;
      if (data && data.key) {
        flagDefs[data.key as FlagKey] = { ...flagDefs[data.key as FlagKey], ...data };
      }
    }
    onSnapshot(collection(db, 'featureFlags'), (s) => {
      s.docChanges().forEach(ch => {
        const data = ch.doc.data() as any;
        if (data && data.key) flagDefs[data.key as FlagKey] = { ...flagDefs[data.key as FlagKey], ...data };
      });
    });
    loaded = true;
  } catch (e) { /* ignore - stays default */ }
  return getAllFlags();
}

// Helper to derive a stable bucket (0-99) for percent rollouts and experiments sharing hashing logic.
export function percentBucket(key: string, userId?: string) {
  const basis = userId || 'anonymous';
  // reuse internal hash via temporary exposure of logic (duplicate minimal to avoid refactor)
  let h = 2166136261 >>> 0;
  const str = key + ':' + basis;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return (h >>> 0) % 100;
}