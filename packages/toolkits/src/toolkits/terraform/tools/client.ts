// @ts-nocheck

const BASE_URL = 'https://app.terraform.io/api/v2';
const JSON_API = 'application/vnd.api+json';

export interface TerraformResponse {
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

export function missingTokenError() {
  return { error: 'Terraform API token is required. Connect Terraform first.' };
}

export async function terraformRequest(
  terraformToken: string | undefined,
  path: string,
  options?: {
    method?: string;
    query?: Record<string, string | number | boolean | undefined>;
    body?: unknown;
  },
): Promise<TerraformResponse> {
  if (!terraformToken) {
    return { ok: false, status: 401, data: missingTokenError() };
  }
  const url = new URL(`${BASE_URL}${path.startsWith('/') ? path : `/${path}`}`);
  appendQuery(url, options?.query);

  const headers: Record<string, string> = {
    Accept: JSON_API,
    Authorization: `Bearer ${terraformToken}`,
    'Content-Type': JSON_API,
  };
  const fetchOptions: RequestInit = {
    method: options?.method ?? 'GET',
    headers,
  };
  if (options?.body !== undefined) {
    fetchOptions.body = JSON.stringify(options.body);
  }

  const response = await fetch(url.toString(), fetchOptions);
  const text = await response.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text };
  }
  return { ok: response.ok, status: response.status, data };
}

export function toTerraformError(error: unknown, action: string) {
  return {
    error: action,
    message: error instanceof Error ? error.message : 'Unknown error',
  };
}

export function failedResult(action: string, result: TerraformResponse) {
  return {
    error: action,
    statusCode: result.status,
    details: result.data,
  };
}

export const pageParams = (pageNumber?: number, pageSize?: number) => ({
  'page[number]': pageNumber,
  'page[size]': pageSize,
});
