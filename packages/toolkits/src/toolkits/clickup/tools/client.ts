const BASE_V2 = 'https://api.clickup.com/api/v2';
const BASE_V3 = 'https://api.clickup.com/api/v3';

export type CuBase = 'V2' | 'V3';

export interface CuOptions {
  query?: Record<string, unknown>;
  body?: unknown;
}

/** Build a query string. Arrays use ClickUp's `key[]=v` convention; objects are JSON-encoded. */
function buildQuery(query?: Record<string, unknown>): string {
  if (!query) return '';
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === '') continue;
    if (Array.isArray(value)) {
      for (const v of value) {
        if (v === undefined || v === null || v === '') continue;
        params.append(
          `${key}[]`,
          typeof v === 'object' ? JSON.stringify(v) : String(v),
        );
      }
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

/**
 * Expand flat `a__b__c` keys into nested objects for ClickUp bodies
 * (e.g. view `filters__show__closed`, space `features__tags__enabled`,
 * tag `tag__name`, group `members__add`).
 */
export function nest(flat: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(flat)) {
    if (value === undefined) continue;
    if (!key.includes('__')) {
      out[key] = value;
      continue;
    }
    const parts = key.split('__');
    let node: Record<string, unknown> = out;
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      const child = node[part];
      if (typeof child !== 'object' || child === null || Array.isArray(child)) {
        node[part] = {};
      }
      node = node[part] as Record<string, unknown>;
    }
    node[parts[parts.length - 1]] = value;
  }
  return out;
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

function apiError(status: number, data: unknown): { error: string; details: unknown } {
  return { error: `ClickUp API error ${status}`, details: data };
}

async function request(
  token: string | undefined,
  base: CuBase,
  method: string,
  path: string,
  opts: CuOptions = {},
): Promise<unknown> {
  try {
    const url = `${base === 'V3' ? BASE_V3 : BASE_V2}${path}` + buildQuery(opts.query);
    const headers: Record<string, string> = {};
    if (token) headers.Authorization = token;
    let body: string | undefined;
    if (opts.body !== undefined) {
      headers['Content-Type'] = 'application/json';
      body = JSON.stringify(opts.body);
    }
    const response = await fetch(url, { method, headers, body });
    const data = await parseResponse(response);
    if (!response.ok) return apiError(response.status, data);
    return data;
  } catch (error) {
    return {
      error: 'Error calling ClickUp API',
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export function cuGet(
  token: string | undefined,
  base: CuBase,
  path: string,
  opts: CuOptions = {},
): Promise<unknown> {
  return request(token, base, 'GET', path, opts);
}

export function cuPost(
  token: string | undefined,
  base: CuBase,
  path: string,
  opts: CuOptions = {},
): Promise<unknown> {
  return request(token, base, 'POST', path, opts);
}

export function cuPut(
  token: string | undefined,
  base: CuBase,
  path: string,
  opts: CuOptions = {},
): Promise<unknown> {
  return request(token, base, 'PUT', path, opts);
}

export function cuPatch(
  token: string | undefined,
  base: CuBase,
  path: string,
  opts: CuOptions = {},
): Promise<unknown> {
  return request(token, base, 'PATCH', path, opts);
}

export function cuDelete(
  token: string | undefined,
  base: CuBase,
  path: string,
  opts: CuOptions = {},
): Promise<unknown> {
  return request(token, base, 'DELETE', path, opts);
}

export interface CuAttachment {
  filename?: string;
  name?: string;
  content_b64?: string;
  content?: string;
  data?: string;
  content_type?: string;
  contentType?: string;
  mimetype?: string;
}

/** Multipart upload for task attachments (POST /task/{task_id}/attachment). */
export async function cuUpload(
  token: string | undefined,
  base: CuBase,
  path: string,
  attachment: CuAttachment,
  query?: Record<string, unknown>,
): Promise<unknown> {
  try {
    if (!attachment || typeof attachment !== 'object') {
      return { error: 'attachment must be an object with filename, content_b64 and content_type.' };
    }
    const filename = attachment.filename ?? attachment.name;
    const b64 = attachment.content_b64 ?? attachment.content ?? attachment.data;
    const contentType =
      attachment.content_type ?? attachment.contentType ?? attachment.mimetype ?? 'application/octet-stream';
    if (!filename || !b64) {
      return { error: 'attachment requires filename (or name) and base64 content (content_b64).' };
    }
    let buffer: Buffer;
    try {
      buffer = Buffer.from(b64, 'base64');
    } catch {
      return { error: 'attachment content_b64 must be valid base64.' };
    }
    const form = new FormData();
    form.append('attachment', new Blob([new Uint8Array(buffer)], { type: contentType }), filename);
    const url =
      `${base === 'V3' ? BASE_V3 : BASE_V2}${path}` + buildQuery(query);
    const headers: Record<string, string> = {};
    if (token) headers.Authorization = token;
    const response = await fetch(url, { method: 'POST', headers, body: form });
    const data = await parseResponse(response);
    if (!response.ok) return apiError(response.status, data);
    return data;
  } catch (error) {
    return {
      error: 'Error uploading attachment to ClickUp',
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
