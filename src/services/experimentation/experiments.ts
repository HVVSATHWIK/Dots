/** Experimentation framework scaffold (bucket assignment). */
export interface ExperimentDefinition { key: string; variants: string[]; salt?: string; }
export function assignVariant(userId: string, exp: ExperimentDefinition): string {
  const base = (exp.salt || '') + userId + exp.key; let h = 0; for (let i = 0; i < base.length; i++) h = Math.imul(33, h) + base.charCodeAt(i);
  const idx = Math.abs(h) % exp.variants.length; return exp.variants[idx];
}
