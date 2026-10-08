// @ts-nocheck
// SAP S/4HANA OData — https://api.sap.com/
// Auth: Basic (communication user) or Bearer (OAuth from BTP)
// Writes require CSRF token (X-CSRF-Token: Fetch on GET)

export interface SapCredentials {
  baseUrl: string;
  username?: string;
  password?: string;
  accessToken?: string;
  sapClient?: string;
}

export interface SapResponse {
  ok: boolean;
  status: number;
  data: unknown;
  headers: Record<string, string>;
}

export const SAP_CONNECT_ERROR =
  'SAP credentials are required. Connect with JSON {"baseUrl":"https://my.s4hana.cloud.sap","username":"...","password":"..."} and optional "sapClient":"100". Or use OAuth {"baseUrl":"...","accessToken":"..."}.';

export function parseSapCredentials(sapCredentials: string | undefined): SapCredentials {
  if (!sapCredentials) {
    throw new Error(SAP_CONNECT_ERROR);
  }
  let parsed: Partial<SapCredentials>;
  try {
    parsed = JSON.parse(sapCredentials);
  } catch {
    throw new Error(
      'SAP credentials must be valid JSON like {"baseUrl":"https://host","username":"...","password":"..."}',
    );
  }
  if (!parsed.baseUrl) {
    throw new Error('SAP credentials must include baseUrl');
  }
  if (!parsed.accessToken && !(parsed.username && parsed.password)) {
    throw new Error('SAP credentials need username+password or accessToken');
  }
  return {
    baseUrl: String(parsed.baseUrl).trim().replace(/\/+$/, ''),
    username: parsed.username ? String(parsed.username) : undefined,
    password: parsed.password ? String(parsed.password) : undefined,
    accessToken: parsed.accessToken ? String(parsed.accessToken).trim() : undefined,
    sapClient: parsed.sapClient ? String(parsed.sapClient).trim() : undefined,
  };
}

function buildAuthHeaders(credentials: SapCredentials): Record<string, string> {
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (credentials.accessToken) {
    headers.Authorization = `Bearer ${credentials.accessToken}`;
  } else if (credentials.username) {
    headers.Authorization = `Basic ${Buffer.from(`${credentials.username}:${credentials.password ?? ''}`, 'utf-8').toString('base64')}`;
  }
  return headers;
}

function appendQuery(url: URL, query?: Record<string, unknown>, sapClient?: string) {
  if (sapClient) {
    url.searchParams.set('sap-client', sapClient);
  }
  if (!query) return;
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null) continue;
    url.searchParams.set(key, String(value));
  }
}

async function fetchCsrfToken(
  credentials: SapCredentials,
  odataPath: string,
): Promise<{ token: string; cookies: string }> {
  const serviceRoot = odataPath.split('/$')[0].split('(')[0];
  const url = new URL(
    `${credentials.baseUrl}${serviceRoot.startsWith('/') ? serviceRoot : `/${serviceRoot}`}`,
  );
  appendQuery(url, undefined, credentials.sapClient);
  const headers = buildAuthHeaders(credentials);
  headers['X-CSRF-Token'] = 'Fetch';
  const response = await fetch(url.toString(), { method: 'GET', headers });
  const token = response.headers.get('x-csrf-token') ?? response.headers.get('X-CSRF-Token');
  const setCookie = response.headers.get('set-cookie');
  if (!token) {
    throw new Error(
      'SAP CSRF token not returned; verify OData service path and user authorizations',
    );
  }
  return { token, cookies: setCookie ?? '' };
}

export async function sapRequest(
  sapCredentials: string | undefined,
  odataPath: string,
  options?: {
    method?: string;
    query?: Record<string, unknown>;
    body?: unknown;
    skipCsrf?: boolean;
  },
): Promise<SapResponse> {
  let credentials: SapCredentials;
  try {
    credentials = parseSapCredentials(sapCredentials);
  } catch (error) {
    return {
      ok: false,
      status: 401,
      data: { error: error instanceof Error ? error.message : SAP_CONNECT_ERROR },
      headers: {},
    };
  }
  const path = odataPath.startsWith('/') ? odataPath : `/${odataPath}`;
  const url = new URL(`${credentials.baseUrl}${path}`);
  appendQuery(url, options?.query, credentials.sapClient);

  const method = options?.method ?? 'GET';
  const headers = buildAuthHeaders(credentials);

  if (method !== 'GET' && method !== 'HEAD' && !options?.skipCsrf) {
    try {
      const csrf = await fetchCsrfToken(credentials, path);
      headers['X-CSRF-Token'] = csrf.token;
      if (csrf.cookies) headers.Cookie = csrf.cookies;
    } catch (error) {
      return {
        ok: false,
        status: 403,
        data: { error: error instanceof Error ? error.message : 'CSRF fetch failed' },
        headers: {},
      };
    }
  }

  const fetchOptions: RequestInit = { method, headers };
  if (options?.body !== undefined) {
    fetchOptions.body = JSON.stringify(options.body);
    headers['Content-Type'] = 'application/json';
  }

  try {
    const response = await fetch(url.toString(), fetchOptions);
    const raw = await response.text();
    let data: unknown = null;
    if (raw) {
      try {
        data = JSON.parse(raw);
      } catch {
        data = raw;
      }
    }
    return {
      ok: response.ok,
      status: response.status,
      data,
      headers: Object.fromEntries(response.headers.entries()),
    };
  } catch (error) {
    return {
      ok: false,
      status: 502,
      data: { error: error instanceof Error ? error.message : 'SAP request failed' },
      headers: {},
    };
  }
}

export function failedResult(action: string, result: SapResponse) {
  return { error: action, statusCode: result.status, details: result.data };
}

export function toSapError(error: unknown, action: string) {
  return { error: action, message: error instanceof Error ? error.message : 'Unknown error' };
}
