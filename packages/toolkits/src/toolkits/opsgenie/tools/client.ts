// @ts-nocheck
// Shared helpers for the Opsgenie toolkit.
// Endpoint paths verified against the Opsgenie REST docs (docs.opsgenie.com),
// the official Python SDK docs, and the MelianLabs opsgenie_v2 client map:
//   US: https://api.opsgenie.com | EU: https://api.eu.opsgenie.com
//   Auth: Authorization: GenieKey <api-key>
// Alert/incident create+delete+actions are async (202 + requestId) — poll the
// request-status endpoints.

export type OpsgenieRegion = 'us' | 'eu';

export interface OpsgenieResponse {
  ok: boolean;
  status: number;
  data: any;
}

export function opsgenieBase(region?: string): string {
  return region === 'eu' ? 'https://api.eu.opsgenie.com' : 'https://api.opsgenie.com';
}

function appendQuery(url: URL, query?: Record<string, unknown>) {
  if (!query) return;
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null) continue;
    if (Array.isArray(value)) {
      for (const item of value) {
        if (item !== undefined && item !== null) url.searchParams.append(key, String(item));
      }
      continue;
    }
    url.searchParams.set(key, String(value));
  }
}

/** Call the Opsgenie REST API. */
export async function opsgenieRequest(
  opsgenieApiKey: string | undefined,
  path: string,
  options?: {
    method?: string;
    query?: Record<string, unknown>;
    body?: unknown;
    region?: string;
  },
): Promise<OpsgenieResponse> {
  if (!opsgenieApiKey) {
    return {
      ok: false,
      status: 401,
      data: {
        error:
          'Opsgenie API key is required. Connect Opsgenie first with an API integration key (Teams > Integrations > API). Use region eu for the EU instance.',
      },
    };
  }
  const url = new URL(
    `${opsgenieBase(options?.region)}${path.startsWith('/') ? path : `/${path}`}`,
  );
  appendQuery(url, options?.query);
  const headers: Record<string, string> = {
    Accept: 'application/json',
    Authorization: `GenieKey ${opsgenieApiKey}`,
  };
  const fetchOptions: RequestInit = { method: options?.method ?? 'GET', headers };
  if (options?.body !== undefined) {
    fetchOptions.body = JSON.stringify(options.body);
    headers['Content-Type'] = 'application/json';
  }
  try {
    const response = await fetch(url.toString(), fetchOptions);
    const data = await response.json().catch(() => null);
    return { ok: response.ok, status: response.status, data };
  } catch (error) {
    return {
      ok: false,
      status: 502,
      data: { error: error instanceof Error ? error.message : 'Opsgenie request failed' },
    };
  }
}

export function failedResult(action: string, result: OpsgenieResponse) {
  return {
    error: action,
    statusCode: result.status,
    details: result.data,
  };
}

export function toOpsgenieError(error: unknown, action: string) {
  return {
    error: action,
    message: error instanceof Error ? error.message : 'Unknown error',
  };
}
