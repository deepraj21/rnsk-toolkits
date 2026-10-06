// @ts-nocheck
// Shared HTTP helper for the WhatsApp Business Platform (Meta Graph API).
// Endpoints verified against Meta docs (developers.facebook.com) — Cloud API,
// Business Management API, Groups API, Flows API, and Graph API reference.

export const DEFAULT_API_VERSION = 'v26.0';
const BASE_URL = 'https://graph.facebook.com';

export interface WhatsAppCredentials {
  accessToken: string;
  wabaId?: string;
  apiVersion: string;
}

export function parseWhatsAppCredentials(whatsappCredentials: string): WhatsAppCredentials {
  let parsed: Partial<WhatsAppCredentials>;
  try {
    parsed = JSON.parse(whatsappCredentials) as Partial<WhatsAppCredentials>;
  } catch {
    throw new Error('WhatsApp credentials must be JSON like {"accessToken":"..."}');
  }
  if (!parsed.accessToken) {
    throw new Error(
      'WhatsApp credentials must include accessToken, e.g. {"accessToken":"...","wabaId":"..."} (system user token from the Meta App Dashboard; add wabaId to skip passing it per call).',
    );
  }
  return {
    accessToken: parsed.accessToken,
    ...(parsed.wabaId ? { wabaId: parsed.wabaId } : {}),
    apiVersion: (parsed.apiVersion ?? DEFAULT_API_VERSION).replace(/^v?/, 'v'),
  };
}

export function resolveWabaHelper(
  whatsappCredentials: string,
  wabaId?: string,
): { id?: string; error?: unknown } {
  let credentials: WhatsAppCredentials;
  try {
    credentials = parseWhatsAppCredentials(whatsappCredentials);
  } catch (error) {
    return {
      error: { error: error instanceof Error ? error.message : 'Invalid WhatsApp credentials' },
    };
  }
  return resolveWabaId(credentials, wabaId);
}

export function resolveWabaId(
  credentials: WhatsAppCredentials,
  wabaId?: string,
): { id?: string; error?: unknown } {
  const id = wabaId ?? credentials.wabaId;
  if (!id) {
    return {
      error: {
        error: 'WABA ID is required. Pass wabaId or set it in WhatsApp credentials.',
      },
    };
  }
  return { id };
}

export interface WhatsAppResponse {
  ok: boolean;
  status: number;
  data: any;
}

function appendQuery(url: URL, query?: Record<string, string | number | boolean | undefined>) {
  if (!query) return;
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined) continue;
    url.searchParams.set(key, String(value));
  }
}

export async function whatsappRequest(
  whatsappCredentials: string,
  path: string,
  options?: {
    method?: string;
    query?: Record<string, string | number | boolean | undefined>;
    body?: unknown;
    form?: FormData;
  },
): Promise<WhatsAppResponse> {
  let credentials: WhatsAppCredentials;
  try {
    credentials = parseWhatsAppCredentials(whatsappCredentials);
  } catch (error) {
    return {
      ok: false,
      status: 400,
      data: { error: error instanceof Error ? error.message : 'Invalid WhatsApp credentials' },
    };
  }
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  const url = new URL(`${BASE_URL}/${credentials.apiVersion}${cleanPath}`);
  appendQuery(url, options?.query);
  const headers: Record<string, string> = {
    Accept: 'application/json',
    Authorization: `Bearer ${credentials.accessToken}`,
  };
  const fetchOptions: RequestInit = { method: options?.method ?? 'GET', headers };
  if (options?.form) {
    fetchOptions.body = options.form;
  } else if (options?.body !== undefined) {
    fetchOptions.body = JSON.stringify(options.body);
    headers['Content-Type'] = 'application/json';
  }
  const response = await fetch(url.toString(), fetchOptions);
  const data = await response.json().catch(() => null);
  return { ok: response.ok, status: response.status, data };
}

export function failedResult(action: string, result: WhatsAppResponse) {
  return {
    error: action,
    statusCode: result.status,
    details: result.data,
  };
}

export function toWhatsAppError(error: unknown, action: string) {
  return {
    error: action,
    message: error instanceof Error ? error.message : 'Unknown error',
  };
}
