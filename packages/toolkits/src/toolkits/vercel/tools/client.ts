// @ts-nocheck
export const VERCEL_API_BASE = 'https://api.vercel.com';

export function buildTeamQuery(teamId?: string, slug?: string): string {
  if (teamId) return `teamId=${encodeURIComponent(teamId)}`;
  if (slug) return `teamId=${encodeURIComponent(slug)}`;
  // Vercel also supports ?slug= but teamId is canonical; fallback to slug param
  return '';
}

export function appendTeamQuery(url: string, teamId?: string, slug?: string): string {
  const q = buildTeamQuery(teamId, slug);
  if (!q) return url;
  return url.includes('?') ? `${url}&${q}` : `${url}?${q}`;
}

export async function vercelFetch(
  path: string,
  opts: {
    vercelToken: string;
    method?: string;
    query?: Record<string, string | undefined>;
    body?: unknown;
    teamId?: string;
    slug?: string;
  },
): Promise<{ ok: boolean; status: number; data: unknown; error?: unknown }> {
  const method = opts.method || 'GET';
  let url = `${VERCEL_API_BASE}${path}`;
  const params = new URLSearchParams();
  if (opts.query) {
    for (const [k, v] of Object.entries(opts.query)) if (v) params.set(k, v);
  }
  const teamQ = buildTeamQuery(opts.teamId, opts.slug);
  if (teamQ) params.append(teamQ.split('=')[0], teamQ.split('=')[1]);
  const qs = params.toString();
  if (qs) url += (url.includes('?') ? '&' : '?') + qs;

  const headers: Record<string, string> = {
    Authorization: `Bearer ${opts.vercelToken}`,
  };
  let bodyStr: string | undefined;
  if (opts.body !== undefined) {
    headers['Content-Type'] = 'application/json';
    bodyStr = JSON.stringify(opts.body);
  }

  const res = await fetch(url, { method, headers, body: bodyStr });
  const text = await res.text().catch(() => '');
  let data: unknown;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = text;
  }
  if (!res.ok) return { ok: false, status: res.status, data, error: data };
  return { ok: true, status: res.status, data };
}
