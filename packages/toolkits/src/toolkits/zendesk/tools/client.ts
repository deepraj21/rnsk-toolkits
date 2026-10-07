// @ts-nocheck
// Shared helpers for the Zendesk toolkit (Support API v2).
// Endpoint paths verified against Zendesk developer docs
// (developer.zendesk.com/api-reference/ticketing/...):
//   Base: https://{subdomain}.zendesk.com/api/v2
//   Auth: Basic with "{email}/token:{api_token}", or Bearer OAuth token.

export interface ZendeskCredentials {
  subdomain?: string;
  baseUrl?: string;
  email?: string;
  apiToken?: string;
  accessToken?: string;
}

export function parseZendeskCredentials(zendeskCredentials: string): ZendeskCredentials {
  let parsed: ZendeskCredentials;
  try {
    parsed = JSON.parse(zendeskCredentials) as ZendeskCredentials;
  } catch {
    throw new Error(
      'Zendesk credentials must be JSON like {"subdomain":"mycompany","email":"agent@company.com","apiToken":"..."}',
    );
  }
  return parsed ?? {};
}

export function zendeskBaseUrl(credentials: ZendeskCredentials): string {
  const raw = (credentials.baseUrl ?? '').trim().replace(/\/+$/, '');
  if (raw) return /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
  const subdomain = (credentials.subdomain ?? '').trim();
  if (!subdomain) {
    throw new Error(
      'Zendesk credentials must include subdomain, e.g. {"subdomain":"mycompany","email":"...","apiToken":"..."} (from mycompany.zendesk.com).',
    );
  }
  return `https://${subdomain}.zendesk.com`;
}

export interface ZendeskResponse {
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

/** Call the Zendesk Support API v2. */
export async function zendeskRequest(
  zendeskCredentials: string,
  path: string,
  options?: {
    method?: string;
    query?: Record<string, unknown>;
    body?: unknown;
    rawBody?: Buffer;
    contentType?: string;
  },
): Promise<ZendeskResponse> {
  let credentials: ZendeskCredentials;
  try {
    credentials = parseZendeskCredentials(zendeskCredentials);
  } catch (error) {
    return {
      ok: false,
      status: 400,
      data: { error: error instanceof Error ? error.message : 'Invalid Zendesk credentials' },
    };
  }
  let base: string;
  try {
    base = zendeskBaseUrl(credentials);
  } catch (error) {
    return {
      ok: false,
      status: 400,
      data: { error: error instanceof Error ? error.message : 'Invalid Zendesk subdomain' },
    };
  }
  let auth: string;
  if (credentials.accessToken) {
    auth = `Bearer ${credentials.accessToken}`;
  } else if (credentials.email && credentials.apiToken) {
    auth = `Basic ${Buffer.from(`${credentials.email}/token:${credentials.apiToken}`).toString('base64')}`;
  } else {
    return {
      ok: false,
      status: 401,
      data: {
        error:
          'Zendesk credentials are required. Connect Zendesk first: {"subdomain":"...","email":"...","apiToken":"..."} (Admin Center > Apps and integrations > API) or {"subdomain":"...","accessToken":"..."} for OAuth.',
      },
    };
  }
  const url = new URL(`${base}/api/v2${path.startsWith('/') ? path : `/${path}`}`);
  appendQuery(url, options?.query);
  const headers: Record<string, string> = { Accept: 'application/json', Authorization: auth };
  const fetchOptions: RequestInit = { method: options?.method ?? 'GET', headers };
  if (options?.rawBody !== undefined) {
    fetchOptions.body = options.rawBody as any;
    headers['Content-Type'] = options.contentType ?? 'application/octet-stream';
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
      data: { error: error instanceof Error ? error.message : 'Zendesk request failed' },
    };
  }
}

export function failedResult(action: string, result: ZendeskResponse) {
  return {
    error: action,
    statusCode: result.status,
    details: result.data,
  };
}

export function toZendeskError(error: unknown, action: string) {
  return {
    error: action,
    message: error instanceof Error ? error.message : 'Unknown error',
  };
}
