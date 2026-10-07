// @ts-nocheck
// Shared helpers for the RabbitMQ toolkit (Management HTTP API).
// Endpoint paths verified against the RabbitMQ management HTTP API reference
// (rabbitmq.com/docs/management) and community SDK coverage tables:
//   Base: {managementUrl}/api/...
//   Auth: HTTP Basic (username:password), default port 15672.

export interface RabbitmqCredentials {
  baseUrl?: string;
  managementUrl?: string;
  username?: string;
  password?: string;
}

export function parseRabbitmqCredentials(rabbitmqCredentials: string): RabbitmqCredentials {
  let parsed: RabbitmqCredentials;
  try {
    parsed = JSON.parse(rabbitmqCredentials) as RabbitmqCredentials;
  } catch {
    throw new Error(
      'RabbitMQ credentials must be JSON like {"baseUrl":"http://localhost:15672","username":"guest","password":"guest"}',
    );
  }
  return parsed ?? {};
}

export function rabbitmqBaseUrl(credentials: RabbitmqCredentials): string {
  const raw = (credentials.baseUrl ?? credentials.managementUrl ?? '').trim().replace(/\/+$/, '');
  if (!raw) {
    throw new Error(
      'RabbitMQ credentials must include baseUrl, e.g. {"baseUrl":"http://localhost:15672","username":"...","password":"..."} (management plugin URL, default port 15672).',
    );
  }
  return /^https?:\/\//i.test(raw) ? raw : `http://${raw}`;
}

/** Encode a single path segment (vhost "/" becomes %2F). */
export function seg(value: string | number): string {
  return encodeURIComponent(String(value));
}

export interface RabbitmqResponse {
  ok: boolean;
  status: number;
  data: any;
}

function appendQuery(url: URL, query?: Record<string, unknown>) {
  if (!query) return;
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null) continue;
    url.searchParams.set(key, String(value));
  }
}

async function readBody(response: Response): Promise<any> {
  const contentType = response.headers.get('content-type') ?? '';
  if (contentType.includes('json')) return response.json().catch(() => null);
  const text = await response.text().catch(() => '');
  return text === '' ? null : text;
}

/** Call the RabbitMQ Management HTTP API. Path segments must be pre-encoded via seg(). */
export async function rabbitmqRequest(
  rabbitmqCredentials: string,
  path: string,
  options?: {
    method?: string;
    query?: Record<string, unknown>;
    headers?: Record<string, string>;
    body?: unknown;
  },
): Promise<RabbitmqResponse> {
  let credentials: RabbitmqCredentials;
  try {
    credentials = parseRabbitmqCredentials(rabbitmqCredentials);
  } catch (error) {
    return {
      ok: false,
      status: 400,
      data: { error: error instanceof Error ? error.message : 'Invalid RabbitMQ credentials' },
    };
  }
  if (!credentials.username) {
    return {
      ok: false,
      status: 401,
      data: {
        error:
          'RabbitMQ credentials are required. Connect RabbitMQ first: {"baseUrl":"http://host:15672","username":"...","password":"..."} (management plugin user).',
      },
    };
  }
  let base: string;
  try {
    base = rabbitmqBaseUrl(credentials);
  } catch (error) {
    return {
      ok: false,
      status: 400,
      data: { error: error instanceof Error ? error.message : 'Invalid RabbitMQ base URL' },
    };
  }
  const url = new URL(`${base}/api${path.startsWith('/') ? path : `/${path}`}`);
  appendQuery(url, options?.query);
  const headers: Record<string, string> = {
    Accept: 'application/json',
    Authorization: `Basic ${Buffer.from(`${credentials.username}:${credentials.password ?? ''}`).toString('base64')}`,
    ...(options?.headers ?? {}),
  };
  const fetchOptions: RequestInit = { method: options?.method ?? 'GET', headers };
  if (options?.body !== undefined) {
    fetchOptions.body = JSON.stringify(options.body);
    headers['Content-Type'] = 'application/json';
  }
  try {
    const response = await fetch(url.toString(), fetchOptions);
    return { ok: response.ok, status: response.status, data: await readBody(response) };
  } catch (error) {
    return {
      ok: false,
      status: 502,
      data: { error: error instanceof Error ? error.message : 'RabbitMQ request failed' },
    };
  }
}

export function failedResult(action: string, result: RabbitmqResponse) {
  return {
    error: action,
    statusCode: result.status,
    details: result.data,
  };
}

export function toRabbitmqError(error: unknown, action: string) {
  return {
    error: action,
    message: error instanceof Error ? error.message : 'Unknown error',
  };
}
