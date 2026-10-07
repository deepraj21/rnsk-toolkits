// @ts-nocheck
// Shared helpers for the Teams toolkit (Microsoft Graph v1.0 Teams APIs).
// Endpoint paths verified against Microsoft Graph v1.0 reference
// (learn.microsoft.com/en-us/graph/api/resources/teams-api-overview).
//   Base: https://graph.microsoft.com/v1.0
//   Auth: Authorization: Bearer <delegated user token>

export interface TeamsResponse {
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
  teamsToken: string | undefined,
  path: string,
  options?: {
    method?: string;
    query?: Record<string, unknown>;
    headers?: Record<string, string>;
    body?: unknown;
  },
): Promise<TeamsResponse> {
  if (!teamsToken) {
    return {
      ok: false,
      status: 401,
      data: {
        error:
          'Teams token is required. Connect Teams first via Microsoft sign-in (delegated Team/Channel/Chat/Meeting permissions).',
      },
    };
  }
  const url = new URL(
    `https://graph.microsoft.com/v1.0${path.startsWith('/') ? path : `/${path}`}`,
  );
  appendQuery(url, options?.query);
  const headers: Record<string, string> = {
    Accept: 'application/json',
    Authorization: `Bearer ${teamsToken}`,
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
      data: { error: error instanceof Error ? error.message : 'Teams request failed' },
    };
  }
}

export function failedResult(action: string, result: TeamsResponse) {
  return {
    error: action,
    statusCode: result.status,
    details: result.data,
  };
}

export function toTeamsError(error: unknown, action: string) {
  return {
    error: action,
    message: error instanceof Error ? error.message : 'Unknown error',
  };
}
