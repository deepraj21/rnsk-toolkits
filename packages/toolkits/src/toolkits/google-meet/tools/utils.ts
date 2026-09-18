// @ts-nocheck

export const GOOGLE_MEET_BASE = 'https://meet.googleapis.com/v2';

export function normalizeSpaceName(spaceName: string): string {
  return spaceName.startsWith('spaces/') ? spaceName : `spaces/${spaceName}`;
}

export function normalizeConferenceRecordName(id: string): string {
  return id.startsWith('conferenceRecords/') ? id : `conferenceRecords/${id}`;
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

export async function googleMeetRequest(
  googleMeetToken: string,
  path: string,
  options?: {
    method?: string;
    body?: unknown;
    query?: Record<string, unknown>;
  },
) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = `${GOOGLE_MEET_BASE}${normalizedPath}${buildQueryString(options?.query ?? {})}`;

  const headers: Record<string, string> = {
    Authorization: `Bearer ${googleMeetToken}`,
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
