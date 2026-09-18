// @ts-nocheck

export const SLIDES_BASE = 'https://slides.googleapis.com/v1';
export const DRIVE_BASE = 'https://www.googleapis.com/drive/v3';

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

export async function slidesRequest(
  googleSlidesToken: string,
  path: string,
  options?: {
    method?: string;
    body?: unknown;
    query?: Record<string, unknown>;
  },
) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = `${SLIDES_BASE}${normalizedPath}${buildQueryString(options?.query ?? {})}`;

  const headers: Record<string, string> = {
    Authorization: `Bearer ${googleSlidesToken}`,
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

export async function driveRequest(
  googleSlidesToken: string,
  path: string,
  options?: {
    method?: string;
    body?: unknown;
    query?: Record<string, unknown>;
  },
) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = `${DRIVE_BASE}${normalizedPath}${buildQueryString(options?.query ?? {})}`;

  const headers: Record<string, string> = {
    Authorization: `Bearer ${googleSlidesToken}`,
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
