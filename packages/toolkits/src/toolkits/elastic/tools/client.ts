// @ts-nocheck
// Shared helpers for the Elastic toolkit (Elasticsearch REST API).
// Endpoint paths verified against the Elasticsearch REST API reference
// (elastic.co/docs/reference/elasticsearch/rest-apis and API docs):
//   Base: {baseUrl} (e.g. http://localhost:9200 or Elastic Cloud URL)
//   Auth: ApiKey <key>, Basic user:password, or Bearer token.

export interface ElasticCredentials {
  baseUrl?: string;
  host?: string;
  apiKey?: string;
  username?: string;
  password?: string;
  bearerToken?: string;
}

export function parseElasticCredentials(elasticCredentials: string): ElasticCredentials {
  let parsed: ElasticCredentials;
  try {
    parsed = JSON.parse(elasticCredentials) as ElasticCredentials;
  } catch {
    throw new Error(
      'Elastic credentials must be JSON like {"baseUrl":"http://localhost:9200","apiKey":"..."} or {"baseUrl":"...","username":"elastic","password":"..."}',
    );
  }
  return parsed ?? {};
}

export function elasticHost(credentials: ElasticCredentials): string {
  const raw = (credentials.baseUrl ?? credentials.host ?? '').trim().replace(/\/+$/, '');
  if (!raw) {
    throw new Error(
      'Elastic credentials must include baseUrl, e.g. {"baseUrl":"http://localhost:9200","apiKey":"..."} (your Elasticsearch URL or Elastic Cloud endpoint).',
    );
  }
  return /^https?:\/\//i.test(raw) ? raw : `http://${raw}`;
}

export interface ElasticResponse {
  ok: boolean;
  status: number;
  data: any;
}

function appendQuery(url: URL, query?: Record<string, unknown>) {
  if (!query) return;
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null) continue;
    if (Array.isArray(value)) {
      url.searchParams.set(key, value.map(String).join(','));
      continue;
    }
    url.searchParams.set(key, String(value));
  }
}

/** Call the Elasticsearch REST API. */
export async function elasticRequest(
  elasticCredentials: string,
  path: string,
  options?: {
    method?: string;
    query?: Record<string, unknown>;
    body?: unknown;
    rawBody?: string;
    contentType?: string;
  },
): Promise<ElasticResponse> {
  let credentials: ElasticCredentials;
  try {
    credentials = parseElasticCredentials(elasticCredentials);
  } catch (error) {
    return {
      ok: false,
      status: 400,
      data: { error: error instanceof Error ? error.message : 'Invalid Elastic credentials' },
    };
  }
  let host: string;
  try {
    host = elasticHost(credentials);
  } catch (error) {
    return {
      ok: false,
      status: 400,
      data: { error: error instanceof Error ? error.message : 'Invalid Elastic host' },
    };
  }
  let auth: string;
  if (credentials.apiKey) {
    auth = `ApiKey ${credentials.apiKey}`;
  } else if (credentials.username && credentials.password) {
    auth = `Basic ${Buffer.from(`${credentials.username}:${credentials.password}`).toString('base64')}`;
  } else if (credentials.bearerToken) {
    auth = `Bearer ${credentials.bearerToken}`;
  } else {
    return {
      ok: false,
      status: 401,
      data: {
        error:
          'Elastic credentials are required. Connect Elastic first: {"baseUrl":"...","apiKey":"..."} (Stack Management > API Keys), {"baseUrl":"...","username":"...","password":"..."}, or {"baseUrl":"...","bearerToken":"..."} (service token).',
      },
    };
  }
  const url = new URL(`${host}${path.startsWith('/') ? path : `/${path}`}`);
  appendQuery(url, options?.query);
  const headers: Record<string, string> = { Accept: 'application/json', Authorization: auth };
  const fetchOptions: RequestInit = { method: options?.method ?? 'GET', headers };
  if (options?.rawBody !== undefined) {
    fetchOptions.body = options.rawBody;
    headers['Content-Type'] = options.contentType ?? 'application/x-ndjson';
  } else if (options?.body !== undefined) {
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
      data: { error: error instanceof Error ? error.message : 'Elastic request failed' },
    };
  }
}

/** Serialize action objects to NDJSON for _bulk / _msearch. */
export function toNdjson(objects: Array<Record<string, unknown>>): string {
  return objects.map((o) => JSON.stringify(o)).join('\n') + '\n';
}

export function failedResult(action: string, result: ElasticResponse) {
  return {
    error: action,
    statusCode: result.status,
    details: result.data,
  };
}

export function toElasticError(error: unknown, action: string) {
  return {
    error: action,
    message: error instanceof Error ? error.message : 'Unknown error',
  };
}
