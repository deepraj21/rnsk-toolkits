// @ts-nocheck
export const GROWW_BASE = 'https://api.groww.in';
export const GROWW_INSTRUMENTS_URL = 'https://growwapi-assets.groww.in/instruments/instrument.csv';

export function buildQueryString(params: Record<string, unknown>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      search.set(key, String(value));
    }
  }
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

export async function growwRequest(
  growwAccessToken: string | undefined,
  path: string,
  options?: {
    method?: string;
    body?: unknown;
    query?: Record<string, unknown>;
  },
) {
  if (!growwAccessToken) {
    return { ok: false, status: 401, data: { error: 'Missing Groww access token' } };
  }
  const qs = options?.query ? buildQueryString(options.query) : '';
  const url = `${GROWW_BASE}${path.startsWith('/') ? path : `/${path}`}${qs}`;
  const headers: Record<string, string> = {
    Accept: 'application/json',
    Authorization: `Bearer ${growwAccessToken}`,
    'X-API-VERSION': '1.0',
  };
  if (options?.body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }
  const fetchOptions: RequestInit = {
    method: options?.method ?? 'GET',
    headers,
  };
  if (options?.body !== undefined) {
    fetchOptions.body = typeof options.body === 'string' ? options.body : JSON.stringify(options.body);
  }
  const response = await fetch(url, fetchOptions);
  const contentType = response.headers.get('content-type') ?? '';
  let data: unknown = null;
  if (contentType.includes('application/json')) {
    data = await response.json().catch(() => null);
  } else {
    data = await response.text().catch(() => null);
  }
  return { ok: response.ok, status: response.status, data };
}

export function handleGrowwResult(result: { ok: boolean; status: number; data: unknown }, action: string) {
  if (!result.ok) {
    return { error: `Failed to ${action}`, details: result.data, statusCode: result.status };
  }
  return result.data;
}
