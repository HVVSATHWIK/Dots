/** Golden set evaluation harness scaffold. */
export interface EvalCase { id: string; kind: 'pricing' | 'assistant'; input: any; expected: any; }
export async function runEval(_cases: EvalCase[]): Promise<{ passed: number; failed: number; results: any[]; }> { return { passed: 0, failed: 0, results: [] }; }
