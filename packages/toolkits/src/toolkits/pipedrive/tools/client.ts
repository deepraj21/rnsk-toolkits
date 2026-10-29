// @ts-nocheck
/**
 * Pipedrive API client.
 *
 * Base URL: https://api.pipedrive.com (both /v1 and /api/v1 long forms work).
 * Auth: personal API token sent in the `x-api-token` header.
 *
 * Pagination:
 *  - v2 list/search endpoints use cursor pagination: `limit` (default 100, max 500)
 *    + `cursor`, with the next marker returned as `additional_data.next_cursor`.
 *  - v1 list endpoints use offset pagination: `start` + `limit`, with
 *    `additional_data.pagination.{start, limit, more_items_in_collection, next_start}`.
 *
 * Responses are enveloped: `{ success, data, additional_data }`.
 */
const BASE_URL = 'https://api.pipedrive.com';

export async function pipedriveRequest(apiToken, path, options = {}) {
  if (!apiToken) {
    return { error: 'Pipedrive API key is required. Connect Pipedrive first.' };
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(options.query ?? {})) {
    if (value === undefined || value === null || value === '') continue;
    if (Array.isArray(value)) {
      if (value.length) search.set(key, value.join(','));
    } else {
      search.set(key, String(value));
    }
  }
  const qs = search.toString();
  const url = `${BASE_URL}${normalizedPath}${qs ? `?${qs}` : ''}`;

  try {
    const headers = { 'x-api-token': String(apiToken).trim(), Accept: 'application/json' };
    const fetchOptions = { method: options.method ?? 'GET', headers };
    if (options.body !== undefined) {
      headers['Content-Type'] = 'application/json';
      fetchOptions.body = JSON.stringify(options.body);
    }

    const response = await fetch(url, fetchOptions);
    const payload = await response.json().catch(() => null);

    if (!response.ok || (payload && payload.success === false)) {
      let detail =
        payload && typeof payload === 'object'
          ? payload.error_info || payload.error || undefined
          : undefined;
      if (response.status === 429) {
        detail = `${detail ? `${detail} — ` : ''}Pipedrive rate limit hit (burst or daily budget exhausted); retry after a short pause.`;
      }
      return {
        error: detail
          ? `Pipedrive API error ${response.status}: ${detail}`
          : `Pipedrive API error ${response.status}`,
        statusCode: response.status,
        details: payload,
      };
    }

    return {
      ok: true,
      status: response.status,
      data: payload ? payload.data : null,
      additionalData: payload ? payload.additional_data : undefined,
    };
  } catch (error) {
    return {
      error: 'Error calling Pipedrive API',
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Unwrap a Pipedrive list/search response into `{ items }` plus whichever
 * pagination pointer applies: `nextCursor` (v2 cursor pages) and/or
 * `nextStart` + `pagination` (v1 offset pages).
 */
export function shapeList(result) {
  const data = result.data;
  const items = Array.isArray(data) ? data : data === null || data === undefined ? [] : [data];
  const additional = result.additionalData ?? {};
  const out = { items };
  if (typeof additional.next_cursor === 'string' && additional.next_cursor) {
    out.nextCursor = additional.next_cursor;
  }
  if (additional.pagination) {
    out.pagination = additional.pagination;
    if (additional.pagination.more_items_in_collection) {
      out.nextStart = additional.pagination.next_start;
    }
  }
  return out;
}

/**
 * Normalize contact entries for person create/update: accepts plain strings
 * ("ada@example.com") or full objects ({ value, primary, label }) and returns
 * the object form the API expects, marking the first entry primary.
 */
export function toContactEntries(values) {
  if (!Array.isArray(values) || values.length === 0) return undefined;
  return values.map((entry, index) => {
    if (entry && typeof entry === 'object') return entry;
    return { value: String(entry), primary: index === 0 };
  });
}

/**
 * Drop unset entries (undefined / '') from a body object. Keeps `null` —
 * Pipedrive uses null to clear a field — and keeps false / 0.
 */
export function compact(body) {
  const out = {};
  for (const [key, value] of Object.entries(body ?? {})) {
    if (value === undefined || value === '') continue;
    out[key] = value;
  }
  return out;
}
