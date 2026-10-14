// @ts-nocheck
// Stripe API — https://stripe.com/docs/api

export const STRIPE_API_BASE = 'https://api.stripe.com/v1';

export interface StripeCredentials {
  secretKey: string;
  connectAccountId?: string;
}

export interface StripeResponse {
  ok: boolean;
  status: number;
  data: unknown;
}

export const STRIPE_CONNECT_ERROR =
  'Stripe credentials are required. Connect with JSON {"secretKey":"sk_test_..."} from Developers > API keys. Optional connectAccountId for Stripe Connect.';

export function parseStripeCredentials(stripeCredentials: string | undefined): StripeCredentials {
  if (!stripeCredentials) {
    throw new Error(STRIPE_CONNECT_ERROR);
  }
  let parsed: Partial<StripeCredentials>;
  try {
    parsed = JSON.parse(stripeCredentials);
  } catch {
    if (stripeCredentials.startsWith('sk_')) {
      return { secretKey: stripeCredentials.trim() };
    }
    throw new Error(
      'Stripe credentials must be JSON {"secretKey":"sk_..."} or a raw secret key string',
    );
  }
  if (!parsed.secretKey) {
    throw new Error('Stripe credentials must include secretKey');
  }
  return {
    secretKey: String(parsed.secretKey).trim(),
    connectAccountId: parsed.connectAccountId ? String(parsed.connectAccountId).trim() : undefined,
  };
}

export function appendFormValue(params: URLSearchParams, key: string, value: unknown): void {
  if (value === undefined || value === null) return;
  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      if (item !== null && typeof item === 'object') {
        appendFormObject(params, item as Record<string, unknown>, `${key}[${index}]`);
      } else {
        params.append(`${key}[${index}]`, String(item));
      }
    });
    return;
  }
  if (typeof value === 'object') {
    appendFormObject(params, value as Record<string, unknown>, key);
    return;
  }
  params.append(key, String(value));
}

export function appendFormObject(
  params: URLSearchParams,
  data: Record<string, unknown>,
  prefix?: string,
): void {
  for (const [key, value] of Object.entries(data)) {
    const fullKey = prefix ? `${prefix}[${key}]` : key;
    appendFormValue(params, fullKey, value);
  }
}

function appendQuery(params: URLSearchParams, query?: Record<string, unknown>) {
  if (!query) return;
  appendFormObject(params, query);
}

export async function stripeRequest(
  stripeCredentials: string | undefined,
  path: string,
  options?: {
    method?: string;
    query?: Record<string, unknown>;
    body?: Record<string, unknown>;
    idempotencyKey?: string;
  },
): Promise<StripeResponse> {
  let creds: StripeCredentials;
  try {
    creds = parseStripeCredentials(stripeCredentials);
  } catch (error) {
    return {
      ok: false,
      status: 401,
      data: { error: error instanceof Error ? error.message : STRIPE_CONNECT_ERROR },
    };
  }

  const suffix = path.startsWith('/') ? path : `/${path}`;
  const url = new URL(`${STRIPE_API_BASE}${suffix}`);
  if (options?.query) {
    const qs = new URLSearchParams();
    appendQuery(qs, options.query);
    const q = qs.toString();
    if (q) url.search = q;
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${creds.secretKey}`,
    Accept: 'application/json',
  };
  if (creds.connectAccountId) {
    headers['Stripe-Account'] = creds.connectAccountId;
  }
  if (options?.idempotencyKey) {
    headers['Idempotency-Key'] = options.idempotencyKey;
  }

  const method = options?.method ?? 'GET';
  const fetchOptions: RequestInit = { method, headers };

  if (options?.body !== undefined) {
    const form = new URLSearchParams();
    appendFormObject(form, options.body);
    fetchOptions.body = form.toString();
    headers['Content-Type'] = 'application/x-www-form-urlencoded';
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
      data: { error: error instanceof Error ? error.message : 'Stripe request failed' },
    };
  }
}

export function failedResult(action: string, result: StripeResponse) {
  return { error: action, statusCode: result.status, details: result.data };
}

export function toStripeError(error: unknown, action: string) {
  return { error: action, message: error instanceof Error ? error.message : 'Unknown error' };
}
