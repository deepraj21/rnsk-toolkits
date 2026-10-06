// @ts-nocheck
// Shared HTTP helper for the Intercom REST API v2.
// Paths/methods verified against the official spec
// (intercom/Intercom-OpenAPI descriptions/2.16, docs default 2.16).

export const DEFAULT_BASE_URL = 'https://api.intercom.io';
export const API_VERSION = '2.16';

export interface IntercomCredentials {
  accessToken: string;
  baseUrl: string;
}

export function parseIntercomCredentials(intercomCredentials: string): IntercomCredentials {
  let parsed: Partial<IntercomCredentials>;
  try {
    parsed = JSON.parse(intercomCredentials) as Partial<IntercomCredentials>;
  } catch {
    throw new Error('Intercom credentials must be JSON like {"accessToken":"..."}');
  }
  if (!parsed.accessToken) {
    throw new Error(
      'Intercom credentials must include accessToken, e.g. {"accessToken":"..."} (create one in the Intercom Developer Hub). EU workspaces can add "baseUrl":"https://api.eu.intercom.io".',
    );
  }
  return {
    accessToken: parsed.accessToken,
    baseUrl: (parsed.baseUrl ?? DEFAULT_BASE_URL).replace(/\/+$/, ''),
  };
}

export interface IntercomResponse {
  ok: boolean;
  status: number;
  data: any;
}

function appendQuery(url: URL, query?: Record<string, string | number | boolean | undefined>) {
  if (!query) return;
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined) continue;
    url.searchParams.set(key, String(value));
  }
}

const SNAKE_KEEP = new Set([
  'customAttributes',
  'custom_attributes',
  'ticketAttributes',
  'ticket_attributes',
  'metadata',
  'translatedContent',
  'translated_content',
]);

function snakeKey(key: string): string {
  return key.replace(/([A-Z])/g, (c) => `_${c.toLowerCase()}`);
}

/** Deep-convert camelCase keys to snake_case, leaving user-defined payloads untouched. */
export function toApiBody(value: any, keep = false): any {
  if (Array.isArray(value)) return value.map((v) => toApiBody(v, keep));
  if (value && typeof value === 'object') {
    const out: Record<string, any> = {};
    for (const [key, val] of Object.entries(value)) {
      const childKeep = keep || SNAKE_KEEP.has(key);
      out[keep ? key : snakeKey(key)] = toApiBody(val, childKeep);
    }
    return out;
  }
  return value;
}

export function toApiQuery(query?: Record<string, string | number | boolean | undefined>) {
  if (!query) return undefined;
  const out: Record<string, string | number | boolean | undefined> = {};
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined) continue;
    out[snakeKey(key)] = value;
  }
  return out;
}

/** Search queries accept a JSON string or an object. */
export function parseQuery(query: string | Record<string, any>): Record<string, any> {
  if (typeof query === 'object') return query;
  try {
    const parsed = JSON.parse(query);
    if (parsed && typeof parsed === 'object') return parsed;
  } catch {
    // fall through to error below
  }
  throw new Error('Search query must be a JSON object or JSON string');
}

export async function intercomRequest(
  intercomCredentials: string,
  path: string,
  options?: {
    method?: string;
    query?: Record<string, string | number | boolean | undefined>;
    body?: unknown;
    acceptOctetStream?: boolean;
  },
): Promise<IntercomResponse> {
  let credentials: IntercomCredentials;
  try {
    credentials = parseIntercomCredentials(intercomCredentials);
  } catch (error) {
    return {
      ok: false,
      status: 400,
      data: { error: error instanceof Error ? error.message : 'Invalid Intercom credentials' },
    };
  }
  const url = new URL(`${credentials.baseUrl}${path.startsWith('/') ? path : `/${path}`}`);
  appendQuery(url, toApiQuery(options?.query));
  const headers: Record<string, string> = {
    Accept: options?.acceptOctetStream ? 'application/octet-stream' : 'application/json',
    Authorization: `Bearer ${credentials.accessToken}`,
    'Intercom-Version': API_VERSION,
  };
  const fetchOptions: RequestInit = { method: options?.method ?? 'GET', headers };
  if (options?.body !== undefined) {
    fetchOptions.body = JSON.stringify(toApiBody(options.body));
    headers['Content-Type'] = 'application/json';
  }
  const response = await fetch(url.toString(), fetchOptions);
  const contentType = response.headers.get('content-type') ?? '';
  if (options?.acceptOctetStream) {
    const bytes = Buffer.from(await response.arrayBuffer().catch(() => new ArrayBuffer(0)));
    if (!response.ok) {
      const preview = bytes.subarray(0, 2000).toString('utf8');
      let details: any = { raw: preview };
      try {
        details = preview ? JSON.parse(preview) : {};
      } catch {
        // keep raw preview
      }
      return { ok: false, status: response.status, data: details };
    }
    return {
      ok: true,
      status: response.status,
      data: {
        contentType: contentType || 'application/octet-stream',
        sizeBytes: bytes.length,
        contentBase64: bytes.toString('base64'),
      },
    };
  }
  if (options?.acceptOctetStream || !contentType.includes('json')) {
    const text = await response.text().catch(() => '');
    let data: any = text;
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      // keep raw text (e.g. transcripts, file downloads)
    }
    return { ok: response.ok, status: response.status, data };
  }
  const data = await response.json().catch(() => null);
  return { ok: response.ok, status: response.status, data };
}

export function failedResult(action: string, result: IntercomResponse) {
  return {
    error: action,
    statusCode: result.status,
    details: result.data,
  };
}

export function toIntercomError(error: unknown, action: string) {
  return {
    error: action,
    message: error instanceof Error ? error.message : 'Unknown error',
  };
}
