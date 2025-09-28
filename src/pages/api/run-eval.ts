import type { APIRoute } from 'astro';
import { randomUUID } from 'node:crypto';

/**
 * Lightweight eval trigger endpoint. Runs the same golden logic used by scripts/eval-search.js (simplified inline)
 * and returns precision metrics. In real production you would separate worker execution.
 */

interface EvalCase { query: string; relevant: string[]; listings: { id: string; title: string; description?: string; price: number; ownerId: string }[] }

const golden: EvalCase[] = [
  { query: 'walnut table', relevant: ['g1','g3'], listings: [
    { id: 'g1', title: 'Walnut dining table', description: 'solid walnut large table', price: 900, ownerId: 's1' },
    { id: 'g2', title: 'Pine bookshelf', description: 'simple pine shelves', price: 120, ownerId: 's2' },
    { id: 'g3', title: 'Walnut side table', description: 'compact walnut accent', price: 180, ownerId: 's1' },
  ] }
];

function deterministicEmbedding(text: string) {
  const dim = 64; const vec = new Array(dim).fill(0);
  for (let i=0;i<text.length;i++){ const c=text.charCodeAt(i); vec[c%dim]+= (c%13)+1; }
  const norm = Math.sqrt(vec.reduce((s,v)=>s+v*v,0))||1; return vec.map(v=>v/norm);
}
function cosine(a:number[],b:number[]){ let dot=0,na=0,nb=0; for(let i=0;i<a.length;i++){dot+=a[i]*b[i];na+=a[i]*a[i];nb+=b[i]*b[i];} return dot/(Math.sqrt(na)*Math.sqrt(nb)); }
function lexicalScore(q:string,l:{title:string;description?:string}){ const terms=q.toLowerCase().split(/\s+/).filter(Boolean); const hay=(l.title+' '+(l.description||'')).toLowerCase(); let s=0; for(const t of terms) if(hay.includes(t)) s++; return s/Math.max(1,terms.length);} 

function hybrid(query: string, listings: EvalCase['listings']) {
  const qVec = deterministicEmbedding(query);
  return listings.map(l => {
    const sem = cosine(qVec, deterministicEmbedding(l.title + ' ' + (l.description||'')));
    const lex = lexicalScore(query,l);
    return { id: l.id, score: sem*0.75 + lex*0.25 };
  }).sort((a,b)=>b.score-a.score);
}

export const POST: APIRoute = async () => {
  const results = golden.map(c => {
    const ranked = hybrid(c.query, c.listings);
    const k = c.relevant.length;
    const topK = ranked.slice(0,k);
    const hits = topK.filter(r => c.relevant.includes(r.id)).length;
    const precision = hits / k;
    return { id: randomUUID(), query: c.query, k, precision, hits, threshold: 0.5, passed: precision >= 0.5 };
  });
  return new Response(JSON.stringify({ cases: results, summary: { passed: results.every(r=>r.passed) } }), { status: 200, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
};

export const prerender = false;
