// @ts-nocheck
// Shopify Admin REST API — https://shopify.dev/docs/api/admin-rest

export const DEFAULT_SHOPIFY_API_VERSION = '2024-10';

export interface ShopifyCredentials {
  shop: string;
  accessToken: string;
  apiVersion?: string;
}

export interface ShopifyResponse {
  ok: boolean;
  status: number;
  data: unknown;
}

export const SHOPIFY_CONNECT_ERROR =
  'Shopify credentials are required. Connect with JSON {"shop":"your-store","accessToken":"shpat_..."} from Admin > Settings > Apps and sales channels > Develop apps.';

export function parseShopifyCredentials(
  shopifyCredentials: string | undefined,
): ShopifyCredentials {
  if (!shopifyCredentials) {
    throw new Error(SHOPIFY_CONNECT_ERROR);
  }
  let parsed: Partial<ShopifyCredentials>;
  try {
    parsed = JSON.parse(shopifyCredentials);
  } catch {
    throw new Error(
      'Shopify credentials must be valid JSON like {"shop":"my-store","accessToken":"shpat_..."}',
    );
  }
  if (!parsed.shop || !parsed.accessToken) {
    throw new Error('Shopify credentials must include shop and accessToken');
  }
  return {
    shop: normalizeShopHost(String(parsed.shop).trim()),
    accessToken: String(parsed.accessToken).trim(),
    apiVersion: parsed.apiVersion ? String(parsed.apiVersion).trim() : DEFAULT_SHOPIFY_API_VERSION,
  };
}

export function normalizeShopHost(shop: string): string {
  let host = shop.replace(/^https?:\/\//i, '').replace(/\/+$/, '');
  if (!host.includes('.')) {
    host = `${host}.myshopify.com`;
  }
  return host.toLowerCase();
}

export function adminBaseUrl(credentials: ShopifyCredentials): string {
  const version = credentials.apiVersion ?? DEFAULT_SHOPIFY_API_VERSION;
  return `https://${credentials.shop}/admin/api/${version}`;
}

function appendQuery(url: URL, query?: Record<string, unknown>) {
  if (!query) return;
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === '') continue;
    url.searchParams.set(key, String(value));
  }
}

export async function shopifyRequest(
  shopifyCredentials: string | undefined,
  path: string,
  options?: {
    method?: string;
    query?: Record<string, unknown>;
    body?: unknown;
  },
): Promise<ShopifyResponse> {
  let credentials: ShopifyCredentials;
  try {
    credentials = parseShopifyCredentials(shopifyCredentials);
  } catch (error) {
    return {
      ok: false,
      status: 401,
      data: { error: error instanceof Error ? error.message : SHOPIFY_CONNECT_ERROR },
    };
  }

  const base = adminBaseUrl(credentials);
  const suffix = path.startsWith('/') ? path : `/${path}`;
  const url = new URL(`${base}${suffix}`);
  appendQuery(url, options?.query);

  const headers: Record<string, string> = {
    Accept: 'application/json',
    'X-Shopify-Access-Token': credentials.accessToken,
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
      data: { error: error instanceof Error ? error.message : 'Shopify request failed' },
    };
  }
}

export function failedResult(action: string, result: ShopifyResponse) {
  return { error: action, statusCode: result.status, details: result.data };
}

export function toShopifyError(error: unknown, action: string) {
  return { error: action, message: error instanceof Error ? error.message : 'Unknown error' };
}
