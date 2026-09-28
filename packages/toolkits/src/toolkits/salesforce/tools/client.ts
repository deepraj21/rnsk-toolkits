const API_VERSION = 'v62.0';
const DATA_ROOT = `/services/data/${API_VERSION}`;

export interface SfCredentials {
  instanceUrl: string;
  accessToken: string;
}

/** salesforceCredentials is the JSON blob injected by the framework under the manifest's tokenField. */
export function parseSfCredentials(raw: string): SfCredentials {
  let parsed: { instanceUrl?: string; accessToken?: string };
  try {
    parsed = JSON.parse(raw) as { instanceUrl?: string; accessToken?: string };
  } catch {
    throw new Error(
      'Salesforce credentials must be a JSON object with instanceUrl and accessToken',
    );
  }
  if (!parsed.instanceUrl)
    throw new Error(
      'Salesforce credentials must include instanceUrl (e.g. https://mydomain.my.salesforce.com)',
    );
  if (!parsed.accessToken) throw new Error('Salesforce credentials must include accessToken');
  if (!/^https:\/\//.test(parsed.instanceUrl))
    throw new Error('Salesforce instanceUrl must start with https://');
  return { instanceUrl: parsed.instanceUrl.replace(/\/+$/, ''), accessToken: parsed.accessToken };
}

function resolveUrl(instanceUrl: string, path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  if (path.startsWith('/services/')) return `${instanceUrl}${path}`;
  return `${instanceUrl}${DATA_ROOT}${path.startsWith('/') ? path : `/${path}`}`;
}

function buildQuery(query?: Record<string, unknown>): string {
  if (!query) return '';
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === '') continue;
    if (Array.isArray(value)) {
      for (const v of value) {
        if (v !== undefined && v !== null && v !== '') params.append(key, String(v));
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
  return { error: `Salesforce API error ${status}`, details: data };
}

export interface SfOptions {
  query?: Record<string, unknown>;
  body?: unknown;
  headers?: Record<string, string>;
}

async function request(
  credentials: string,
  method: string,
  path: string,
  opts: SfOptions = {},
): Promise<unknown> {
  try {
    const { instanceUrl, accessToken } = parseSfCredentials(credentials);
    const url = resolveUrl(instanceUrl, path) + buildQuery(opts.query);
    const response = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        ...(opts.headers ?? {}),
      },
      body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
    });
    const data = await parseResponse(response);
    if (!response.ok) return apiError(response.status, data);
    return data;
  } catch (error) {
    return {
      error: 'Error calling Salesforce API',
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export function sfGet(credentials: string, path: string, opts: SfOptions = {}): Promise<unknown> {
  return request(credentials, 'GET', path, opts);
}

export function sfPost(credentials: string, path: string, opts: SfOptions = {}): Promise<unknown> {
  return request(credentials, 'POST', path, opts);
}

export function sfPut(credentials: string, path: string, opts: SfOptions = {}): Promise<unknown> {
  return request(credentials, 'PUT', path, opts);
}

export function sfPatch(credentials: string, path: string, opts: SfOptions = {}): Promise<unknown> {
  return request(credentials, 'PATCH', path, opts);
}

export function sfDelete(
  credentials: string,
  path: string,
  opts: SfOptions = {},
): Promise<unknown> {
  return request(credentials, 'DELETE', path, opts);
}

/** HEAD request returning status code and headers (no body). */
export async function sfHead(
  credentials: string,
  path: string,
  opts: SfOptions = {},
): Promise<unknown> {
  try {
    const { instanceUrl, accessToken } = parseSfCredentials(credentials);
    const url = resolveUrl(instanceUrl, path) + buildQuery(opts.query);
    const response = await fetch(url, {
      method: 'HEAD',
      headers: { Authorization: `Bearer ${accessToken}`, ...(opts.headers ?? {}) },
    });
    const headers: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });
    return { statusCode: response.status, headers };
  } catch (error) {
    return {
      error: 'Error calling Salesforce API',
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/** Raw body upload (e.g. Bulk API CSV batches). */
export async function sfRaw(
  credentials: string,
  method: string,
  path: string,
  body: string,
  contentType: string,
): Promise<unknown> {
  try {
    const { instanceUrl, accessToken } = parseSfCredentials(credentials);
    const response = await fetch(resolveUrl(instanceUrl, path), {
      method,
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': contentType },
      body,
    });
    const data = await parseResponse(response);
    if (!response.ok) return apiError(response.status, data);
    return { success: true, statusCode: response.status };
  } catch (error) {
    return {
      error: 'Error uploading to Salesforce API',
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/** Bulk API CSV results endpoints: returns text plus pagination headers. */
export async function sfCsv(
  credentials: string,
  path: string,
  opts: { locator?: string; maxRecords?: number } = {},
): Promise<unknown> {
  try {
    const { instanceUrl, accessToken } = parseSfCredentials(credentials);
    const query: Record<string, unknown> = {};
    if (opts.locator) query.locator = opts.locator;
    if (opts.maxRecords) query.maxRecords = opts.maxRecords;
    const response = await fetch(resolveUrl(instanceUrl, path) + buildQuery(query), {
      method: 'GET',
      headers: { Authorization: `Bearer ${accessToken}`, Accept: 'text/csv' },
    });
    const csvData = await response.text();
    if (!response.ok) {
      let details: unknown = csvData;
      try {
        details = csvData ? JSON.parse(csvData) : null;
      } catch {
        /* keep text */
      }
      return apiError(response.status, details);
    }
    return {
      csvData,
      sforceLocator: response.headers.get('sforce-locator') ?? undefined,
      sforceNumberOfRecords: response.headers.get('sforce-numberofrecords')
        ? Number(response.headers.get('sforce-numberofrecords'))
        : undefined,
    };
  } catch (error) {
    return {
      error: 'Error calling Salesforce API',
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/** Escape a string for embedding in a SOQL string literal. */
export function soqlEscape(value: string): string {
  return String(value).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}
