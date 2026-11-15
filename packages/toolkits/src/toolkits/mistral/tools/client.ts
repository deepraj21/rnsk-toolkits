// @ts-nocheck
/**
 * Mistral AI API client.
 *
 * Base URL: https://api.mistral.ai/v1
 * Auth: `Authorization: Bearer <api key>` (bearer_token pattern).
 * Keys: https://console.mistral.ai → API keys.
 *
 * Errors come back as `{"detail": "Invalid API Key"}` (string) for auth errors
 * or `{"detail": [{"loc": [...], "msg": "...", "type": "..."}]}` (array) for
 * validation errors — both shapes are flattened into a single message.
 *
 * List endpoints return `{ object: "list", data: [...], total? }` and paginate
 * with `page` / `page_size` query params (page is 0-indexed).
 *
 * Never throws — always returns { ok, status, data } or { error, statusCode?, details? }.
 */
const BASE = 'https://api.mistral.ai/v1';

function extractError(data, status) {
  if (data && typeof data === 'object') {
    const detail = data.detail;
    if (typeof detail === 'string' && detail) return `Mistral API error ${status}: ${detail}`;
    if (Array.isArray(detail)) {
      const msg = detail
        .map((d) =>
          typeof d === 'string'
            ? d
            : d.msg
              ? `${(d.loc || []).join('.')} - ${d.msg}`
              : JSON.stringify(d),
        )
        .join('; ');
      if (msg) return `Mistral API error ${status}: ${msg}`;
    }
    if (typeof data.message === 'string' && data.message)
      return `Mistral API error ${status}: ${data.message}`;
  }
  if (typeof data === 'string' && data) return `Mistral API error ${status}: ${data}`;
  return `Mistral API error ${status}`;
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
 * JSON request against api.mistral.ai/v1.
 * `query` values may be arrays (repeated param), objects (JSON-encoded),
 * booleans, numbers, or strings; empty values are dropped.
 */
export async function mistralRequest(
  token,
  path,
  { method = 'GET', query, body, headers = {} } = {},
) {
  const trimmed = String(token ?? '').trim();
  if (!trimmed) {
    return { error: 'Mistral API key is required. Connect Mistral first.' };
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
      error: 'Error calling Mistral API',
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Multipart upload (files, audio). Do NOT set Content-Type — fetch adds the
 * boundary. `fields` are form fields (arrays repeat, objects JSON-encode);
 * `file` is { field?, content, encoding?, mimeType?, filename? }.
 */
export async function mistralUpload(token, path, { fields = {}, file } = {}) {
  const trimmed = String(token ?? '').trim();
  if (!trimmed) {
    return { error: 'Mistral API key is required. Connect Mistral first.' };
  }
  try {
    const form = new FormData();
    for (const [key, value] of Object.entries(fields)) {
      if (value === undefined || value === null || value === '') continue;
      if (Array.isArray(value)) {
        for (const item of value)
          if (item !== undefined && item !== null) form.append(key, String(item));
      } else if (typeof value === 'object') {
        form.append(key, JSON.stringify(value));
      } else {
        form.append(key, String(value));
      }
    }
    if (file) {
      const blob = fileBlob(file.content, file.encoding, file.mimeType);
      form.append(file.field ?? 'file', blob, file.filename ?? 'upload.bin');
    }

    const response = await fetch(`${BASE}${path}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${trimmed}` },
      body: form,
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
      error: 'Error calling Mistral API',
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Binary GET (file content). Returns { ok, buffer, contentType, status } or
 * { error, ... } — the caller decides how to encode the bytes.
 */
export async function mistralDownload(token, path) {
  const trimmed = String(token ?? '').trim();
  if (!trimmed) {
    return { error: 'Mistral API key is required. Connect Mistral first.' };
  }
  try {
    const response = await fetch(`${BASE}${path}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${trimmed}` },
    });

    const buffer = Buffer.from(await response.arrayBuffer());

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

    return {
      ok: true,
      status: response.status,
      buffer,
      contentType: response.headers.get('content-type') || '',
    };
  } catch (error) {
    return {
      error: 'Error calling Mistral API',
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/** Build a Blob from string content (utf8 or base64). */
export function fileBlob(content, encoding = 'utf8', mimeType = 'application/octet-stream') {
  const buffer =
    encoding === 'base64' ? Buffer.from(content, 'base64') : Buffer.from(content, 'utf8');
  return new Blob([buffer], { type: mimeType });
}

/** Parse an octet-stream body as UTF-8 text, falling back to base64. */
export function decodeBuffer(buffer) {
  const text = buffer.toString('utf8');
  if (!text.includes('\uFFFD') && !text.includes('\u0000')) {
    return { encoding: 'utf8', content: text };
  }
  return { encoding: 'base64', content: buffer.toString('base64') };
}
