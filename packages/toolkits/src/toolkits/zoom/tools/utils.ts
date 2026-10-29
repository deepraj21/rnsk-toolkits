// @ts-nocheck

export const ZOOM_API_BASE = 'https://api.zoom.us/v2';

/**
 * Zoom meeting UUIDs that begin with '/' or contain '//' must be double-encoded
 * before being placed in the path (per Zoom docs). Numeric meeting IDs are encoded once.
 */
export function encodeMeetingPath(meetingIdOrUuid: string): string {
  const once = encodeURIComponent(meetingIdOrUuid);
  return meetingIdOrUuid.startsWith('/') || meetingIdOrUuid.includes('//')
    ? encodeURIComponent(once)
    : once;
}

export function buildQuery(params: Record<string, unknown>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      search.set(key, String(value));
    }
  }
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

export async function zoomRequest(
  zoomToken: string,
  path: string,
  options?: {
    method?: string;
    body?: unknown;
    query?: Record<string, unknown>;
  },
) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = `${ZOOM_API_BASE}${normalizedPath}${buildQuery(options?.query ?? {})}`;

  const headers: Record<string, string> = {
    Authorization: `Bearer ${zoomToken}`,
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
    return { ok: true, status: response.status, data: { success: true } };
  }

  const data = await response.json().catch(() => null);
  return { ok: response.ok, status: response.status, data };
}
