// @ts-nocheck
/** Shared HTTP helper for the Asana toolkit (REST API v1.0, Bearer auth, {data} envelope). */

const BASE_URL = 'https://app.asana.com/api/1.0';

export interface AsanaOptions {
  query?: Record<string, unknown>;
  body?: unknown;
}

function buildQuery(query?: Record<string, unknown>): string {
  if (!query) return '';
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === '') continue;
    if (Array.isArray(value)) {
      if (value.length === 0) continue;
      params.append(key, value.map((v) => String(v)).join(','));
    } else if (typeof value === 'boolean') {
      params.append(key, value ? 'true' : 'false');
    } else if (typeof value === 'object') {
      params.append(key, JSON.stringify(value));
    } else {
      params.append(key, String(value));
    }
  }
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

async function parseResponse(response: Response): Promise<unknown> {
  if (response.status === 204 || response.status === 205) return { success: true };
  const text = await response.text();
  if (!text) return { success: response.ok };
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

async function request(
  token: string | undefined,
  method: string,
  path: string,
  opts: AsanaOptions = {},
): Promise<unknown> {
  if (!token) return { error: 'Asana token is required. Connect Asana first.' };
  try {
    const url = `${BASE_URL}${path}` + buildQuery(opts.query);
    const headers: Record<string, string> = { Accept: 'application/json' };
    headers.Authorization = `Bearer ${token}`;
    let body: string | undefined;
    if (opts.body !== undefined) {
      headers['Content-Type'] = 'application/json';
      body = JSON.stringify({ data: opts.body });
    }
    const response = await fetch(url, { method, headers, body });
    const data = await parseResponse(response);
    if (!response.ok) return { error: `Asana API error ${response.status}`, details: data };
    return data;
  } catch (error) {
    return {
      error: 'Error calling Asana API',
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export function asanaGet(
  token: string | undefined,
  path: string,
  opts: AsanaOptions = {},
): Promise<unknown> {
  return request(token, 'GET', path, opts);
}

export function asanaPost(
  token: string | undefined,
  path: string,
  opts: AsanaOptions = {},
): Promise<unknown> {
  return request(token, 'POST', path, opts);
}

export function asanaPut(
  token: string | undefined,
  path: string,
  opts: AsanaOptions = {},
): Promise<unknown> {
  return request(token, 'PUT', path, opts);
}

export function asanaDelete(
  token: string | undefined,
  path: string,
  opts: AsanaOptions = {},
): Promise<unknown> {
  return request(token, 'DELETE', path, opts);
}

/** Common opt_fields / opt_pretty query params. */
export function optQuery(optFields?: string[], optPretty?: boolean): Record<string, unknown> {
  const q: Record<string, unknown> = {};
  if (optFields !== undefined) q.opt_fields = optFields;
  if (optPretty !== undefined) q.opt_pretty = optPretty;
  return q;
}

/** Common limit / offset pagination query params. */
export function pageQuery(limit?: number, offset?: string): Record<string, unknown> {
  const q: Record<string, unknown> = {};
  if (limit !== undefined) q.limit = limit;
  if (offset !== undefined) q.offset = offset;
  return q;
}

export interface AsanaUpload {
  fileName?: string;
  fileContentBase64?: string;
  contentType?: string;
}

/**
 * Multipart file upload for attachments.
 * POST /tasks/{gid}/attachments and POST /attachments accept multipart `file` + fields.
 */
export async function asanaUpload(
  token: string | undefined,
  path: string,
  upload: AsanaUpload,
  fields?: Record<string, string>,
  query?: Record<string, unknown>,
): Promise<unknown> {
  if (!token) return { error: 'Asana token is required. Connect Asana first.' };
  try {
    if (!upload || !upload.fileName || !upload.fileContentBase64) {
      return { error: 'Attachment upload requires fileName and base64 fileContentBase64.' };
    }
    let buffer: Buffer;
    try {
      buffer = Buffer.from(upload.fileContentBase64, 'base64');
    } catch {
      return { error: 'fileContentBase64 must be valid base64.' };
    }
    const form = new FormData();
    form.append(
      'file',
      new Blob([new Uint8Array(buffer)], {
        type: upload.contentType ?? 'application/octet-stream',
      }),
      upload.fileName,
    );
    if (fields) {
      for (const [k, v] of Object.entries(fields)) form.append(k, v);
    }
    const url = `${BASE_URL}${path}` + buildQuery(query);
    const response = await fetch(url, {
      method: 'POST',
      headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
      body: form,
    });
    const data = await parseResponse(response);
    if (!response.ok) return { error: `Asana API error ${response.status}`, details: data };
    return data;
  } catch (error) {
    return {
      error: 'Error uploading attachment to Asana',
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
