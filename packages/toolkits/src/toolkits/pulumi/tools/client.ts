// @ts-nocheck
// Shared helpers for the Pulumi toolkit (Pulumi Cloud REST API).
// Endpoint paths verified against the official OpenAPI spec
// (api.pulumi.com/api/openapi/pulumi-spec.json, 479 paths):
//   Base: https://api.pulumi.com
//   Auth: Authorization: Bearer <PULUMI_ACCESS_TOKEN>

export interface PulumiResponse {
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

/** Call the Pulumi Cloud REST API. */
export async function pulumiRequest(
  pulumiAccessToken: string | undefined,
  path: string,
  options?: {
    method?: string;
    query?: Record<string, unknown>;
    body?: unknown;
  },
): Promise<PulumiResponse> {
  if (!pulumiAccessToken) {
    return {
      ok: false,
      status: 401,
      data: {
        error:
          'Pulumi access token is required. Connect Pulumi first with a PULUMI_ACCESS_TOKEN (Pulumi Cloud > Settings > Access Tokens).',
      },
    };
  }
  const url = new URL(`https://api.pulumi.com${path.startsWith('/') ? path : `/${path}`}`);
  appendQuery(url, options?.query);
  const headers: Record<string, string> = {
    Accept: 'application/json',
    Authorization: `Bearer ${pulumiAccessToken}`,
  };
  const fetchOptions: RequestInit = { method: options?.method ?? 'GET', headers };
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
      data: { error: error instanceof Error ? error.message : 'Pulumi request failed' },
    };
  }
}

export function failedResult(action: string, result: PulumiResponse) {
  return {
    error: action,
    statusCode: result.status,
    details: result.data,
  };
}

export function toPulumiError(error: unknown, action: string) {
  return {
    error: action,
    message: error instanceof Error ? error.message : 'Unknown error',
  };
}
