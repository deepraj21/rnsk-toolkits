// @ts-nocheck
// Shared helpers for the OneNote toolkit (Microsoft Graph v1.0 OneNote APIs).
// Endpoint paths verified against Microsoft Graph v1.0 reference
// (learn.microsoft.com/en-us/graph/api/resources/onenote-api-overview,
// onenote-get-content, onenote-update-page).
//   Base: https://graph.microsoft.com/v1.0/{me|users/{id}}/onenote
//   Auth: Authorization: Bearer <delegated user token>

export interface OneNoteResponse {
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
  onenoteToken: string | undefined,
  path: string,
  options?: {
    method?: string;
    query?: Record<string, unknown>;
    headers?: Record<string, string>;
    body?: unknown;
    rawBody?: string;
  },
): Promise<OneNoteResponse> {
  if (!onenoteToken) {
    return {
      ok: false,
      status: 401,
      data: {
        error:
          'OneNote token is required. Connect OneNote first via Microsoft sign-in (delegated Notes permissions).',
      },
    };
  }
  const url = new URL(
    `https://graph.microsoft.com/v1.0${path.startsWith('/') ? path : `/${path}`}`,
  );
  appendQuery(url, options?.query);
  const headers: Record<string, string> = {
    Accept: 'application/json',
    Authorization: `Bearer ${onenoteToken}`,
    ...(options?.headers ?? {}),
  };
  const fetchOptions: RequestInit = { method: options?.method ?? 'GET', headers };
  if (options?.rawBody !== undefined) {
    fetchOptions.body = options.rawBody;
    headers['Content-Type'] = 'text/html';
  } else if (options?.body !== undefined) {
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
      data: { error: error instanceof Error ? error.message : 'OneNote request failed' },
    };
  }
}

/** /me/onenote or /users/{owner}/onenote base for user notebook calls. */
export function onenoteBase(owner?: string): string {
  if (owner && owner !== 'me') return `/users/${owner}/onenote`;
  return '/me/onenote';
}

export function failedResult(action: string, result: OneNoteResponse) {
  return {
    error: action,
    statusCode: result.status,
    details: result.data,
  };
}

export function toOneNoteError(error: unknown, action: string) {
  return {
    error: action,
    message: error instanceof Error ? error.message : 'Unknown error',
  };
}
