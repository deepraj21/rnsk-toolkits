// @ts-nocheck
// Shared helpers for the Databricks toolkit.
// Endpoint paths verified against the official Databricks REST API reference
// (https://docs.databricks.com/api/) and community OpenAPI specs:
//   Base: {workspaceUrl}/api/{2.0,2.1,...}
//   Auth: Authorization: Bearer <PAT or OAuth token>

export interface DatabricksCredentials {
  workspaceUrl?: string;
  baseUrl?: string;
  token?: string;
}

export function parseDatabricksCredentials(databricksCredentials: string): DatabricksCredentials {
  let parsed: DatabricksCredentials;
  try {
    parsed = JSON.parse(databricksCredentials) as DatabricksCredentials;
  } catch {
    throw new Error(
      'Databricks credentials must be JSON like {"workspaceUrl":"https://adb-123.azuredatabricks.net","token":"dapi..."}',
    );
  }
  return parsed ?? {};
}

export function databricksHost(credentials: DatabricksCredentials): string {
  const raw = (credentials.workspaceUrl ?? credentials.baseUrl ?? '').trim().replace(/\/+$/, '');
  if (!raw) {
    throw new Error(
      'Databricks credentials must include workspaceUrl, e.g. {"workspaceUrl":"https://my-workspace.cloud.databricks.com","token":"..."} (your Databricks workspace URL).',
    );
  }
  return /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
}

export interface DatabricksResponse {
  ok: boolean;
  status: number;
  data: any;
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

/** Call a Databricks workspace REST API, e.g. path '/2.0/clusters/list'. */
export async function databricksRequest(
  databricksCredentials: string,
  path: string,
  options?: {
    method?: string;
    query?: Record<string, unknown>;
    body?: unknown;
  },
): Promise<DatabricksResponse> {
  let credentials: DatabricksCredentials;
  try {
    credentials = parseDatabricksCredentials(databricksCredentials);
  } catch (error) {
    return {
      ok: false,
      status: 400,
      data: { error: error instanceof Error ? error.message : 'Invalid Databricks credentials' },
    };
  }
  if (!credentials.token) {
    return {
      ok: false,
      status: 401,
      data: {
        error:
          'Databricks token is required. Connect Databricks first: {"workspaceUrl":"https://...","token":"..."} with a personal access token (User Settings > Access tokens) or OAuth token.',
      },
    };
  }
  let host: string;
  try {
    host = databricksHost(credentials);
  } catch (error) {
    return {
      ok: false,
      status: 400,
      data: { error: error instanceof Error ? error.message : 'Invalid Databricks workspace URL' },
    };
  }
  const url = new URL(`${host}/api${path.startsWith('/') ? path : `/${path}`}`);
  appendQuery(url, options?.query);
  const headers: Record<string, string> = {
    Accept: 'application/json',
    Authorization: `Bearer ${credentials.token}`,
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
      data: { error: error instanceof Error ? error.message : 'Databricks request failed' },
    };
  }
}

export function failedResult(action: string, result: DatabricksResponse) {
  return {
    error: action,
    statusCode: result.status,
    details: result.data,
  };
}

export function toDatabricksError(error: unknown, action: string) {
  return {
    error: action,
    message: error instanceof Error ? error.message : 'Unknown error',
  };
}
