// @ts-nocheck
const BASE_URL = 'https://api.linkedin.com';
const LINKEDIN_VERSION = '202509';

export class LinkedInApiError extends Error {
  status: number;
  details: unknown;
  constructor(message: string, status: number, details: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

function appendQuery(url: URL, query?: Record<string, string | number | boolean | undefined>) {
  if (!query) return;
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined) continue;
    url.searchParams.set(key, String(value));
  }
}

export interface LinkedInRequestOptions {
  query?: Record<string, string | number | boolean | undefined>;
  body?: unknown;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
}

/**
 * Shared LinkedIn API caller.
 * - `path` starting with `/rest/` uses the versioned API (Linkedin-Version header).
 * - `path` starting with `/v2/` uses the legacy unversioned API.
 * Every call sends `Authorization: Bearer <token>` + `X-Restli-Protocol-Version: 2.0.0`.
 */
export async function linkedInRequest(
  linkedinToken: string,
  path: string,
  options?: LinkedInRequestOptions,
): Promise<any> {
  const method = options?.method ?? (options?.body !== undefined ? 'POST' : 'GET');
  const url = new URL(`${BASE_URL}${path}`);
  appendQuery(url, options?.query);
  const headers: Record<string, string> = {
    Authorization: `Bearer ${linkedinToken}`,
    'X-Restli-Protocol-Version': '2.0.0',
  };
  if (path.startsWith('/rest/')) headers['Linkedin-Version'] = LINKEDIN_VERSION;
  if (options?.body !== undefined) headers['Content-Type'] = 'application/json';
  const response = await fetch(url.toString(), {
    method,
    headers,
    body: options?.body !== undefined ? JSON.stringify(options.body) : undefined,
  });
  const text = await response.text();
  let data: any = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }
  if (!response.ok) {
    throw new LinkedInApiError(
      'LinkedIn API request failed',
      response.status,
      (data as any)?.message ?? data,
    );
  }
  return data;
}

export function toLinkedInError(error: unknown, label: string) {
  if ((error as any)?.details !== undefined) {
    return { error: label, details: (error as any).details };
  }
  return {
    error: label.replace('Failed', 'Error').replace('failed', 'error'),
    message: error instanceof Error ? error.message : 'Unknown error',
  };
}

export function missingToken() {
  return { error: 'LinkedIn access token is required. Connect LinkedIn first.' };
}

export function normalizeUrn(value: string, prefix: string) {
  const trimmed = value.trim();
  if (trimmed.startsWith('urn:li:')) return trimmed;
  return `urn:li:${prefix}:${trimmed}`;
}
