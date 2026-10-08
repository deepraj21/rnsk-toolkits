// @ts-nocheck
// CircleCI API v2 — https://circleci.com/docs/api/
// Auth: Circle-Token: <personal API token>

export interface CircleCiCredentials {
  apiToken: string;
  baseUrl?: string;
}

export interface CircleCiResponse {
  ok: boolean;
  status: number;
  data: unknown;
}

export const CIRCLE_CI_CONNECT_ERROR =
  'CircleCI credentials are required. Connect with JSON {"apiToken":"..."} from User Settings > Personal API Tokens. Optional "baseUrl" for CircleCI Server (default https://circleci.com).';

export function parseCircleCiCredentials(
  circleCiCredentials: string | undefined,
): CircleCiCredentials {
  if (!circleCiCredentials) {
    throw new Error(CIRCLE_CI_CONNECT_ERROR);
  }
  let parsed: Partial<CircleCiCredentials>;
  try {
    parsed = JSON.parse(circleCiCredentials);
  } catch {
    throw new Error('CircleCI credentials must be valid JSON like {"apiToken":"CCIPAT_..."}');
  }
  if (!parsed.apiToken) {
    throw new Error('CircleCI credentials must include apiToken');
  }
  const base = parsed.baseUrl
    ? String(parsed.baseUrl).trim().replace(/\/+$/, '')
    : 'https://circleci.com';
  return { apiToken: String(parsed.apiToken).trim(), baseUrl: base };
}

function appendQuery(url: URL, query?: Record<string, unknown>) {
  if (!query) return;
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null) continue;
    url.searchParams.set(key, String(value));
  }
}

export async function circleCiRequest(
  circleCiCredentials: string | undefined,
  path: string,
  options?: {
    method?: string;
    query?: Record<string, unknown>;
    body?: unknown;
  },
): Promise<CircleCiResponse> {
  let credentials: CircleCiCredentials;
  try {
    credentials = parseCircleCiCredentials(circleCiCredentials);
  } catch (error) {
    return {
      ok: false,
      status: 401,
      data: { error: error instanceof Error ? error.message : CIRCLE_CI_CONNECT_ERROR },
    };
  }
  const url = new URL(`${credentials.baseUrl}/api/v2${path.startsWith('/') ? path : `/${path}`}`);
  appendQuery(url, options?.query);
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'Circle-Token': credentials.apiToken,
  };
  const fetchOptions: RequestInit = { method: options?.method ?? 'GET', headers };
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
    return { ok: response.ok, status: response.status, data };
  } catch (error) {
    return {
      ok: false,
      status: 502,
      data: { error: error instanceof Error ? error.message : 'CircleCI request failed' },
    };
  }
}

export function failedResult(action: string, result: CircleCiResponse) {
  return { error: action, statusCode: result.status, details: result.data };
}

export function toCircleCiError(error: unknown, action: string) {
  return { error: action, message: error instanceof Error ? error.message : 'Unknown error' };
}
