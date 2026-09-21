// @ts-nocheck
const BASE_URL = 'https://dev.to/api';
const ACCEPT = 'application/vnd.forem.api-v1+json';

export class DevToApiError extends Error {
  status: number;
  details: unknown;
  constructor(message: string, status: number, details: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export function appendQuery(url: URL, query?: Record<string, unknown>) {
  if (!query) return;
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null) continue;
    url.searchParams.set(key, String(value));
  }
}

export async function devToRequest(
  devToApiKey: string | undefined,
  method: 'GET' | 'POST' | 'PUT',
  path: string,
  options?: {
    query?: Record<string, unknown>;
    body?: unknown;
  },
): Promise<any> {
  const url = new URL(`${BASE_URL}${path}`);
  appendQuery(url, options?.query);
  const headers: Record<string, string> = { Accept: ACCEPT };
  if (devToApiKey) {
    headers['api-key'] = devToApiKey;
  }
  if (options?.body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }
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
    throw new DevToApiError('DEV API request failed', response.status, data);
  }
  return data;
}

export function toDevToError(error: unknown, label: string) {
  if (error instanceof DevToApiError) {
    return { error: label, details: error.details, statusCode: error.status };
  }
  return {
    error: label.replace('Failed', 'Error').replace('failed', 'error'),
    message: error instanceof Error ? error.message : 'Unknown error',
  };
}

export function requireApiKey(devToApiKey: string | undefined) {
  if (!devToApiKey) {
    return { error: 'DEV API key is required. Connect DEV first.' };
  }
  return null;
}
