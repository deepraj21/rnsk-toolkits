// @ts-nocheck
/**
 * Typeform API client.
 *
 * Base URL: https://api.typeform.com (EU accounts use api.eu.typeform.com)
 * Auth: `Authorization: Bearer <OAuth access token>` (oauth2 pattern — the host
 * runs the authorization code flow and refreshes the token when it expires;
 * tokens are valid for 1 week).
 *
 * Errors come back as `{"code": "...", "description": "..."}` — flattened into
 * `Typeform API error <status>: <code>: <description>`.
 *
 * List endpoints paginate with `page` / `page_size` (max 200) and return
 * `{ total_items, page_count, items }`. Responses use `page_size` (max 1000)
 * plus `since`/`until` dates and `after`/`before` cursors. Rate limit: 2
 * requests per second per account.
 *
 * Binary responses (file downloads) are not inlined — the client returns a
 * small JSON descriptor with the URL and content type instead. Empty bodies
 * with a `Location` header (image create) come back as `{ location }`.
 *
 * Never throws — always returns { ok, status, data } or { error, statusCode?, details? }.
 */
const BASE = 'https://api.typeform.com';

function extractError(data, status) {
  if (data && typeof data === 'object') {
    const code = typeof data.code === 'string' && data.code ? data.code : null;
    const description =
      typeof data.description === 'string' && data.description ? data.description : null;
    if (code && description) return `Typeform API error ${status}: ${code}: ${description}`;
    if (code) return `Typeform API error ${status}: ${code}`;
    if (description) return `Typeform API error ${status}: ${description}`;
    if (typeof data.message === 'string' && data.message)
      return `Typeform API error ${status}: ${data.message}`;
  }
  if (typeof data === 'string' && data) return `Typeform API error ${status}: ${data}`;
  return `Typeform API error ${status}`;
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
 * Request against api.typeform.com.
 * `query` values may be arrays (joined with commas), booleans, numbers, or
 * strings; empty values are dropped. `body` may be an object (JSON-encoded) or
 * an array (sent as-is — used by the RFC-6902 style PATCH endpoints).
 */
export async function typeformRequest(
  token,
  path,
  { method = 'GET', query, body, headers = {} } = {},
) {
  const trimmed = String(token ?? '').trim();
  if (!trimmed) {
    return { error: 'Typeform access token is required. Connect Typeform first.' };
  }
  try {
    let url = `${BASE}${path}`;
    if (query) {
      const params = new URLSearchParams();
      for (const [key, value] of Object.entries(query)) {
        if (value === undefined || value === null || value === '') continue;
        if (Array.isArray(value)) {
          if (value.length) params.append(key, value.join(','));
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
      if (!Object.keys(init.headers).some((h) => h.toLowerCase() === 'content-type')) {
        init.headers['Content-Type'] = 'application/json';
      }
      init.body = typeof body === 'string' ? body : JSON.stringify(body);
    }

    const response = await fetch(url, init);
    const contentType = response.headers.get('content-type') || '';
    const text = await response.text();

    let data = null;
    if (text) {
      if (/json/i.test(contentType) || !response.ok) {
        try {
          data = JSON.parse(text);
        } catch {
          data = text;
        }
      } else if (/text\/|xml/i.test(contentType)) {
        data = text;
      } else {
        data = {
          contentType,
          url,
          note: 'Binary content is not returned by this tool — fetch this URL with the Typeform access token to download it.',
        };
      }
    }

    if (!response.ok) {
      return {
        error: extractError(data, response.status),
        statusCode: response.status,
        details: data,
      };
    }

    if (data === null) {
      const location = response.headers.get('location');
      if (location) data = { location };
    }
    return { ok: true, status: response.status, data };
  } catch (error) {
    return {
      error: 'Error calling Typeform API',
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
