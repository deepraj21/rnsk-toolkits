// @ts-nocheck
// Shared helpers for the Workday toolkit: OAuth2 token exchange for the REST
// APIs plus Basic/Bearer support for Report-as-a-Service (RaaS).
// URL patterns verified against Workday docs and community OpenAPI specs:
//   REST:  https://{host}/ccx/api/{service}/{tenant}
//   OAuth: https://{host}/ccx/oauth2/{tenant}/token (refresh_token grant)
//   RaaS:  https://{host}/ccx/service/customreport2/{tenant}/{owner}/{report}?format=json

export interface WorkdayCredentials {
  baseUrl?: string;
  tenant?: string;
  clientId?: string;
  clientSecret?: string;
  refreshToken?: string;
  accessToken?: string;
  username?: string;
  password?: string;
}

export function parseWorkdayCredentials(workdayCredentials: string): WorkdayCredentials {
  let parsed: WorkdayCredentials;
  try {
    parsed = JSON.parse(workdayCredentials) as WorkdayCredentials;
  } catch {
    throw new Error('Workday credentials must be JSON like {"baseUrl":"...","tenant":"..."}');
  }
  return parsed;
}

export function workdayHost(credentials: WorkdayCredentials): string {
  const host = (credentials.baseUrl ?? '').replace(/^https?:\/\//, '').replace(/\/+$/, '');
  if (!host) {
    throw new Error(
      'Workday credentials must include baseUrl, e.g. {"baseUrl":"wd2-impl-services1.workday.com","tenant":"mycompany",...} (your tenant data-center host).',
    );
  }
  return host;
}

export function workdayTenant(credentials: WorkdayCredentials): string {
  if (!credentials.tenant) {
    throw new Error('Workday credentials must include tenant, e.g. {"tenant":"mycompany",...}.');
  }
  return credentials.tenant;
}

async function fetchAccessToken(credentials: WorkdayCredentials): Promise<string> {
  if (credentials.accessToken) return credentials.accessToken;
  const { clientId, clientSecret, refreshToken } = credentials;
  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error(
      'Workday REST calls need OAuth credentials: register an API client in Workday and supply {"clientId":"...","clientSecret":"...","refreshToken":"..."} (non-expiring refresh token), or a ready {"accessToken":"..."}.',
    );
  }
  const host = workdayHost(credentials);
  const tenant = workdayTenant(credentials);
  const response = await fetch(`https://${host}/ccx/oauth2/${tenant}/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
    }).toString(),
  });
  const data = (await response.json().catch(() => null)) as any;
  if (!response.ok || !data?.access_token) {
    throw new Error(
      `Workday token exchange failed (HTTP ${response.status}): ${data?.error_description ?? data?.error ?? 'unknown error'}`,
    );
  }
  return data.access_token as string;
}

export interface WorkdayResponse {
  ok: boolean;
  status: number;
  data: any;
}

/** Call a versioned Workday REST service, e.g. service 'v1' or 'staffing/v1'. */
export async function workdayRest(
  workdayCredentials: string,
  service: string,
  path: string,
  options?: {
    method?: string;
    query?: Record<string, string | number | boolean | undefined>;
    body?: unknown;
  },
): Promise<WorkdayResponse> {
  let credentials: WorkdayCredentials;
  try {
    credentials = parseWorkdayCredentials(workdayCredentials);
  } catch (error) {
    return {
      ok: false,
      status: 400,
      data: { error: error instanceof Error ? error.message : 'Invalid Workday credentials' },
    };
  }
  let token: string;
  try {
    token = await fetchAccessToken(credentials);
    const host = workdayHost(credentials);
    const tenant = workdayTenant(credentials);
    const url = new URL(
      `https://${host}/ccx/api/${service}/${tenant}${path.startsWith('/') ? path : `/${path}`}`,
    );
    if (options?.query) {
      for (const [key, value] of Object.entries(options.query)) {
        if (value !== undefined) url.searchParams.set(key, String(value));
      }
    }
    const headers: Record<string, string> = {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    };
    const fetchOptions: RequestInit = { method: options?.method ?? 'GET', headers };
    if (options?.body !== undefined) {
      fetchOptions.body = JSON.stringify(options.body);
      headers['Content-Type'] = 'application/json';
    }
    const response = await fetch(url.toString(), fetchOptions);
    const data = await response.json().catch(() => null);
    return { ok: response.ok, status: response.status, data };
  } catch (error) {
    return {
      ok: false,
      status: 401,
      data: { error: error instanceof Error ? error.message : 'Workday authentication failed' },
    };
  }
}

/** Run a Workday custom report exposed as a web service (RaaS). */
export async function workdayReport(
  workdayCredentials: string,
  reportOwner: string,
  reportName: string,
  options?: {
    format?: string;
    prompts?: Record<string, string | number | boolean | undefined>;
  },
): Promise<WorkdayResponse> {
  let credentials: WorkdayCredentials;
  try {
    credentials = parseWorkdayCredentials(workdayCredentials);
  } catch (error) {
    return {
      ok: false,
      status: 400,
      data: { error: error instanceof Error ? error.message : 'Invalid Workday credentials' },
    };
  }
  let host: string;
  let tenant: string;
  try {
    host = workdayHost(credentials);
    tenant = workdayTenant(credentials);
  } catch (error) {
    return {
      ok: false,
      status: 400,
      data: { error: error instanceof Error ? error.message : 'Invalid Workday credentials' },
    };
  }
  const url = new URL(
    `https://${host}/ccx/service/customreport2/${tenant}/${reportOwner}/${reportName}`,
  );
  url.searchParams.set('format', options?.format ?? 'json');
  if (options?.prompts) {
    for (const [key, value] of Object.entries(options.prompts)) {
      if (value !== undefined) url.searchParams.set(key, String(value));
    }
  }
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (credentials.accessToken) {
    headers.Authorization = `Bearer ${credentials.accessToken}`;
  } else if (credentials.username && credentials.password) {
    headers.Authorization = `Basic ${Buffer.from(`${credentials.username}:${credentials.password}`).toString('base64')}`;
  } else {
    return {
      ok: false,
      status: 401,
      data: {
        error:
          'Workday report calls need {"username":"...","password":"..."} (report ISU Basic auth) or {"accessToken":"..."}.',
      },
    };
  }
  try {
    const response = await fetch(url.toString(), { headers });
    const contentType = response.headers.get('content-type') ?? '';
    const data = contentType.includes('json')
      ? await response.json().catch(() => null)
      : await response.text().catch(() => '');
    return { ok: response.ok, status: response.status, data };
  } catch (error) {
    return {
      ok: false,
      status: 502,
      data: { error: error instanceof Error ? error.message : 'Workday report request failed' },
    };
  }
}

export function failedResult(action: string, result: WorkdayResponse) {
  return {
    error: action,
    statusCode: result.status,
    details: result.data,
  };
}

export function toWorkdayError(error: unknown, action: string) {
  return {
    error: action,
    message: error instanceof Error ? error.message : 'Unknown error',
  };
}
