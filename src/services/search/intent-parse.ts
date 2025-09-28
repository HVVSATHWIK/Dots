export interface ParsedIntent {
  budgetMin?: number; budgetMax?: number;
  materials?: string[];
  timeframeDays?: number;
  remainingQuery: string;
}

const MATERIAL_WORDS = ['walnut','oak','maple','ceramic','clay','glass','leather','cotton','linen'];

export function parseIntent(raw: string): ParsedIntent {
  let q = raw.toLowerCase();
  const out: ParsedIntent = { remainingQuery: raw };
  // Budget patterns: under 200, below 500, 100-300, 200 to 400
  const range = q.match(/(\d+)[\s-]{1,3}(\d+)/);
  if (range) { out.budgetMin = Number(range[1]); out.budgetMax = Number(range[2]); q = q.replace(range[0], ''); }
  const under = q.match(/(?:under|below)\s*(\d+)/);
  if (under) { out.budgetMax = Number(under[1]); q = q.replace(under[0], ''); }
  const over = q.match(/over\s*(\d+)/);
  if (over) { out.budgetMin = Number(over[1]); q = q.replace(over[0], ''); }
  // Timeframe: in 2 weeks, within 10 days
  const tf = q.match(/(?:in|within)\s*(\d+)\s*(?:day|days|week|weeks)/);
  if (tf) {
    const val = Number(tf[1]);
    out.timeframeDays = /week/.test(tf[0]) ? val * 7 : val;
    q = q.replace(tf[0], '');
  }
  const mats: string[] = [];
  for (const m of MATERIAL_WORDS) if (q.includes(m)) mats.push(m);
  if (mats.length) { out.materials = mats; }
  out.remainingQuery = q.replace(/\s+/g,' ').trim();
  return out;
}