/**
 * Safe JSON fetch helper: returns null on network / parse / non-JSON content or non-2xx status.
 * Logs concise diagnostic in dev without throwing to avoid uncaught promise rejections in UI.
 */
export async function safeFetchJSON<T = any>(url: string, init?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(url, init);
    const ct = res.headers.get('content-type') || '';
    if (!res.ok) {
      const text = await res.text().catch(()=>'');
      if (import.meta.env.DEV) console.warn(`[fetch] ${url} failed ${res.status}`, text.slice(0, 120));
      return null;
    }
    if (!ct.includes('application/json')) {
      const text = await res.text().catch(()=>'');
      if (import.meta.env.DEV) console.warn(`[fetch] ${url} expected JSON got '${ct || 'unknown'}'`, text.slice(0, 120));
      return null;
    }
    return await res.json() as T;
  } catch (e:any) {
    if (import.meta.env.DEV) console.warn(`[fetch] ${url} error`, e?.message);
    return null;
  }
}

export async function safePostJSON<T = any>(url: string, body?: any, init?: RequestInit) {
  return safeFetchJSON<T>(url, { method: 'POST', headers: { 'content-type': 'application/json', ...(init?.headers||{}) }, body: body == null ? undefined : JSON.stringify(body), ...init });
}