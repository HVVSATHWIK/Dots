// Trust score skeleton: combines simple heuristics for now.
// Future: on-time fulfillment %, dispute ratio, rating distribution, recency decay.
import { runWithTrace } from '@/lib/tracing';
import { getDb } from '@/integrations/members/firebase';
import { addDoc, collection, doc, setDoc } from 'firebase/firestore';

export interface TrustFactors {
  listingCount: number;         // number of active listings
  fulfilledOrders: number;      // orders delivered
  avgFulfillmentMs?: number;    // average latency (mocked)
  disputes?: number;            // count of disputes
  tenureDays?: number;          // days since account creation
  recentFulfillments30d?: number; // heuristic count of fulfillments in last 30 days (optional)
  decayedFulfillments?: number;   // exponential decay weighted fulfillments (windowed)
  endorsementsCount?: number;     // distinct peer endorsements
}

export interface TrustScoreResult {
  score: number; // 0-100
  grade: 'bronze' | 'silver' | 'gold' | 'platinum';
  components: { name: string; value: number; weight: number; contribution: number }[];
  factors: TrustFactors;
  version: string;
}

export function computeTrustScoreRaw(factors: TrustFactors): TrustScoreResult {
  const components: TrustScoreResult['components'] = [];
  function add(name: string, rawValue: number, weight: number, normalize: (v: number) => number) {
    const normalized = Math.min(1, Math.max(0, normalize(rawValue)));
    const contribution = normalized * weight;
    components.push({ name, value: rawValue, weight, contribution });
    return contribution;
  }
  let total = 0;
  // Weights (sum = 1.0) including peer endorsements (small but meaningful signal)
  total += add('listings', factors.listingCount, 0.15, v => v / 20);
  total += add('fulfilledTotal', factors.fulfilledOrders, 0.25, v => v / 100);
  total += add('fulfilledDecayed', factors.decayedFulfillments || 0, 0.09, v => v / 60);
  total += add('fulfilledRecent30d', factors.recentFulfillments30d || 0, 0.09, v => v / 30);
  total += add('latency', factors.avgFulfillmentMs || 0, 0.13, v => (v <= 0 ? 0 : 1 - Math.min(1, v / (7*24*3600*1000))));
  total += add('disputes', factors.disputes || 0, 0.13, v => 1 - Math.min(1, v / 5));
  total += add('tenure', factors.tenureDays || 0, 0.10, v => v / 365);
  total += add('endorsements', factors.endorsementsCount || 0, 0.06, v => v / 25); // saturate around 25 distinct endorsements

  const score = Math.round(total * 100);
  let grade: TrustScoreResult['grade'] = 'bronze';
  if (score >= 75) grade = 'platinum';
  else if (score >= 55) grade = 'gold';
  else if (score >= 35) grade = 'silver';

  return { score, grade, components, factors, version: 'trust-v0' };
}

export async function computeTrustScore(factors: TrustFactors) {
  return runWithTrace(() => Promise.resolve(computeTrustScoreRaw(factors)), { span: 'trust.compute', metaStart: { listingCount: factors.listingCount } });
}

export interface PersistedTrustSnapshot {
  userId: string;
  at: number;
  score: number;
  grade: string;
  version: string;
  factors: TrustFactors;
}

export async function persistTrustScore(userId: string, factors: TrustFactors) {
  return runWithTrace(async () => {
    const result = computeTrustScoreRaw(factors);
    const db = getDb();
    const payload: PersistedTrustSnapshot = { userId, at: Date.now(), score: result.score, grade: result.grade, version: result.version, factors };
    try {
      await addDoc(collection(db, 'trustSnapshots'), payload);
      // Upsert latest snapshot doc for O(1) retrieval and cache warm.
      await setDoc(doc(db, 'trustLatest', userId), {
        userId,
        score: result.score,
        grade: result.grade,
        version: result.version,
        updatedAt: Date.now(),
        listingCount: factors.listingCount,
        fulfilledOrders: factors.fulfilledOrders,
    disputes: factors.disputes || 0,
    tenureDays: factors.tenureDays || 0,
    recentFulfillments30d: factors.recentFulfillments30d || 0,
    decayedFulfillments: factors.decayedFulfillments || 0,
    endorsementsCount: factors.endorsementsCount || 0,
      }, { merge: true });
    } catch (e) {
      if (import.meta.env.DEV) console.warn('[trust] persist failed', (e as any)?.message);
    }
    return { ...result, persisted: true };
  }, { span: 'trust.persist', metaStart: { userId } });
}
