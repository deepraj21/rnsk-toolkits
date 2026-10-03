const API_BASE = 'https://api.supabase.com';

export interface SbOptions {
  query?: Record<string, unknown>;
  body?: unknown;
  headers?: Record<string, string>;
}

function buildQuery(query?: Record<string, unknown>): string {
  if (!query) return '';
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === '') continue;
    if (Array.isArray(value)) {
      for (const v of value) {
        if (v !== undefined && v !== null && v !== '') params.append(key, String(v));
      }
    } else if (typeof value === 'boolean') {
      params.append(key, value ? 'true' : 'false');
    } else {
      params.append(key, String(value));
    }
  }
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

async function parseResponse(response: Response): Promise<unknown> {
  if (response.status === 204 || response.status === 205) return { success: true };
  const text = await response.text();
  if (!text) return { success: response.ok };
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

function apiError(status: number, data: unknown): { error: string; details: unknown } {
  return { error: `Supabase API error ${status}`, details: data };
}

async function request(
  token: string,
  method: string,
  path: string,
  opts: SbOptions = {},
): Promise<unknown> {
  try {
    const url = `${API_BASE}${path}` + buildQuery(opts.query);
    const response = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...(opts.headers ?? {}),
      },
      body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
    });
    const data = await parseResponse(response);
    if (!response.ok) return apiError(response.status, data);
    return data;
  } catch (error) {
    return {
      error: 'Error calling Supabase API',
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export function sbGet(token: string, path: string, opts: SbOptions = {}): Promise<unknown> {
  return request(token, 'GET', path, opts);
}

export function sbPost(token: string, path: string, opts: SbOptions = {}): Promise<unknown> {
  return request(token, 'POST', path, opts);
}

export function sbPut(token: string, path: string, opts: SbOptions = {}): Promise<unknown> {
  return request(token, 'PUT', path, opts);
}

export function sbPatch(token: string, path: string, opts: SbOptions = {}): Promise<unknown> {
  return request(token, 'PATCH', path, opts);
}

export function sbDelete(token: string, path: string, opts: SbOptions = {}): Promise<unknown> {
  return request(token, 'DELETE', path, opts);
}

/** HEAD request returning status code and headers (no body). */
export async function sbHead(token: string, path: string, opts: SbOptions = {}): Promise<unknown> {
  try {
    const url = `${API_BASE}${path}` + buildQuery(opts.query);
    const response = await fetch(url, {
      method: 'HEAD',
      headers: { Authorization: `Bearer ${token}`, ...(opts.headers ?? {}) },
    });
    return { status: response.status, headers: response.headers };
  } catch (error) {
    return {
      error: 'Error calling Supabase API',
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/** OPTIONS preflight returning status code and TUS/capability headers. */
export async function sbOptions(
  token: string,
  url: string,
  opts: SbOptions = {},
): Promise<unknown> {
  try {
    const target = /^https?:\/\//.test(url) ? url : `${API_BASE}${url}`;
    const response = await fetch(target + buildQuery(opts.query), {
      method: 'OPTIONS',
      headers: { Authorization: `Bearer ${token}`, ...(opts.headers ?? {}) },
    });
    const headers: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });
    return { status_code: response.status, headers };
  } catch (error) {
    return {
      error: 'Error calling Supabase API',
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/** TUS resumable-upload preflight against a storage URL. */
export async function tusOptions(token: string, url: string): Promise<unknown> {
  const res = await sbOptions(token, url, {
    headers: { 'Tus-Resumable': '1.0.0', 'Access-Control-Request-Method': 'POST' },
  });
  if (res && typeof res === 'object' && 'error' in res) return res;
  const { status_code, headers } = res as { status_code: number; headers: Record<string, string> };
  return {
    status_code,
    tus_version: headers['tus-version'],
    tus_extension: headers['tus-extension'],
    tus_max_size: headers['tus-max-size'],
    tus_resumable: headers['tus-resumable'],
    headers,
  };
}

/** Drop undefined values from an object. */
export function pickDefined<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) out[key] = value;
  }
  return out as Partial<T>;
}

/**
 * Resolve a project API key through the Management API (`?reveal=true`).
 * `kinds` lists acceptable key `type` values in preference order
 * (e.g. `['publishable']`, `['secret']`), with legacy `anon`/`service_role`
 * names as fallback. Returns the key string or `{ error, ... }`.
 */
export async function resolveApiKey(
  token: string,
  ref: string,
  kinds: string[],
): Promise<string | { error: string; details?: unknown; message?: string }> {
  const data = await sbGet(token, `/v1/projects/${encodeURIComponent(ref)}/api-keys`, {
    query: { reveal: true },
  });
  if (data && typeof data === 'object' && 'error' in data) {
    return data as { error: string; details?: unknown };
  }
  const keys = Array.isArray(data) ? data : ((data as { keys?: unknown[] }).keys ?? []);
  const legacyName = kinds.includes('publishable') ? 'anon' : 'service_role';
  for (const kind of kinds) {
    const found = (keys as Record<string, unknown>[]).find(
      (k) => k && k.type === kind && k.api_key,
    );
    if (found) return String(found.api_key);
  }
  const legacy = (keys as Record<string, unknown>[]).find(
    (k) => k && k.name === legacyName && k.api_key,
  );
  if (legacy) return String(legacy.api_key);
  return {
    error: `No usable project API key found (looked for: ${kinds.join(', ')}).`,
    message: 'Create a publishable or secret key for the project first, or pass apiKey explicitly.',
  };
}

export { buildQuery, parseResponse };
