/** Fair price confidence badge scaffold. */
export interface PriceConfidence { score: number; band: 'low' | 'medium' | 'high'; rationale: string[]; }
export function computePriceConfidence(_suggested: number, _variance: number): PriceConfidence {
  // TODO: integrate historical sale dispersion metrics.
  return { score: 0, band: 'low', rationale: ['stub'] };
}
