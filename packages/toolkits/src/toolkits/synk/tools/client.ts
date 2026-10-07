// @ts-nocheck
// Shared helpers for the Synk (Snyk) toolkit.
// Endpoint paths verified against the Snyk REST OpenAPI spec (rest-spec.json,
// 199 paths) and Snyk API docs (docs.snyk.io/developer-tools/snyk-api):
//   REST: {base}/rest/...?version=YYYY-MM-DD (default 2024-10-15)
//   V1:   {base}/api/v1/...
//   Auth: Authorization: token <API_TOKEN> (NOT Bearer)
// Regions: api.snyk.io (US-01), api.us.snyk.io (US-02),
//          api.eu.snyk.io (EU-01), api.au.snyk.io (AU-01)

export interface SynkCredentials {
  baseUrl?: string;
  apiKey?: string;
  token?: string;
}

export function parseSynkCredentials(synkCredentials: string): SynkCredentials {
  let parsed: SynkCredentials;
  try {
    parsed = JSON.parse(synkCredentials) as SynkCredentials;
  } catch {
    throw new Error(
      'Synk credentials must be JSON like {"apiKey":"..."} with your Snyk API token (Account Settings), plus optional baseUrl for EU/AU/US-02 regions',
    );
  }
  return parsed ?? {};
}

export function synkBaseUrl(credentials: SynkCredentials): string {
  const raw = (credentials.baseUrl ?? 'https://api.snyk.io').trim().replace(/\/+$/, '');
  return /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
}

export interface SynkResponse {
  ok: boolean;
  status: number;
  data: any;
}

function appendQuery(url: URL, query?: Record<string, unknown>) {
  if (!query) return;
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null) continue;
    if (Array.isArray(value)) {
      for (const item of value) {
        if (item !== undefined && item !== null) url.searchParams.append(key, String(item));
      }
      continue;
    }
    url.searchParams.set(key, String(value));
  }
}

async function doFetch(
  url: string,
  token: string,
  options?: {
    method?: string;
    query?: Record<string, unknown>;
    body?: unknown;
    contentType?: string;
  },
): Promise<SynkResponse> {
  const full = new URL(url);
  appendQuery(full, options?.query);
  const headers: Record<string, string> = {
    Accept: 'application/json',
    Authorization: `token ${token}`,
  };
  const fetchOptions: RequestInit = { method: options?.method ?? 'GET', headers };
  if (options?.body !== undefined) {
    fetchOptions.body = JSON.stringify(options.body);
    headers['Content-Type'] = options?.contentType ?? 'application/json';
  }
  try {
    const response = await fetch(full.toString(), fetchOptions);
    const data = await response.json().catch(() => null);
    return { ok: response.ok, status: response.status, data };
  } catch (error) {
    return {
      ok: false,
      status: 502,
      data: { error: error instanceof Error ? error.message : 'Synk request failed' },
    };
  }
}

function creds(synkCredentials: string): { base: string; token: string } | { error: SynkResponse } {
  let parsed: SynkCredentials;
  try {
    parsed = parseSynkCredentials(synkCredentials);
  } catch (error) {
    return {
      error: {
        ok: false,
        status: 400,
        data: { error: error instanceof Error ? error.message : 'Invalid Synk credentials' },
      },
    };
  }
  const token = parsed.apiKey ?? parsed.token;
  if (!token) {
    return {
      error: {
        ok: false,
        status: 401,
        data: {
          error:
            'Snyk API token is required. Connect Synk first: {"apiKey":"..."} (Account Settings > API Token), plus optional baseUrl for your region (default https://api.snyk.io).',
        },
      },
    };
  }
  return { base: synkBaseUrl(parsed), token };
}

export const REST_VERSION = '2024-10-15';

/** Call the Snyk REST API (base/rest). version defaults to 2024-10-15. */
export async function synkRest(
  synkCredentials: string,
  path: string,
  options?: {
    method?: string;
    query?: Record<string, unknown>;
    body?: unknown;
    version?: string;
  },
): Promise<SynkResponse> {
  const c = creds(synkCredentials);
  if ('error' in c) return c.error;
  const version = options?.version ?? REST_VERSION;
  return doFetch(`${c.base}/rest${path.startsWith('/') ? path : `/${path}`}`, c.token, {
    method: options?.method,
    query: { version, ...(options?.query ?? {}) },
    body: options?.body,
    contentType: 'application/vnd.api+json',
  });
}

/** Call the legacy Snyk V1 API (base/api/v1). Enterprise plans. */
export async function synkV1(
  synkCredentials: string,
  path: string,
  options?: { method?: string; query?: Record<string, unknown>; body?: unknown },
): Promise<SynkResponse> {
  const c = creds(synkCredentials);
  if ('error' in c) return c.error;
  return doFetch(`${c.base}/api/v1${path.startsWith('/') ? path : `/${path}`}`, c.token, options);
}

export function failedResult(action: string, result: SynkResponse) {
  return {
    error: action,
    statusCode: result.status,
    details: result.data,
  };
}

export function toSynkError(error: unknown, action: string) {
  return {
    error: action,
    message: error instanceof Error ? error.message : 'Unknown error',
  };
}
