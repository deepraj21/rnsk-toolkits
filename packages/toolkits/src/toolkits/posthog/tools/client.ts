// @ts-nocheck
/**
 * PostHog API client.
 *
 * Base URL: taken from the credentials (default https://us.posthog.com;
 * EU Cloud: https://eu.posthog.com; self-hosted: your instance URL).
 * Auth: `Authorization: Bearer <personal API key>` (phx_...).
 *
 * Errors come back as DRF-style JSON — {"type","code","detail","attr"} — and
 * are flattened into `PostHog API error <status>: <detail>`. Missing-scope
 * failures are 403s naming the scope the key lacks.
 *
 * Pagination: most endpoints use limit/offset with {count, results};
 * groups use a cursor (next_cursor).
 *
 * Query-string values: primitives are sent as-is, arrays of primitives are
 * joined with commas, arrays/objects are JSON-encoded. Endpoints that want a
 * JSON-encoded list (e.g. `tags`, `dashboards`) should receive a JSON string
 * (pass JSON.stringify(...) from the tool).
 *
 * Never throws — always returns { ok, status, data } or { error, ... }.
 */

const DEFAULT_BASE_URL = 'https://us.posthog.com';

function extractError(data, status) {
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    const detail = typeof data.detail === 'string' && data.detail ? data.detail : null;
    const code = typeof data.code === 'string' && data.code ? data.code : null;
    const message = typeof data.message === 'string' && data.message ? data.message : null;
    const picked = detail ?? code ?? message;
    if (picked) return `PostHog API error ${status}: ${picked}`;
  }
  if (typeof data === 'string' && data.trim()) return `PostHog API error ${status}: ${data.trim()}`;
  return `PostHog API error ${status}`;
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
 * Request against the PostHog host stored in the credentials.
 * `query` values may be arrays (primitives joined with commas, objects
 * JSON-encoded), booleans, numbers, or strings; empty values are dropped.
 */
export async function posthogRequest(
  posthogCredentials,
  path,
  { method = 'GET', query, body, headers = {} } = {},
) {
  const raw = String(posthogCredentials ?? '').trim();
  if (!raw) {
    return { error: 'PostHog credentials are required. Connect PostHog first.' };
  }

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    parsed = null;
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return {
      error:
        'PostHog credentials must be JSON like {"baseUrl":"https://us.posthog.com","apiToken":"phx_..."}',
    };
  }
  const apiToken = String(parsed.apiToken ?? '').trim();
  if (!apiToken) {
    return {
      error:
        'PostHog credentials must include apiToken, e.g. {"baseUrl":"https://us.posthog.com","apiToken":"phx_..."}',
    };
  }
  const baseUrl =
    (String(parsed.baseUrl ?? '').trim() || DEFAULT_BASE_URL).replace(/\/+$/, '') ||
    DEFAULT_BASE_URL;

  try {
    let url = `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
    if (query) {
      const params = new URLSearchParams();
      for (const [key, value] of Object.entries(query)) {
        if (value === undefined || value === null || value === '') continue;
        if (Array.isArray(value)) {
          if (!value.length) continue;
          if (value.some((v) => v !== null && typeof v === 'object')) {
            params.append(key, JSON.stringify(value));
          } else {
            params.append(key, value.join(','));
          }
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
      headers: {
        Authorization: `Bearer ${apiToken}`,
        Accept: 'application/json',
        ...headers,
      },
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
      if (/json/i.test(contentType)) {
        try {
          data = JSON.parse(text);
        } catch {
          data = text;
        }
      } else {
        data = text;
      }
    }

    if (!response.ok) {
      return {
        error: extractError(data, response.status),
        statusCode: response.status,
        details: data,
      };
    }

    return { ok: true, status: response.status, data };
  } catch (error) {
    return {
      error: 'Error calling PostHog API',
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
