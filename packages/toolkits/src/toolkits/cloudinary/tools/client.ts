// @ts-nocheck
/**
 * Shared HTTP helper for the Cloudinary toolkit.
 *
 * - Admin API (+ Search, metadata, triggers, presets, mappings, video analytics):
 *   Basic auth (api_key:api_secret) against https://api.cloudinary.com/v1_1/{cloud}
 * - Upload API (upload, explicit, destroy, rename, multi, sprite, explode, text,
 *   slideshow, generate_archive, chunks): signed multipart requests (SHA-1).
 * - Live Streaming + Analysis APIs: Basic auth JSON against v2 hosts.
 */
import { createHash } from 'crypto';

export interface CloudinaryCreds {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
}

export function parseCreds(cloudinaryCredentials: string | undefined): CloudinaryCreds | null {
  if (!cloudinaryCredentials) return null;
  try {
    const parsed = JSON.parse(cloudinaryCredentials);
    if (!parsed.cloudName || !parsed.apiKey || !parsed.apiSecret) return null;
    return { cloudName: parsed.cloudName, apiKey: parsed.apiKey, apiSecret: parsed.apiSecret };
  } catch {
    return null;
  }
}

export function credsError() {
  return {
    error:
      'Cloudinary credentials are required. Connect Cloudinary first with cloudName, apiKey and apiSecret.',
  };
}

function basicHeader(creds: CloudinaryCreds): string {
  return `Basic ${Buffer.from(`${creds.apiKey}:${creds.apiSecret}`).toString('base64')}`;
}

function adminBase(creds: CloudinaryCreds): string {
  return `https://api.cloudinary.com/v1_1/${encodeURIComponent(creds.cloudName)}`;
}

function liveBase(creds: CloudinaryCreds): string {
  return `https://api.cloudinary.com/v2/video/${encodeURIComponent(creds.cloudName)}`;
}

function analysisBase(creds: CloudinaryCreds): string {
  return `https://api.cloudinary.com/v2/analysis/${encodeURIComponent(creds.cloudName)}`;
}

async function parseResponse(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return { success: response.ok };
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

function apiError(service: string, status: number, data: unknown) {
  return { error: `${service} API error ${status}`, details: data };
}

function toForm(params: Record<string, unknown>): URLSearchParams {
  const form = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    if (Array.isArray(value)) {
      for (const v of value) {
        if (v === undefined || v === null || v === '') continue;
        form.append(`${key}[]`, typeof v === 'object' ? JSON.stringify(v) : String(v));
      }
    } else if (typeof value === 'boolean') {
      form.append(key, value ? 'true' : 'false');
    } else if (typeof value === 'object') {
      form.append(key, JSON.stringify(value));
    } else {
      form.append(key, String(value));
    }
  }
  return form;
}

function toQuery(params: Record<string, unknown>): string {
  const qs = toForm(params).toString();
  return qs ? `?${qs}` : '';
}

export interface AdminOptions {
  query?: Record<string, unknown>;
  /** Form-encoded body params (classic Admin API style). */
  form?: Record<string, unknown>;
  /** JSON body (metadata fields/rules, triggers, presets, mappings). */
  json?: unknown;
}

async function adminRequest(
  creds: CloudinaryCreds,
  method: string,
  path: string,
  opts: AdminOptions = {},
): Promise<unknown> {
  try {
    const url = `${adminBase(creds)}${path}` + toQuery(opts.query ?? {});
    const headers: Record<string, string> = { Authorization: basicHeader(creds) };
    let body: string | undefined;
    if (opts.json !== undefined) {
      headers['Content-Type'] = 'application/json';
      body = JSON.stringify(opts.json);
    } else if (opts.form !== undefined) {
      headers['Content-Type'] = 'application/x-www-form-urlencoded';
      body = toForm(opts.form).toString();
    }
    const response = await fetch(url, { method, headers, body });
    const data = await parseResponse(response);
    if (!response.ok) return apiError('Cloudinary', response.status, data);
    return data;
  } catch (error) {
    return {
      error: 'Error calling Cloudinary API',
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export function cldGet(
  creds: CloudinaryCreds | null,
  path: string,
  query: Record<string, unknown> = {},
): Promise<unknown> {
  if (!creds) return Promise.resolve(credsError());
  return adminRequest(creds, 'GET', path, { query });
}

export function cldPost(
  creds: CloudinaryCreds | null,
  path: string,
  form: Record<string, unknown> = {},
): Promise<unknown> {
  if (!creds) return Promise.resolve(credsError());
  return adminRequest(creds, 'POST', path, { form });
}

export function cldPut(
  creds: CloudinaryCreds | null,
  path: string,
  form: Record<string, unknown> = {},
): Promise<unknown> {
  if (!creds) return Promise.resolve(credsError());
  return adminRequest(creds, 'PUT', path, { form });
}

export function cldDelete(
  creds: CloudinaryCreds | null,
  path: string,
  form: Record<string, unknown> = {},
): Promise<unknown> {
  if (!creds) return Promise.resolve(credsError());
  return adminRequest(creds, 'DELETE', path, { form });
}

/** JSON-body variant for metadata fields/rules, triggers, presets, mappings. */
export function cldJson(
  creds: CloudinaryCreds | null,
  method: string,
  path: string,
  json: unknown = {},
): Promise<unknown> {
  if (!creds) return Promise.resolve(credsError());
  return adminRequest(creds, method, path, { json });
}

/** JSON POST for the Search API (/resources/search, /resources/visual_search, /folders/search). */
export function cldSearch(
  creds: CloudinaryCreds | null,
  path: string,
  body: Record<string, unknown>,
): Promise<unknown> {
  if (!creds) return Promise.resolve(credsError());
  return adminRequest(creds, 'POST', path, { json: body });
}

/** Live Streaming API (v2/video): Basic auth + JSON body. */
export function cldLive(
  creds: CloudinaryCreds | null,
  method: string,
  path: string,
  body?: Record<string, unknown>,
): Promise<unknown> {
  if (!creds) return Promise.resolve(credsError());
  return (async () => {
    try {
      const url = `${liveBase(creds)}${path}`;
      const headers: Record<string, string> = {
        Authorization: basicHeader(creds),
        'Content-Type': 'application/json',
      };
      const response = await fetch(url, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
      });
      const data = await parseResponse(response);
      if (!response.ok) return apiError('Cloudinary Live Streaming', response.status, data);
      return data;
    } catch (error) {
      return {
        error: 'Error calling Cloudinary Live Streaming API',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  })();
}

/** Analyze API task status (v2/analysis): Basic auth GET. */
export function cldAnalysisGet(creds: CloudinaryCreds | null, path: string): Promise<unknown> {
  if (!creds) return Promise.resolve(credsError());
  return (async () => {
    try {
      const url = `${analysisBase(creds)}${path}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: { Authorization: basicHeader(creds) },
      });
      const data = await parseResponse(response);
      if (!response.ok) return apiError('Cloudinary Analysis', response.status, data);
      return data;
    } catch (error) {
      return {
        error: 'Error calling Cloudinary Analysis API',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  })();
}

/** Video Analytics API (v1_1 Admin host): Basic auth GET with query params. */
export function cldVideoAnalytics(
  creds: CloudinaryCreds | null,
  query: Record<string, unknown>,
): Promise<unknown> {
  if (!creds) return Promise.resolve(credsError());
  return (async () => {
    try {
      const url = `${adminBase(creds)}/video/analytics/views` + toQuery(query);
      const response = await fetch(url, {
        method: 'GET',
        headers: { Authorization: basicHeader(creds) },
      });
      const data = await parseResponse(response);
      if (!response.ok) return apiError('Cloudinary Video Analytics', response.status, data);
      return data;
    } catch (error) {
      return {
        error: 'Error calling Cloudinary Video Analytics API',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  })();
}

const SIGN_EXCLUDED = new Set(['file', 'cloud_name', 'resource_type', 'api_key']);

/** Multipart file variant for visual search (Basic auth POST /resources/visual_search). */
export async function cldSearchUpload(
  creds: CloudinaryCreds | null,
  fields: Record<string, unknown>,
  file: UploadFile,
): Promise<unknown> {
  if (!creds) return credsError();
  try {
    const converted = fileToBlob(file);
    if ('error' in converted) return { error: converted.error };
    const form = new FormData();
    form.append('file', converted.blob, converted.filename);
    for (const [key, value] of Object.entries(fields)) {
      if (value === undefined || value === null || value === '') continue;
      form.append(key, String(value));
    }
    const url = `${adminBase(creds)}/resources/visual_search`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { Authorization: basicHeader(creds) },
      body: form,
    });
    const data = await parseResponse(response);
    if (!response.ok) return apiError('Cloudinary', response.status, data);
    return data;
  } catch (error) {
    return {
      error: 'Error calling Cloudinary API',
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
/** SHA-1 signature over sorted params + api_secret (Upload API auth). */
export function signParams(params: Record<string, unknown>, apiSecret: string): string {
  const parts: string[] = [];
  for (const key of Object.keys(params).sort()) {
    if (SIGN_EXCLUDED.has(key)) continue;
    const value = params[key];
    if (value === undefined || value === null || value === '') continue;
    parts.push(`${key}=${Array.isArray(value) ? value.join(',') : String(value)}`);
  }
  return createHash('sha1')
    .update(parts.join('&') + apiSecret)
    .digest('hex');
}

export interface UploadFile {
  fileName?: string;
  fileContentBase64?: string;
  contentType?: string;
}

function fileToBlob(file: UploadFile): { blob: Blob; filename: string } | { error: string } {
  if (!file.fileContentBase64)
    return { error: 'fileContentBase64 is required for binary uploads.' };
  const match = file.fileContentBase64.match(/^data:([^;,]+)?(;base64)?,(.*)$/s);
  const b64 = match ? match[3] : file.fileContentBase64;
  const mime = file.contentType ?? (match && match[1]) ?? 'application/octet-stream';
  try {
    const buffer = Buffer.from(b64, 'base64');
    return {
      blob: new Blob([new Uint8Array(buffer)], { type: mime }),
      filename: file.fileName ?? 'upload.bin',
    };
  } catch {
    return { error: 'fileContentBase64 must be valid base64 (or a data URI).' };
  }
}

/**
 * Signed Upload API call (multipart). `file` may be a remote URL (Cloudinary
 * fetches it), a data URI, or omitted for non-file methods (explicit, destroy,
 * rename, archive, text, multi, sprite, explode, slideshow).
 */
export async function cldUpload(
  creds: CloudinaryCreds | null,
  resourceType: string,
  action: string,
  params: Record<string, unknown> = {},
  file?: string | UploadFile,
  extraHeaders: Record<string, string> = {},
): Promise<unknown> {
  if (!creds) return credsError();
  try {
    const timestamp = Math.floor(Date.now() / 1000);
    const fullParams: Record<string, unknown> = { timestamp, ...params };
    const signature = signParams(fullParams, creds.apiSecret);
    const form = new FormData();
    if (typeof file === 'string') {
      form.append('file', file);
    } else if (file && typeof file === 'object') {
      const converted = fileToBlob(file);
      if ('error' in converted) return { error: converted.error };
      form.append('file', converted.blob, converted.filename);
    }
    for (const [key, value] of Object.entries(fullParams)) {
      if (value === undefined || value === null || value === '') continue;
      form.append(key, Array.isArray(value) ? value.join(',') : String(value));
    }
    form.append('api_key', creds.apiKey);
    form.append('signature', signature);
    const url = `${adminBase(creds)}/${resourceType}/${action}`;
    const response = await fetch(url, { method: 'POST', headers: extraHeaders, body: form });
    const data = await parseResponse(response);
    if (!response.ok) return apiError('Cloudinary Upload', response.status, data);
    return data;
  } catch (error) {
    return {
      error: 'Error calling Cloudinary Upload API',
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
