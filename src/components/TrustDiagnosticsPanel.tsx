import { useEffect, useState } from 'react';

interface TrustStats { hits: number; misses: number; hitRatio: number; }
interface Flags { [k: string]: boolean }

export default function TrustDiagnosticsPanel() {
  const [open, setOpen] = useState(false);
  const [stats, setStats] = useState<TrustStats>({ hits: 0, misses: 0, hitRatio: 0 });
  const [flags, setFlags] = useState<Flags>({});
  const [bypass, setBypass] = useState(false);
  const [querying, setQuerying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setError(null);
      const s = await fetch('/api/trust-cache-stats').then(r => r.json());
      setStats(s.stats);
      const f = await fetch('/api/feature-flags').then(r => r.json());
      setFlags(f.flags || {});
    } catch (e: any) { setError(e?.message || 'Failed'); }
  }

  async function toggleFlag(key: string, value: boolean) {
    await fetch('/api/feature-flags', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key, value }) });
    load();
  }

  async function runBypassProbe() {
    setQuerying(true);
    try {
      await fetch('/api/trust-cache-stats?bypass=1').then(r => r.json());
      await load();
    } catch (e: any) { setError(e?.message || 'Bypass failed'); }
    finally { setQuerying(false); }
  }

  useEffect(() => { if (open) load(); }, [open]);

  return (
    <div style={{ position: 'fixed', bottom: 16, right: 16, zIndex: 60 }}>
      <button onClick={() => setOpen(o => !o)} className="px-3 py-1 text-xs rounded bg-indigo-600 text-white shadow">
        {open ? 'Trust ▲' : 'Trust ▼'}
      </button>
      {open && (
        <div className="mt-2 w-72 text-xs bg-neutral-900/90 backdrop-blur text-white border border-neutral-700 rounded p-3 space-y-2 max-h-[60vh] overflow-auto">
          <div className="font-semibold">Trust Cache</div>
          <div className="grid grid-cols-3 gap-2">
            <div><div className="opacity-70">Hits</div><div>{stats.hits}</div></div>
            <div><div className="opacity-70">Misses</div><div>{stats.misses}</div></div>
            <div><div className="opacity-70">Hit %</div><div>{(stats.hitRatio*100).toFixed(1)}%</div></div>
          </div>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-1"><input type="checkbox" checked={bypass} onChange={e => setBypass(e.target.checked)} />Bypass</label>
            <button disabled={querying} onClick={runBypassProbe} className="px-2 py-0.5 bg-neutral-700 rounded disabled:opacity-50">Probe</button>
          </div>
          <div className="font-semibold pt-1">Feature Flags</div>
          <div className="space-y-1">
            {Object.entries(flags).map(([k,v]) => (
              <div key={k} className="flex justify-between items-center">
                <span>{k}</span>
                <button onClick={() => toggleFlag(k, !v)} className={`px-2 py-0.5 rounded text-[10px] ${v ? 'bg-green-600' : 'bg-neutral-600'}`}>{v ? 'on' : 'off'}</button>
              </div>
            ))}
          </div>
          {error && <div className="text-red-400">{error}</div>}
          <div className="opacity-60">DEV only diagnostics</div>
        </div>
      )}
    </div>
  );
}
