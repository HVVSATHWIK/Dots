/** Repair triage flow scaffold. */
export interface RepairTriageInput { damageDescription: string; photos?: string[]; }
export interface RepairTriageResult { reparable: boolean; confidence: number; recommendations: string[]; }
export async function triageRepair(_input: RepairTriageInput): Promise<RepairTriageResult> { return { reparable: false, confidence: 0, recommendations: [] }; }
