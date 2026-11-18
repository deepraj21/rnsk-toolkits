// @ts-nocheck
/**
 * DeepSeek API client.
 *
 * Base URL: https://api.deepseek.com (the FIM completion endpoint lives under
 * /beta, the Anthropic-compatible endpoint under /anthropic — both on the same
 * host, so allowedHosts is just api.deepseek.com).
 *
 * Auth: `Authorization: Bearer <api key>` (bearer_token pattern).
 * Keys: https://platform.deepseek.com/api_keys
 *
 * Errors come back as OpenAI-style
 * `{"error":{"message":"Authentication Fails, ...","type":"authentication_error",
 * "code":"invalid_request_error"}}` — flattened into
 * `DeepSeek API error <status>: <message>`.
 *
 * Non-streaming only: tools always read complete JSON responses; the `stream`
 * option is deliberately not exposed on chat/completion tools.
 *
 * Never throws — always returns { ok, status, data } or { error, ... }.
 */
const BASE = 'https://api.deepseek.com';

function extractError(data, status) {
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    const err = data.error;
    if (err && typeof err === 'object' && typeof err.message === 'string' && err.message) {
      return `DeepSeek API error ${status}: ${err.message}`;
    }
    if (typeof data.message === 'string' && data.message) {
      return `DeepSeek API error ${status}: ${data.message}`;
    }
  }
  if (typeof data === 'string' && data.trim())
    return `DeepSeek API error ${status}: ${data.trim()}`;
  return `DeepSeek API error ${status}`;
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
 * JSON request against api.deepseek.com.
 * `query` values may be arrays (repeated param), objects (JSON-encoded),
 * booleans, numbers, or strings; empty values are dropped.
 */
export async function deepseekRequest(
  deepseekToken,
  path,
  { method = 'GET', query, body, headers = {} } = {},
) {
  const trimmed = String(deepseekToken ?? '').trim();
  if (!trimmed) {
    return { error: 'DeepSeek API key is required. Connect DeepSeek first.' };
  }
  try {
    let url = `${BASE}${path.startsWith('/') ? path : `/${path}`}`;
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
      error: 'Error calling DeepSeek API',
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Multipart upload (files, audio, documents). Do NOT set Content-Type — fetch
 * adds the boundary. `fields` are appended before the file part (DeepSeek's
 * file API requires `purpose` to precede `file`); `file` is
 * { field?, content, encoding?, mimeType?, filename? }.
 */
export async function deepseekUpload(deepseekToken, path, { fields = {}, file } = {}) {
  const trimmed = String(deepseekToken ?? '').trim();
  if (!trimmed) {
    return { error: 'DeepSeek API key is required. Connect DeepSeek first.' };
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
      error: 'Error calling DeepSeek API',
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Binary POST (text-to-speech audio). Returns { ok, buffer, contentType,
 * status } or { error, ... } — the caller encodes the bytes.
 */
export async function deepseekDownload(deepseekToken, path, { body, headers = {} } = {}) {
  const trimmed = String(deepseekToken ?? '').trim();
  if (!trimmed) {
    return { error: 'DeepSeek API key is required. Connect DeepSeek first.' };
  }
  try {
    const init = {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${trimmed}`,
        'Content-Type': 'application/json',
        ...headers,
      },
    };
    if (body !== undefined) init.body = typeof body === 'string' ? body : JSON.stringify(body);

    const response = await fetch(`${BASE}${path}`, init);
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
      error: 'Error calling DeepSeek API',
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/** Build a Blob from string content (utf8 or base64). */
export function fileBlob(content, encoding = 'base64', mimeType = 'application/octet-stream') {
  const buffer =
    encoding === 'base64' ? Buffer.from(content, 'base64') : Buffer.from(content, 'utf8');
  return new Blob([buffer], { type: mimeType });
}

/** Parse a binary body as UTF-8 text, falling back to base64. */
export function decodeBuffer(buffer) {
  const text = buffer.toString('utf8');
  if (!text.includes('\uFFFD') && !text.includes('\u0000')) {
    return { encoding: 'utf8', content: text };
  }
  return { encoding: 'base64', content: buffer.toString('base64') };
}
