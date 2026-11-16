// @ts-nocheck
/**
 * Spotify Web API client.
 *
 * Base URL: https://api.spotify.com/v1
 * Auth: `Authorization: Bearer <OAuth access token>` (oauth2 pattern — the host
 * runs the authorization code flow and refreshes the token when it expires).
 *
 * Errors come back as `{"error": {"status": 401, "message": "..."}}` — flattened
 * into `Spotify API error <status>: <message>`. 429 responses append the
 * Retry-After seconds.
 *
 * List endpoints paginate with `limit` / `offset` query params and return
 * `{ href, items, limit, next, offset, previous, total }`; `/me/following` uses a
 * cursor (`after`).
 *
 * Several player commands answer 204 No Content — data is null in that case.
 *
 * Never throws — always returns { ok, status, data } or { error, statusCode?, details? }.
 */
const BASE = 'https://api.spotify.com/v1';

function extractError(data, status, retryAfter) {
  const suffix = retryAfter ? ` (retry after ${retryAfter}s)` : '';
  if (data && typeof data === 'object') {
    const err = data.error;
    if (err && typeof err === 'object' && typeof err.message === 'string' && err.message)
      return `Spotify API error ${status}: ${err.message}${suffix}`;
    if (typeof err === 'string' && err) return `Spotify API error ${status}: ${err}${suffix}`;
    if (typeof data.message === 'string' && data.message)
      return `Spotify API error ${status}: ${data.message}${suffix}`;
  }
  if (typeof data === 'string' && data) return `Spotify API error ${status}: ${data}${suffix}`;
  return `Spotify API error ${status}${suffix}`;
}

/**
 * Normalize an item reference to a bare Spotify ID.
 * Accepts `7a3LWj5xSFhFRYmztS8wgK`, `spotify:track:7a3LWj5xSFhFRYmztS8wgK`,
 * and `https://open.spotify.com/track/7a3LWj5xSFhFRYmztS8wgK?si=...`.
 */
export function spotifyId(value) {
  const raw = String(value ?? '').trim();
  if (!raw) return raw;
  if (raw.startsWith('spotify:')) return raw.slice(raw.lastIndexOf(':') + 1);
  const url = raw.match(/open\.spotify\.com\/(?:intl-[a-z]{2}\/)?[a-z]+\/([A-Za-z0-9]+)/);
  if (url) return url[1];
  return raw;
}

/**
 * Normalize an item reference to a full `spotify:<type>:<id>` URI (what the
 * library/playlist/queue endpoints expect). URLs and URIs are converted;
 * a bare ID is prefixed with `defaultType` when one is given, otherwise it
 * is passed through untouched.
 */
export function spotifyUri(value, defaultType) {
  const raw = String(value ?? '').trim();
  if (!raw) return raw;
  if (raw.startsWith('spotify:')) return raw;
  const url = raw.match(/open\.spotify\.com\/(?:intl-[a-z]{2}\/)?([a-z]+)\/([A-Za-z0-9]+)/);
  if (url) return `spotify:${url[1]}:${url[2]}`;
  if (defaultType) return `spotify:${defaultType}:${raw}`;
  return raw;
}

/** Flatten undefined/null/'' out of a body so the API sees only real values. */
export function compact(body) {
  if (!body || typeof body !== 'object') return body;
  const out = {};
  for (const [key, value] of Object.entries(body)) {
    if (value !== undefined && value !== null) out[key] = value;
  }
  return out;
}

/**
 * Request against api.spotify.com/v1.
 * `query` values may be arrays (repeated param), objects (JSON-encoded),
 * booleans, numbers, or strings; empty values are dropped.
 * `body` may be an object (JSON-encoded) or a string (sent as-is — used for the
 * base64 playlist-cover upload, where the caller sets Content-Type).
 */
export async function spotifyRequest(
  token,
  path,
  { method = 'GET', query, body, headers = {} } = {},
) {
  const trimmed = String(token ?? '').trim();
  if (!trimmed) {
    return { error: 'Spotify access token is required. Connect Spotify first.' };
  }
  try {
    let url = `${BASE}${path}`;
    if (query) {
      const params = new URLSearchParams();
      for (const [key, value] of Object.entries(query)) {
        if (value === undefined || value === null || value === '') continue;
        if (Array.isArray(value)) {
          for (const item of value)
            if (item !== undefined && item !== null) params.append(key, String(item));
        } else if (typeof value === 'object') {
          params.append(key, JSON.stringify(value));
        } else {
          params.append(key, String(value));
        }
      }
      const qs = params.toString();
      if (qs) url += `?${qs}`;
    }

    const init = {
      method,
      headers: { Authorization: `Bearer ${trimmed}`, ...headers },
    };
    if (body !== undefined && body !== null) {
      if (typeof body === 'string') {
        if (!Object.keys(init.headers).some((h) => h.toLowerCase() === 'content-type')) {
          init.headers['Content-Type'] = 'application/json';
        }
        init.body = body;
      } else {
        if (!Object.keys(init.headers).some((h) => h.toLowerCase() === 'content-type')) {
          init.headers['Content-Type'] = 'application/json';
        }
        init.body = JSON.stringify(body);
      }
    }

    const response = await fetch(url, init);
    const text = await response.text();

    let data = null;
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }
    }

    if (!response.ok) {
      const retryAfter = response.headers.get('retry-after');
      return {
        error: extractError(data, response.status, retryAfter),
        statusCode: response.status,
        details: data,
      };
    }
    return { ok: true, status: response.status, data };
  } catch (error) {
    return {
      error: 'Error calling Spotify API',
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
