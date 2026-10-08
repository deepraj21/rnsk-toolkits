// @ts-nocheck
// LaunchDarkly REST API — https://launchdarkly.com/docs/api
// Auth: Authorization: <access token>

const DEFAULT_BASE = 'https://app.launchdarkly.com/api/v2';

export interface LaunchdarklyResponse {
  ok: boolean;
  status: number;
  data: unknown;
}

export const LAUNCHDARKLY_CONNECT_ERROR =
  'LaunchDarkly API token is required. Connect with a personal or service access token from Account settings > Authorization.';

export async function launchdarklyRequest(
  launchdarklyApiToken: string | undefined,
  path: string,
  options?: {
    method?: string;
    query?: Record<string, unknown>;
    body?: unknown;
    baseUrl?: string;
  },
): Promise<LaunchdarklyResponse> {
  if (!launchdarklyApiToken) {
    return {
      ok: false,
      status: 401,
      data: { error: LAUNCHDARKLY_CONNECT_ERROR },
    };
  }
  const base = (options?.baseUrl ?? DEFAULT_BASE).replace(/\/+$/, '');
  const url = new URL(`${base}${path.startsWith('/') ? path : `/${path}`}`);
  if (options?.query) {
    for (const [key, value] of Object.entries(options.query)) {
      if (value === undefined || value === null) continue;
      url.searchParams.set(key, String(value));
    }
  }
  const headers: Record<string, string> = {
    Accept: 'application/json',
    Authorization: launchdarklyApiToken,
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
      data: { error: error instanceof Error ? error.message : 'LaunchDarkly request failed' },
    };
  }
}

export function failedResult(action: string, result: LaunchdarklyResponse) {
  return { error: action, statusCode: result.status, details: result.data };
}

export function toLaunchdarklyError(error: unknown, action: string) {
  return { error: action, message: error instanceof Error ? error.message : 'Unknown error' };
}
