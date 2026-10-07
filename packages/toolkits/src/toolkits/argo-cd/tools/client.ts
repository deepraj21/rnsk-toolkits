// @ts-nocheck
// Shared helpers for the Argo CD toolkit.
// Endpoint paths verified against the Argo CD Swagger spec
// (argoproj/argo-cd assets/swagger.json, 82 paths):
//   Base: {serverUrl}/api/v1/...
//   Auth: Authorization: Bearer <JWT> — mint via POST /api/v1/session
//         {username, password}, or supply a token (account/project token).

export interface ArgoCdCredentials {
  baseUrl?: string;
  serverUrl?: string;
  token?: string;
  username?: string;
  password?: string;
}

export function parseArgoCdCredentials(argoCdCredentials: string): ArgoCdCredentials {
  let parsed: ArgoCdCredentials;
  try {
    parsed = JSON.parse(argoCdCredentials) as ArgoCdCredentials;
  } catch {
    throw new Error(
      'Argo CD credentials must be JSON like {"baseUrl":"https://argocd.example.com:8080","token":"..."} or {"baseUrl":"...","username":"admin","password":"..."}',
    );
  }
  return parsed ?? {};
}

export function argoCdServer(credentials: ArgoCdCredentials): string {
  const raw = (credentials.baseUrl ?? credentials.serverUrl ?? '').trim().replace(/\/+$/, '');
  if (!raw) {
    throw new Error(
      'Argo CD credentials must include baseUrl, e.g. {"baseUrl":"https://argocd.example.com:8080","token":"..."} (your argocd-server URL).',
    );
  }
  return /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
}

export interface ArgoCdResponse {
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

async function fetchArgoCd(
  server: string,
  path: string,
  token: string,
  options?: { method?: string; query?: Record<string, unknown>; body?: unknown },
): Promise<ArgoCdResponse> {
  const url = new URL(`${server}/api/v1${path.startsWith('/') ? path : `/${path}`}`);
  appendQuery(url, options?.query);
  const headers: Record<string, string> = {
    Accept: 'application/json',
    Authorization: `Bearer ${token}`,
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
      data: { error: error instanceof Error ? error.message : 'Argo CD request failed' },
    };
  }
}

/** Resolve a Bearer token: direct token, or mint via username+password login. */
async function resolveToken(
  server: string,
  credentials: ArgoCdCredentials,
): Promise<{ token?: string; error?: ArgoCdResponse }> {
  if (credentials.token) return { token: credentials.token };
  if (credentials.username && credentials.password) {
    const url = `${server}/api/v1/session`;
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: credentials.username, password: credentials.password }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.token) {
        return {
          error: {
            ok: false,
            status: response.status,
            data: {
              error:
                'Argo CD login failed. Check username/password (local accounts only via /session).',
              details: data,
            },
          },
        };
      }
      return { token: data.token as string };
    } catch (error) {
      return {
        error: {
          ok: false,
          status: 502,
          data: { error: error instanceof Error ? error.message : 'Argo CD login failed' },
        },
      };
    }
  }
  return {
    error: {
      ok: false,
      status: 401,
      data: {
        error:
          'Argo CD credentials are required. Connect Argo CD first: {"baseUrl":"https://argocd.example.com:8080","token":"..."} (account/project token) or {"baseUrl":"...","username":"admin","password":"..."} (local account login).',
      },
    },
  };
}

/** Call the Argo CD REST API. */
export async function argoCdRequest(
  argoCdCredentials: string,
  path: string,
  options?: { method?: string; query?: Record<string, unknown>; body?: unknown },
): Promise<ArgoCdResponse> {
  let credentials: ArgoCdCredentials;
  try {
    credentials = parseArgoCdCredentials(argoCdCredentials);
  } catch (error) {
    return {
      ok: false,
      status: 400,
      data: { error: error instanceof Error ? error.message : 'Invalid Argo CD credentials' },
    };
  }
  let server: string;
  try {
    server = argoCdServer(credentials);
  } catch (error) {
    return {
      ok: false,
      status: 400,
      data: { error: error instanceof Error ? error.message : 'Invalid Argo CD server URL' },
    };
  }
  const resolved = await resolveToken(server, credentials);
  if (resolved.error) return resolved.error;
  return fetchArgoCd(server, path, resolved.token as string, options);
}

export function failedResult(action: string, result: ArgoCdResponse) {
  return {
    error: action,
    statusCode: result.status,
    details: result.data,
  };
}

export function toArgoCdError(error: unknown, action: string) {
  return {
    error: action,
    message: error instanceof Error ? error.message : 'Unknown error',
  };
}
