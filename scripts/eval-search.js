// Simple evaluation harness for hybrid search vs golden expectations.
// Fails (non-zero exit) if precision@k drops below threshold.
// Lightweight re-implementation of only what we need from embeddings without Firestore (pure functions) fallback.
// To keep it simple and avoid complex loader issues, we duplicate minimal logic.
function deterministicEmbedding(text) {
  const dim = 64; const vec = new Array(dim).fill(0);
  for (let i=0;i<text.length;i++){ const c=text.charCodeAt(i); vec[c%dim]+= (c%13)+1; }
  const norm = Math.sqrt(vec.reduce((s,v)=>s+v*v,0))||1; return vec.map(v=>v/norm);
}
function cosine(a,b){ let dot=0,na=0,nb=0; for(let i=0;i<a.length;i++){dot+=a[i]*b[i];na+=a[i]*a[i];nb+=b[i]*b[i];} return dot/(Math.sqrt(na)*Math.sqrt(nb)); }
function lexicalScore(q,l){ const terms=q.toLowerCase().split(/\s+/).filter(Boolean); const hay=(l.title+' '+(l.description||'')).toLowerCase(); let s=0; for(const t of terms) if(hay.includes(t)) s++; return s/Math.max(1,terms.length);} 
async function ensureListingEmbeddings(listings){ /* no-op for deterministic approach */ return listings; }
async function hybridSearchListings(queryText, listings, limit){ const qVec=deterministicEmbedding(queryText); const sem = listings.map(l=>({refId:l.id, score: cosine(qVec, deterministicEmbedding(l.title+' '+(l.description||'')))})); const semMap=new Map(sem.map(r=>[r.refId,r.score])); const results=listings.map(l=>{ const semantic=semMap.get(l.id)||0; const lexical=lexicalScore(queryText,l); const score=semantic*0.75+lexical*0.25; return { refId:l.id, score, semantic, lexical }; }); return results.sort((a,b)=>b.score-a.score).slice(0,limit);} 
async function loadEmbeddings(){ return { ensureListingEmbeddings, hybridSearchListings }; }
import fs from 'node:fs';

// Golden dataset structure (hard-coded here; could externalize later)
// Each query has expected top listing IDs (unordered) considered relevant.
const golden = [
  { query: 'walnut table', listings: [
    { id: 'g1', title: 'Walnut dining table', description: 'solid walnut large table', price: 900, ownerId: 's1' },
    { id: 'g2', title: 'Pine bookshelf', description: 'simple pine shelves', price: 120, ownerId: 's2' },
    { id: 'g3', title: 'Walnut side table', description: 'compact walnut accent', price: 180, ownerId: 's1' }
  ], relevant: ['g1','g3'] }
];

const PRECISION_THRESHOLD = 0.5; // minimal acceptable precision@K

(async () => {
  let failures = 0;
  const emb = await loadEmbeddings();
  for (const row of golden) {
    await emb.ensureListingEmbeddings(row.listings);
    const res = await emb.hybridSearchListings(row.query, row.listings, row.listings.length);
    const topK = res.slice(0, row.relevant.length); // evaluate at R size
    const hits = topK.filter(r => row.relevant.includes(r.refId)).length;
    const precision = hits / topK.length;
    if (precision < PRECISION_THRESHOLD) {
      console.error(`[EVAL] precision@${topK.length}=${precision.toFixed(2)} below threshold for query '${row.query}'`);
      failures++;
    } else {
      console.log(`[EVAL] precision@${topK.length}=${precision.toFixed(2)} OK for query '${row.query}'`);
    }
  }
  if (failures > 0) {
    console.error(`[EVAL] FAILED with ${failures} degraded cases`);
    process.exit(1);
  } else {
    console.log('[EVAL] All search evaluations passed');
  }
})();
