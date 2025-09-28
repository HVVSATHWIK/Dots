// Simple co-occurrence based related listings scaffold.
export interface InteractionEvent { userId: string; listingId: string; type: 'view' | 'favorite'; at: number }
const events: InteractionEvent[] = [];

export function recordInteraction(evt: InteractionEvent) { events.push(evt); }

export function relatedListings(listingId: string, limit = 5): { id: string; score: number }[] {
  // Build co-occurrence counts: users who interacted with listingId and other listings.
  const byUser: Record<string, Set<string>> = {};
  for (const e of events) {
    if (!byUser[e.userId]) byUser[e.userId] = new Set();
    byUser[e.userId].add(e.listingId);
  }
  const scores: Record<string, number> = {};
  for (const [user, set] of Object.entries(byUser)) {
    if (!set.has(listingId)) continue;
    for (const other of set) {
      if (other === listingId) continue;
      scores[other] = (scores[other] || 0) + 1;
    }
  }
  return Object.entries(scores).map(([id, score]) => ({ id, score })).sort((a,b)=>b.score-a.score).slice(0, limit);
}