/** Sustainability scoring & eco substitution scaffold. */
export interface SustainabilityScore { score: number; carbonEstimateKg: number; suggestions: string[]; }
export function computeSustainability(_materials: string[], _originDistanceKm?: number): SustainabilityScore { return { score: 0, carbonEstimateKg: 0, suggestions: [] }; }
