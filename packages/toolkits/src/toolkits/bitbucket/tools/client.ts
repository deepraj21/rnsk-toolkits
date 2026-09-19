// @ts-nocheck
const BASE_URL = 'https://api.bitbucket.org/2.0';

export class BitbucketApiError extends Error {
  status: number;
  details: unknown;
  constructor(message: string, status: number, details: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

/** Encode a single path segment. */
export function enc(value: string | number): string {
  return encodeURIComponent(String(value));
}

/** Encode a path that may itself contain slashes (file paths, branch names, revspecs). */
export function encPath(value: string | number): string {
  return String(value)
    .split('/')
    .map((seg) => encodeURIComponent(seg))
    .join('/');
}

export function appendQuery(url: URL, query?: Record<string, unknown>) {
  if (!query) return;
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null) continue;
    url.searchParams.set(key, String(value));
  }
}

export async function bbRequest(
  bitbucketToken: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  path: string,
  options?: {
    query?: Record<string, unknown>;
    body?: unknown;
    accept?: string;
  },
): Promise<any> {
  const url = new URL(`${BASE_URL}${path}`);
  appendQuery(url, options?.query);
  const headers: Record<string, string> = {
    Authorization: `Bearer ${bitbucketToken}`,
    Accept: options?.accept ?? 'application/json',
  };
  if (options?.body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }
  const response = await fetch(url.toString(), {
    method,
    headers,
    body: options?.body !== undefined ? JSON.stringify(options.body) : undefined,
  });
  if (response.status === 204) {
    return { success: true };
  }
  const contentType = response.headers.get('content-type') ?? '';
  const text = await response.text();
  let data: any = text;
  if (contentType.includes('application/json')) {
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { raw: text };
    }
  }
  if (!response.ok) {
    throw new BitbucketApiError('Bitbucket API request failed', response.status, data);
  }
  return data;
}

/** Normalize a milestone/component/version reference that may be a name (string) or id (number). */
export function nameOrIdRef(value: string | number | undefined) {
  if (value === undefined) return undefined;
  return typeof value === 'number' ? { id: value } : { name: value };
}

export function toBbError(error: unknown, label: string) {
  if (error instanceof BitbucketApiError) {
    return { error: label, details: error.details, statusCode: error.status };
  }
  return {
    error: label.replace('Failed', 'Error').replace('failed', 'error'),
    message: error instanceof Error ? error.message : 'Unknown error',
  };
}

export function requireToken(bitbucketToken: string | undefined) {
  if (!bitbucketToken) {
    return { error: 'Bitbucket token is required. Connect Bitbucket first.' };
  }
  return null;
}
