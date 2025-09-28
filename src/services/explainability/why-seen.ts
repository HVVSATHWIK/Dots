/** Explainability scaffold for recommendations. */
export interface WhySeenFactor { name: string; weight: number; contribution: number; }
export interface WhySeenExplanation { factors: WhySeenFactor[]; summary: string; }
export function buildWhySeen(_context: any): WhySeenExplanation { return { factors: [], summary: 'stub' }; }
