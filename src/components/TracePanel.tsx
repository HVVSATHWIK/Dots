import React, { useEffect, useState } from 'react';

interface TraceEvent {
  ts: number;
  span: string;
  level?: string;
  durationMs?: number;
  meta?: any;
}

export const TracePanel: React.FC<{ pollMs?: number; limit?: number }> = ({ pollMs = 4000, limit = 120 }) => {
  const [events, setEvents] = useState<TraceEvent[]>([]);
  const [collapsed, setCollapsed] = useState(false);
  useEffect(() => {
    let timer: any;
    const load = async () => {
      try {
        const res = await fetch('/api/traces');
        if (!res.ok) return;
        const json = await res.json();
        setEvents(json.traces || []);
      } catch {}
      timer = setTimeout(load, pollMs);
    };
    load();
    return () => clearTimeout(timer);
  }, [pollMs]);

  if (collapsed) {
    return <div style={panelStyleCollapsed} onClick={() => setCollapsed(false)}>Traces ({events.length})</div>;
  }
  const shown = events.slice(-limit).reverse();
  return (
    <div style={panelStyle}>
      <div style={headerStyle}>
        <strong>Trace Panel</strong>
        <button onClick={() => setCollapsed(true)} style={btnStyle}>_</button>
      </div>
      <div style={bodyStyle}>
        {shown.map((e, i) => (
          <div key={i} style={{ ...rowStyle, opacity: e.level === 'debug' ? 0.6 : 1 }}>
            <span style={spanStyle}>{new Date(e.ts).toLocaleTimeString()}</span>
            <span style={levelStyle(e.level)}>{e.level || 'info'}</span>
            <span style={nameStyle}>{e.span}</span>
            {e.durationMs != null && <span style={durStyle}>{e.durationMs.toFixed(1)}ms</span>}
            {e.meta && <span style={metaStyle}>{JSON.stringify(e.meta).slice(0,120)}</span>}
          </div>
        ))}
      </div>
    </div>
  );
};

const panelStyle: React.CSSProperties = {
  position: 'fixed', bottom: 8, right: 8, width: 420, maxHeight: 340, fontSize: 11,
  fontFamily: 'ui-monospace, monospace', background: 'rgba(0,0,0,0.80)', color: '#eee',
  border: '1px solid #333', borderRadius: 6, zIndex: 9999, display: 'flex', flexDirection: 'column'
};
const panelStyleCollapsed: React.CSSProperties = { position: 'fixed', bottom: 8, right: 8, background: '#111', color: '#eee', padding: '4px 8px', borderRadius: 4, cursor: 'pointer', fontSize: 12, fontFamily: 'ui-monospace, monospace' };
const headerStyle: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '4px 8px', borderBottom: '1px solid #222' };
const bodyStyle: React.CSSProperties = { overflowY: 'auto', padding: 4 };
const rowStyle: React.CSSProperties = { display: 'flex', gap: 6, padding: '2px 0', borderBottom: '1px solid #222', alignItems: 'baseline' };
const spanStyle: React.CSSProperties = { minWidth: 60, color: '#bbb' };
const nameStyle: React.CSSProperties = { flex: 1, color: '#8bd5ff' };
const durStyle: React.CSSProperties = { color: '#f6d06f' };
const metaStyle: React.CSSProperties = { color: '#ccc', flex: 1 };
const btnStyle: React.CSSProperties = { background: 'transparent', color: '#aaa', border: 'none', cursor: 'pointer' };
const levelStyle = (lvl?: string): React.CSSProperties => ({ color: lvl === 'error' ? '#ff6b6b' : lvl === 'warn' ? '#ffa94d' : lvl === 'debug' ? '#888' : '#5ef38c' });

export default TracePanel;
