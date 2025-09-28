/** Seasonal trend radar scaffold. */
export interface TrendSignal { tag: string; velocity: number; delta7d: number; }
export async function computeSeasonalTrends(): Promise<TrendSignal[]> { return []; }
