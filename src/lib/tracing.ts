// Lightweight tracing & metrics utility.
// Provides: time measurement, token usage hooks, structured logging fan-out.

export interface TraceEventBase {
  ts: number; // epoch ms
  span: string; // logical operation name
  level?: 'info' | 'warn' | 'error' | 'debug';
  durationMs?: number;
  meta?: Record<string, any>;
}

export type TraceSink = (event: TraceEventBase) => void;

// Global switch to disable all tracing/logging functionality
const TRACING_ENABLED = false;

const sinks: TraceSink[] = [];
// In-memory ring buffer for recent traces (dev tooling)
export interface RingBufferOptions { capacity?: number; }
const __traceBuffer: { events: TraceEventBase[]; capacity: number } = { events: [], capacity: 300 };
export function configureTraceBuffer(opts: RingBufferOptions) {
  if (!TRACING_ENABLED) return;
  if (opts.capacity && opts.capacity > 10) __traceBuffer.capacity = opts.capacity;
}
export function getRecentTraces(limit = 100): TraceEventBase[] {
  if (!TRACING_ENABLED) return [];
  const evts = __traceBuffer.events;
  return evts.slice(Math.max(0, evts.length - limit));
}
function pushToRing(e: TraceEventBase) {
  if (!TRACING_ENABLED) return;
  __traceBuffer.events.push(e);
  if (__traceBuffer.events.length > __traceBuffer.capacity) {
    __traceBuffer.events.splice(0, __traceBuffer.events.length - __traceBuffer.capacity);
  }
}

if (TRACING_ENABLED) {
  addTraceSink(pushToRing);
}

export function addTraceSink(sink: TraceSink) {
  if (!TRACING_ENABLED) return;
  sinks.push(sink);
}

// Default console sink (can be disabled in prod if needed)
if (TRACING_ENABLED) {
  addTraceSink(e => {
    if (import.meta.env.PROD && e.level === 'debug') return;
    const { span, durationMs, level = 'info', meta } = e;
    // eslint-disable-next-line no-console
    console[level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log'](
      `[trace] ${span}${durationMs != null ? ` ${durationMs.toFixed(1)}ms` : ''}`,
      meta || ''
    );
  });
}

export interface RunWithTraceOptions {
  span: string;
  metaStart?: Record<string, any>;
  onSuccessMeta?: (result: any) => Record<string, any> | void;
  onErrorMeta?: (err: any) => Record<string, any> | void;
}

export async function runWithTrace<T>(fn: () => Promise<T> | T, opts: RunWithTraceOptions): Promise<T> {
  if (!TRACING_ENABLED) {
    // Tracing disabled: simply run the function without logging
    return await fn();
  }
  const start = performance.now();
  const startEvent: TraceEventBase = { ts: Date.now(), span: opts.span, level: 'debug', meta: opts.metaStart };
  sinks.forEach(s => s(startEvent));
  try {
    const result = await fn();
    const durationMs = performance.now() - start;
    const meta = opts.onSuccessMeta?.(result) || undefined;
    sinks.forEach(s => s({ ts: Date.now(), span: opts.span, durationMs, level: 'info', meta }));
    return result;
  } catch (err: any) {
    const durationMs = performance.now() - start;
    const meta = opts.onErrorMeta?.(err) || { message: err?.message };
    sinks.forEach(s => s({ ts: Date.now(), span: opts.span, durationMs, level: 'error', meta }));
    throw err;
  }
}

// Synchronous variant (no awaiting) for hot path pure functions to avoid forcing async API changes.
export function runWithTraceSync<T>(fn: () => T, opts: RunWithTraceOptions): T {
  if (!TRACING_ENABLED) {
    return fn();
  }
  const start = performance.now();
  sinks.forEach(s => s({ ts: Date.now(), span: opts.span, level: 'debug', meta: opts.metaStart }));
  try {
    const result = fn();
    const durationMs = performance.now() - start;
    const meta = opts.onSuccessMeta?.(result) || undefined;
    sinks.forEach(s => s({ ts: Date.now(), span: opts.span, durationMs, level: 'info', meta }));
    return result;
  } catch (err: any) {
    const durationMs = performance.now() - start;
    const meta = opts.onErrorMeta?.(err) || { message: err?.message };
    sinks.forEach(s => s({ ts: Date.now(), span: opts.span, durationMs, level: 'error', meta }));
    throw err;
  }
}

// Token usage accumulator (approximate – caller provides counts)
let tokenTally = { input: 0, output: 0 };
export function recordTokenUsage(input: number, output: number, span?: string) {
  if (!TRACING_ENABLED) return;
  tokenTally.input += input; tokenTally.output += output;
  sinks.forEach(s => s({ ts: Date.now(), span: span || 'token', level: 'debug', meta: { input, output, total: { ...tokenTally } } }));
}
export function getTokenTotals() { return TRACING_ENABLED ? { ...tokenTally } : { input: 0, output: 0 }; }
export function resetTokenTotals() { tokenTally = { input: 0, output: 0 }; }
