const BASE = 'https://api.dribbble.com/v2';

export interface DribbbleOptions {
  query?: Record<string, unknown>;
  /** JSON body (PUT/POST). Mutually exclusive with `form`. */
  body?: unknown;
  /** Multipart form body. Mutually exclusive with `body`. */
  form?: FormData;
  headers?: Record<string, string>;
}

export interface DribbbleRawResponse {
  status: number;
  headers: Headers;
  data: unknown;
}

function buildQuery(query?: Record<string, unknown>): string {
  if (!query) return '';
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === '') continue;
    if (Array.isArray(value)) {
      for (const v of value) {
        if (v !== undefined && v !== null && v !== '') params.append(`${key}[]`, String(v));
      }
    } else if (typeof value === 'boolean') {
      params.append(key, value ? 'true' : 'false');
    } else {
      params.append(key, String(value));
    }
  }
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

async function parseBody(response: Response): Promise<unknown> {
  if (response.status === 204 || response.status === 205) return null;
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

/** Low-level request returning status + headers + data. Never throws. */
export async function dribRaw(
  token: string | undefined,
  method: string,
  path: string,
  opts: DribbbleOptions = {},
): Promise<DribbbleRawResponse | { error: string; message: string }> {
  try {
    const headers: Record<string, string> = { ...(opts.headers ?? {}) };
    if (token) headers.Authorization = `Bearer ${token}`;
    let body: string | FormData | undefined;
    if (opts.form !== undefined) {
      body = opts.form;
    } else if (opts.body !== undefined) {
      headers['Content-Type'] = 'application/json';
      body = JSON.stringify(opts.body);
    }
    const response = await fetch(`${BASE}${path}` + buildQuery(opts.query), {
      method,
      headers,
      body,
    });
    return { status: response.status, headers: response.headers, data: await parseBody(response) };
  } catch (error) {
    return {
      error: 'Error calling Dribbble API',
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

function apiError(status: number, data: unknown): { error: string; details: unknown } {
  return { error: `Dribbble API error ${status}`, details: data };
}

/** JSON request returning parsed data, or { error, details } on HTTP errors. Never throws. */
async function dribJson(
  token: string | undefined,
  method: string,
  path: string,
  opts: DribbbleOptions = {},
): Promise<unknown> {
  const res = await dribRaw(token, method, path, opts);
  if (res && typeof res === 'object' && 'error' in res && !('status' in res)) return res;
  const { status, data } = res as DribbbleRawResponse;
  if (status >= 400) return apiError(status, data);
  return data;
}

export function dribGet(
  token: string | undefined,
  path: string,
  opts: DribbbleOptions = {},
): Promise<unknown> {
  return dribJson(token, 'GET', path, opts);
}

export function dribPost(
  token: string | undefined,
  path: string,
  opts: DribbbleOptions = {},
): Promise<unknown> {
  return dribJson(token, 'POST', path, opts);
}

export function dribPut(
  token: string | undefined,
  path: string,
  opts: DribbbleOptions = {},
): Promise<unknown> {
  return dribJson(token, 'PUT', path, opts);
}

export function dribDelete(
  token: string | undefined,
  path: string,
  opts: DribbbleOptions = {},
): Promise<unknown> {
  return dribJson(token, 'DELETE', path, opts);
}

export interface DribbbleFileInput {
  filename?: string;
  name?: string;
  content_b64?: string;
  content?: string;
  data?: string;
  content_type?: string;
  contentType?: string;
  mimetype?: string;
}

/** Decode a base64 file input to bytes. Returns { error } on invalid input. */
export function decodeFileInput(
  input: unknown,
): { buffer: Buffer; filename: string; contentType: string } | { error: string } {
  if (!input || typeof input !== 'object') {
    return { error: 'file must be an object with filename, content_b64 and content_type.' };
  }
  const f = input as DribbbleFileInput;
  const filename = f.filename ?? f.name;
  const b64 = f.content_b64 ?? f.content ?? f.data;
  const contentType = f.content_type ?? f.contentType ?? f.mimetype ?? 'application/octet-stream';
  if (!filename || !b64) {
    return { error: 'file requires filename (or name) and base64 content (content_b64).' };
  }
  try {
    return { buffer: Buffer.from(b64, 'base64'), filename, contentType };
  } catch {
    return { error: 'file content_b64 must be valid base64.' };
  }
}

/** Extract the trailing numeric id from a Dribbble API Location URL. */
export function shotIdFromLocation(location: string | null): number | undefined {
  if (!location) return undefined;
  const match = location.match(/\/(\d+)\/?$/);
  return match ? Number(match[1]) : undefined;
}

/** Extract a `page` number from an RFC 5988 Link header rel="next" URL. */
export function nextPageFromLink(link: string | null): number | undefined {
  if (!link) return undefined;
  const match = link.match(/<[^>]*[?&]page=(\d+)[^>]*>\s*;\s*rel="next"/);
  return match ? Number(match[1]) : undefined;
}
