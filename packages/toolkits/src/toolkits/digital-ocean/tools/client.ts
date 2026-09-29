// @ts-nocheck
const BASE_URL = 'https://api.digitalocean.com/v2';

export class DigitalOceanApiError extends Error {
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

export async function digitalOceanRequest(
  digitalOceanApiKey: string,
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  path: string,
  options?: {
    query?: Record<string, string | number | boolean | undefined>;
    body?: unknown;
  },
): Promise<any> {
  const url = new URL(`${BASE_URL}${path}`);
  appendQuery(url, options?.query);
  const headers: Record<string, string> = { Authorization: `Bearer ${digitalOceanApiKey}` };
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
    throw new DigitalOceanApiError(
      'DigitalOcean API request failed',
      response.status,
      (data as any)?.message ?? data,
    );
  }
  return data;
}

export function toDigitalOceanError(error: unknown, label: string) {
  if ((error as any)?.details !== undefined) {
    return { error: label, details: (error as any).details };
  }
  return {
    error: label.replace('Failed', 'Error').replace('failed', 'error'),
    message: error instanceof Error ? error.message : 'Unknown error',
  };
}

export function missingKey() {
  return { error: 'DigitalOcean API key is required. Connect DigitalOcean first.' };
}
