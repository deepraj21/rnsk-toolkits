// @ts-nocheck
// PayPal REST API — https://developer.paypal.com/api/rest/

export type PayPalEnvironment = 'sandbox' | 'live';

export interface PayPalCredentials {
  clientId?: string;
  clientSecret?: string;
  environment?: PayPalEnvironment;
  accessToken?: string;
}

export interface PayPalResponse {
  ok: boolean;
  status: number;
  data: unknown;
}

interface CachedToken {
  token: string;
  expiresAt: number;
}

const tokenCache = new Map<string, CachedToken>();

export const PAYPAL_CONNECT_ERROR =
  'PayPal credentials are required. Connect with JSON {"clientId":"...","clientSecret":"...","environment":"sandbox"} or {"accessToken":"..."}.';

export function paypalApiBase(environment: PayPalEnvironment = 'sandbox'): string {
  return environment === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';
}

export function parsePayPalCredentials(
  paypalCredentials: string | undefined,
): PayPalCredentials & { environment: PayPalEnvironment } {
  if (!paypalCredentials) {
    throw new Error(PAYPAL_CONNECT_ERROR);
  }
  let parsed: Partial<PayPalCredentials>;
  try {
    parsed = JSON.parse(paypalCredentials);
  } catch {
    throw new Error(
      'PayPal credentials must be valid JSON with clientId/clientSecret or accessToken',
    );
  }
  const environment: PayPalEnvironment = parsed.environment === 'live' ? 'live' : 'sandbox';
  if (parsed.accessToken) {
    return { accessToken: String(parsed.accessToken).trim(), environment };
  }
  if (!parsed.clientId || !parsed.clientSecret) {
    throw new Error('PayPal credentials must include accessToken, or clientId + clientSecret');
  }
  return {
    clientId: String(parsed.clientId).trim(),
    clientSecret: String(parsed.clientSecret).trim(),
    environment,
  };
}

async function fetchPayPalToken(
  creds: PayPalCredentials & { environment: PayPalEnvironment },
): Promise<{
  token: string;
  expiresIn: number;
}> {
  const base = paypalApiBase(creds.environment);
  const auth = Buffer.from(`${creds.clientId}:${creds.clientSecret}`, 'utf-8').toString('base64');
  const response = await fetch(`${base}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body: 'grant_type=client_credentials',
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(`Failed to acquire PayPal token: ${response.status} ${JSON.stringify(data)}`);
  }
  if (!data.access_token) {
    throw new Error('PayPal token response did not include access_token');
  }
  const expiresIn =
    typeof data.expires_in === 'string' ? parseInt(data.expires_in, 10) : (data.expires_in ?? 3600);
  return { token: data.access_token, expiresIn };
}

export async function getPayPalToken(
  paypalCredentials: string | undefined,
): Promise<{ token: string; environment: PayPalEnvironment }> {
  const creds = parsePayPalCredentials(paypalCredentials);
  if (creds.accessToken) {
    return { token: creds.accessToken, environment: creds.environment };
  }
  const cacheKey = `${creds.environment}:${creds.clientId}`;
  const cached = tokenCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now() + 60_000) {
    return { token: cached.token, environment: creds.environment };
  }
  const { token, expiresIn } = await fetchPayPalToken(creds);
  tokenCache.set(cacheKey, { token, expiresAt: Date.now() + expiresIn * 1000 });
  return { token, environment: creds.environment };
}

function appendQuery(url: URL, query?: Record<string, unknown>) {
  if (!query) return;
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === '') continue;
    url.searchParams.set(key, String(value));
  }
}

export async function paypalRequest(
  paypalCredentials: string | undefined,
  path: string,
  options?: {
    method?: string;
    query?: Record<string, unknown>;
    body?: unknown;
    preferRepresentation?: boolean;
  },
): Promise<PayPalResponse> {
  let token: string;
  let environment: PayPalEnvironment;
  try {
    ({ token, environment } = await getPayPalToken(paypalCredentials));
  } catch (error) {
    return {
      ok: false,
      status: 401,
      data: { error: error instanceof Error ? error.message : PAYPAL_CONNECT_ERROR },
    };
  }

  const base = paypalApiBase(environment);
  const suffix = path.startsWith('/') ? path : `/${path}`;
  const url = new URL(`${base}${suffix}`);
  appendQuery(url, options?.query);

  const headers: Record<string, string> = {
    Accept: 'application/json',
    Authorization: `Bearer ${token}`,
  };
  if (options?.preferRepresentation) {
    headers.Prefer = 'return=representation';
  }

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
      data: { error: error instanceof Error ? error.message : 'PayPal request failed' },
    };
  }
}

export function failedResult(action: string, result: PayPalResponse) {
  return { error: action, statusCode: result.status, details: result.data };
}

export function toPayPalError(error: unknown, action: string) {
  return { error: action, message: error instanceof Error ? error.message : 'Unknown error' };
}
