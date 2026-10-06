// @ts-nocheck
// Shared HTTP helper for the cron-job.org REST API.
// Endpoint and auth verified against the official API docs (https://api.cron-job.org/).

const BASE_URL = 'https://api.cron-job.org';

export interface CronJobResponse {
  ok: boolean;
  status: number;
  data: any;
}

export function missingTokenError() {
  return { error: 'cron-job.org API key is required. Connect cron-job.org first.' };
}

export async function cronJobRequest(
  cronJobApiKey: string | undefined,
  path: string,
  options?: {
    method?: string;
    body?: unknown;
  },
): Promise<CronJobResponse> {
  if (!cronJobApiKey) {
    return { ok: false, status: 401, data: missingTokenError() };
  }
  const url = new URL(`${BASE_URL}${path.startsWith('/') ? path : `/${path}`}`);
  const headers: Record<string, string> = {
    Accept: 'application/json',
    Authorization: `Bearer ${cronJobApiKey}`,
  };
  const fetchOptions: RequestInit = {
    method: options?.method ?? 'GET',
    headers,
  };
  if (options?.body !== undefined) {
    fetchOptions.body = JSON.stringify(options.body);
    headers['Content-Type'] = 'application/json';
  }
  const response = await fetch(url.toString(), fetchOptions);
  const text = await response.text().catch(() => '');
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }
  return { ok: response.ok, status: response.status, data };
}

export function failedResult(action: string, result: CronJobResponse) {
  return {
    error: action,
    statusCode: result.status,
    details: result.data,
  };
}

export function toCronJobError(error: unknown, action: string) {
  return {
    error: action,
    message: error instanceof Error ? error.message : 'Unknown error',
  };
}
