// @ts-nocheck
// Okta Management API — https://developer.okta.com/docs/reference/core-okta-api/
// Base: https://{oktaDomain}/api/v1
// Auth: Authorization: SSWS {apiToken}

export interface OktaCredentials {
  oktaDomain: string;
  apiToken: string;
}

export interface OktaResponse {
  ok: boolean;
  status: number;
  data: unknown;
  headers: Record<string, string>;
}

export const OKTA_CONNECT_ERROR =
  'Okta credentials are required. Connect Okta with JSON {"oktaDomain":"your-org.okta.com","apiToken":"..."} from Security > API > Tokens (least-privilege custom admin role recommended).';

export function parseOktaCredentials(oktaCredentials: string | undefined): OktaCredentials {
  if (!oktaCredentials) {
    throw new Error(OKTA_CONNECT_ERROR);
  }
  let parsed: Partial<OktaCredentials>;
  try {
    parsed = JSON.parse(oktaCredentials);
  } catch {
    throw new Error(
      'Okta credentials must be valid JSON like {"oktaDomain":"dev-123456.okta.com","apiToken":"00..."}',
    );
  }
  if (!parsed.oktaDomain || !parsed.apiToken) {
    throw new Error('Okta credentials must include oktaDomain and apiToken');
  }
  return {
    oktaDomain: String(parsed.oktaDomain).trim(),
    apiToken: String(parsed.apiToken).trim(),
  };
}

export function oktaApiBase(credentials: OktaCredentials): string {
  let host = credentials.oktaDomain.replace(/\/+$/, '');
  if (!/^https?:\/\//i.test(host)) {
    host = `https://${host}`;
  }
  host = host.replace(/\/api\/v1\/?$/i, '');
  return `${host}/api/v1`;
}

function appendQuery(url: URL, query?: Record<string, unknown>) {
  if (!query) return;
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null) continue;
    url.searchParams.set(key, String(value));
  }
}

export async function oktaRequest(
  oktaCredentials: string | undefined,
  path: string,
  options?: {
    method?: string;
    query?: Record<string, unknown>;
    body?: unknown;
  },
): Promise<OktaResponse> {
  let credentials: OktaCredentials;
  try {
    credentials = parseOktaCredentials(oktaCredentials);
  } catch (error) {
    return {
      ok: false,
      status: 401,
      data: { error: error instanceof Error ? error.message : OKTA_CONNECT_ERROR },
      headers: {},
    };
  }

  const url = new URL(`${oktaApiBase(credentials)}${path.startsWith('/') ? path : `/${path}`}`);
  appendQuery(url, options?.query);

  const headers: Record<string, string> = {
    Accept: 'application/json',
    Authorization: `SSWS ${credentials.apiToken}`,
  };
  const fetchOptions: RequestInit = { method: options?.method ?? 'GET', headers };
  if (options?.body !== undefined) {
    fetchOptions.body = JSON.stringify(options.body);
    headers['Content-Type'] = 'application/json';
  }

  try {
    const response = await fetch(url.toString(), fetchOptions);
    const raw = await response.text();
    let data: unknown = null;
    if (raw) {
      try {
        data = JSON.parse(raw);
      } catch {
        data = raw;
      }
    }
    return {
      ok: response.ok,
      status: response.status,
      data,
      headers: Object.fromEntries(response.headers.entries()),
    };
  } catch (error) {
    return {
      ok: false,
      status: 502,
      data: { error: error instanceof Error ? error.message : 'Okta request failed' },
      headers: {},
    };
  }
}

export function failedResult(action: string, result: OktaResponse) {
  return {
    error: action,
    statusCode: result.status,
    details: result.data,
  };
}

export function toOktaError(error: unknown, action: string) {
  return {
    error: action,
    message: error instanceof Error ? error.message : 'Unknown error',
  };
}
