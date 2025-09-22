export const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:3001/api';

type HttpOptions = {
  method?: 'GET'|'POST'|'PATCH'|'DELETE';
  body?: any;
  token?: string;
}

export async function http<T=any>(path: string, opts: HttpOptions = {}): Promise<T> {
  const headers: Record<string,string> = { 'Content-Type': 'application/json' };
  if (opts.token) headers['Authorization'] = `Bearer ${opts.token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method: opts.method ?? 'GET',
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });

  if (!res.ok) {
    const text = await res.text().catch(()=>'');
    let data: any;
    try { data = JSON.parse(text) } catch { data = { message: text || res.statusText } }
    throw new Error(data?.message || `HTTP ${res.status}`);
  }

  return res.json() as Promise<T>;
}
