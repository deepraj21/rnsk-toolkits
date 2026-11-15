// @ts-nocheck
/**
 * Canva Connect API client.
 *
 * Base URL: https://api.canva.com/rest
 * Auth: `Authorization: Bearer <access token>` (bearer_token pattern).
 * Token: Canva developer-console OAuth access token (https://www.canva.dev/).
 *
 * Errors come back as `{"code": "...", "message": "..."}` — flattened into
 * `Canva API error <status>: <message>` (the `code` stays in `details`).
 *
 * List endpoints paginate with a `continuation` query param: pass the
 * `continuation` value from the previous response to fetch the next page.
 *
 * Async job endpoints (asset-uploads, imports, exports, autofills, generations,
 * image-generations) return `{ job: { id, status } }` — poll the matching GET
 * until `status` is `success` or `failed`. Export download URLs expire in 24h.
 *
 * Never throws — always returns { ok, status, data } or { error, statusCode?, details? }.
 */
const BASE = 'https://api.canva.com/rest';

function extractError(data, status) {
  if (data && typeof data === 'object') {
    if (typeof data.message === 'string' && data.message)
      return `Canva API error ${status}: ${data.message}`;
    if (typeof data.code === 'string' && data.code)
      return `Canva API error ${status}: ${data.code}`;
  }
  if (typeof data === 'string' && data) return `Canva API error ${status}: ${data}`;
  return `Canva API error ${status}`;
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

/** Base64-encode a UTF-8 string (Canva metadata headers use this). */
export function b64(text) {
  return Buffer.from(String(text), 'utf8').toString('base64');
}

/** Build a Buffer from string content (utf8 or base64) for octet-stream bodies. */
export function toBuffer(content, encoding = 'utf8') {
  return encoding === 'base64'
    ? Buffer.from(String(content), 'base64')
    : Buffer.from(String(content), 'utf8');
}

/**
 * JSON request against api.canva.com/rest.
 * `query` values may be arrays (repeated param), objects (JSON-encoded),
 * booleans, numbers, or strings; empty values are dropped.
 */
export async function canvaRequest(
  token,
  path,
  { method = 'GET', query, body, headers = {} } = {},
) {
  const trimmed = String(token ?? '').trim();
  if (!trimmed) {
    return { error: 'Canva access token is required. Connect Canva first.' };
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
    if (body !== undefined) {
      if (!Object.keys(init.headers).some((h) => h.toLowerCase() === 'content-type')) {
        init.headers['Content-Type'] = 'application/json';
      }
      init.body = typeof body === 'string' ? body : JSON.stringify(body);
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
      return {
        error: extractError(data, response.status),
        statusCode: response.status,
        details: data,
      };
    }
    return { ok: true, status: response.status, data };
  } catch (error) {
    return {
      error: 'Error calling Canva API',
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Raw `application/octet-stream` POST (asset uploads, design imports).
 * `body` is a Buffer; metadata rides in custom headers (`Asset-Upload-Metadata`
 * / `Import-Metadata` — JSON strings whose name/title fields are base64).
 */
export async function canvaRaw(token, path, { body, headers = {} } = {}) {
  const trimmed = String(token ?? '').trim();
  if (!trimmed) {
    return { error: 'Canva access token is required. Connect Canva first.' };
  }
  try {
    const response = await fetch(`${BASE}${path}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${trimmed}`,
        'Content-Type': 'application/octet-stream',
        ...headers,
      },
      body,
    });

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
      return {
        error: extractError(data, response.status),
        statusCode: response.status,
        details: data,
      };
    }
    return { ok: true, status: response.status, data };
  } catch (error) {
    return {
      error: 'Error calling Canva API',
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
