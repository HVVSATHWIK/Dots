import { getDb } from '@/integrations/members/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { snapshotCounters } from '@/lib/metrics';
import { runWithTrace } from '@/lib/tracing';

let lastFlush = 0;
const FLUSH_INTERVAL_MS = 60_000;

function dateKey(ts = Date.now()) { const d = new Date(ts); return d.toISOString().slice(0,10); }

export async function flushMetricsIfDue(force=false) {
  const now = Date.now();
  if (!force && now - lastFlush < FLUSH_INTERVAL_MS) return false;
  lastFlush = now;
  return runWithTrace(async () => {
    const counters = snapshotCounters();
    const db = getDb();
    const ref = doc(db, 'metricsDaily', dateKey());
    await setDoc(ref, { updatedAt: now, counters }, { merge: true });
    return true;
  }, { span: 'metrics.flush', metaStart: {} });
}

// Optional: call periodically in a loose interval (dev only – production would use a scheduler / cron)
if (typeof window === 'undefined') {
  setInterval(() => { void flushMetricsIfDue(); }, FLUSH_INTERVAL_MS);
}
