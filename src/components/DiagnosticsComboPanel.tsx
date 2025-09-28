import { useEffect, useState } from 'react';

interface TrustStats { hits: number; misses: number; hitRatio: number; }
interface Flags { [k: string]: boolean }

interface EvalRow { query: string; precision: number; threshold: number; passed: boolean; }

export default function DiagnosticsComboPanel() {
  const [open, setOpen] = useState(false);
  const [stats, setStats] = useState<TrustStats>({ hits: 0, misses: 0, hitRatio: 0 });
  const [flags, setFlags] = useState<Flags>({});
  const [counters, setCounters] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [evalRows, setEvalRows] = useState<EvalRow[]>([]);

  async function load() {
    try {
      setError(null);
      const s = await fetch('/api/trust-cache-stats').then(r => r.json()).catch(()=>null);
      if (s?.stats) setStats(s.stats);
  const f = await fetch('/api/feature-flags').then(r => r.json()).catch(()=>null);
      if (f?.flags) setFlags(f.flags);
  const m = await fetch('/api/diagnostics-metrics').then(r => r.json()).catch(()=>null);
  if (m?.counters) { setCounters(m.counters); if (m.trust) setStats(m.trust); }
    } catch (e: any) { setError(e?.message || 'Failed'); }
  }

  async function toggleFlag(key: string, value: boolean) {
    await fetch('/api/feature-flags', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key, value }) });
    load();
  }

  async function runEval() {
    setLoading(true);
    try {
      const res = await fetch('/api/run-eval', { method: 'POST' }).then(r => r.json());
      const rows = (res.cases || []).map((c: any) => ({ query: c.query, precision: c.precision, threshold: c.threshold, passed: c.passed }));
      setEvalRows(rows);
    } catch (e: any) {
      setError(e?.message || 'Eval failed');
    } finally { setLoading(false); }
  }

  useEffect(() => { if (open) load(); }, [open]);

  return (
    <div style={{ position: 'fixed', bottom: 16, left: 16, zIndex: 60 }}>
      <button onClick={() => setOpen(o => !o)} className="px-3 py-1 text-xs rounded bg-fuchsia-600 text-white shadow">
        {open ? 'Diag ▲' : 'Diag ▼'}
      </button>
      {open && (
        <div className="mt-2 w-80 text-[11px] bg-neutral-900/90 backdrop-blur text-white border border-neutral-700 rounded p-3 space-y-3 max-h-[65vh] overflow-auto">
          <section>
            <div className="font-semibold mb-1">Trust Cache</div>
            <div className="grid grid-cols-3 gap-2 mb-1">
              <div><div className="opacity-60">Hits</div><div>{stats.hits}</div></div>
              <div><div className="opacity-60">Misses</div><div>{stats.misses}</div></div>
              <div><div className="opacity-60">Hit%</div><div>{(stats.hitRatio*100).toFixed(1)}%</div></div>
            </div>
          </section>
          <section>
            <div className="font-semibold mb-1">Counters</div>
            {Object.keys(counters).length === 0 && <div className="opacity-60">(none yet)</div>}
            <div className="space-y-0.5">
              {Object.entries(counters).sort().map(([k,v]) => (
                <div key={k} className="flex justify-between"><span className="truncate max-w-[60%]" title={k}>{k}</span><span>{v}</span></div>
              ))}
            </div>
          </section>
          <section>
            <div className="font-semibold mb-1">Feature Flags</div>
            <div className="space-y-1">
              {Object.entries(flags).map(([k,v]) => (
                <div key={k} className="flex justify-between items-center">
                  <span>{k}</span>
                  <button onClick={() => toggleFlag(k, !v)} className={`px-2 py-0.5 rounded text-[10px] ${v ? 'bg-green-600' : 'bg-neutral-600'}`}>{v ? 'on' : 'off'}</button>
                </div>
              ))}
            </div>
          </section>
          <section>
            <div className="font-semibold mb-1 flex items-center justify-between">Eval <button onClick={runEval} disabled={loading} className="px-2 py-0.5 bg-neutral-700 rounded disabled:opacity-40">Run</button></div>
            {evalRows.length === 0 && <div className="opacity-60">No runs yet.</div>}
            {evalRows.map(r => (
              <div key={r.query} className={`p-1 rounded border ${r.passed ? 'border-green-600/40 bg-green-600/10' : 'border-red-600/40 bg-red-600/10'}`}>
                <div className="flex justify-between"><span>{r.query}</span><span>{(r.precision*100).toFixed(0)}%</span></div>
                <div className="opacity-60">Thresh {(r.threshold*100).toFixed(0)}% • {r.passed ? 'PASS' : 'FAIL'}</div>
              </div>
            ))}
          </section>
          {error && <div className="text-red-400">{error}</div>}
          <div className="opacity-50">Composite diagnostics (DEV)</div>
        </div>
      )}
    </div>
  );
}
