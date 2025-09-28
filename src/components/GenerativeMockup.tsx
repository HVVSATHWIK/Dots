import { useState, useRef, useCallback, useEffect } from 'react';
import ModelViewer3D from '@/components/ModelViewer3D';

/**
 * Moonshot PoC Component: GenerativeMockup
 * ---------------------------------------
 * Allows a user to enter a text prompt describing a craft idea and fetch a generated 3D asset.
 * This is an early scaffold: it includes a placeholder API call and a simple Three.js viewer.
 *
 * Integration Strategy (future):
 * 1. Call a serverless API route (/api/gen3d) that proxies to selected text->3D provider (e.g., Luma Genie / OpenAI Shap-E alt / Stability / TripoAI).
 * 2. Poll for job completion if provider is async (most are) and then fetch GLB/OBJ/USDZ.
 * 3. Display the mesh using drei's <Stage> for quick neutral lighting.
 * 4. Cache results keyed by normalized prompt to avoid re-generation.
 */

interface Gen3DJob {
  id: string;
  status: 'queued' | 'processing' | 'succeeded' | 'failed';
  progress?: number;
  url?: string;
  mode?: 'procedural' | 'asset';
  error?: string;
}

async function createJob(prompt: string): Promise<string> {
  const res = await fetch('/api/gen3d', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ prompt }) });
  if (!res.ok) throw new Error('Failed to create job');
  const json = await res.json();
  return json.id;
}

async function fetchJob(id: string): Promise<Gen3DJob> {
  const res = await fetch(`/api/gen3d/${id}`);
  if (!res.ok) throw new Error('Failed to fetch job');
  return await res.json();
}

export default function GenerativeMockup() {
  const [prompt, setPrompt] = useState('Hand-carved walnut jewelry box with geometric lid pattern');
  const [job, setJob] = useState<Gen3DJob | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<Gen3DJob[]>([]);
  const [wireframe, setWireframe] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const pollRef = useRef<number | null>(null);

  const generate = useCallback(async () => {
    const p = prompt.trim();
    if (!p) return;
    setIsLoading(true); setError(null); setJob(null);
    try {
      const id = await createJob(p);
      // Kick off polling
      const start = async () => {
        try {
          const j = await fetchJob(id);
            setJob(j);
            if (j.status === 'succeeded' || j.status === 'failed') {
              setHistory(h => [j, ...h].slice(0, 12));
              if (pollRef.current) window.clearTimeout(pollRef.current);
              pollRef.current = null;
            } else {
              pollRef.current = window.setTimeout(start, 1200);
            }
        } catch (e: any) {
          setError(e.message);
        }
      };
      start();
    } catch (e: any) {
      setError(e?.message || 'Generation failed');
    } finally {
      setIsLoading(false);
    }
  }, [prompt]);

  useEffect(() => {
    // Auto-generate on first mount for demo
    if (!job) { void generate(); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => () => { if (pollRef.current) window.clearTimeout(pollRef.current); }, []);

  return (
    <div className="space-y-4 p-4 border rounded-xl bg-background/50">
      <div className="space-y-2">
        <label className="text-sm font-medium" htmlFor="gen3d-prompt">Describe your idea</label>
        <textarea
          id="gen3d-prompt"
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          rows={3}
          className="w-full text-sm rounded-lg border px-3 py-2 resize-none focus:outline-none focus:ring"
          placeholder="e.g. Minimalist ceramic tea set with matte white glaze and bamboo handles"
        />
        <div className="flex gap-2 items-center">
          <button
            disabled={isLoading || !prompt.trim()}
            onClick={() => void generate()}
            className="inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm disabled:opacity-50 hover:bg-accent"
          >
            {isLoading ? 'Generating…' : 'Generate'}
          </button>
          {error && <span className="text-xs text-red-600">{error}</span>}
        </div>
      </div>

      <ModelViewer3D url={job?.url} mode={job?.mode} wireframe={wireframe} autoRotate={autoRotate} />
      <div className="flex flex-wrap gap-4 text-xs">
        <label className="inline-flex items-center gap-1 cursor-pointer select-none">
          <input type="checkbox" checked={wireframe} onChange={e => setWireframe(e.target.checked)} /> Wireframe
        </label>
        <label className="inline-flex items-center gap-1 cursor-pointer select-none">
          <input type="checkbox" checked={autoRotate} onChange={e => setAutoRotate(e.target.checked)} /> Auto-Rotate
        </label>
        {job && <span className="text-muted-foreground">Status: {job.status}{typeof job.progress === 'number' && job.status !== 'succeeded' ? ` (${Math.round(job.progress)}%)` : ''}</span>}
      </div>

      <div className="space-y-1">
        <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Recent</div>
        {history.length === 0 && <div className="text-xs text-muted-foreground">No generations yet.</div>}
        <ul className="space-y-1 max-h-32 overflow-auto pr-1 text-xs">
          {history.map(h => {
            const color = h.status === 'succeeded' ? 'text-emerald-500' : h.status === 'failed' ? 'text-red-500' : 'text-yellow-500';
            return (
              <li key={h.id} className="flex items-center justify-between gap-2 border rounded px-2 py-1 bg-background/70">
                <span className="truncate" title={h.id}>{h.id}</span>
                <span className={`text-[10px] uppercase tracking-wide ${color}`}>{h.status}</span>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="text-[11px] text-muted-foreground leading-relaxed border-t pt-2">
        This preview uses a simulated job pipeline. For production: replace the /api/gen3d implementation with an external text→3D provider (Luma, Tripo, etc.), persist jobs, and stream progress. Once provider returns a GLB URL, set job.mode = 'asset' & job.url to load the actual mesh.
      </div>
    </div>
  );
}
