// @ts-nocheck
// Shared helpers for the Redis toolkit (Redis Cloud REST API).
// Endpoint paths verified against the bundled Redis Cloud OpenAPI spec
// (redis-developer/redis-cloud-rs tests/fixtures/cloud_openapi.json, 99 paths)
// and the Redis Cloud API docs (redis.io/docs/latest/operate/rc/api/).
//   Base: https://api.redislabs.com/v1
//   Auth: x-api-key (account key) + x-api-secret-key (user key) headers.

export interface RedisCredentials {
  accountKey?: string;
  apiKey?: string;
  secretKey?: string;
  apiSecretKey?: string;
}

export function parseRedisCredentials(redisCredentials: string): RedisCredentials {
  let parsed: RedisCredentials;
  try {
    parsed = JSON.parse(redisCredentials) as RedisCredentials;
  } catch {
    throw new Error(
      'Redis credentials must be JSON like {"accountKey":"...","secretKey":"..."} (Redis Cloud account key + user secret key)',
    );
  }
  return parsed ?? {};
}

export interface RedisResponse {
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

/** Call the Redis Cloud REST API. */
export async function redisRequest(
  redisCredentials: string,
  path: string,
  options?: {
    method?: string;
    query?: Record<string, unknown>;
    body?: unknown;
  },
): Promise<RedisResponse> {
  let credentials: RedisCredentials;
  try {
    credentials = parseRedisCredentials(redisCredentials);
  } catch (error) {
    return {
      ok: false,
      status: 400,
      data: { error: error instanceof Error ? error.message : 'Invalid Redis credentials' },
    };
  }
  const accountKey = credentials.accountKey ?? credentials.apiKey;
  const secretKey = credentials.secretKey ?? credentials.apiSecretKey;
  if (!accountKey || !secretKey) {
    return {
      ok: false,
      status: 401,
      data: {
        error:
          'Redis Cloud API keys are required. Connect Redis first: {"accountKey":"...","secretKey":"..."} (Access Management > API Keys in Redis Cloud; the API must be enabled).',
      },
    };
  }
  const url = new URL(`https://api.redislabs.com/v1${path.startsWith('/') ? path : `/${path}`}`);
  appendQuery(url, options?.query);
  const headers: Record<string, string> = {
    Accept: 'application/json',
    'x-api-key': accountKey,
    'x-api-secret-key': secretKey,
  };
  const fetchOptions: RequestInit = { method: options?.method ?? 'GET', headers };
  if (options?.body !== undefined) {
    fetchOptions.body = JSON.stringify(options.body);
    headers['Content-Type'] = 'application/json';
  }
  try {
    const response = await fetch(url.toString(), fetchOptions);
    const data = await response.json().catch(() => null);
    return { ok: response.ok, status: response.status, data };
  } catch (error) {
    return {
      ok: false,
      status: 502,
      data: { error: error instanceof Error ? error.message : 'Redis Cloud request failed' },
    };
  }
}

export function failedResult(action: string, result: RedisResponse) {
  return {
    error: action,
    statusCode: result.status,
    details: result.data,
  };
}

export function toRedisError(error: unknown, action: string) {
  return {
    error: action,
    message: error instanceof Error ? error.message : 'Unknown error',
  };
}
