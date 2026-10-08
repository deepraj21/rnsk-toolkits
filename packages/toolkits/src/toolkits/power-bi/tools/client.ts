// @ts-nocheck
// Power BI REST API — https://learn.microsoft.com/en-us/rest/api/power-bi/

export const POWER_BI_API_ROOT = 'https://api.powerbi.com/v1.0/myorg';

export interface PowerBiCredentials {
  tenantId?: string;
  clientId?: string;
  clientSecret?: string;
  accessToken?: string;
}

export interface PowerBiResponse {
  ok: boolean;
  status: number;
  data: unknown;
}

interface CachedToken {
  token: string;
  expiresAt: number;
}

const tokenCache = new Map<string, CachedToken>();

export const POWER_BI_CONNECT_ERROR =
  'Power BI credentials are required. Connect with JSON {"tenantId":"...","clientId":"...","clientSecret":"..."} for a service principal, or {"accessToken":"..."} for a bearer token.';

export function parsePowerBiCredentials(
  powerBiCredentials: string | undefined,
): PowerBiCredentials {
  if (!powerBiCredentials) {
    throw new Error(POWER_BI_CONNECT_ERROR);
  }
  let parsed: Partial<PowerBiCredentials>;
  try {
    parsed = JSON.parse(powerBiCredentials);
  } catch {
    throw new Error(
      'Power BI credentials must be valid JSON with service principal fields or accessToken',
    );
  }
  if (parsed.accessToken) {
    return { accessToken: String(parsed.accessToken).trim() };
  }
  if (!parsed.tenantId || !parsed.clientId || !parsed.clientSecret) {
    throw new Error(
      'Power BI credentials must include accessToken, or tenantId + clientId + clientSecret',
    );
  }
  return {
    tenantId: String(parsed.tenantId).trim(),
    clientId: String(parsed.clientId).trim(),
    clientSecret: String(parsed.clientSecret).trim(),
  };
}

async function fetchPowerBiToken(
  creds: PowerBiCredentials,
): Promise<{ token: string; expiresIn: number }> {
  const url = `https://login.microsoftonline.com/${encodeURIComponent(creds.tenantId!)}/oauth2/v2.0/token`;
  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: creds.clientId!,
    client_secret: creds.clientSecret!,
    scope: 'https://analysis.windows.net/powerbi/api/.default',
  });
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(`Failed to acquire Power BI token: ${response.status} ${JSON.stringify(data)}`);
  }
  if (!data.access_token) {
    throw new Error('Entra ID token response did not include access_token');
  }
  const expiresIn =
    typeof data.expires_in === 'string' ? parseInt(data.expires_in, 10) : (data.expires_in ?? 3600);
  return { token: data.access_token, expiresIn };
}

export async function getPowerBiToken(powerBiCredentials: string | undefined): Promise<string> {
  const creds = parsePowerBiCredentials(powerBiCredentials);
  if (creds.accessToken) return creds.accessToken;
  const cacheKey = `${creds.tenantId}:${creds.clientId}`;
  const cached = tokenCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now() + 60_000) return cached.token;
  const { token, expiresIn } = await fetchPowerBiToken(creds);
  tokenCache.set(cacheKey, { token, expiresAt: Date.now() + expiresIn * 1000 });
  return token;
}

function appendQuery(url: URL, query?: Record<string, unknown>) {
  if (!query) return;
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === '') continue;
    url.searchParams.set(key, String(value));
  }
}

export async function powerBiRequest(
  powerBiCredentials: string | undefined,
  path: string,
  options?: {
    method?: string;
    query?: Record<string, unknown>;
    body?: unknown;
  },
): Promise<PowerBiResponse> {
  let token: string;
  try {
    token = await getPowerBiToken(powerBiCredentials);
  } catch (error) {
    return {
      ok: false,
      status: 401,
      data: { error: error instanceof Error ? error.message : POWER_BI_CONNECT_ERROR },
    };
  }

  const suffix = path.startsWith('/') ? path : `/${path}`;
  const url = new URL(`${POWER_BI_API_ROOT}${suffix}`);
  appendQuery(url, options?.query);

  const headers: Record<string, string> = {
    Accept: 'application/json',
    Authorization: `Bearer ${token}`,
  };
  const method = options?.method ?? 'GET';
  const fetchOptions: RequestInit = { method, headers };

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
    return { ok: response.ok, status: response.status, data };
  } catch (error) {
    return {
      ok: false,
      status: 502,
      data: { error: error instanceof Error ? error.message : 'Power BI request failed' },
    };
  }
}

export function failedResult(action: string, result: PowerBiResponse) {
  return { error: action, statusCode: result.status, details: result.data };
}

export function toPowerBiError(error: unknown, action: string) {
  return { error: action, message: error instanceof Error ? error.message : 'Unknown error' };
}
