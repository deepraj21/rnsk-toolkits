// @ts-nocheck
/**
 * Anthropic (Claude) API client.
 *
 * Base URL: https://api.anthropic.com
 * Auth: API key sent as `x-api-key: <key>` (sk-ant-api... personal key,
 *       sk-ant-admin... admin key, or a service-account key).
 * Keys: Claude Console > Settings > API keys (platform.claude.com/settings/requests).
 *
 * Every request pins `anthropic-version: 2026-10-21` so response shapes stay stable.
 *
 * Errors come back as `{ type: "error", error: { type, message }, request_id }`.
 * List endpoints return `{ data: [...], ... }` and paginate with cursors:
 *   - `page` / `next_page`  → files, skills, skill versions
 *   - `after_id` / `before_id` → models, batches, workspaces, API keys
 * Array query params repeat with a `[]` suffix
 *   (?group_by[]=model&group_by[]=workspace_id), they are not comma-joined.
 *
 * The Admin endpoints (/v1/organizations/...) accept a personal key that is not
 * scoped to a specific workspace, an `sk-ant-admin...` key, or an org:admin
 * OAuth token — workspace-scoped keys are rejected there.
 */
const BASE_URL = 'https://api.anthropic.com';
const API_VERSION = '2026-10-21';

function baseHeaders(anthropicApiKey) {
  return {
    'x-api-key': String(anthropicApiKey).trim(),
    'anthropic-version': API_VERSION,
    Accept: 'application/json',
  };
}

function applyQuery(url, query) {
  const search = url.searchParams;
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value === undefined || value === null || value === '') continue;
    if (Array.isArray(value)) {
      // Anthropic repeats array params with a `[]` suffix.
      for (const item of value) {
        if (item === undefined || item === null || item === '') continue;
        search.append(`${key}[]`, String(item));
      }
    } else {
      search.set(key, String(value));
    }
  }
}

function parseBody(text) {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    // JSONL results streams and binary downloads come through here as text.
    return text;
  }
}

function shapeResponse(response, data) {
  if (response.status === 204) return { ok: true, status: 204, data: null };

  if (!response.ok) {
    const detail =
      data && typeof data === 'object' && data.error?.message ? data.error.message : undefined;
    return {
      error: detail
        ? `Anthropic API error ${response.status}: ${detail}`
        : `Anthropic API error ${response.status}`,
      statusCode: response.status,
      errorType: data && typeof data === 'object' && data.error?.type ? data.error.type : undefined,
      requestId: data && typeof data === 'object' ? data.request_id : undefined,
      details: data,
    };
  }

  return { ok: true, status: response.status, data };
}

/**
 * JSON request helper. Never throws — returns `{ ok, status, data }` or
 * `{ error, statusCode?, errorType?, requestId?, details?, message? }`.
 */
export async function anthropicRequest(anthropicApiKey, path, options = {}) {
  if (!anthropicApiKey) {
    return { error: 'Anthropic API key is required. Connect Anthropic first.' };
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = new URL(`${BASE_URL}${normalizedPath}`);
  applyQuery(url, options.query);

  try {
    const headers = baseHeaders(anthropicApiKey);
    const fetchOptions = { method: options.method ?? 'GET', headers };
    if (options.body !== undefined && options.body !== null) {
      headers['Content-Type'] = 'application/json';
      fetchOptions.body = JSON.stringify(options.body);
    }

    const response = await fetch(url.toString(), fetchOptions);
    const text = await response.text();
    return shapeResponse(response, parseBody(text));
  } catch (error) {
    return {
      error: 'Error calling Anthropic API',
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Multipart (form-data) helper used by the Files and Skills uploads.
 * Do NOT set Content-Type — fetch adds the multipart boundary itself.
 */
export async function anthropicUpload(anthropicApiKey, path, form) {
  if (!anthropicApiKey) {
    return { error: 'Anthropic API key is required. Connect Anthropic first.' };
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  try {
    const response = await fetch(`${BASE_URL}${normalizedPath}`, {
      method: 'POST',
      headers: baseHeaders(anthropicApiKey),
      body: form,
    });
    const text = await response.text();
    return shapeResponse(response, parseBody(text));
  } catch (error) {
    return {
      error: 'Error uploading to Anthropic API',
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Build a Blob for an upload part. `content` is plain text by default, or
 * base64 when `encoding` is `'base64'` (binary files: PDF, PNG, ...).
 */
export function fileBlob(content, encoding, mimeType) {
  const bytes =
    encoding === 'base64'
      ? Buffer.from(String(content), 'base64')
      : Buffer.from(String(content), 'utf8');
  return new Blob([bytes], mimeType ? { type: mimeType } : undefined);
}

/**
 * Rename known camelCase keys to the snake_case the API expects.
 * Used for the nested `params` objects inside a message batch.
 */
const BATCH_PARAM_KEYS = {
  maxTokens: 'max_tokens',
  stopSequences: 'stop_sequences',
  toolChoice: 'tool_choice',
  serviceTier: 'service_tier',
  userId: 'user_id',
  topP: 'top_p',
  topK: 'top_k',
};

export function snakeBatchParams(params) {
  if (!params || typeof params !== 'object') return params;
  const out = {};
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) continue;
    out[BATCH_PARAM_KEYS[key] ?? key] = value;
  }
  return out;
}

/** Drop unset entries (undefined / '') from a body object. Keeps null/false/0. */
export function compact(body) {
  const out = {};
  for (const [key, value] of Object.entries(body ?? {})) {
    if (value === undefined || value === '') continue;
    out[key] = value;
  }
  return out;
}

/**
 * Parse the raw text of a `.jsonl` response (batch results) into objects.
 * Falls back to treating the payload as a single JSON document.
 */
export function parseJsonl(text) {
  if (typeof text !== 'string') return text;
  const trimmed = text.trim();
  if (!trimmed) return [];
  const lines = trimmed.split('\n').filter((line) => line.trim());
  const out = [];
  for (const line of lines) {
    try {
      out.push(JSON.parse(line));
    } catch {
      return text;
    }
  }
  return out;
}
