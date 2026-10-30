// @ts-nocheck
/**
 * Clerk Backend API client.
 *
 * Base URL: https://api.clerk.com/v1
 * Auth: instance secret key (`sk_test_...` / `sk_live_...`) as a Bearer token.
 * Keys: Clerk Dashboard > API keys.
 *
 * Clerk is versioned by date; requests pin the API version via the
 * `Clerk-API-Version` header so responses stay stable.
 *
 * List endpoints return `{ data: [...], total_count }` and paginate with
 * `limit` / `offset` (users also support the `starting_after` cursor).
 * Array query params repeat the key (?a=1&a=2), they are not comma-joined.
 * Errors come back as `{ errors: [{ message, ... }] }`.
 */
const BASE_URL = 'https://api.clerk.com/v1';
const API_VERSION = '2026-08-20';

export async function clerkRequest(clerkToken, path, options = {}) {
  if (!clerkToken) {
    return { error: 'Clerk secret key is required. Connect Clerk first.' };
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(options.query ?? {})) {
    if (value === undefined || value === null || value === '') continue;
    if (Array.isArray(value)) {
      for (const item of value) search.append(key, String(item));
    } else {
      search.set(key, String(value));
    }
  }
  const qs = search.toString();
  const url = `${BASE_URL}${normalizedPath}${qs ? `?${qs}` : ''}`;

  try {
    const headers = {
      Authorization: `Bearer ${String(clerkToken).trim()}`,
      'Clerk-API-Version': API_VERSION,
      Accept: 'application/json',
    };
    const fetchOptions = { method: options.method ?? 'GET', headers };
    if (options.body !== undefined) {
      headers['Content-Type'] = 'application/json';
      fetchOptions.body = JSON.stringify(options.body);
    }

    const response = await fetch(url, fetchOptions);

    if (response.status === 204) {
      return { ok: true, status: 204, data: null };
    }

    const data = await response.json().catch(() => null);
    if (!response.ok) {
      const detail =
        data && Array.isArray(data.errors) && data.errors[0]?.message
          ? data.errors[0].message
          : undefined;
      return {
        error: detail
          ? `Clerk API error ${response.status}: ${detail}`
          : `Clerk API error ${response.status}`,
        statusCode: response.status,
        details: data,
      };
    }

    return { ok: true, status: response.status, data };
  } catch (error) {
    return {
      error: 'Error calling Clerk API',
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/** Unwrap a Clerk list response into `{ items, totalCount }`. */
export function shapeList(result) {
  const body = result.data;
  const items = Array.isArray(body)
    ? body
    : Array.isArray(body?.data)
      ? body.data
      : body === null || body === undefined
        ? []
        : [body];
  const totalCount = typeof body?.total_count === 'number' ? body.total_count : undefined;
  return { items, totalCount };
}

/** Drop unset entries (undefined / '') from a body object. Keeps null/false/0. */
export function compact(body) {
  const out = {};
  for (const [key, value] of Object.entries(body ?? {})) {
    if (value === undefined || value === '') continue;
    out[key] = value;
  }
  return out;
}
