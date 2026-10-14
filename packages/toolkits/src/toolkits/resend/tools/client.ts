// @ts-nocheck
// Resend API — https://resend.com/docs/api-reference

export const RESEND_API_BASE = 'https://api.resend.com';

export interface ResendResponse {
  ok: boolean;
  status: number;
  data: unknown;
}

export const RESEND_CONNECT_ERROR =
  'Resend API key is required. Connect Resend with your re_... key from Resend Dashboard > API Keys.';

export function missingResendKey() {
  return { error: RESEND_CONNECT_ERROR };
}

function appendQuery(url: URL, query?: Record<string, unknown>) {
  if (!query) return;
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === '') continue;
    url.searchParams.set(key, String(value));
  }
}

export async function resendRequest(
  resendApiKey: string | undefined,
  path: string,
  options?: {
    method?: string;
    query?: Record<string, unknown>;
    body?: unknown;
  },
): Promise<ResendResponse> {
  if (!resendApiKey?.trim()) {
    return { ok: false, status: 401, data: { error: RESEND_CONNECT_ERROR } };
  }

  const suffix = path.startsWith('/') ? path : `/${path}`;
  const url = new URL(`${RESEND_API_BASE}${suffix}`);
  appendQuery(url, options?.query);

  const headers: Record<string, string> = {
    Authorization: `Bearer ${resendApiKey.trim()}`,
    Accept: 'application/json',
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
      data: { error: error instanceof Error ? error.message : 'Resend request failed' },
    };
  }
}

export function failedResult(action: string, result: ResendResponse) {
  return { error: action, statusCode: result.status, details: result.data };
}

export function toResendError(error: unknown, action: string) {
  return { error: action, message: error instanceof Error ? error.message : 'Unknown error' };
}
