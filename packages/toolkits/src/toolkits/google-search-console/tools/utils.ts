// @ts-nocheck

export const WEBMASTERS_BASE = 'https://www.googleapis.com/webmasters/v3';
export const SEARCH_CONSOLE_BASE = 'https://searchconsole.googleapis.com/v1';

export function encodeSiteUrl(siteUrl: string): string {
  return encodeURIComponent(siteUrl);
}

export function encodeFeedpath(feedpath: string): string {
  return encodeURIComponent(feedpath);
}

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

export async function webmastersRequest(
  googleSearchConsoleToken: string,
  path: string,
  options?: {
    method?: string;
    body?: unknown;
    query?: Record<string, unknown>;
  },
) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = `${WEBMASTERS_BASE}${normalizedPath}${buildQueryString(options?.query ?? {})}`;

  const headers: Record<string, string> = {
    Authorization: `Bearer ${googleSearchConsoleToken}`,
    Accept: 'application/json',
  };

  const method = options?.method ?? 'GET';
  const fetchOptions: RequestInit = { method, headers };

  if (options?.body !== undefined) {
    headers['Content-Type'] = 'application/json';
    fetchOptions.body = JSON.stringify(options.body);
  }

  const response = await fetch(url, fetchOptions);

  if (response.status === 204) {
    return { ok: response.ok, status: response.status, data: null };
  }

  const data = await response.json().catch(() => null);
  return { ok: response.ok, status: response.status, data };
}

export async function searchConsoleRequest(
  googleSearchConsoleToken: string,
  path: string,
  options?: {
    method?: string;
    body?: unknown;
    query?: Record<string, unknown>;
  },
) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = `${SEARCH_CONSOLE_BASE}${normalizedPath}${buildQueryString(options?.query ?? {})}`;

  const headers: Record<string, string> = {
    Authorization: `Bearer ${googleSearchConsoleToken}`,
    Accept: 'application/json',
  };

  const method = options?.method ?? 'GET';
  const fetchOptions: RequestInit = { method, headers };

  if (options?.body !== undefined) {
    headers['Content-Type'] = 'application/json';
    fetchOptions.body = JSON.stringify(options.body);
  }

  const response = await fetch(url, fetchOptions);
  const data = await response.json().catch(() => null);
  return { ok: response.ok, status: response.status, data };
}
