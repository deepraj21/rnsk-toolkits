// @ts-nocheck
// Shared helpers for the Outlook toolkit (Microsoft Graph v1.0 Outlook APIs).
// Endpoint paths verified against Microsoft Graph v1.0 reference
// (learn.microsoft.com/en-us/graph/api/overview, Outlook mail/calendar).
//   Base: https://graph.microsoft.com/v1.0
//   Auth: Authorization: Bearer <delegated user token>

export interface OutlookResponse {
  ok: boolean;
  status: number;
  data: any;
}

function appendQuery(url: URL, query?: Record<string, unknown>) {
  if (!query) return;
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null) continue;
    url.searchParams.set(key, String(value));
  }
}

async function readBody(response: Response): Promise<any> {
  const contentType = response.headers.get('content-type') ?? '';
  if (contentType.includes('json')) return response.json().catch(() => null);
  const text = await response.text().catch(() => '');
  return text === '' ? null : text;
}

/** Call Microsoft Graph. Returns an envelope — never throws for auth errors. */
export async function graphRequest(
  outlookToken: string | undefined,
  path: string,
  options?: {
    method?: string;
    query?: Record<string, unknown>;
    headers?: Record<string, string>;
    body?: unknown;
  },
): Promise<OutlookResponse> {
  if (!outlookToken) {
    return {
      ok: false,
      status: 401,
      data: {
        error:
          'Outlook token is required. Connect Outlook first via Microsoft sign-in (delegated Mail/Calendars/Contacts permissions).',
      },
    };
  }
  const url = new URL(
    `https://graph.microsoft.com/v1.0${path.startsWith('/') ? path : `/${path}`}`,
  );
  appendQuery(url, options?.query);
  const headers: Record<string, string> = {
    Accept: 'application/json',
    Authorization: `Bearer ${outlookToken}`,
    ...(options?.headers ?? {}),
  };
  const fetchOptions: RequestInit = { method: options?.method ?? 'GET', headers };
  if (options?.body !== undefined) {
    fetchOptions.body = JSON.stringify(options.body);
    headers['Content-Type'] = 'application/json';
  }
  try {
    const response = await fetch(url.toString(), fetchOptions);
    return { ok: response.ok, status: response.status, data: await readBody(response) };
  } catch (error) {
    return {
      ok: false,
      status: 502,
      data: { error: error instanceof Error ? error.message : 'Outlook request failed' },
    };
  }
}

/** /me or /users/{mailbox} prefix for mailbox-scoped calls (shared mailboxes). */
export function mailboxBase(mailbox?: string): string {
  if (mailbox && mailbox !== 'me') return `/users/${mailbox}`;
  return '/me';
}

export function failedResult(action: string, result: OutlookResponse) {
  return {
    error: action,
    statusCode: result.status,
    details: result.data,
  };
}

export function toOutlookError(error: unknown, action: string) {
  return {
    error: action,
    message: error instanceof Error ? error.message : 'Unknown error',
  };
}
