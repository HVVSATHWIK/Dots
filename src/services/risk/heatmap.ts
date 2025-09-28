/** Risk heatmap scaffold. */
export interface RiskSignal { userId: string; score: number; factors: string[]; }
export async function computeRiskSignals(): Promise<RiskSignal[]> { return []; }
