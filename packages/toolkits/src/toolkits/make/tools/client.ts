// @ts-nocheck
// Shared helpers for the Make toolkit (Make API v2).
// Endpoint paths verified against https://developers.make.com/api-documentation
// Base URL is zone-specific: https://{eu1,eu2,us1,us2}.make.com/api/v2
// Auth: `Authorization: Token <api-token>` header (token needs matching scopes).

export interface MakeCredentials {
  baseUrl?: string;
  zone?: string;
  apiToken?: string;
}

export function parseMakeCredentials(makeCredentials: string): MakeCredentials {
  let parsed: MakeCredentials;
  try {
    parsed = JSON.parse(makeCredentials) as MakeCredentials;
  } catch {
    throw new Error(
      'Make credentials must be JSON like {"baseUrl":"https://eu1.make.com","apiToken":"..."}',
    );
  }
  return parsed ?? {};
}

export function makeBaseUrl(credentials: MakeCredentials): string {
  const raw = (credentials.baseUrl ?? credentials.zone ?? 'https://eu1.make.com').trim();
  if (!raw) throw new Error('Make base URL is missing.');
  const withScheme = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  return withScheme.replace(/\/+$/, '');
}

export interface MakeResponse {
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

/** Call the Make API v2. Returns an envelope — never throws for auth/config errors. */
export async function makeRequest(
  makeCredentials: string,
  path: string,
  options?: {
    method?: string;
    query?: Record<string, unknown>;
    body?: unknown;
  },
): Promise<MakeResponse> {
  let credentials: MakeCredentials;
  try {
    credentials = parseMakeCredentials(makeCredentials);
  } catch (error) {
    return {
      ok: false,
      status: 400,
      data: { error: error instanceof Error ? error.message : 'Invalid Make credentials' },
    };
  }
  if (!credentials.apiToken) {
    return {
      ok: false,
      status: 401,
      data: {
        error:
          'Make API token is required. Connect Make first: paste an API token (Profile > API tokens) with the needed scopes, e.g. {"baseUrl":"https://eu1.make.com","apiToken":"..."}.',
      },
    };
  }
  let base: string;
  try {
    base = makeBaseUrl(credentials);
  } catch (error) {
    return {
      ok: false,
      status: 400,
      data: { error: error instanceof Error ? error.message : 'Invalid Make base URL' },
    };
  }
  const url = new URL(`${base}/api/v2${path.startsWith('/') ? path : `/${path}`}`);
  appendQuery(url, options?.query);
  const headers: Record<string, string> = {
    Accept: 'application/json',
    Authorization: `Token ${credentials.apiToken}`,
  };
  const fetchOptions: RequestInit = { method: options?.method ?? 'GET', headers };
  if (options?.body !== undefined) {
    fetchOptions.body = JSON.stringify(options.body);
    headers['Content-Type'] = 'application/json';
  }
  try {
    const response = await fetch(url.toString(), fetchOptions);
    const data = await response.json().catch(() => null);
    return { ok: response.ok, status: response.status, data };
  } catch (error) {
    return {
      ok: false,
      status: 502,
      data: { error: error instanceof Error ? error.message : 'Make request failed' },
    };
  }
}

export function failedResult(action: string, result: MakeResponse) {
  return {
    error: action,
    statusCode: result.status,
    details: result.data,
  };
}

export function toMakeError(error: unknown, action: string) {
  return {
    error: action,
    message: error instanceof Error ? error.message : 'Unknown error',
  };
}
