// @ts-nocheck
// Shared helpers for the JFrog toolkit.
// Endpoint paths verified against the official JFrog REST API reference
// (https://docs.jfrog.com, "API Reference" tab) and community OpenAPI specs:
//   Artifactory: {platformUrl}/artifactory/api/...
//   Access:      {platformUrl}/access/api/...
//   Event:       {platformUrl}/event/api/...
// Auth: Bearer access token (preferred), X-JFrog-Art-Api API key, or Basic.

export interface JfrogCredentials {
  baseUrl?: string;
  accessToken?: string;
  apiKey?: string;
  username?: string;
  password?: string;
}

export function parseJfrogCredentials(jfrogCredentials: string): JfrogCredentials {
  let parsed: JfrogCredentials;
  try {
    parsed = JSON.parse(jfrogCredentials) as JfrogCredentials;
  } catch {
    throw new Error(
      'JFrog credentials must be JSON like {"baseUrl":"https://mycompany.jfrog.io","accessToken":"..."}',
    );
  }
  return parsed ?? {};
}

export function jfrogPlatformUrl(credentials: JfrogCredentials): string {
  const raw = (credentials.baseUrl ?? '').trim().replace(/\/+$/, '');
  if (!raw) {
    throw new Error(
      'JFrog credentials must include baseUrl, e.g. {"baseUrl":"https://mycompany.jfrog.io","accessToken":"..."} (your JFrog Platform URL).',
    );
  }
  return /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
}

function authHeaders(credentials: JfrogCredentials): Record<string, string> {
  if (credentials.accessToken) return { Authorization: `Bearer ${credentials.accessToken}` };
  if (credentials.apiKey) return { 'X-JFrog-Art-Api': credentials.apiKey };
  if (credentials.username && credentials.password) {
    return {
      Authorization: `Basic ${Buffer.from(`${credentials.username}:${credentials.password}`).toString('base64')}`,
    };
  }
  throw new Error(
    'JFrog credentials need one of: accessToken (Bearer, preferred), apiKey (X-JFrog-Art-Api header), or username+password (Basic).',
  );
}

export interface JfrogResponse {
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

async function readBody(response: Response): Promise<any> {
  const contentType = response.headers.get('content-type') ?? '';
  if (contentType.includes('json')) return response.json().catch(() => null);
  const text = await response.text().catch(() => '');
  return text === '' ? null : text;
}

/** Call a JFrog Platform service API. service is 'artifactory' | 'access' | 'event'. */
export async function jfrogRequest(
  jfrogCredentials: string,
  service: 'artifactory' | 'access' | 'event',
  path: string,
  options?: {
    method?: string;
    query?: Record<string, unknown>;
    headers?: Record<string, string>;
    body?: unknown;
    rawBody?: string | Buffer;
  },
): Promise<JfrogResponse> {
  let credentials: JfrogCredentials;
  try {
    credentials = parseJfrogCredentials(jfrogCredentials);
  } catch (error) {
    return {
      ok: false,
      status: 400,
      data: { error: error instanceof Error ? error.message : 'Invalid JFrog credentials' },
    };
  }
  let base: string;
  let headers: Record<string, string>;
  try {
    base = jfrogPlatformUrl(credentials);
    headers = {
      Accept: 'application/json',
      ...authHeaders(credentials),
      ...(options?.headers ?? {}),
    };
  } catch (error) {
    return {
      ok: false,
      status: 401,
      data: { error: error instanceof Error ? error.message : 'Invalid JFrog credentials' },
    };
  }
  const url = new URL(`${base}/${service}/api${path.startsWith('/') ? path : `/${path}`}`);
  appendQuery(url, options?.query);
  const fetchOptions: RequestInit = { method: options?.method ?? 'GET', headers };
  if (options?.rawBody !== undefined) {
    fetchOptions.body = options.rawBody as any;
  } else if (options?.body !== undefined) {
    fetchOptions.body = JSON.stringify(options.body);
    headers['Content-Type'] = 'application/json';
  }
  try {
    const response = await fetch(url.toString(), fetchOptions);
    return { ok: response.ok, status: response.status, data: await readBody(response) };
  } catch (error) {
    return {
      ok: false,
      status: 502,
      data: { error: error instanceof Error ? error.message : 'JFrog request failed' },
    };
  }
}

export function failedResult(action: string, result: JfrogResponse) {
  return {
    error: action,
    statusCode: result.status,
    details: result.data,
  };
}

export function toJfrogError(error: unknown, action: string) {
  return {
    error: action,
    message: error instanceof Error ? error.message : 'Unknown error',
  };
}
