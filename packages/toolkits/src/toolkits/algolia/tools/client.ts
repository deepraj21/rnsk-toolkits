// @ts-nocheck
/**
 * Algolia Search API client.
 *
 * Base URL: https://{applicationId}.algolia.net (built from the credentials;
 * the -dsn host and algolianet fallbacks are handled by Algolia's clients —
 * a single host is fine for tool traffic).
 *
 * Auth: two headers on every request —
 *   x-algolia-application-id: <Application ID>
 *   x-algolia-api-key: <API key>
 * The Application ID + API key live in the credentials JSON supplied at connect
 * time. Write operations need a key whose ACL includes the operation's requirement
 * (addObject, editSettings, deleteIndex, listIndexes, browse, search, ...).
 *
 * Errors: {"status":403,"message":"Invalid Application-ID or API key"} —
 * flattened into `Algolia API error <status>: <message>`. A wrong Application ID
 * does not resolve in DNS and surfaces as a network error instead.
 *
 * Query strings: primitives are sent as-is, arrays of primitives are joined with
 * commas (Algolia's documented form), arrays of objects / objects are
 * JSON-encoded. Most parameters travel in POST/PUT bodies anyway.
 *
 * Never throws — always returns { ok, status, data } or { error, ... }.
 */

function extractError(data, status) {
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    const message = typeof data.message === 'string' && data.message ? data.message : null;
    const body = typeof data.body === 'string' && data.body ? data.body : null;
    const picked = message ?? body;
    if (picked) return `Algolia API error ${status}: ${picked}`;
  }
  if (typeof data === 'string' && data.trim()) return `Algolia API error ${status}: ${data.trim()}`;
  return `Algolia API error ${status}`;
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
 * Request against the Algolia application host stored in the credentials.
 * `query` values may be arrays (primitives joined with commas, objects
 * JSON-encoded), booleans, numbers, or strings; empty values are dropped.
 */
export async function algoliaRequest(
  algoliaCredentials,
  path,
  { method = 'GET', query, body, headers = {} } = {},
) {
  const raw = String(algoliaCredentials ?? '').trim();
  if (!raw) {
    return { error: 'Algolia credentials are required. Connect Algolia first.' };
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
        'Algolia credentials must be JSON like {"applicationId":"YOUR_APP_ID","apiKey":"your_api_key"}',
    };
  }
  const applicationId = String(parsed.applicationId ?? '').trim();
  const apiKey = String(parsed.apiKey ?? '').trim();
  if (!applicationId || !apiKey) {
    return {
      error:
        'Algolia credentials must include applicationId and apiKey, e.g. {"applicationId":"YOUR_APP_ID","apiKey":"your_api_key"}',
    };
  }

  try {
    let url = `https://${applicationId}.algolia.net${path.startsWith('/') ? path : `/${path}`}`;
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
        } else if (typeof value === 'boolean') {
          params.append(key, String(value));
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
        'x-algolia-application-id': applicationId,
        'x-algolia-api-key': apiKey,
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
      error: 'Error calling Algolia API',
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
