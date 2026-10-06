// @ts-nocheck
/**
 * Shared HTTP helper for the PagerDuty toolkit.
 *
 * REST API v2: https://api.pagerduty.com with
 * `Authorization: Token token=<api_token>` and
 * `Accept: application/vnd.pagerduty+json;version=2`.
 * Write calls accept an optional `From` header (acting user's email),
 * which PagerDuty requires for several endpoints when using an API token.
 */
const BASE_URL = 'https://api.pagerduty.com';
const ACCEPT = 'application/vnd.pagerduty+json;version=2';

export function pdKeyError() {
  return {
    error:
      'PagerDuty API token is required. Connect PagerDuty first with a REST API token (Integrations > API Access Keys).',
  };
}

function appendQuery(url: URL, query?: Record<string, unknown>) {
  if (!query) return;
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === '') continue;
    if (Array.isArray(value)) {
      for (const v of value) {
        if (v === undefined || v === null || v === '') continue;
        url.searchParams.append(`${key}[]`, String(v));
      }
    } else if (typeof value === 'boolean') {
      url.searchParams.set(key, value ? 'true' : 'false');
    } else {
      url.searchParams.set(key, String(value));
    }
  }
}

export async function pdRequest(
  pagerdutyApiKey: string | undefined,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  path: string,
  options?: {
    query?: Record<string, unknown>;
    body?: unknown;
    fromEmail?: string;
  },
): Promise<any> {
  if (!pagerdutyApiKey) return pdKeyError();
  try {
    const url = new URL(`${BASE_URL}${path}`);
    appendQuery(url, options?.query);
    const headers: Record<string, string> = {
      Accept: ACCEPT,
      'Content-Type': 'application/json',
      Authorization: `Token token=${pagerdutyApiKey}`,
    };
    if (options?.fromEmail) headers['From'] = options.fromEmail;
    const response = await fetch(url.toString(), {
      method,
      headers,
      body: options?.body !== undefined ? JSON.stringify(options.body) : undefined,
    });
    const text = await response.text();
    let data: any = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { raw: text };
    }
    if (!response.ok) {
      return { error: `PagerDuty API error ${response.status}`, details: data?.error ?? data };
    }
    return data;
  } catch (error) {
    return {
      error: 'Error calling PagerDuty API',
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
