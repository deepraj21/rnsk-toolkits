// @ts-nocheck
/**
 * Dropbox API v2 client.
 *
 * Two hosts:
 *   - RPC:      https://api.dropboxapi.com/2  — JSON in / JSON out (POST + body)
 *   - Content:  https://content.dropboxapi.com/2 — upload/download/thumbnail;
 *               args travel in the `Dropbox-API-Arg` header, payload is raw bytes,
 *               and download responses carry metadata in `Dropbox-API-Result`.
 *
 * Auth: `Authorization: Bearer <token>` on every request (bearer_token pattern).
 *
 * Errors are JSON: {"error": {".tag": "..."}, "error_summary": "path/not_found/..."}
 * (occasionally plain text, e.g. a malformed Authorization header). Never throws —
 * always returns { ok, status, data, ... } or { error, statusCode?, details? }.
 *
 * Note: Dropbox's root folder is the EMPTY STRING "" (not "/").
 */
const RPC_BASE = 'https://api.dropboxapi.com/2';
const CONTENT_BASE = 'https://content.dropboxapi.com/2';

function extractError(data, status) {
  if (data && typeof data === 'object') {
    const summary = data.error_summary || data.message;
    if (summary) return `Dropbox API error ${status}: ${summary}`;
    const err = data.error;
    const tag = err && typeof err === 'object' ? err['.tag'] || err.tag : undefined;
    if (tag) return `Dropbox API error ${status}: ${tag}`;
  }
  if (typeof data === 'string' && data) return `Dropbox API error ${status}: ${data}`;
  return `Dropbox API error ${status}`;
}

async function request(token, url, { headers = {}, body } = {}) {
  const trimmed = String(token ?? '').trim();
  if (!trimmed) {
    return { error: 'Dropbox access token is required. Connect Dropbox first.' };
  }
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${trimmed}`, ...headers },
      body,
    });

    const buffer = Buffer.from(await response.arrayBuffer());

    let apiResult = null;
    const resultHeader = response.headers.get('dropbox-api-result');
    if (resultHeader) {
      try {
        apiResult = JSON.parse(resultHeader);
      } catch {
        apiResult = resultHeader;
      }
    }

    if (!response.ok) {
      let data;
      try {
        data = JSON.parse(buffer.toString('utf8'));
      } catch {
        data = buffer.toString('utf8');
      }
      return {
        error: extractError(data, response.status),
        statusCode: response.status,
        details: data,
      };
    }

    let data = null;
    if (buffer.length > 0) {
      try {
        data = JSON.parse(buffer.toString('utf8'));
      } catch {
        data = buffer;
      }
    }
    return { ok: true, status: response.status, data, buffer, apiResult };
  } catch (error) {
    return {
      error: 'Error calling Dropbox API',
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/** JSON RPC call against api.dropboxapi.com. */
export async function dropboxRpc(token, path, body = {}) {
  return request(token, `${RPC_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body ?? {}),
  });
}

/**
 * Raw call against content.dropboxapi.com (upload / download).
 * `arg` is serialized into the Dropbox-API-Arg header; `body` is raw bytes/string.
 */
export async function dropboxContent(
  token,
  path,
  { arg, body, contentType = 'application/octet-stream' } = {},
) {
  const headers = { 'Content-Type': contentType };
  if (arg !== undefined) headers['Dropbox-API-Arg'] = JSON.stringify(arg);
  return request(token, `${CONTENT_BASE}${path}`, { headers, body });
}

/** Ensure a value is an array — some Dropbox list endpoints return a bare object. */
export function asList(value) {
  if (Array.isArray(value)) return value;
  if (value && typeof value === 'object') return [value];
  return [];
}
