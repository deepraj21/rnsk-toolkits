// @ts-nocheck
/**
 * Trello REST API client.
 *
 * Base URL: https://api.trello.com/1
 * Auth: Trello requires BOTH an API key and a token on every request, sent as
 *       query params `?key=<key>&token=<token>`. They are stored as a single
 *       "key:token" string under `trelloCredentials` (basic_auth pattern, same
 *       shape Greenhouse uses for "clientId:clientSecret").
 *
 * Keys: https://trello.com/power-ups/admin → API Key → generate a token
 *       (the token must be generated from that same key's page).
 *
 * Errors come back as PLAIN TEXT, not JSON — e.g. `invalid key`,
 * `invalid token`, `invalid id`, or `model not found`. Always try JSON first
 * and fall back to the raw text so the message survives.
 *
 * Writes accept params either in the query string or a JSON body; this client
 * puts scalars in the query string and objects/arrays in the JSON body, which
 * is how Trello's own SDKs do it.
 */
const BASE_URL = 'https://api.trello.com/1';

function credentialsOf(trelloCredentials) {
  const raw = String(trelloCredentials ?? '');
  const idx = raw.indexOf(':');
  if (idx <= 0 || idx === raw.length - 1) return null;
  return {
    key: raw.slice(0, idx).trim(),
    token: raw.slice(idx + 1).trim(),
  };
}

function parseBody(text) {
  if (text === undefined || text === null || text === '') return null;
  try {
    return JSON.parse(text);
  } catch {
    // Trello errors (and a few endpoints) return bare text.
    return text;
  }
}

function splitParams(params) {
  // Query params keyed by name; values are either a scalar or (for repeatable
  // params) an array. Nested plain objects are the only thing that goes in a
  // JSON body — Trello reads query and body on writes alike.
  const query = {};
  const body = {};
  for (const [key, value] of Object.entries(params ?? {})) {
    if (value === undefined || value === null || value === '') continue;
    if (Array.isArray(value)) {
      if (value.length) query[key] = value;
    } else if (typeof value === 'object') {
      body[key] = value;
    } else {
      query[key] = value;
    }
  }
  return { query, body };
}

/**
 * JSON/text request helper. Never throws — returns `{ ok, status, data }` or
 * `{ error, statusCode?, details? }`.
 */
export async function trelloRequest(trelloCredentials, path, options = {}) {
  if (!trelloCredentials) {
    return { error: 'Trello API credentials are required. Connect Trello first.' };
  }
  const creds = credentialsOf(trelloCredentials);
  if (!creds) {
    return {
      error:
        'Invalid Trello credentials. Expected "key:token" — copy the API key and token from https://trello.com/power-ups/admin and paste them joined by a colon. Reconnect Trello.',
    };
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = new URL(`${BASE_URL}${normalizedPath}`);

  // Auth first, so caller-supplied params can never override them.
  url.searchParams.set('key', creds.key);
  url.searchParams.set('token', creds.token);

  const { query, body } = splitParams(options.query ?? options.params);
  for (const [key, value] of Object.entries(query)) {
    if (Array.isArray(value)) {
      // Repeatable params serialize as key=a&key=b (Trello's array convention).
      for (const item of value) url.searchParams.append(key, String(item));
    } else {
      url.searchParams.set(key, String(value));
    }
  }
  const mergedBody = { ...(options.body ?? {}), ...body };

  try {
    const fetchOptions = { method: options.method ?? 'GET' };
    const headers = { Accept: 'application/json' };
    if (Object.keys(mergedBody).length > 0) {
      headers['Content-Type'] = 'application/json';
      fetchOptions.body = JSON.stringify(mergedBody);
    }
    fetchOptions.headers = headers;

    const response = await fetch(url.toString(), fetchOptions);
    const text = await response.text();
    const data = parseBody(text);

    if (!response.ok) {
      // Trello returns plain text errors, occasionally JSON.
      const detail =
        typeof data === 'string' && data
          ? data
          : data && typeof data === 'object' && data.message
            ? data.message
            : undefined;
      return {
        error: detail
          ? `Trello API error ${response.status}: ${detail}`
          : `Trello API error ${response.status}`,
        statusCode: response.status,
        details: data,
      };
    }

    return { ok: true, status: response.status, data };
  } catch (error) {
    return {
      error: 'Error calling Trello API',
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/** Ensure a value is an array — some Trello list endpoints return a bare object. */
export function asList(value) {
  if (Array.isArray(value)) return value;
  if (value && typeof value === 'object') return [value];
  return [];
}

/**
 * Pick only the requested fields off an object/array (Trello's `fields`
 * param), or return the input untouched when no field list is given.
 */
export function pickFields(value, fields) {
  if (!fields || !fields.length) return value;
  const keys = Array.isArray(fields) ? fields : String(fields).split(',');
  const pick = (item) => {
    if (!item || typeof item !== 'object') return item;
    const out = {};
    for (const key of keys) {
      if (key in item) out[key] = item[key];
    }
    return out;
  };
  return Array.isArray(value) ? value.map(pick) : pick(value);
}
