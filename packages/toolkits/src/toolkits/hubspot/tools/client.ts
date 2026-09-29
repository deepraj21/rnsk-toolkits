const API_BASE = 'https://api.hubapi.com';

export interface HubOptions {
  query?: Record<string, unknown>;
  body?: unknown;
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
  return { error: `HubSpot API error ${status}`, details: data };
}

async function request(
  token: string,
  method: string,
  path: string,
  opts: HubOptions = {},
): Promise<unknown> {
  try {
    const url = `${API_BASE}${path}` + buildQuery(opts.query);
    const response = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
    });
    const data = await parseResponse(response);
    if (!response.ok) return apiError(response.status, data);
    return data;
  } catch (error) {
    return {
      error: 'Error calling HubSpot API',
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export function hubGet(token: string, path: string, opts: HubOptions = {}): Promise<unknown> {
  return request(token, 'GET', path, opts);
}

export function hubPost(token: string, path: string, opts: HubOptions = {}): Promise<unknown> {
  return request(token, 'POST', path, opts);
}

export function hubPut(token: string, path: string, opts: HubOptions = {}): Promise<unknown> {
  return request(token, 'PUT', path, opts);
}

export function hubPatch(token: string, path: string, opts: HubOptions = {}): Promise<unknown> {
  return request(token, 'PATCH', path, opts);
}

export function hubDelete(token: string, path: string, opts: HubOptions = {}): Promise<unknown> {
  return request(token, 'DELETE', path, opts);
}

/** Multipart upload (e.g. CRM imports). */
export async function hubMultipart(token: string, path: string, form: FormData): Promise<unknown> {
  try {
    const response = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });
    const data = await parseResponse(response);
    if (!response.ok) return apiError(response.status, data);
    return data;
  } catch (error) {
    return {
      error: 'Error uploading to HubSpot API',
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/** Drop undefined values from an object. */
export function pickDefined<T extends Record<string, unknown>>(obj: T): Partial<T> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) out[key] = value;
  }
  return out as Partial<T>;
}

/** Omit the given keys from an object. */
export function stripKeys<T extends Record<string, unknown>>(
  obj: T,
  keys: string[],
): Record<string, unknown> {
  const drop = new Set(keys);
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (!drop.has(key)) out[key] = value;
  }
  return out;
}

/** Rename keys via a camelCase -> wire-name map. */
export function mapKeys(
  obj: Record<string, unknown>,
  map: Record<string, string>,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    out[map[key] ?? key] = value;
  }
  return out;
}

/** Expand double-underscore flat fields (from__fromName) into nested objects. */
export function unflattenDeep(obj: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    const parts = key.split('__');
    let node = out;
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (typeof node[part] !== 'object' || node[part] === null) node[part] = {};
      node = node[part] as Record<string, unknown>;
    }
    node[parts[parts.length - 1]] = value;
  }
  return out;
}

export interface SearchInput {
  query?: unknown;
  filterGroups?: unknown;
  sorts?: unknown;
  properties?: unknown;
  limit?: unknown;
  after?: unknown;
  customProperties?: Record<string, unknown>;
}

/** Build a CRM search body; customProperties become extra EQ filters. */
export function searchBody(input: SearchInput): Record<string, unknown> {
  const { customProperties, ...rest } = input;
  const body = pickDefined(rest) as Record<string, unknown>;
  if (customProperties && typeof customProperties === 'object') {
    const extra = Object.entries(customProperties)
      .filter(([, v]) => v !== undefined && v !== null && v !== '')
      .map(([propertyName, value]) => ({ propertyName, operator: 'EQ', value: String(value) }));
    if (extra.length) {
      const groups = Array.isArray(body.filterGroups) ? [...body.filterGroups] : [];
      groups.push({ filters: extra });
      body.filterGroups = groups;
    }
  }
  return body;
}

/**
 * Build a `{ properties, associations? }` body from flat tool input.
 * `map` translates camelCase input keys back to HubSpot property names.
 * `customProperties` is merged in; `associations` passes through.
 */
export function flatProps(
  input: Record<string, unknown>,
  map: Record<string, string>,
): { properties: Record<string, unknown>; associations?: unknown } {
  const properties: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input)) {
    if (value === undefined) continue;
    if (key === 'hubspotToken' || key === 'associations' || key === 'customProperties') continue;
    properties[map[key] ?? key] = value;
  }
  const custom = input.customProperties;
  if (custom && typeof custom === 'object') Object.assign(properties, custom);
  const out: { properties: Record<string, unknown>; associations?: unknown } = { properties };
  if (input.associations !== undefined) out.associations = input.associations;
  return out;
}
